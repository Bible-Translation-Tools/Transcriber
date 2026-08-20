import type { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import type { Progress } from "@src/data/Progress.ts";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";

type ReactStyleStateSetter<T> = T | ((prev: T) => T);

export interface TranscriptionActions {
	setLanguage: (option: LanguageOption) => Promise<void>;
	setBookCode: (code: string) => Promise<void>;
	setChapter: (chapter: number) => Promise<void>;
	setImages: (
		newArrOrSetterFn: ReactStyleStateSetter<TranscribableDocument[]>,
	) => void;
	setSelectedImage: (image: TranscribableDocument | null) => void;
	setModel: (model: TranscriptionModel) => void;
	setSystemPrompt: (prompt: string) => void;
	setProgress: (progress: Progress) => void;
	setPrompt: (prompt: string) => void;
	refreshProject: () => Promise<void>;
}
