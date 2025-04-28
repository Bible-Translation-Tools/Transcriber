import type {TranscriptionError} from "@api/ai/TranscriptionResponse.ts";
import type {DeleteTranscriptionRequest} from "@api/domain/HandleTranscriptionRequest.ts";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {deleteImage, handleTranscriptionError,} from "@src/domain/ImageActions.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {sendDeleteTranscription} from "@src/services/TranscriptionApi.ts";
import {useMutation} from "@tanstack/react-query";

const imageRepo = IndexedDBImageRepository.getInstance();

export function useDeleteImage() {
	const store = useTranscriptionStore();

	async function executeDeleteTranscription(
		image: TranscribableDocument,
		request: DeleteTranscriptionRequest,
	): Promise<[TranscribableDocument]> {
		console.log("Deleting image...", image.id);
		await sendDeleteTranscription(request);
		return [image];
	}

	const deleteQuery = useMutation({
		mutationFn: async ({
			image,
			request,
		}: {
			image: TranscribableDocument;
			request: DeleteTranscriptionRequest;
		}) => {
			return executeDeleteTranscription(image, request);
		},
		onSuccess: async ([image]: [TranscribableDocument]) => {
			await deleteImage(store, imageRepo, image);
		},
		onError: async (error: TranscriptionError) => {
			handleTranscriptionError(error);
		},
	});

	async function deleteTranscription(
		document: TranscribableDocument,
	): Promise<void> {
		const request: DeleteTranscriptionRequest = { imageId: document.id };
		deleteQuery.mutate({
			image: document,
			request: request,
		});
	}

	return deleteTranscription;
}
