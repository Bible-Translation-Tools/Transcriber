import type { TranscriptionResponse } from "@api/ai/TranscriptionResponse.ts";
import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import { apiV1 } from "@src/api";
import { transcribeRoute, updateTranscriptionRoute } from "@src/constants";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository";
import { type QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import type { ImageData } from "@src/data/ImageData";
// import { getTranscription } from "@src/services/TranscriptionApi.ts";
import type { TranscriptionStore } from "@src/persistence/store/TranscriptionStore";

const imageRepo = IndexedDBImageRepository.getInstance();

type getIndexedDbImagesArgs = {
	languageCode: string;
	bookCode: string;
	chapter: number;
};
export const getIndexedDbImages = ({
	languageCode,
	bookCode,
	chapter,
}: getIndexedDbImagesArgs) => {
	return useQuery({
		queryKey: ["getIndexedDbImages", languageCode, bookCode, chapter],
		queryFn: () => imageRepo.getImages(languageCode, bookCode, chapter),
	});
};
export const useMutateIndexedDbImage = (
	queryClient: QueryClient,
	imageId: string,
	imageData: ImageData,
) => {
	return useMutation({
		mutationFn: () => imageRepo.storeImage(imageId, imageData),
		onMutate: async () => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			// Snapshot the previous value
			const previousImages = queryClient.getQueryData([
				"getIndexedDbImages",
			]);
			// Optimistically update to the new value
			queryClient.setQueryData(
				["getIndexedDbImages"],
				(old: Array<ImageData>) => {
					return old.map((image: ImageData) => {
						if (image.id === imageId) {
							return { ...image, ...imageData };
						}
						return image;
					});
				},
			);
			// Return a context object with the snapshotted value
			return { previousImages };
		},
		onError: (_err, _newImages, context) => {
			// If the mutation fails, use the context we returned above
			// to roll back to the previous value
			if (!context) return;
			queryClient.setQueryData(
				["getIndexedDbImages"],
				context.previousImages,
			);
		},
		onSuccess: () => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["getIndexedDbImages"] });
		},
	});
};
export const mutationGetTranscription = (request: TranscriptionRequest) => {
	return useMutation({
		mutationFn: () => getTranscription(request),
	});
};

export async function getTranscription(
	request: TranscriptionRequest,
): Promise<TranscriptionResponse> {
	const res = await fetch(`${apiV1}${transcribeRoute}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request),
	});

	if (!res.ok) {
		// Consider throwing so React Query can handle the error properly
		throw new Error(`HTTP ${res.status}: Failed to fetch transcription`);
	}
	const json = await res.json();
	return json; // Assume server returns { success: true | false, ... }
}

export const mutationSendUpdatedTranscription = (
	args: sendUpdatedTranscriptionArgs,
) => {
	return useMutation({
		mutationFn: () => sendUpdatedTranscription(args),
	});
};
type sendUpdatedTranscriptionArgs = {
	imageId: string;
	transcription: string;
	language?: string;
	book?: string;
	chapter?: number;
	startVerse?: number;
	endVerse?: number;
};

type AddImageArgs = {
	image: ImageData;
	transcriptionRequest: TranscriptionRequest;
	queryClient: QueryClient;
};

export const useAddImage = async ({
	image,
	queryClient,
	transcriptionRequest,
}: AddImageArgs) => {
	// Step 1: Save image to IndexedDB even before OCR, in case it fails
	await useMutateIndexedDbImage(queryClient, image.id, image).mutateAsync();

	// Step 2: Get transcription
	let transcriptionResult: TranscriptionResponse;
	try {
		transcriptionResult =
			await mutationGetTranscription(transcriptionRequest).mutateAsync();
	} catch (err) {
		console.error("Transcription failed", err);
		return;
	}

	// Step 3: Update image in IndexedDB with transcription
	if (transcriptionResult.success) {
		const updatedImage: ImageData = {
			...image,
			transcription: transcriptionResult.transcription,
		};
		await useMutateIndexedDbImage(
			queryClient,
			image.id,
			updatedImage,
		).mutateAsync();
	}
};

type updateImgArgs = {
	image: ImageData;
	queryClient: QueryClient;
};
export const updateImg = async ({ image, queryClient }: updateImgArgs) => {
	// Step 1: Save updated image to IndexedDB
	await useMutateIndexedDbImage(queryClient, image.id, image).mutateAsync();

	// Step 2: Update remote transcription
	if (image.transcription) {
		await mutationSendUpdatedTranscription({
			imageId: image.id,
			transcription: image.transcription,
			language: image.languageCode,
			book: image.bookCode,
			chapter: image.chapter,
			startVerse: image.startVerse,
			endVerse: image.endVerse,
		}).mutateAsync();
	}

	// Step 3: We already have the mutated transcription that we passed to server, so now just invalidate the react query reading from indexed
	queryClient.invalidateQueries({ queryKey: ["getIndexedDbImages"] });
};

export const resubmitImageForTranscription = async ({
	image,
	queryClient,
	transcriptionRequest,
}: AddImageArgs) => {
	// Step 1: Save image to IndexedDB even before OCR, in case it fails
	await useMutateIndexedDbImage(queryClient, image.id, image).mutateAsync();

	// 2: Get transcription again from llm
	let transcriptionResult: TranscriptionResponse;
	try {
		transcriptionResult =
			await mutationGetTranscription(transcriptionRequest).mutateAsync();
		console.log({ transcriptionResult });
	} catch (err) {
		console.error("Transcription failed", err);
		return;
	}
	// 3: If success
};

export async function sendUpdatedTranscription({
	imageId,
	transcription,
	language,
	book,
	chapter,
	startVerse,
	endVerse,
}: sendUpdatedTranscriptionArgs): Promise<void> {
	const response = await fetch(`${apiV1}${updateTranscriptionRoute}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			imageId,
			transcription,
			language,
			book,
			chapter,
			startVerse,
			endVerse,
		}),
	});

	console.log(response);
}
export const getTranscriptionRequestPayload = ({
	image,
	store,
}: { store: TranscriptionStore; image: ImageData }): TranscriptionRequest => {
	return {
		model: store.model,
		image: image.data,
		imageId: image.id,
		languageCode: image.languageCode,
		bookCode: image.bookCode,
		chapter: image.chapter,
		systemPrompt: store.systemPrompt,
		prompt: store.prompt,
	};
};
