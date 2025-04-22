import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";
import {getTranscription, sendUpdatedTranscription} from "@src/services/TranscriptionApi.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import type {TranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import type {TranscriptionRequest} from "@api/domain/TranscriptionRequest.ts";
import type {TranscriptionErrorCode} from "@api/ai/TranscriptionResponse.ts";

const imageRepo = IndexedDBImageRepository.getInstance()

export const addImage = (
    store: TranscriptionStore,
    image: TranscribableDocument,
    onError: (err: TranscriptionErrorCode, errorMessage: string) => void,
) => {
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

    const imageWithCurrentMetadata: TranscribableDocument = {
        ...image,
        id: self.crypto.randomUUID(),
        languageCode: language.code,
        bookCode: bookCode,
        chapter: chapter,
    };

    console.log(`Adding image: ${imageWithCurrentMetadata.id}.`);
    store.setSelectedImage(imageWithCurrentMetadata);

    console.log(`Images in store: ${store.images.length}`)

    store.setImages((prev: any) => {
        console.log(`Updating: images in previous store: ${prev.length}`)
        return [
            ...prev,
            imageWithCurrentMetadata,
        ]
    });

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
            store.setImages((prev: any) => (prev.map((image: TranscribableDocument) => {
                if (image.id === imageWithCurrentMetadata.id) {
                    return newImage;
                }
                return image;
            })));

            store.setSelectedImage(newImage);
            updateTranscription(store, newImage);
        } else {
            onError(transcription.errorCode, transcription.error)
        }
    })();
};

export const updateImage = async (
    store: TranscriptionStore,
    updatedImage: TranscribableDocument,
    reloadOnSuccess = true
) => {
    console.log(`Updating image: ${updatedImage.id}.`);
    await imageRepo.storeImage(updatedImage.id, updatedImage)

    if (updatedImage?.transcription) {
        await sendUpdatedTranscription(
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
        console.log(`Reloading on successful transcription: ${updatedImage.id}.`);
        const selectedImageMoved = updatedImage.languageCode !== store.language?.code || updatedImage.bookCode !== store.bookCode || updatedImage.chapter !== store.chapter;
        console.log(`selectedImageMoved: ${selectedImageMoved}`);

        function updatedImagesList(prevImages: TranscribableDocument[]) {
            const updated = prevImages.map((image) =>
                image.id === updatedImage.id
                    ? updatedImage
                    : image,
            ).filter(
                (image) => {
                    return image.languageCode === store.language?.code && image.bookCode === store.bookCode && image.chapter === store.chapter;
                }
            )
            console.log(updated.map((lang: TranscribableDocument) => {
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
            console.log(`Updating selected image: ${updatedImage.id}.`);
            store.setSelectedImage(updatedImage);
        } else {
            console.log("nulling out selectedImage");
            store.setSelectedImage(null);
        }
    }
};

export const updateTranscription = (
    store: TranscriptionStore,
    imageToUpdate: TranscribableDocument
) => {
    updateImage(store, imageToUpdate, false);
};

export async function resubmitImageForTranscription(
    store: TranscriptionStore,
    imageToUpdate: TranscribableDocument,
    onError: (err: TranscriptionErrorCode, errorMessage: string) => void,
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
    } else {
        onError(transcription.errorCode, transcription.error)
    }
}