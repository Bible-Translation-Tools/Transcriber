import {
	TranscriptionErrorCode,
	type TranscriptionResponse,
} from "@api/ai/TranscriptionResponse.ts";
import { DetaultTranscriptionPrompt } from "@api/domain/TranscriptionRequest.ts";
import { Mistral } from "@mistralai/mistralai";
import type { ContentChunk } from "@mistralai/mistralai/models/components";
import type Model from "./Model";

export class PixtralAIModel implements Model {
	baseUrl = "https://api.mistral.ai/v1/models";
	key: string;
	systemPrompt: string;
	prompt: string;

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
		return await this.transcribeImpl(
			new Mistral({
				apiKey: this.key,
			}),
			imageId,
			base64Image,
		);
	}

	async transcribeImpl(
		client: Mistral,
		imageId: string,
		base64Image: string,
	): Promise<TranscriptionResponse> {
		console.log("Sending image to pixtral");
		const response = await client.chat.complete({
			model: "pixtral-12b",
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
							imageUrl: {
								url: `${base64Image}`,
							},
						},
					],
				},
			],
			temperature: 0.0,
			maxTokens: 500,
		});

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const messageContent = response.choices![0].message?.content;
		const isContentValid = !!messageContent;
		const transcription = extractTranscription(messageContent);
		if (isContentValid) {
			return {
				success: isContentValid,
				imageId: imageId,
				transcription: transcription,
			};
		}
		return {
			success: false,
			imageId: imageId,
			error: "Error extracting transcription from pixtral response",
			errorCode: TranscriptionErrorCode.UnknownError,
		};
	}
}

function extractTranscription(
	content: string | ContentChunk[] | null | undefined,
): string {
	if (!content) {
		return "";
	}

	if (Array.isArray(content)) {
		return content
			.map((chunk) => {
				if (chunk.type === "text" && chunk.text) {
					return chunk.text;
				}
				return "";
			})
			.join("");
	}

	return String(content).trim();
}
