import HandleTranscriptionRequest from "./domain/HandleTranscriptionRequest";
import { TranscriptionModel } from "./domain/TranscriptionRequest";


export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api/v1/transcribe/")) {

            function createApiMap(): Map<TranscriptionModel, string> {
                const keys =  new Map<TranscriptionModel, string>();
                keys.set(TranscriptionModel.OPENAI, env.OPENAI_KEY);
                return keys;
            }

            const htr = await HandleTranscriptionRequest(createApiMap(), request)
            return htr
        }

        return env.ASSETS.fetch(request);
    },
} satisfies ExportedHandler<Env>;
