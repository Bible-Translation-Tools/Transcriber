import { DetaultTranscriptionPrompt } from "@api/domain/TranscriptionRequest.ts";
import OpenAI from "openai";
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

	async transcribe(imageId: string, base64Image: any): Promise<TranscriptionResponse> {
		return this.transcribeImpl(
			new OpenAI({
				apiKey: this.key,
				baseURL: this.baseUrl,
				dangerouslyAllowBrowser: true,
			}),
			imageId,
			base64Image,
		);
	}

	async transcribeImpl(
		client: OpenAI,
		imageId: string,
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
			imageId: imageId,
			transcription: response.choices[0].message?.content ?? "",
		};
	}
}
