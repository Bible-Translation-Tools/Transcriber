export type TranscriptionRequest = {
	model: TranscriptionModel;
	image: string;
	imageId: string;
	languageCode: string;
	created: number;
	filename: string;
	bookCode: string;
	chapter: number;
	systemPrompt: string;
	prompt: string;
};

export type UpdateTranscriptionRequest = {
	imageId: string;
	transcription: string;
	languageCode?: string;
	bookCode?: string;
	chapter?: number;
	startVerse?: number;
	endVerse?: number;
};

export enum TranscriptionModel {
	OPENAI = "openai",
	PIXTRAL = "pixtral",
	GEMINI = "gemini",
}

export enum DetaultTranscriptionPrompt {
	SYSTEM = "You are an expert at transcribing handwritten images of various languages. Respond with a JSON object that has exactly one key, 'transcription', whose value is the transcribed text from the image. Do not wrap the transcription in quotes, parentheses, brackets or other symbols. Output only valid JSON.",
	PROMPT = "The image says: ",
}
