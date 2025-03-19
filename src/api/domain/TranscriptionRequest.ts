export type TranscriptionRequest = {
	model: TranscriptionModel;
	image: string;
};

export enum TranscriptionModel {
	OPENAI = "openai",
	PIXTRAl = "pixtral",
}
