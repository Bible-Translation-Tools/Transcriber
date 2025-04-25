enum TranscriptionErrorCode {
	InvalidFileFormat = "invalid_file_format",
	FileSizeExceeded = "file_size_exceeded",
	AuthenticationError = "authentication_error",
	RateLimitExceeded = "rate_limit_exceeded",
	UnexpectedResponse = "unexpected_response",
	UnknownError = "unknown_error", // A general error for unexpected situations
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
