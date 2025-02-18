import { ApiKeyStatus } from "./ApiKeyStatus";
import OpenAI from 'openai';
import Model from "./Model";
import { TranscriptionResponse } from "./TranscriptionResponse";

export default class OpenAIModel implements Model {

    systemPrompt = "You are an expert at transcribing handwritten images of various languages. Respond only with the transcription of the image provided."
    prompt = "The image says: "


    baseUrl: string = "https://api.openai.com/v1";
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    async keyIsValid(): Promise<ApiKeyStatus> {
        try {
            const openai = new OpenAI({
                apiKey: this.key,
                baseURL: this.baseUrl,
                dangerouslyAllowBrowser: true
            });

            const models = await openai.models.list(); // Check key validity
            console.log(`models are ${models}`)
        } catch (error: any) {
            if (error.response) { // Check for API errors
                const status = error.response.status;
                if (
                    status === 401
                    || error.message.includes("Incorrect API key provided")
                    || error.name === 'OpenAIAuthenticationError'
                ) {
                    console.error("OpenAI API Key Invalid:", error.message);
                    return ApiKeyStatus.Invalid;
                } else if (status === 429) { // Check for Rate Limiting (status code may vary)
                    console.error("OpenAI API Key Rate Limited:", error.message);
                    return ApiKeyStatus.RateLimited;
                } else {
                    console.error(`OpenAI API Error (${status}):`, error.message);
                    return ApiKeyStatus.OtherError;
                }
            } else if (error.message.includes("NetworkError")) { // Check for network errors
                console.error("Network Error checking OpenAI API Key:", error.message);
                return ApiKeyStatus.NetworkError;
            } else {
                console.error("Other Error checking OpenAI API Key:", error);
                return ApiKeyStatus.OtherError;
            }
        }
        return ApiKeyStatus.Valid;
    }
    async transcribe(base64Image: any): Promise<TranscriptionResponse> {
        return this.transcribeImpl(new OpenAI({
            apiKey: this.key,
            baseURL: this.baseUrl,
            dangerouslyAllowBrowser: true
        }), base64Image)
    }

    async transcribeImpl(client: OpenAI, base64Image: any): Promise<TranscriptionResponse> {
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: this.systemPrompt },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: this.prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                "url": `data:image/jpeg;base64,${base64Image}`
                            },
                        }
                    ]
                }
            ],
            temperature: 0.0,
            max_tokens: 500
        });
        return {success: true, transcription: response.choices[0].message?.content ?? ""}
    }
}