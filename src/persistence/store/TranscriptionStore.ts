import {
	DetaultTranscriptionPrompt,
	TranscriptionModel,
} from "@api/domain/TranscriptionRequest";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import { transcriptionStateStorage } from "@src/persistence/store/PersistTranscriptionState.tsx";
import type { TranscriptionActions } from "@src/persistence/store/TranscriptionActions.ts";
import type { TranscriptionState } from "@src/persistence/store/TranscriptionState.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TranscriptionStore = TranscriptionState & TranscriptionActions;

const imageRepo = IndexedDBImageRepository.getInstance();

export const useTranscriptionStore = create<TranscriptionStore>()(
	persist(
		(set, get) => ({
			language: { anglicized: "English", code: "en" },
			recentLanguages: [],
			bookCode: "mat",
			chapter: 1,
			images: [],
			selectedImage: null,
			model: TranscriptionModel.OPENAI,
			systemPrompt: DetaultTranscriptionPrompt.SYSTEM,
			prompt:
				localStorage.getItem("prompt") ||
				DetaultTranscriptionPrompt.PROMPT,
			setLanguage: async (lang: LanguageOption) => {
				await updateProject(
					set,
					lang,
					get().bookCode,
					get().chapter,
					get().selectedImage,
				);
			},
			setBookCode: async (bookCode: string) => {
				await updateProject(
					set,
					get().language,
					bookCode,
					get().chapter,
					get().selectedImage,
				);
			},
			setChapter: async (chapter: number) => {
				await updateProject(
					set,
					get().language,
					get().bookCode,
					chapter,
					get().selectedImage,
				);
			},
			setImages: (newArrOrSetterFn) => {
				set(({ images }) => {
					if (Array.isArray(newArrOrSetterFn)) {
						const newArr = newArrOrSetterFn;
						return { selectedImageIds: newArr };
					}
					const setterFn = newArrOrSetterFn;
					return {
						images: setterFn(images),
					};
				});
			},
			setSelectedImage: (image: TranscribableDocument | null) =>
				set(() => ({ selectedImage: image })),
			setModel: (model: TranscriptionModel) => set(() => ({ model })),
			setSystemPrompt: (prompt: string) =>
				set(() => ({ systemPrompt: prompt })),
			setPrompt: (prompt: string) => set(() => ({ prompt })),
			refreshProject: async () => {
				await updateProject(
					set,
					get().language,
					get().bookCode,
					get().chapter,
					get().selectedImage,
				);
			},
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

type SetFn = (state: Partial<TranscriptionState> | TranscriptionState) => void;
async function updateProject(
	set: SetFn,
	language: LanguageOption | null,
	bookCode: string,
	chapter: number,
	selectedImage: TranscribableDocument | null,
) {
	set({
		language: language,
		bookCode: bookCode,
		chapter: chapter,
	});
	if (language != null) {
		const images = await imageRepo.getImages(
			language.code,
			bookCode,
			chapter,
		);
		// WK note: possible addition. More flexible would be if the img had an "order" property in case someone had a pdf out of order or whatever when uploaded and wanted ot change that order
		images.sort((a, b) => {
			return a.created - b.created;
		});
		const recentLanguages = imageRepo.getRecentLanguages();
		const selected: TranscribableDocument | undefined =
			selectedImage != null && images.includes(selectedImage)
				? selectedImage
				: images[0];
		set({
			recentLanguages: recentLanguages,
			language: language,
			bookCode: bookCode,
			chapter: chapter,
			images: images,
			selectedImage: selected ?? null,
		});
	} else {
		set({
			language: language,
			bookCode: bookCode,
			chapter: chapter,
			images: [],
			selectedImage: null,
		});
	}
}
