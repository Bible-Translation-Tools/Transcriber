import OpenAIModel from '../ai/OpenAIModel.ts';
import { TranscriptionModel, TranscriptionRequest } from './TranscriptionRequest.ts';

export default async function HandleTranscriptionRequest(
    apiKeys: Map<TranscriptionModel, string>, 
    request: Request
): Promise<Response> {

    const method = request.method
    const tRequest = await request.json();

    if (method == "POST" && isTranscriptionRequest(tRequest)) {
        console.log("got a post request");
        console.log(tRequest)
        switch (tRequest.model) {
            case TranscriptionModel.OPENAI: {
                const model = new OpenAIModel(apiKeys.get(TranscriptionModel.OPENAI)!!)
                const transcription = await model.transcribe(tRequest.image);
                console.log(transcription)
                return Response.json(transcription)
            }
            case TranscriptionModel.PIXTRAl: {
                break;
            }
        }
        return Response.json({})
    } else {
        console.error("Invalid TranscriptionRequest:", tRequest);
        return new Response(JSON.stringify({ error: "Invalid request format" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}

function isTranscriptionRequest(obj: any): obj is TranscriptionRequest {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.model === 'string' &&
        typeof obj.image === 'string'
    );
}