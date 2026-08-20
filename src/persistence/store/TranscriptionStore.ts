import {
	DetaultTranscriptionPrompt,
	TranscriptionModel,
} from "@api/domain/TranscriptionRequest";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import type { Progress } from "@src/data/Progress.ts";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { getCurrentUserId } from "@src/domain/CurrentUser.ts";
import { sortDocuments } from "@src/domain/SortDocuments.ts";
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
			progress: {},
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
				set(({ images }) => ({
					images: Array.isArray(newArrOrSetterFn)
						? newArrOrSetterFn
						: newArrOrSetterFn(images),
				}));
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
			setProgress: (progress: Progress) => set({ progress: progress }),
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

/**
 * Loads every image the signed-in user has, across all languages, books, and
 * chapters, and reconciles the selection against it.
 *
 * Reads the local snapshot, which the sync engine has already replaced with the
 * server's list - so this is a cache read, never a merge.
 *
 * The language/book/chapter fields are still tracked - uploads stamp new images
 * with them, and project navigation will want them back - but they no longer
 * filter what is displayed.
 */
async function updateProject(
	set: SetFn,
	language: LanguageOption | null,
	bookCode: string,
	chapter: number,
	selectedImage: TranscribableDocument | null,
) {
	const userId = getCurrentUserId();
	if (!userId) {
		// Not signed in yet: nothing is readable, since the cache is per user.
		set({
			language,
			bookCode,
			chapter,
			images: [],
			selectedImage: null,
		});
		return;
	}

	// WK note: possible addition. More flexible would be if the img had an "order" property in case someone had a pdf out of order or whatever when uploaded and wanted ot change that order
	const images = sortDocuments(await imageRepo.getAllForUser(userId));

	// Match on id, not object identity: these documents were just deserialized
	// from IndexedDB, so they are never the same reference as the current
	// selection even when they represent the same image.
	const selected =
		images.find((image) => image.id === selectedImage?.id) ?? images[0];

	set({
		recentLanguages: imageRepo.getRecentLanguages(),
		language,
		bookCode,
		chapter,
		images,
		selectedImage: selected ?? null,
	});
}
