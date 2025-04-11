import {create} from 'zustand';
import {persist, StorageValue} from 'zustand/middleware';
import {DetaultTranscriptionPrompt, TranscriptionModel} from "@api/domain/TranscriptionRequest";
import type {LanguageOption} from "@src/components/LanguageDropdown";
import type {ImageData} from "@src/data/ImageData.tsx";
import {TranscriptionState} from "@src/persistence/store/TranscriptionState.ts";
import {TranscriptionActions} from "@src/persistence/store/TranscriptionActions.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";

const imageRepo = IndexedDBImageRepository.getInstance();

export type TranscriptionStore = TranscriptionState & TranscriptionActions;

export const useTranscriptionStore = create<TranscriptionStore>()(
    persist(
        (set, get) => ({
            language: {anglicized: "English", code: "en"},
            recentLanguages: [],
            bookCode: "mat",
            chapter: 1,
            images: [], // Initialize as empty, will be loaded from repository
            selectedImage: null,
            model: TranscriptionModel.OPENAI,
            systemPrompt: DetaultTranscriptionPrompt.SYSTEM,
            prompt: localStorage.getItem("prompt") || DetaultTranscriptionPrompt.PROMPT,

            setLanguage: (lang: LanguageOption) => {
                set({language: lang});
            },
            setBookCode: (code: string) => set({bookCode: code}),
            setChapter: (chapter: number) => set({chapter}),
            setImages: (images: ImageData[]) => set({images}),
            setSelectedImage: (image: ImageData | null) => set({selectedImage: image}),
            setModel: (model: TranscriptionModel) => set({model}),
            setSystemPrompt: (prompt: string) => set({systemPrompt: prompt}),
            setPrompt: (prompt: string) => set({prompt}),
        }),
        {
            name: 'transcription-storage',
            storage: {
                getItem: async (name) => {
                    debugger
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const existingValue = JSON.parse(str);

                    let selectedImage = null;
                    let images: ImageData[] | null = null;
                    if (existingValue.state.selectedImage) {
                        selectedImage = await imageRepo.retrieveImage(existingValue.state.selectedImage)
                    }
                    if (existingValue.state.images?.length != null  && existingValue.state.images.length > 0) {
                        images = await imageRepo.getImages(existingValue.state.images);
                    }

                    debugger
                    const rehydrated = {
                        ...existingValue,
                        state: {
                            ...existingValue.state,
                            selectedImage: selectedImage,
                            images: images ? images : [],
                        }
                    }

                    console.log("Rehydrating store with:", rehydrated);
                    debugger

                    return rehydrated;
                },
                setItem: async (name, newValue: StorageValue<TranscriptionState>) => {
                    const str = JSON.stringify({
                        ...newValue,
                        state: {
                            ...newValue.state,
                            selectedImage: (newValue.state.selectedImage) ? newValue.state.selectedImage.id : null,
                            images: newValue.state.images.map((image) => image.id),
                        },
                    })
                    localStorage.setItem(name, str)
                },
                removeItem: async (name) => localStorage.removeItem(name),
            },
            onRehydrateStorage: (state) => {
                console.log('rehydrating non-image state', state)
            },
        }
    )
);