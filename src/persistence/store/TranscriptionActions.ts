import type { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";

type ReactStyleStateSetter<T> = T | ((prev: T) => T);

export interface TranscriptionActions {
	setLanguage: (option: LanguageOption) => void;
	setBookCode: (code: string) => void;
	setChapter: (chapter: number) => void;
	setImages: (
		newArrOrSetterFn: ReactStyleStateSetter<TranscribableDocument[]>,
	) => void;
	setSelectedImage: (image: TranscribableDocument | null) => void;
	setModel: (model: TranscriptionModel) => void;
	setSystemPrompt: (prompt: string) => void;
	setPrompt: (prompt: string) => void;
	refreshProject: () => void;
}
