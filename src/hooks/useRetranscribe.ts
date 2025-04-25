import type {
	TranscriptionError,
	TranscriptionSuccess,
} from "@api/ai/TranscriptionResponse.ts";
import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import {
	addImageToStore,
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
			handleTranscriptionError(error);
		},
	});

	async function retranscribeDocument(
		document: TranscribableDocument,
	): Promise<void> {
		await updateImage(store, imageRepo, document);
		const request = await constructTranscriptionRequest(store, document);
		transcribe.mutate({ image: document, request: request });
	}

	return retranscribeDocument;
}
