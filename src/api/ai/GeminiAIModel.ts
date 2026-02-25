import { DetaultTranscriptionPrompt } from "@api/domain/TranscriptionRequest.ts";
import { GoogleGenAI } from "@google/genai";
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
	// Required by the shared Model interface, but not used by the official Gemini client.
	baseUrl = "https://generativelanguage.googleapis.com";
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
			new GoogleGenAI({
				apiKey: this.key,
			}),
			imageId,
			base64Image,
		);
	}

	async transcribeImpl(
		client: GoogleGenAI,
		imageId: string,
		base64Image: string,
	): Promise<TranscriptionResponse> {
		// Support both raw base64 strings and data URLs.
		let mimeType = "image/png";
		let imageData = base64Image;
		const dataUrlMatch = base64Image.match(/^data:(.+?);base64,(.*)$/);
		if (dataUrlMatch) {
			mimeType = dataUrlMatch[1];
			imageData = dataUrlMatch[2];
		}

		const response = await client.models.generateContent({
			model: "gemini-3-flash-preview",
			contents: [
				{
					inlineData: {
						mimeType,
						data: imageData,
					},
				},
				{ text: this.prompt },
			],
			config: {
				systemInstruction: this.systemPrompt,
				responseMimeType: "application/json",
				responseSchema: TRANSCRIPTION_JSON_SCHEMA,
				maxOutputTokens: 15000,
				temperature: 0,
			},
		});

		const rawContent = response.text ?? "";
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
