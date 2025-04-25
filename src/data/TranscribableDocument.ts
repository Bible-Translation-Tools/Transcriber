export interface TranscribableDocument {
	[key: string]:
		| string
		| number
		| undefined
		| EpochTimeStamp
		| null
		| boolean;
	id: string;
	filename: string;
	created: EpochTimeStamp;
	// todo: delete, not an img url, and not need to keep blob urls around
	data: any;
	transcription: string | undefined | null; // Optional transcription
	languageCode: string;
	bookCode: string;
	chapter: number;
	startVerse?: number | undefined;
	endVerse?: number | undefined;
	loading?: boolean;
}
