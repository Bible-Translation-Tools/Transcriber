import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { TranscriptionStatus } from "@src/data/TranscriptionStatus.ts";
import { calculateProgress } from "@src/domain/CalculateProgress.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import type { TranscriptionState } from "@src/persistence/store/TranscriptionState.ts";
import type { PersistStorage, StorageValue } from "zustand/middleware";

const imageRepo = IndexedDBImageRepository.getInstance();

function restoreTranscriptionStatus(
	image: TranscribableDocument,
): TranscriptionStatus {
	if (image.transcription == null) {
		return TranscriptionStatus.TRANSCRIPTION_ERROR;
	}
	return TranscriptionStatus.COMPLETED;
}

export const transcriptionStateStorage: PersistStorage<TranscriptionState> = {
	getItem: async (name) => {
		const str = localStorage.getItem(name);
		if (!str) return null;
		const existingValue = JSON.parse(str);

		let selectedImage = null;
		let images: TranscribableDocument[] | null = null;
		let recentLanguages: string[] = [];
		if (existingValue.state.selectedImage) {
			selectedImage = await imageRepo.retrieveImage(
				existingValue.state.selectedImage,
			);
			selectedImage = { ...selectedImage, loading: false };
		}

		const { language, bookCode, chapter } = existingValue.state;

		const allImages = await imageRepo.retrieveAllImages();
		const progress = calculateProgress(allImages ?? []);

		if (language != null) {
			images = await imageRepo.getImages(
				language.code,
				bookCode,
				chapter,
			);
			images = images.map((image: TranscribableDocument) => ({
				...image,
				status: restoreTranscriptionStatus(image),
			}));
			if (selectedImage != null) {
				selectedImage = {
					...selectedImage,
					status: restoreTranscriptionStatus(selectedImage),
				};
			}
			recentLanguages = imageRepo.getRecentLanguages();
		} else {
			recentLanguages = imageRepo.getRecentLanguages();
		}

		const rehydrated = {
			...existingValue,
			state: {
				...existingValue.state,
				recentLanguages: recentLanguages,
				selectedImage: selectedImage,
				images: images ? images : [],
				progress: progress,
			},
		};

		console.log("Rehydrating store with:", rehydrated);
		return rehydrated;
	},
	setItem: async (name, newValue: StorageValue<TranscriptionState>) => {
		const str = JSON.stringify({
			...newValue,
			state: {
				...newValue.state,
				selectedImage: newValue.state.selectedImage
					? newValue.state.selectedImage.id
					: null,
				images: newValue.state.images.map((image) => image.id),
			},
		});
		localStorage.setItem(name, str);
	},
	removeItem: async (name) => localStorage.removeItem(name),
};
