export interface BookOption {
	label: string;
	value: string;
}

/**
 * The 66 books in canonical order.
 */
export const BOOK_OPTIONS: BookOption[] = [
	{ label: "Genesis", value: "gen" },
	{ label: "Exodus", value: "exo" },
	{ label: "Leviticus", value: "lev" },
	{ label: "Numbers", value: "num" },
	{ label: "Deuteronomy", value: "deu" },
	{ label: "Joshua", value: "jos" },
	{ label: "Judges", value: "jdg" },
	{ label: "Ruth", value: "rut" },
	{ label: "1 Samuel", value: "1sa" },
	{ label: "2 Samuel", value: "2sa" },
	{ label: "1 Kings", value: "1ki" },
	{ label: "2 Kings", value: "2ki" },
	{ label: "1 Chronicles", value: "1ch" },
	{ label: "2 Chronicles", value: "2ch" },
	{ label: "Ezra", value: "ezr" },
	{ label: "Nehemiah", value: "neh" },
	{ label: "Esther", value: "est" },
	{ label: "Job", value: "job" },
	{ label: "Psalms", value: "psa" },
	{ label: "Proverbs", value: "pro" },
	{ label: "Ecclesiastes", value: "ecc" },
	{ label: "Song of Solomon", value: "sng" },
	{ label: "Isaiah", value: "isa" },
	{ label: "Jeremiah", value: "jer" },
	{ label: "Lamentations", value: "lam" },
	{ label: "Ezekiel", value: "ezk" },
	{ label: "Daniel", value: "dan" },
	{ label: "Hosea", value: "hos" },
	{ label: "Joel", value: "jol" },
	{ label: "Amos", value: "amo" },
	{ label: "Obadiah", value: "oba" },
	{ label: "Jonah", value: "jon" },
	{ label: "Micah", value: "mic" },
	{ label: "Nahum", value: "nam" },
	{ label: "Habakkuk", value: "hab" },
	{ label: "Zephaniah", value: "zep" },
	{ label: "Haggai", value: "hag" },
	{ label: "Zechariah", value: "zec" },
	{ label: "Malachi", value: "mal" },
	{ label: "Matthew", value: "mat" },
	{ label: "Mark", value: "mrk" },
	{ label: "Luke", value: "luk" },
	{ label: "John", value: "jhn" },
	{ label: "Acts", value: "act" },
	{ label: "Romans", value: "rom" },
	{ label: "1 Corinthians", value: "1co" },
	{ label: "2 Corinthians", value: "2co" },
	{ label: "Galatians", value: "gal" },
	{ label: "Ephesians", value: "eph" },
	{ label: "Philippians", value: "php" },
	{ label: "Colossians", value: "col" },
	{ label: "1 Thessalonians", value: "1th" },
	{ label: "2 Thessalonians", value: "2th" },
	{ label: "1 Timothy", value: "1ti" },
	{ label: "2 Timothy", value: "2ti" },
	{ label: "Titus", value: "tit" },
	{ label: "Philemon", value: "phm" },
	{ label: "Hebrews", value: "heb" },
	{ label: "James", value: "jas" },
	{ label: "1 Peter", value: "1pe" },
	{ label: "2 Peter", value: "2pe" },
	{ label: "1 John", value: "1jn" },
	{ label: "2 John", value: "2jn" },
	{ label: "3 John", value: "3jn" },
	{ label: "Jude", value: "jud" },
	{ label: "Revelation", value: "rev" },
];

const BOOK_ORDER: Map<string, number> = new Map(
	BOOK_OPTIONS.map((book, index) => [book.value, index]),
);

/**
 * Canonical position of a book code. Unknown codes sort last rather than
 * throwing, so an image carrying an unexpected book still appears in the list.
 */
export function bookOrder(bookCode: string): number {
	return BOOK_ORDER.get(bookCode) ?? Number.MAX_SAFE_INTEGER;
}
