import OpenAIModel from "@api/ai/OpenAIModel.ts";
import { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import * as v from "valibot";

export async function HandleTranscriptionRequest(
	apiKeys: Map<TranscriptionModel, string>,
	body: TranscriptionRequest,
): Promise<Response> {
	switch (body.model) {
		case TranscriptionModel.OPENAI: {
			const model = new OpenAIModel(
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				apiKeys.get(TranscriptionModel.OPENAI)!,
			);
			const transcription = await model.transcribe(body.image);
			console.log(transcription);
			return Response.json(transcription);
		}
		case TranscriptionModel.PIXTRAl: {
			break;
		}
	}
	return Response.json({});
}

export const transcriptionRequestSchema = v.object({
	model: v.string(),
	image: v.string(),
});
export type TranscriptionRequest = v.InferOutput<
	typeof transcriptionRequestSchema
>;
