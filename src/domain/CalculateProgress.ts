import type {TranscribableDocument} from "@src/data/TranscribableDocument.ts";
import {Progress} from "@src/data/Progress.ts";

export function calculateProgress(documents: TranscribableDocument[]): Progress {
    debugger
    const contentProgress: Progress = {};

    for (const doc of documents) {
        const {languageCode, bookCode, chapter} = doc;
        const imageCount = 1;

        if (!contentProgress[languageCode]) {
            contentProgress[languageCode] = {};
        }

        if (!contentProgress[languageCode][bookCode]) {
            contentProgress[languageCode][bookCode] = {};
        }

        const chapterString = String(chapter);
        contentProgress[languageCode][bookCode][chapterString] =
            (contentProgress[languageCode][bookCode][chapterString] || 0) + imageCount;
    }

    return contentProgress;
}