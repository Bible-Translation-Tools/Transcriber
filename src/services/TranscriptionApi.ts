import type { TranscriptionResponse } from "@api/ai/TranscriptionResponse.ts";
import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import { apiV1 } from "@src/api";
import { transcribeRoute, updateTranscriptionRoute } from "@src/constants";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectImageData } from "@src/data/ImageData";
// import { getTranscription } from "@src/services/TranscriptionApi.ts";
import type { TranscriptionStore } from "@src/persistence/store/TranscriptionStore";

const imageRepo = IndexedDBImageRepository.getInstance();

type getIndexedDbImagesArgs = {
	languageCode: string;
	bookCode: string;
	chapter: number;
};
export const useIndexedDbImages = ({
	languageCode,
	bookCode,
	chapter,
}: getIndexedDbImagesArgs) => {
	return useQuery({
		queryKey: ["getIndexedDbImages", languageCode, bookCode, chapter],
		queryFn: () => imageRepo.getImages(languageCode, bookCode, chapter),
	});
};

type useMutateIndexedDbImageArgs = {
	imageId: string;
	imageData: ProjectImageData;
};
export const useMutateIndexedDbImage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ imageData, imageId }: useMutateIndexedDbImageArgs) =>
			imageRepo.storeImage(imageId, imageData),
		onMutate: async ({ imageData, imageId }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: ["getIndexedDbImages"],
			});
			// Snapshot the previous value
			const previousImages = queryClient.getQueryData([
				"getIndexedDbImages",
			]);
			// Optimistically update to the new value
			queryClient.setQueryData(
				["getIndexedDbImages"],
				(old: Array<ProjectImageData>) => {
					if (!old) return [imageData];
					return old.map((image: ProjectImageData) => {
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
			console.log("Image updated successfully");

			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: ["getIndexedDbImages"] });
		},
	});
};
export const useMutationGetTranscription = () => {
	return useMutation({
		mutationFn: (request: TranscriptionRequest) =>
			getTranscription(request),
	});
};

export const useMutationSendUpdatedTranscription = () => {
	return useMutation({
		mutationFn: (args: sendUpdatedTranscriptionArgs) =>
			sendUpdatedTranscription(args),
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
	image: ProjectImageData;
	transcriptionRequest: TranscriptionRequest;
};

type TranscriptionServiceArgs = {
	image: ProjectImageData;
	transcriptionRequest: TranscriptionRequest;
	mutateImage: ReturnType<typeof useMutateIndexedDbImage>;
	getTranscription: ReturnType<typeof useMutationGetTranscription>;
};
type MutateServerTranscript = ReturnType<
	typeof useMutationSendUpdatedTranscription
>;
async function addImage({
	image,
	transcriptionRequest,
	mutateImage,
	getTranscription,
}: TranscriptionServiceArgs) {
	await mutateImage.mutateAsync({
		imageData: image,
		imageId: image.id,
	});

	let transcriptionResult: TranscriptionResponse;
	try {
		transcriptionResult =
			await getTranscription.mutateAsync(transcriptionRequest);
	} catch (err) {
		console.error("Transcription failed", err);
		return;
	}

	if (transcriptionResult.success) {
		const updatedImage: ProjectImageData = {
			...image,
			transcription: transcriptionResult.transcription,
		};
		await mutateImage.mutateAsync({
			imageData: updatedImage,
			imageId: image.id,
		});
	}
}

export const useTranscriptionService = () => {
	const mutateImage = useMutateIndexedDbImage();
	const getTranscription = useMutationGetTranscription();
	const mutateServerTranscription = useMutationSendUpdatedTranscription();

	const addImg = ({ image, transcriptionRequest }: AddImageArgs) =>
		addImage({
			image,
			transcriptionRequest,
			mutateImage,
			getTranscription,
		});
	const updateImg = ({
		image,
	}: Omit<AddImageArgs, "transcriptionRequest">) => {
		return updateImage({
			image,
			mutateImage,
			mutateServerTranscription,
		});
	};
	const resubmitImageForTranscription = (args: AddImageArgs) =>
		resubmitImgForTranscription({
			...args,
			mutateImage,
			getTranscription,
		});

	return {
		// bind function as hook vals
		addImage: addImg,
		updateImage: updateImg,
		resubmitImageForTranscription,
	};
};

async function updateImage({
	image,
	mutateImage,
	mutateServerTranscription,
}: Omit<
	TranscriptionServiceArgs,
	"transcriptionRequest" | "getTranscription"
> & { mutateServerTranscription: MutateServerTranscript }) {
	await mutateImage.mutateAsync({
		imageData: image,
		imageId: image.id,
	});
	// Step 2: Update remote transcription
	if (image.transcription) {
		await mutateServerTranscription.mutateAsync({
			imageId: image.id,
			transcription: image.transcription,
			language: image.languageCode,
			book: image.bookCode,
			chapter: image.chapter,
			startVerse: image.startVerse,
			endVerse: image.endVerse,
		});
	}
}

async function resubmitImgForTranscription({
	image,
	transcriptionRequest,
	mutateImage,
	getTranscription,
}: TranscriptionServiceArgs) {
	// mutate indexed db
	await mutateImage.mutateAsync({
		imageData: image,
		imageId: image.id,
	});
	// 2: Get transcription again from llm
	let transcriptionResult: TranscriptionResponse;
	try {
		transcriptionResult =
			await getTranscription.mutateAsync(transcriptionRequest);
		console.log({ transcriptionResult });
	} catch (err) {
		console.error("Transcription failed", err);
		return;
	}
	if (transcriptionResult.success) {
		const updatedImage: ProjectImageData = {
			...image,
			transcription: transcriptionResult.transcription,
		};
		await mutateImage.mutateAsync({
			imageData: updatedImage,
			imageId: image.id,
		});
	}
}

// ACROSS THE NETWORK FUNCTIONS
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

// UTILS
export const getTranscriptionRequestPayload = ({
	image,
	store,
}: {
	store: TranscriptionStore;
	image: ProjectImageData;
}): TranscriptionRequest => {
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
