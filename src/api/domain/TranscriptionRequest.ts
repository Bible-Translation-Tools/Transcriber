export type TranscriptionRequest = {
	model: TranscriptionModel;
	image: string;
    imageId: string;
    languageCode: string;
    bookCode: string;
    chapter: number;
};

export enum TranscriptionModel {
	OPENAI = "openai",
	PIXTRAl = "pixtral",
}

export enum DetaultTranscriptionPrompt {
    SYSTEM = "You are an expert at transcribing handwritten images of various languages. Respond only with the transcription of the image provided, do not output the transcription in quotes, parentheses, brackets or other such symbols",
    PROMPT = "The image says: ",
}