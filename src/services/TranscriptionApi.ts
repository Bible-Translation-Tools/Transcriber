import {
	TranscriptionErrorCode,
	type TranscriptionResponse,
} from "@api/ai/TranscriptionResponse.ts";
import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import { apiV1 } from "@src/api";
import { transcribeRoute, updateTranscriptionRoute } from "@src/constants";

export async function getTranscription(
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
		console.log(json);
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

export async function sendUpdatedTranscription(
	imageId: string,
	transcription: string,
	language?: string,
	book?: string,
	chapter?: number,
	startVerse?: number,
	endVerse?: number,
): Promise<void> {
	const response = await fetch(`${apiV1}${updateTranscriptionRoute}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			imageId,
			transcription,
			language,
			book,
			chapter,
			startVerse,
			endVerse,
		}),
	});

	console.log(response);
}
