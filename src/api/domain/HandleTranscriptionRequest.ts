import OpenAIModel from "@api/ai/OpenAIModel.ts";

import { PixtralAIModel } from "@api/ai/PixtralAIModel.ts";
import {
	TranscriptionErrorCode,
	type TranscriptionResponse,
	type TranscriptionSuccess,
} from "@api/ai/TranscriptionResponse";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import type { D1TranscriptionRepository } from "@api/persistence/D1TranscriptionRepository";
import type { TranscriptionImage } from "@src/data/TranscriptionImage";
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
	let transcriptionResponse: TranscriptionResponse | null = null;

	switch (body.model) {
		case TranscriptionModel.OPENAI: {
			const apiKey = apiKeys.get(TranscriptionModel.OPENAI);
			if (!apiKey) {
				return Response.json({
					success: false,
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
			transcriptionResponse = await model.transcribe(body.image);
			break;
		}
		case TranscriptionModel.PIXTRAL: {
			const apiKey = apiKeys.get(TranscriptionModel.PIXTRAL);
			if (!apiKey) {
				return Response.json({
					success: false,
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
			transcriptionResponse = await model.transcribe(body.image);
			break;
		}
	}

	if (transcriptionResponse != null) {
		const bookCode = body.bookCode;
		const languageCode = body.languageCode;
		const chapter = body.chapter;

		let transcription = "";
		if (transcriptionResponse.success) {
			transcription = (transcriptionResponse as TranscriptionSuccess)
				.transcription;
		}

		const image: TranscriptionImage = {
			id: body.imageId,
			user_deleted: false,
			userId: userId,
			path: `${userId}/${body.imageId}`,
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

		await imageRepo.createTranscriptionImage(image);
		return Response.json(transcriptionResponse);
	}
	return Response.json({});
}

export const transcriptionRequestSchema = v.object({
	model: v.string(),
	image: v.string(),
	imageId: v.string(),
	languageCode: v.string(),
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
});
export type UpdateTranscriptionRequest = v.InferOutput<
	typeof updateTranscriptionRequestSchema
>;
