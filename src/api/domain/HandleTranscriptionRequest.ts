import OpenAIModel from "@api/ai/OpenAIModel.ts";

import { PixtralAIModel } from "@api/ai/PixtralAIModel.ts";
import {
	TranscriptionErrorCode,
	type TranscriptionResponse,
	type TranscriptionSuccess,
} from "@api/ai/TranscriptionResponse";
import type { TranscriptionImage } from "@api/data/TranscriptionImage.ts";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import type { D1TranscriptionRepository } from "@api/persistence/D1TranscriptionRepository";
import * as v from "valibot";

export async function HandleUpdateTranscriptionRequest(
	body: UpdateTranscriptionRequest,
	imageRepo: D1TranscriptionRepository,
): Promise<Response> {
	await imageRepo.updateTranscriptionText(body.imageId, body.transcription);
	return Response.json({});
}

export async function HandleTranscriptionRequest(
	userId: string,
	apiKeys: Map<TranscriptionModel, string>,
	body: TranscriptionRequest,
	imageRepo: D1TranscriptionRepository,
): Promise<Response> {
	console.log("Handling Transcription Request");
	let transcriptionResponse: TranscriptionResponse | null = null;

	switch (body.model) {
		case TranscriptionModel.OPENAI: {
			const apiKey = apiKeys.get(TranscriptionModel.OPENAI);
			if (!apiKey) {
				return Response.json({
					success: false,
					imageId: body.imageId,
					error: "Error, could not get api key from environment for Pixtral",
					errorCode: TranscriptionErrorCode.AuthenticationError,
				});
			}
			console.log("User selection: OpenAI");
			const model = new OpenAIModel(
				apiKey,
				body.systemPrompt,
				body.prompt,
			);
			transcriptionResponse = await model.transcribe(
				body.imageId,
				body.image,
			);
			break;
		}
		case TranscriptionModel.PIXTRAL: {
			const apiKey = apiKeys.get(TranscriptionModel.PIXTRAL);
			if (!apiKey) {
				return Response.json({
					success: false,
					imageId: body.imageId,
					error: "Error, could not get api key from environment for Pixtral",
					errorCode: TranscriptionErrorCode.AuthenticationError,
				});
			}
			console.log("User selection: Pixtral");
			const model = new PixtralAIModel(
				apiKey,
				body.systemPrompt,
				body.prompt,
			);
			transcriptionResponse = await model.transcribe(
				body.imageId,
				body.image,
			);
			break;
		}
		default: {
			console.log(`Missing model ${body.model}`);
			console.log(
				`Pixtral: ${body.model === TranscriptionModel.PIXTRAL}`,
			);
		}
	}

	if (transcriptionResponse != null) {
		const bookCode = body.bookCode;
		const languageCode = body.languageCode;
		const chapter = body.chapter;

		let transcription = "";
		if (transcriptionResponse.success) {
			console.log("Transcription was successful!");
			transcription = (transcriptionResponse as TranscriptionSuccess)
				.transcription;
		}

		const image: TranscriptionImage = {
			id: body.imageId,
			user_deleted: false,
			userId: userId,
			path: `${userId}/${body.imageId}`,
			filename: body.filename,
			created: body.created,
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
					text: transcription,
				},
			],
		};

		console.log("Storing transcription.");
		await imageRepo.createTranscriptionImage(image);
		console.log("Returning transcription response.");
		return Response.json(transcriptionResponse);
	}
	console.error("Transcription request failed.");
	return Response.json({});
}

export const transcriptionRequestSchema = v.object({
	model: v.string(),
	image: v.string(),
	imageId: v.string(),
	languageCode: v.string(),
	filename: v.string(),
	created: v.number(), //unix timestamp
	bookCode: v.string(),
	chapter: v.number(),
	systemPrompt: v.string(),
	prompt: v.string(),
});
export type TranscriptionRequest = v.InferOutput<
	typeof transcriptionRequestSchema
>;

export const updateTranscriptionRequestSchema = v.object({
	imageId: v.string(),
	transcription: v.string(),
	languageCode: v.optional(v.string()),
	bookCode: v.optional(v.string()),
	chapter: v.optional(v.number()),
	startVerse: v.optional(v.number()),
	endVerse: v.optional(v.number()),
});
export type UpdateTranscriptionRequest = v.InferOutput<
	typeof updateTranscriptionRequestSchema
>;
