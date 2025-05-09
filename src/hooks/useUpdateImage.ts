import type {TranscriptionError} from "@api/ai/TranscriptionResponse.ts";
import type {UpdateTranscriptionRequest} from "@api/domain/TranscriptionRequest.ts";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {
	constructTranscriptionUpdateRequest,
	finalizeSuccessfulTranscriptionUpdate,
	handleTranscriptionError,
	updateImage,
} from "@src/domain/ImageActions.ts";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {sendUpdatedTranscription} from "@src/services/TranscriptionApi.ts";
import {useMutation} from "@tanstack/react-query";

const imageRepo = IndexedDBImageRepository.getInstance();

export function useUpdateImage() {
    const store = useTranscriptionStore();

    async function executeTranscription(
        image: TranscribableDocument,
        request: UpdateTranscriptionRequest,
        reloadOnSuccess: boolean,
    ): Promise<[TranscribableDocument, boolean]> {
        await sendUpdatedTranscription(request);
        return [image, reloadOnSuccess];
    }

    const transcribe = useMutation({
        mutationFn: ({
                         image,
                         request,
                         reloadOnSuccess,
                     }: {
            image: TranscribableDocument;
            request: UpdateTranscriptionRequest;
            reloadOnSuccess: boolean;
        }) => {
            return executeTranscription(image, request, reloadOnSuccess);
        },
        onSuccess: async ([image, reloadOnSuccess]: [
            TranscribableDocument,
            boolean,
        ]) => {
            await finalizeSuccessfulTranscriptionUpdate(
                imageRepo,
                store,
                image,
                reloadOnSuccess,
            );
        },
        onError: async (error: TranscriptionError) => {
            handleTranscriptionError(error);
        },
    });

    async function updateTranscription(
        document: TranscribableDocument,
        reloadOnSuccess = false,
    ): Promise<void> {
        await updateImage(store, imageRepo, document);
        const request = await constructTranscriptionUpdateRequest(document);
        transcribe.mutate({
            image: document,
            request: request,
            reloadOnSuccess: reloadOnSuccess,
        });
    }

    return updateTranscription;
}
