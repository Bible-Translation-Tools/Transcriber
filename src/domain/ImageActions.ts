import {
    type TranscriptionError,
    TranscriptionErrorCode,
    type TranscriptionSuccess,
} from "@api/ai/TranscriptionResponse.ts";
import type {TranscriptionRequest, UpdateTranscriptionRequest,} from "@api/domain/TranscriptionRequest.ts";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {TranscriptionStatus} from "@src/data/TranscriptionStatus.ts";
import type IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import type {TranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {toast} from "react-toastify";
import {calculateProgress} from "@src/domain/CalculateProgress.ts";

export const prepareImageForUpload = async (
    store: TranscriptionStore,
    imageRepo: IndexedDBImageRepository,
    image: Partial<TranscribableDocument>,
): Promise<[TranscribableDocument, TranscriptionRequest]> => {
    const updatedImage = await addMetadataFromLocation(store, image);
    await addImageToStore(store, imageRepo, updatedImage);
    const request = await constructTranscriptionRequest(store, updatedImage);
    return [updatedImage, request];
};

const addMetadataFromLocation = async (
    store: TranscriptionStore,
    image: Partial<TranscribableDocument>,
): Promise<TranscribableDocument> => {
    if (store.language == null) {
        console.error("Language is null, cannot add image!");
        throw new Error("Language is null, cannot add image!");
    }

    const language = store.language;
    const bookCode = store.bookCode;
    const chapter = store.chapter;

    // @ts-ignore: we shoudl probably valibot validate to make sure correct, but for now assume types are right
    const imageWithCurrentMetadata: TranscribableDocument = {
        ...image,
        id: self.crypto.randomUUID(),
        languageCode: language?.code,
        bookCode: bookCode,
        chapter: chapter,
    };

    return imageWithCurrentMetadata;
};

export const addImageToStore = async (
    store: TranscriptionStore,
    imageRepo: IndexedDBImageRepository,
    image: TranscribableDocument,
): Promise<void> => {
    console.log(`Adding image: ${image.id}.`);
    store.setSelectedImage(image);

    console.log(`Images in store: ${store.images.length}`);

    store.setImages((prev) => {
        console.log(`Updating: images in previous store: ${prev.length}`);
        return [...prev, image];
    });

    await imageRepo.storeImage(image.id, image);
};

export const constructTranscriptionRequest = async (
    store: TranscriptionStore,
    image: TranscribableDocument,
): Promise<TranscriptionRequest> => {
    const model = store.model;
    const systemPrompt = store.systemPrompt;
    const prompt = store.prompt;

    return {
        image: image.data,
        imageId: image.id,
        created: image.created,
        bookCode: image.bookCode,
        languageCode: image.languageCode,
        filename: image.filename,
        chapter: image.chapter,
        model: model,
        systemPrompt: systemPrompt,
        prompt: prompt,
    };
};

export const finalizeSuccessfulTranscription = async (
    store: TranscriptionStore,
    imageRepo: IndexedDBImageRepository,
    image: TranscribableDocument,
    transcription: TranscriptionSuccess,
): Promise<void> => {
    console.log("Finalizing transcription for image: ", image.id);
    const newImage: TranscribableDocument = {
        ...image,
        transcription: transcription.transcription,
        status: TranscriptionStatus.COMPLETED,
    };
    store.setImages((prev) =>
        prev.map((prevImage: TranscribableDocument) => {
            if (newImage.id === prevImage.id) {
                return newImage;
            }
            return prevImage;
        }),
    );

    store.setSelectedImage(newImage);
    await imageRepo.storeImage(newImage.id, newImage);

    const allImages = await imageRepo.retrieveAllImages()
    store.setProgress(calculateProgress(allImages ?? []))
};

export const constructTranscriptionUpdateRequest = async (
    image: TranscribableDocument,
): Promise<UpdateTranscriptionRequest> => {
    return {
        ...image,
        imageId: image.id,
        transcription: image.transcription ?? "",
    };
};

export const updateImage = async (
    store: TranscriptionStore,
    imageRepo: IndexedDBImageRepository,
    updatedImage: TranscribableDocument,
) => {
    console.log(`Updating image: ${updatedImage.id}.`);
    await imageRepo.storeImage(updatedImage.id, updatedImage);

    for (let i = 0; i < store.images.length; i++) {
        if (store.images[i].id === updatedImage.id) {
            store.images[i].transcription = updatedImage.transcription;
            store.images[i].status = updatedImage.status;
        }
    }
};

export const deleteImage = async (
    store: TranscriptionStore,
    imageRepo: IndexedDBImageRepository,
    imageToDelete: TranscribableDocument,
) => {
    await imageRepo.deleteImage(imageToDelete.id);
    store.setImages((prev) =>
        prev.filter((image) => image.id !== imageToDelete.id),
    );

    const allImages = await imageRepo.retrieveAllImages()
    store.setProgress(calculateProgress(allImages ?? []))
};

export const finalizeSuccessfulTranscriptionUpdate = async (
    imageRepo: IndexedDBImageRepository,
    store: TranscriptionStore,
    updatedImage: TranscribableDocument,
    reloadOnSuccess: boolean,
) => {
    if (reloadOnSuccess) {
        console.log(
            `Reloading on successful transcription: ${updatedImage.id}.`,
        );
        const selectedImageMoved =
            updatedImage.languageCode !== store.language?.code ||
            updatedImage.bookCode !== store.bookCode ||
            updatedImage.chapter !== store.chapter;
        console.log(`selectedImageMoved: ${selectedImageMoved}`);

        function updatedImagesList(prevImages: TranscribableDocument[]) {
            const updated = prevImages
                .map((image) =>
                    image.id === updatedImage.id ? updatedImage : image,
                )
                .filter((image) => {
                    return (
                        image.languageCode === store.language?.code &&
                        image.bookCode === store.bookCode &&
                        image.chapter === store.chapter
                    );
                });
            console.log(
                updated.map((lang: TranscribableDocument) => {
                    lang.languageCode;
                }),
            );
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

    const allImages = await imageRepo.retrieveAllImages()
    store.setProgress(calculateProgress(allImages ?? []))
};

export const handleTranscriptionError = (error: TranscriptionError) => {
    switch (error.errorCode) {
        case TranscriptionErrorCode.AuthenticationError:
            toast.error("Error: Authentication error");
            break;
        case TranscriptionErrorCode.NoUserFound:
            toast.error("Error: User not found");
            break;
        case TranscriptionErrorCode.RateLimitExceeded:
            toast.error("Error: RateLimit exceeded");
            break;
        default:
            toast.error("An error occurred.");
            break;
    }
};
