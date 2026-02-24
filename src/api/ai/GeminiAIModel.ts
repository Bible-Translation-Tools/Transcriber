import { DetaultTranscriptionPrompt } from "@api/domain/TranscriptionRequest.ts";
import OpenAI from "openai";
import type Model from "./Model";
import {
	parseJsonResponse,
	TranscriptionErrorCode,
	TRANSCRIPTION_JSON_SCHEMA,
	type TranscriptionResponse,
} from "./TranscriptionResponse";

export default class GeminiAIModel implements Model {
	systemPrompt: string;
	prompt: string;
	baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
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

	async transcribe(
		imageId: string,
		base64Image: string,
	): Promise<TranscriptionResponse> {
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
		base64Image: string,
	): Promise<TranscriptionResponse> {
		const response = await client.chat.completions.create({
			model: "gemini-3-flash-preview",
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
			max_completion_tokens: 5000,
			response_format: {
				type: "json_schema",
				json_schema: {
					name: "transcription_output",
					strict: true,
					schema: TRANSCRIPTION_JSON_SCHEMA,
				},
			},
		});

		const message = response.choices[0].message;
		const refusal = message?.refusal;
		if (refusal) {
			return {
				success: false,
				imageId,
				error: refusal,
				errorCode: TranscriptionErrorCode.UnexpectedResponse,
			};
		}

		const rawContent = message?.content ?? "";
		const parsed = parseJsonResponse(rawContent);
		if (parsed) {
			return {
				success: true,
				imageId,
				transcription: parsed.transcription,
			};
		}

		return {
			success: false,
			imageId,
			error: "Invalid or missing structured transcription in response",
			errorCode: TranscriptionErrorCode.UnexpectedResponse,
		};
	}
}
