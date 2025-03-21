import OpenAIModel from "@api/ai/OpenAIModel.ts";
import { TranscriptionResponse, TranscriptionSuccess } from "@api/ai/TranscriptionResponse";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import { D1TranscriptionRepository } from "@api/persistence/D1TranscriptionRepository";
import { TranscriptionImage } from "@src/data/TranscriptionImage";
import * as v from "valibot";

export async function HandleTranscriptionRequest(
    userId: string,
    apiKeys: Map<TranscriptionModel, string>,
    body: TranscriptionRequest,
    imageRepo: D1TranscriptionRepository
): Promise<Response> {
    let transcriptionResponse: TranscriptionResponse | null = null;
    switch (body.model) {
        case TranscriptionModel.OPENAI: {
            const model = new OpenAIModel(
                apiKeys.get(TranscriptionModel.OPENAI)!,
                body.systemPrompt,
                body.prompt
            );
            transcriptionResponse = await model.transcribe(body.image);
            break;
        }
        case TranscriptionModel.PIXTRAl: {
            break;
        }
    }

    if (transcriptionResponse != null) {
        const bookCode = body.bookCode;
        const languageCode = body.languageCode;
        const chapter = body.chapter;

        let transcription = "";
        if (transcriptionResponse.success) {
            transcription = (transcriptionResponse as TranscriptionSuccess).transcription;
        }

        const image: TranscriptionImage = {
            id: body.imageId,
            user_deleted: false,
            userId: userId,
            path: `${userId}/${body.imageId}`,
            data: body.image,
            book_code: bookCode,
            language_code: languageCode,
            chapter: chapter,
            verse_start: 0,
            verse_end: 0,
            transcription: [
                {
                    human_modified: false,
                    prompt: body.prompt,
                    system_prompt: body.systemPrompt,
                    date: Date.now(),
                    model: body.model,
                    text: [
                        {
                            start_verse: 0,
                            end_verse: 0,
                            text: transcription,
                        }
                    ]
                }
            ]
        }

        await imageRepo.createTranscriptionImage(image)
        return Response.json(transcriptionResponse)
    } else {
        return Response.json({});
    }
}

export const transcriptionRequestSchema = v.object({
    model: v.string(),
    image: v.string(),
    imageId: v.string(),
    languageCode: v.string(),
    bookCode: v.string(),
    chapter: v.number(),
    systemPrompt: v.string(),
    prompt: v.string()
});
export type TranscriptionRequest = v.InferOutput<
    typeof transcriptionRequestSchema
>;
