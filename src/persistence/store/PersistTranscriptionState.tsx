import {PersistStorage, StorageValue} from "zustand/middleware";
import {TranscriptionState} from "@src/persistence/store/TranscriptionState.ts";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";

const imageRepo = IndexedDBImageRepository.getInstance();

export const transcriptionStateStorage : PersistStorage<TranscriptionState> =  {
    getItem: async (name) => {
        const str = localStorage.getItem(name);
        if (!str) return null;
        const existingValue = JSON.parse(str);

        let selectedImage = null;
        let images: TranscribableDocument[] | null = null;
        let recentLanguages: string[] = [];
        if (existingValue.state.selectedImage) {
            selectedImage = await imageRepo.retrieveImage(existingValue.state.selectedImage)
            selectedImage = {...selectedImage, loading: false};
        }

        const {language, bookCode, chapter} = existingValue.state
        if (language != null) {
            images = await imageRepo.getImages(language.code, bookCode, chapter);
            images = images.map((image) => ({...image, loading: false }));
            recentLanguages = imageRepo.getRecentLanguages();
        } else {
            await imageRepo.retrieveAllImages();
            recentLanguages = imageRepo.getRecentLanguages();
        }

        const rehydrated = {
            ...existingValue,
            state: {
                ...existingValue.state,
                recentLanguages: recentLanguages,
                selectedImage: selectedImage,
                images: images ? images : [],
            }
        }

        console.log("Rehydrating store with:", rehydrated);
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
}