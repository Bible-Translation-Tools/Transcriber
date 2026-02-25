import { DetaultTranscriptionPrompt } from "@api/domain/TranscriptionRequest.ts";
import OpenAI from "openai";
import type Model from "./Model";
import {
	parseJsonResponse,
	TranscriptionErrorCode,
	TRANSCRIPTION_JSON_SCHEMA,
	type TranscriptionResponse,
} from "./TranscriptionResponse";

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
		const response = await client.responses.create({
			model: "gpt-5.2",
			input: [
				{
					role: "system",
					content: this.systemPrompt,
				},
				{
					role: "user",
					content: [
						{
							type: "input_text",
							text: this.prompt,
						},
						{
							type: "input_image",
							image_url: base64Image,
							detail: "high",
						},
					],
				},
			],
			temperature: 0.0,
			max_output_tokens: 5000,
			text: {
				format: {
					type: "json_schema",
					name: "transcription_output",
					schema: TRANSCRIPTION_JSON_SCHEMA,
					strict: true,
				},
			},
		});

		const refusal = this.getRefusalFromOutput(response.output);
		if (refusal) {
			return {
				success: false,
				imageId,
				error: refusal,
				errorCode: TranscriptionErrorCode.UnexpectedResponse,
			};
		}

		const rawContent = this.getOutputText(response);
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
			error: "OpenAI model returned an unexpected response",
			errorCode: TranscriptionErrorCode.UnexpectedResponse,
		};
	}

	private getRefusalFromOutput(
		output: OpenAI.Responses.Response["output"],
	): string | undefined {
		return output
			?.flatMap((item) =>
				item?.type === "message" && Array.isArray(item.content)
					? item.content
					: [],
			)
			.find((part): part is { type: "refusal"; refusal: string } => part?.type === "refusal")
			?.refusal;
	}

	private getOutputText(response: OpenAI.Responses.Response): string {
		return (
			response.output_text ??
			(response.output?.[0] as { content?: Array<{ type?: string; text?: string }> } | undefined)
				?.content?.find((p) => p?.type === "output_text")?.text ??
			""
		);
	}
}
