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
	SYSTEM =
		"You are an expert at reading and transcribing text from images (including handwriting, print, and mixed languages). You must return a JSON object with exactly one key, 'transcription', whose value is the transcribed text from the image. Preserve the original language(s), numbers, punctuation, and line breaks as much as possible. Do not add explanations, labels, or metadata. If a small part is unreadable, skip or approximate it rather than inventing new content. Output only valid JSON that matches the expected schema.",
	PROMPT =
		"Carefully read the text in this image and provide only the transcription in the 'transcription' field of the JSON response.",
}
