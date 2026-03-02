import type {
	TranscriptionError,
	TranscriptionSuccess,
} from "@api/ai/TranscriptionResponse.ts";
import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { TranscriptionStatus } from "@src/data/TranscriptionStatus.ts";
import {
	constructTranscriptionRequest,
	finalizeSuccessfulTranscription,
	handleTranscriptionError,
	updateImage,
} from "@src/domain/ImageActions.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import { getTranscription } from "@src/services/TranscriptionApi.ts";
import { useMutation } from "@tanstack/react-query";

const imageRepo = IndexedDBImageRepository.getInstance();

export function useRetranscribe() {
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

	async function retranscribeDocument(
		document: TranscribableDocument,
	): Promise<void> {
		// Use getState() so we update the live store (status → IN_PROGRESS) and use
		// current settings; avoids stale closure when "Transcribe Again" is used from the toast.
		const currentStore = useTranscriptionStore.getState();
		await updateImage(currentStore, imageRepo, {
			...document,
			status: TranscriptionStatus.IN_PROGRESS,
		});
		const request = await constructTranscriptionRequest(
			currentStore,
			document,
		);
		transcribe.mutate({ image: document, request: request });
	}

	return retranscribeDocument;
}
