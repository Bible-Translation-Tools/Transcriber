import type {LanguageOption} from "@components/LanguageDropdown.tsx";
import type {ImageData} from "@src/data/ImageData.tsx";
import type {TranscriptionModel} from "@api/domain/TranscriptionRequest.ts";

export interface TranscriptionState {
    language: LanguageOption | null;
    recentLanguages: string[];
    bookCode: string;
    chapter: number;
    images: ImageData[]; // We will manage this manually
    selectedImage: ImageData | null;
    model: TranscriptionModel;
    systemPrompt: string;
    prompt: string;
}