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
