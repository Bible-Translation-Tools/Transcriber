import type { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import type { Progress } from "@src/data/Progress.ts";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";

export interface TranscriptionState {
	language: LanguageOption | null;
	recentLanguages: string[];
	bookCode: string;
	chapter: number;
	images: TranscribableDocument[];
	progress: Progress;
	selectedImage: TranscribableDocument | null;
	model: TranscriptionModel;
	systemPrompt: string;
	prompt: string;
}
