import { calculateProgress } from "@src/domain/CalculateProgress.ts";
import { getCurrentUserId } from "@src/domain/CurrentUser.ts";
import { sortDocuments } from "@src/domain/SortDocuments.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import type { TranscriptionState } from "@src/persistence/store/TranscriptionState.ts";
import type { PersistStorage, StorageValue } from "zustand/middleware";

const imageRepo = IndexedDBImageRepository.getInstance();

/**
 * localStorage persistence for UI preferences only.
 *
 * The selected image is kept as a bare id: a pointer into the cache, not a copy of
 * the record.
 */
export const transcriptionStateStorage: PersistStorage<TranscriptionState> = {
	getItem: async (name) => {
		const raw = localStorage.getItem(name);
		if (!raw) return null;
		const existingValue = JSON.parse(raw);

		const userId = getCurrentUserId();
		const selectedImageId = existingValue.state.selectedImage;

		const images = sortDocuments(
			userId ? await imageRepo.getAllForUser(userId) : [],
		);

		const selectedImage =
			images.find((image) => image.id === selectedImageId) ?? null;

		return {
			...existingValue,
			state: {
				...existingValue.state,
				recentLanguages: imageRepo.getRecentLanguages(),
				selectedImage,
				images,
				progress: calculateProgress(images),
			},
		};
	},
	setItem: async (name, newValue: StorageValue<TranscriptionState>) => {
		// Strip the cache-backed fields; only preferences belong in localStorage.
		const { images, progress, recentLanguages, ...preferences } =
			newValue.state;

		localStorage.setItem(
			name,
			JSON.stringify({
				...newValue,
				state: {
					...preferences,
					// A pointer into the cache, not a copy of the document.
					selectedImage: newValue.state.selectedImage?.id ?? null,
				},
			}),
		);
	},
	removeItem: async (name) => localStorage.removeItem(name),
};
