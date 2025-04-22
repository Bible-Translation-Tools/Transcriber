import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";
import type {TranscriptionModel} from "@api/domain/TranscriptionRequest.ts";
import {LanguageOption} from "@src/data/LanguageOption.tsx";

export interface TranscriptionState {
    language: LanguageOption | null;
    recentLanguages: string[];
    bookCode: string;
    chapter: number;
    images: TranscribableDocument[]; // We will manage this manually
    selectedImage: TranscribableDocument | null;
    model: TranscriptionModel;
    systemPrompt: string;
    prompt: string;
}