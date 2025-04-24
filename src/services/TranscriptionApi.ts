import type {
	TranscriptionSuccess
} from "@api/ai/TranscriptionResponse.ts";
import type { TranscriptionRequest } from "@api/domain/TranscriptionRequest.ts";
import { apiV1, transcribeRoute, updateTranscriptionRoute } from "@src/api";

export async function getTranscription(
	request: TranscriptionRequest,
): Promise<TranscriptionSuccess> {
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
		// throw if is TranscriptionError
		if (Object.keys(json).includes("error")){
			throw json;
		}
		return json;
	} catch (e) {
		console.log(response);
		console.log(e);
		throw e;
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
