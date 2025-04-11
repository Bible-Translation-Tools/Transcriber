import {ImageData} from "@src/data/ImageData.tsx";
import {getTranscription, sendUpdatedTranscription} from "@src/domain/getTranscription.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import {TranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import type {TranscriptionRequest} from "@api/domain/TranscriptionRequest.ts";

const imageRepo = IndexedDBImageRepository.getInstance()

export const addImage = (
    store: TranscriptionStore,
    image: ImageData
) => {
    console.log(store);

    if (store.language == null) {
        console.error("Language is null, cannot add image!");
        return;
    }

    const language = store.language;
    const bookCode = store.bookCode;
    const chapter = store.chapter;
    const model = store.model;
    const systemPrompt = store.systemPrompt;
    const prompt = store.prompt;

    const imageWithCurrentMetadata: ImageData = {
        ...image,
        id: self.crypto.randomUUID(),
        languageCode: language.code,
        bookCode: bookCode,
        chapter: chapter,
    };

    console.log(`Adding image: ${imageWithCurrentMetadata.id}.`);
    store.setSelectedImage(imageWithCurrentMetadata);

    store.setImages([
        ...store.images,
        imageWithCurrentMetadata,
    ]);

    (async () => {
        await imageRepo.storeImage(imageWithCurrentMetadata.id, imageWithCurrentMetadata)

        const transcription = await getTranscription({
            image: imageWithCurrentMetadata.data,
            imageId: imageWithCurrentMetadata.id,
            bookCode: imageWithCurrentMetadata.bookCode,
            languageCode: imageWithCurrentMetadata.languageCode,
            chapter: imageWithCurrentMetadata.chapter,
            model: model,
            systemPrompt: systemPrompt,
            prompt: prompt,
        });
        if (transcription.success) {
            const newImage = {
                ...imageWithCurrentMetadata,
                transcription: transcription.transcription,
                loading: false,
            }

            store.setImages(store.images.map((image) => {
                if (image.id === imageWithCurrentMetadata.id) {
                    return newImage;
                } else {
                    return image;
                }
            }));

            store.setSelectedImage(newImage);
            updateTranscription(store, newImage);
        }
    })();
};

export const updateImage = (
    store: TranscriptionStore,
    updatedImage: ImageData,
    reloadOnSuccess = true
) => {
    imageRepo.storeImage(updatedImage.id, updatedImage.data)

    if (updatedImage?.transcription) {
        sendUpdatedTranscription(
            updatedImage.id,
            updatedImage.transcription,
            updatedImage.languageCode,
            updatedImage.bookCode,
            updatedImage.chapter,
            updatedImage?.startVerse,
            updatedImage?.endVerse,
        );
    }

    for (let i = 0; i < store.images.length; i++) {
        if (store.images[i].id === updatedImage.id) {
            store.images[i].transcription = updatedImage.transcription;
        }
    }

    if (reloadOnSuccess) {
        const selectedImageMoved = updatedImage.languageCode !== store.language?.code || updatedImage.bookCode !== store.bookCode || updatedImage.chapter !== store.chapter;

        function updatedImagesList(prevImages: ImageData[]) {
            const updated = prevImages.map((image) =>
                image.id === updatedImage.id
                    ? updatedImage
                    : image,
            ).filter(
                (image) => {
                    return image.languageCode === store.language?.code && image.bookCode === store.bookCode && image.chapter === store.chapter;
                }
            )
            console.log(updated.map((lang: ImageData) => {
                lang.languageCode
            }))
            return updated;
        }

        store.setImages(updatedImagesList(store.images));

        if (
            !selectedImageMoved &&
            store.selectedImage &&
            store.selectedImage.id === updatedImage.id
        ) {
            store.setSelectedImage(updatedImage);
        } else {
            console.log("nulling out selectedImage");
            store.setSelectedImage(null);
        }
    }
};

export const updateTranscription = (
    store: TranscriptionStore,
    imageToUpdate: ImageData
) => {
    updateImage(store, imageToUpdate, false);
};

export async function resubmitImageForTranscription(
    store: TranscriptionStore,
    imageToUpdate: ImageData
): Promise<void> {
    updateImage(store, {...imageToUpdate, transcription: null, loading: true});

    const request: TranscriptionRequest = {
        model: store.model,
        image: imageToUpdate.data,
        imageId: imageToUpdate.id,
        languageCode: imageToUpdate.languageCode,
        bookCode: imageToUpdate.bookCode,
        chapter: imageToUpdate.chapter,
        systemPrompt: store.systemPrompt,
        prompt: store.prompt,
    };
    const transcription = await getTranscription(request);
    if (transcription.success) {
        imageToUpdate.transcription = transcription.transcription;
        updateImage(store, imageToUpdate, true);
    }
}