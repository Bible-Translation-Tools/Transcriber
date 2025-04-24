import {useMutation} from "@tanstack/react-query";
import type {TranscriptionRequest} from "@api/domain/TranscriptionRequest.ts";
import {getTranscription} from "@src/services/TranscriptionApi.ts";
import {toast} from "react-toastify";

export const useGetTranscription = (request: TranscriptionRequest) => {
    return useMutation({
        mutationFn: () => getTranscription(request),
        onError: () => {
            toast.error("Network Error: Could not get transcription.");
        }
    });
};