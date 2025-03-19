import {
	TranscriptionErrorCode,
	type TranscriptionResponse,
} from "@api/ai/TranscriptionResponse";
import { TranscriptionModel, TranscriptionRequest } from "@api/domain/TranscriptionRequest";
import { apiV1, transcribeRoute } from "@api/index";

export default async function getTranscription(
	request: TranscriptionRequest,
): Promise<TranscriptionResponse> {
	const response = await fetch(`${apiV1}${transcribeRoute}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	console.log(response);

	try {
		const json = await response.json();
		console.log(response);
		return json;
	} catch (e) {
		console.log(response);
		console.log(e);
		return {
			success: false,
			error: "Error getting transcription",
			errorCode: TranscriptionErrorCode.UnknownError,
		};
	}
}
