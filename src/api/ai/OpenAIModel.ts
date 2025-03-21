import { DetaultTranscriptionPrompt } from "@api/domain/TranscriptionRequest.ts";
import OpenAI from "openai";
import { ApiKeyStatus } from "./ApiKeyStatus";
import type Model from "./Model";
import type { TranscriptionResponse } from "./TranscriptionResponse";

export default class OpenAIModel implements Model {
	systemPrompt: string;
	prompt: string;
	baseUrl = "https://api.openai.com/v1";
	key: string;

	constructor(
		key: string,
		systemPrompt: string = DetaultTranscriptionPrompt.SYSTEM,
		prompt: string = DetaultTranscriptionPrompt.PROMPT,
	) {
		this.key = key;
		this.systemPrompt = systemPrompt;
		this.prompt = prompt;
	}

	async keyStatus(): Promise<ApiKeyStatus> {
		try {
			const openai = new OpenAI({
				apiKey: this.key,
				baseURL: this.baseUrl,
				dangerouslyAllowBrowser: true,
			});

			const models = await openai.models.list(); // Check key validity
			console.log(`models are ${models.data.map((model) => model.id)}`);
		} catch (error: any) {
			if (
				error.status === 401 ||
				error.message.includes("Incorrect API key provided") ||
				error.name === "OpenAIAuthenticationError"
			) {
				console.error("OpenAI API Key Invalid:", error.message);
				return ApiKeyStatus.Invalid;
			}
			console.error("Other Error checking OpenAI API Key:", error);
			return ApiKeyStatus.Invalid;
		}
		return ApiKeyStatus.Valid;
	}
	async transcribe(base64Image: any): Promise<TranscriptionResponse> {
		return this.transcribeImpl(
			new OpenAI({
				apiKey: this.key,
				baseURL: this.baseUrl,
				dangerouslyAllowBrowser: true,
			}),
			base64Image,
		);
	}

	async transcribeImpl(
		client: OpenAI,
		base64Image: any,
	): Promise<TranscriptionResponse> {
		const response = await client.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: this.systemPrompt },
				{
					role: "user",
					content: [
						{
							type: "text",
							text: this.prompt,
						},
						{
							type: "image_url",
							image_url: {
								url: `${base64Image}`,
							},
						},
					],
				},
			],
			temperature: 0.0,
			max_tokens: 500,
		});
		return {
			success: true,
			transcription: response.choices[0].message?.content ?? "",
		};
	}
}
