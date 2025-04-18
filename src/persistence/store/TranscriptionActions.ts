import type { ProjectImageData } from "@src/data/ImageData.tsx";
import type { TranscriptionModel } from "@api/domain/TranscriptionRequest.ts";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";

export interface TranscriptionActions {
	setLanguage: (option: LanguageOption) => void;
	setBookCode: (code: string) => void;
	setChapter: (chapter: number) => void;
	// setImages: (newArrOrSetterFn: ReactStyleStateSetter<ImageData[]>) => void,
	setSelectedImage: (image: ProjectImageData | null) => void;
	setModel: (model: TranscriptionModel) => void;
	setSystemPrompt: (prompt: string) => void;
	setPrompt: (prompt: string) => void;
	refreshProject: () => void;
}
