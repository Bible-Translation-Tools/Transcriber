import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	DetaultTranscriptionPrompt,
	TranscriptionModel,
} from "@api/domain/TranscriptionRequest";
import type { ImageData } from "@src/data/ImageData.tsx";
import type { TranscriptionState } from "@src/persistence/store/TranscriptionState.ts";
import type { TranscriptionActions } from "@src/persistence/store/TranscriptionActions.ts";
import { transcriptionStateStorage } from "@src/persistence/store/PersistTranscriptionState.tsx";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository";

export type TranscriptionStore = TranscriptionState & TranscriptionActions;

export const useTranscriptionStore = create<TranscriptionStore>()(
	persist(
		(set, _get) => ({
			language: { anglicized: "English", code: "en" },
			recentLanguages: [],
			bookCode: "mat",
			chapter: 1,
			// images: [],
			selectedImage: null,
			model: TranscriptionModel.OPENAI,
			systemPrompt: DetaultTranscriptionPrompt.SYSTEM,
			prompt:
				localStorage.getItem("prompt") ||
				DetaultTranscriptionPrompt.PROMPT,
			setLanguage: (lang: LanguageOption) => set({ language: lang }),
			setBookCode: (code: string) => {
				set({ bookCode: code });
			},
			setChapter: (chapter: number) => {
				set({ chapter });
			},
			// setImages: (newArrOrSetterFn) => {
			// 	set(({ images }) => {
			// 		if (Array.isArray(newArrOrSetterFn)) {
			// 			const newArr = newArrOrSetterFn;
			// 			return { selectedImageIds: newArr };
			// 		}
			// 		const setterFn = newArrOrSetterFn;
			// 		return {
			// 			images: setterFn(images),
			// 		};
			// 	});
			// },
			setSelectedImage: async (image: ImageData | null) => {
				if (!image) {
					set({ selectedImage: null });
					return;
				}

				// If it already has data, just use it
				if (image.data) {
					console.log("Image already has data, using it.");
					set({ selectedImage: image });
					return;
				}

				// Else load full image from IndexedDB
				const repo = IndexedDBImageRepository.getInstance();
				const fullImage = await repo.retrieveImage(image.id);
				set({ selectedImage: fullImage ?? null });
			},
			setModel: (model: TranscriptionModel) => set(() => ({ model })),
			setSystemPrompt: (prompt: string) =>
				set(() => ({ systemPrompt: prompt })),
			setPrompt: (prompt: string) => set(() => ({ prompt })),
			// todo: see if nooop is fine
			refreshProject: async () => {},
			// refreshProject: async () => {
			// 	await updateProject(
			// 		set,
			// 		get().language,
			// 		get().bookCode,
			// 		get().chapter,
			// 		get().selectedImage,
			// 	);
			// },
		}),
		{
			name: "transcription-storage",
			storage: transcriptionStateStorage,
			onRehydrateStorage: (state) => {
				console.log("rehydrating non-image state", state);
			},
		},
	),
);

// async function updateProject(
// 	set: any,
// 	language: LanguageOption | null,
// 	bookCode: string,
// 	chapter: number,
// 	selectedImage: ImageData | null,
// ) {
// 	set({
// 		language: language,
// 		bookCode: bookCode,
// 		chapter: chapter,
// 	});
// 	if (language != null) {
// 		const images = await imageRepo.getImages(
// 			language.code,
// 			bookCode,
// 			chapter,
// 		);
// 		const recentLanguages = imageRepo.getRecentLanguages();
// 		const selected: ImageData | undefined =
// 			selectedImage != null && images.includes(selectedImage)
// 				? selectedImage
// 				: images[0];
// 		set({
// 			recentLanguages: recentLanguages,
// 			language: language,
// 			bookCode: bookCode,
// 			chapter: chapter,
// 			images: images,
// 			selectedImage: selected ?? null,
// 		});
// 	} else {
// 		set({
// 			language: language,
// 			bookCode: bookCode,
// 			chapter: chapter,
// 			images: [],
// 			selectedImage: null,
// 		});
// 	}
// }
