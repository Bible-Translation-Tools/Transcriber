import { ApiKeyStatus } from "./ApiKeyStatus";
import OpenAI from 'openai';
import Model from "./Model";
import { TranscriptionResponse } from "./TranscriptionResponse";

export default class OpenAIModel implements Model {

    systemPrompt = `
    You are an expert at transcribing handwritten images of various languages.
    People will give you handwritten documents of various languages, and you are eager to help transcribe them!
    Your assistance is very helpful in saving them time, and you are happy to do so!
    They will provide you with an image, and tell you "The image reads: " in which you will respond only with what is written
    in the document."
    `
    prompt = "Please transcribe the following document. The image reads: "

    baseUrl: string = "https://api.openai.com/v1";
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    async keyStatus(): Promise<ApiKeyStatus> {
        try {
            const openai = new OpenAI({
                apiKey: this.key,
                baseURL: this.baseUrl,
                dangerouslyAllowBrowser: true
            });

            const models = await openai.models.list(); // Check key validity
            console.log(`models are ${models.data.map((model)=>model.id)}`);
        } catch (error: any) {
            if (
                error.status === 401
                || error.message.includes("Incorrect API key provided")
                || error.name === 'OpenAIAuthenticationError'
            ) {
                console.error("OpenAI API Key Invalid:", error.message);
                return ApiKeyStatus.Invalid;
            } else {
                console.error("Other Error checking OpenAI API Key:", error);
                return ApiKeyStatus.Invalid;
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
                                "url": `${base64Image}`
                            },
                        }
                    ]
                }
            ],
            temperature: 0.0,
            max_tokens: 500
        });
        return { success: true, transcription: response.choices[0].message?.content ?? "" }
    }
}