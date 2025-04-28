import type {TranscriptionError, TranscriptionSuccess,} from "@api/ai/TranscriptionResponse.ts";
import type {TranscriptionRequest} from "@api/domain/TranscriptionRequest.ts";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {TranscriptionStatus} from "@src/data/TranscriptionStatus.ts";
import {
	finalizeSuccessfulTranscription,
	handleTranscriptionError,
	prepareImageForUpload,
	updateImage,
} from "@src/domain/ImageActions.ts";
import {processFiles} from "@src/domain/ProcessFiles.tsx";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {getTranscription} from "@src/services/TranscriptionApi.ts";
import {useMutation} from "@tanstack/react-query";

const imageRepo = IndexedDBImageRepository.getInstance();

export function useUploadImage() {
	const store = useTranscriptionStore();

	async function executeTranscription(
		image: TranscribableDocument,
		request: TranscriptionRequest,
	): Promise<[TranscribableDocument, TranscriptionSuccess]> {
		const response = await getTranscription(request);
		return [image, response];
	}

	const transcribe = useMutation({
		mutationFn: ({
			image,
			request,
		}: { image: TranscribableDocument; request: TranscriptionRequest }) => {
			return executeTranscription(image, request);
		},

		onSuccess: async ([image, transcription]: [
			TranscribableDocument,
			TranscriptionSuccess,
		]) => {
			await finalizeSuccessfulTranscription(
				store,
				imageRepo,
				image,
				transcription,
			);
		},
		onError: async (error: TranscriptionError) => {
			try {
				const image = await imageRepo.retrieveImage(error.imageId);
				if (image) {
					await updateImage(store, imageRepo, {
						...image,
						status: TranscriptionStatus.TRANSCRIPTION_ERROR,
					});
				}
			} finally {
				handleTranscriptionError(error);
			}
		},
	});

	async function uploadImage(files: File[]): Promise<void> {
		const images = await processFiles(files);
		images.map(async (image) => {
			const [updatedImage, request] = await prepareImageForUpload(
				store,
				imageRepo,
				image,
			);
			transcribe.mutate({ image: updatedImage, request: request });
		});
	}

	return uploadImage;
}
