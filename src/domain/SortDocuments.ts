import { bookOrder } from "@src/data/Books.ts";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";

/**
 * Orders the file list by where each image belongs: language, then book, then
 * chapter, then upload time.
 */
function compareDocuments(
	a: TranscribableDocument,
	b: TranscribableDocument,
): number {
	const byLanguage = a.languageCode.localeCompare(b.languageCode);
	if (byLanguage !== 0) {
		return byLanguage;
	}

	const byBook = bookOrder(a.bookCode) - bookOrder(b.bookCode);
	if (byBook !== 0) {
		return byBook;
	}

	const byChapter = a.chapter - b.chapter;
	if (byChapter !== 0) {
		return byChapter;
	}

	return a.created - b.created;
}

/** Returns a new array in file-list order, leaving the input untouched. */
export function sortDocuments(
	documents: TranscribableDocument[],
): TranscribableDocument[] {
	return [...documents].sort(compareDocuments);
}
