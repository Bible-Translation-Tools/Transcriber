export interface TranscribableDocument {
    id: string;
    filename: string;
    created: EpochTimeStamp;
    url: string; // Key for IndexedDB
    data: any;
    transcription: string | undefined | null; // Optional transcription
    languageCode: string;
    bookCode: string;
    chapter: number;
    startVerse?: number | undefined;
    endVerse?: number | undefined;
    loading?: boolean;
}