export type TranscriptionImage = {
	id: string;
	data: string;
	language_code: string;
	book_code: string;
	chapter: number;
	verse_start: number;
	verse_end: number;
	transcription: Transcription[];
};

export type Transcription = {
	human_modified: boolean;
	model: string;
	prompt: string;
	system_prompt: string;
	text: TranscriptionText[];
	date: EpochTimeStamp;
};

export type TranscriptionText = {
	start_verse: number;
	end_verse: number;
	text: string;
};
