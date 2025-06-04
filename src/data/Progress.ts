export type Progress = LanguageBookCounts;

type ImageCount = number;

interface ChapterImageCounts {
	[chapterNumber: string]: ImageCount;
}

interface BookChapterCounts {
	[bookIdentifier: string]: ChapterImageCounts;
}

interface LanguageBookCounts {
	[languageCode: string]: BookChapterCounts;
}
