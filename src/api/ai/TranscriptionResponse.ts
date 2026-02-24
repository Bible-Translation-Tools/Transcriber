enum TranscriptionErrorCode {
	InvalidFileFormat = "invalid_file_format",
	FileSizeExceeded = "file_size_exceeded",
	AuthenticationError = "authentication_error",
	RateLimitExceeded = "rate_limit_exceeded",
	UnexpectedResponse = "unexpected_response",
	UnknownError = "unknown_error", // A general error for unexpected situations
	NoUserFound = "no_user_found",
}

/** Structured output returned by AI models when using JSON schema. */
export interface TranscriptionObject {
	transcription: string;
}

/**
 * JSON schema for transcription structured output.
 * Used with OpenAI and Gemini response_format.json_schema.
 */
export const TRANSCRIPTION_JSON_SCHEMA = {
	type: "object" as const,
	properties: {
		transcription: {
			type: "string" as const,
			description:
				"The transcribed text extracted from the image. Only the raw transcription, no quotes or extra symbols.",
		},
	},
	required: ["transcription"] as const,
	additionalProperties: false,
};

/**
 * Parses raw JSON string into StructuredTranscriptionOutput.
 * Returns null if parsing fails or shape is invalid.
 */
export function parseJsonResponse(content: string): TranscriptionObject | null {
	const trimmed = content.trim();
	if (!trimmed) return null;

	try {
		const obj = JSON.parse(trimmed);
		if (typeof obj?.transcription === "string") {
			return { transcription: obj.transcription };
		}
	} catch {
		// Fall through
	}
	return null;

}

interface TranscriptionSuccess {
	success: true;
	imageId: string;
	transcription: string;
}

interface TranscriptionError {
	success: false;
	imageId: string;
	error: string;
	errorCode: TranscriptionErrorCode;
}

type TranscriptionResponse = TranscriptionSuccess | TranscriptionError;

export { TranscriptionErrorCode };
export type { TranscriptionSuccess, TranscriptionError, TranscriptionResponse };
