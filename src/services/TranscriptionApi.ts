import type { TranscriptionSuccess } from "@api/ai/TranscriptionResponse.ts";
import type {
	TranscriptionRequest,
	UpdateTranscriptionRequest,
} from "@api/domain/TranscriptionRequest.ts";
import { apiV1 } from "@src/api";
import { TRANSCRIBE_ROUTE, UPDATE_TRANSCRIPTION_ROUTE } from "@src/constants";

export async function getTranscription(
	request: TranscriptionRequest,
): Promise<TranscriptionSuccess> {
	const response = await fetch(`${apiV1}${TRANSCRIBE_ROUTE}`, {
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
		if (Object.keys(json).includes("error")) {
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
	document: UpdateTranscriptionRequest,
): Promise<void> {
	const response = await fetch(`${apiV1}${UPDATE_TRANSCRIPTION_ROUTE}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(document),
	});

	console.log(response);
}
