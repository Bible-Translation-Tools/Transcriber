import React, {useCallback, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Chip} from "@mui/material";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {ShowWhen} from "@components/utils/ShowWhen.tsx";

interface BookDropdownProps {
    onSelect: (book: string, chapter: number) => void;
    selectedBook: string;
    selectedChapter?: number | null;
}

const BookDropdown: React.FC<BookDropdownProps> = ({
                                                       onSelect,
                                                       selectedBook,
                                                       selectedChapter,
                                                   }) => {
    interface Option {
        label: string;
        value: string;
    }

    const bookOptions: Option[] = [
        {label: "Genesis", value: "gen"},
        {label: "Exodus", value: "exo"},
        {label: "Leviticus", value: "lev"},
        {label: "Numbers", value: "num"},
        {label: "Deuteronomy", value: "deu"},
        {label: "Joshua", value: "jos"},
        {label: "Judges", value: "jdg"},
        {label: "Ruth", value: "rut"},
        {label: "1 Samuel", value: "1sa"},
        {label: "2 Samuel", value: "2sa"},
        {label: "1 Kings", value: "1ki"},
        {label: "2 Kings", value: "2ki"},
        {label: "1 Chronicles", value: "1ch"},
        {label: "2 Chronicles", value: "2ch"},
        {label: "Ezra", value: "ezr"},
        {label: "Nehemiah", value: "neh"},
        {label: "Esther", value: "est"},
        {label: "Job", value: "job"},
        {label: "Psalms", value: "psa"},
        {label: "Proverbs", value: "pro"},
        {label: "Ecclesiastes", value: "ecc"},
        {label: "Song of Solomon", value: "sng"},
        {label: "Isaiah", value: "isa"},
        {label: "Jeremiah", value: "jer"},
        {label: "Lamentations", value: "lam"},
        {label: "Ezekiel", value: "ezk"},
        {label: "Daniel", value: "dan"},
        {label: "Hosea", value: "hos"},
        {label: "Joel", value: "jol"},
        {label: "Amos", value: "amo"},
        {label: "Obadiah", value: "oba"},
        {label: "Jonah", value: "jon"},
        {label: "Micah", value: "mic"},
        {label: "Nahum", value: "nam"},
        {label: "Habakkuk", value: "hab"},
        {label: "Zephaniah", value: "zep"},
        {label: "Haggai", value: "hag"},
        {label: "Zechariah", value: "zec"},
        {label: "Malachi", value: "mal"},
        {label: "Matthew", value: "mat"},
        {label: "Mark", value: "mrk"},
        {label: "Luke", value: "luk"},
        {label: "John", value: "jhn"},
        {label: "Acts", value: "act"},
        {label: "Romans", value: "rom"},
        {label: "1 Corinthians", value: "1co"},
        {label: "2 Corinthians", value: "2co"},
        {label: "Galatians", value: "gal"},
        {label: "Ephesians", value: "eph"},
        {label: "Philippians", value: "php"},
        {label: "Colossians", value: "col"},
        {label: "1 Thessalonians", value: "1th"},
        {label: "2 Thessalonians", value: "2th"},
        {label: "1 Timothy", value: "1ti"},
        {label: "2 Timothy", value: "2ti"},
        {label: "Titus", value: "tit"},
        {label: "Philemon", value: "phm"},
        {label: "Hebrews", value: "heb"},
        {label: "James", value: "jas"},
        {label: "1 Peter", value: "1pe"},
        {label: "2 Peter", value: "2pe"},
        {label: "1 John", value: "1jn"},
        {label: "2 John", value: "2jn"},
        {label: "3 John", value: "3jn"},
        {label: "Jude", value: "jud"},
        {label: "Revelation", value: "rev"},
    ];

    const {t} = useTranslation();
    const {language, progress} = useTranscriptionStore()
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openBook, setOpenBook] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleBookClick = (book: string) => {
        if (openBook === book) {
            setOpenBook(null); // Collapse if already open
        } else {
            setOpenBook(book); // Open if closed or different book
        }
    };

    const handleChapterClick = (chapter: number) => {
        onSelect(openBook || "", chapter);
        setIsOpen(false);
        setOpenBook(null);
    };

    const filteredOptions = bookOptions.filter(
        (option) =>
            option.label.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().startsWith(searchTerm.toLowerCase()),
    );

    const handleOutsideClick = useCallback((event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
            setOpenBook(null);
        }
    }, []);

    // todo: verify wroks with useCallback
    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [handleOutsideClick]);

    const getChapters = (book: string): number[] => {
        switch (book) {
            case "gen":
                return Array.from({length: 50}, (_, i) => i + 1);
            case "exo":
                return Array.from({length: 40}, (_, i) => i + 1);
            case "lev":
                return Array.from({length: 27}, (_, i) => i + 1);
            case "num":
                return Array.from({length: 36}, (_, i) => i + 1);
            case "deu":
                return Array.from({length: 34}, (_, i) => i + 1);
            case "jos":
                return Array.from({length: 24}, (_, i) => i + 1);
            case "jdg":
                return Array.from({length: 21}, (_, i) => i + 1);
            case "rut":
                return Array.from({length: 4}, (_, i) => i + 1);
            case "1sa":
                return Array.from({length: 31}, (_, i) => i + 1);
            case "2sa":
                return Array.from({length: 24}, (_, i) => i + 1);
            case "1ki":
                return Array.from({length: 22}, (_, i) => i + 1);
            case "2ki":
                return Array.from({length: 25}, (_, i) => i + 1);
            case "1ch":
                return Array.from({length: 29}, (_, i) => i + 1);
            case "2ch":
                return Array.from({length: 36}, (_, i) => i + 1);
            case "ezr":
                return Array.from({length: 10}, (_, i) => i + 1);
            case "neh":
                return Array.from({length: 13}, (_, i) => i + 1);
            case "est":
                return Array.from({length: 10}, (_, i) => i + 1);
            case "job":
                return Array.from({length: 42}, (_, i) => i + 1);
            case "psa":
                return Array.from({length: 150}, (_, i) => i + 1);
            case "pro":
                return Array.from({length: 31}, (_, i) => i + 1);
            case "ecc":
                return Array.from({length: 12}, (_, i) => i + 1);
            case "sng":
                return Array.from({length: 8}, (_, i) => i + 1);
            case "isa":
                return Array.from({length: 66}, (_, i) => i + 1);
            case "jer":
                return Array.from({length: 52}, (_, i) => i + 1);
            case "lam":
                return Array.from({length: 5}, (_, i) => i + 1);
            case "ezk":
                return Array.from({length: 48}, (_, i) => i + 1);
            case "dan":
                return Array.from({length: 12}, (_, i) => i + 1);
            case "hos":
                return Array.from({length: 14}, (_, i) => i + 1);
            case "jol":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "amo":
                return Array.from({length: 9}, (_, i) => i + 1);
            case "oba":
                return Array.from({length: 1}, (_, i) => i + 1);
            case "jon":
                return Array.from({length: 4}, (_, i) => i + 1);
            case "mic":
                return Array.from({length: 7}, (_, i) => i + 1);
            case "nam":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "hab":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "zep":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "hag":
                return Array.from({length: 2}, (_, i) => i + 1);
            case "zec":
                return Array.from({length: 14}, (_, i) => i + 1);
            case "mal":
                return Array.from({length: 4}, (_, i) => i + 1);
            case "mat":
                return Array.from({length: 28}, (_, i) => i + 1);
            case "mrk":
                return Array.from({length: 16}, (_, i) => i + 1);
            case "luk":
                return Array.from({length: 24}, (_, i) => i + 1);
            case "jhn":
                return Array.from({length: 21}, (_, i) => i + 1);
            case "act":
                return Array.from({length: 28}, (_, i) => i + 1);
            case "rom":
                return Array.from({length: 16}, (_, i) => i + 1);
            case "1co":
                return Array.from({length: 16}, (_, i) => i + 1);
            case "2co":
                return Array.from({length: 13}, (_, i) => i + 1);
            case "gal":
                return Array.from({length: 6}, (_, i) => i + 1);
            case "eph":
                return Array.from({length: 6}, (_, i) => i + 1);
            case "php":
                return Array.from({length: 4}, (_, i) => i + 1);
            case "col":
                return Array.from({length: 4}, (_, i) => i + 1);
            case "1th":
                return Array.from({length: 5}, (_, i) => i + 1);
            case "2th":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "1ti":
                return Array.from({length: 6}, (_, i) => i + 1);
            case "2ti":
                return Array.from({length: 4}, (_, i) => i + 1);
            case "tit":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "phm":
                return Array.from({length: 1}, (_, i) => i + 1);
            case "heb":
                return Array.from({length: 13}, (_, i) => i + 1);
            case "jas":
                return Array.from({length: 5}, (_, i) => i + 1);
            case "1pe":
                return Array.from({length: 5}, (_, i) => i + 1);
            case "2pe":
                return Array.from({length: 3}, (_, i) => i + 1);
            case "1jn":
                return Array.from({length: 5}, (_, i) => i + 1);
            case "2jn":
                return Array.from({length: 1}, (_, i) => i + 1);
            case "3jn":
                return Array.from({length: 1}, (_, i) => i + 1);
            case "jud":
                return Array.from({length: 1}, (_, i) => i + 1);
            case "rev":
                return Array.from({length: 22}, (_, i) => i + 1);
            default:
                return [];
        }
    };

    const chapters = openBook ? getChapters(openBook) : [];

    return (
        <div className="relative w-96" ref={dropdownRef}>
            <button
                type="button"
                className="w-96 max-w-96 max-h-12 bg-gray-100 bg-color-surface-secondary rounded-xl inline-flex justify-start items-center"
                onClick={toggleDropdown}
            >
                <div
                    className="w-96 max-w-96 max-h-12 bg-color-surface-secondary rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center">
                    <div className="flex-1 p-4 flex justify-start items-center gap-2">
                        <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-5 bg-color-on-surface-secondary">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g id="material-symbols:book-2-outline-rounded">
                                        <path
                                            id="Vector"
                                            d="M6 15.325C6.23333 15.2083 6.475 15.125 6.725 15.075C6.975 15.025 7.23333 15 7.5 15H8V4H7.5C7.08333 4 6.72933 4.146 6.438 4.438C6.14667 4.73 6.00067 5.084 6 5.5V15.325ZM10 15H18V4H10V15ZM7.5 22C6.53333 22 5.70833 21.6583 5.025 20.975C4.34167 20.2917 4 19.4667 4 18.5V5.5C4 4.53333 4.34167 3.70833 5.025 3.025C5.70833 2.34167 6.53333 2 7.5 2H18C18.55 2 19.021 2.19567 19.413 2.587C19.805 2.97833 20.0007 3.44933 20 4V16.525C20 16.6583 19.946 16.7793 19.838 16.888C19.73 16.9967 19.534 17.1173 19.25 17.25C19.0167 17.3667 18.8333 17.5333 18.7 17.75C18.5667 17.9667 18.5 18.2167 18.5 18.5C18.5 18.7833 18.5667 19.0377 18.7 19.263C18.8333 19.4883 19.0167 19.6507 19.25 19.75C19.4833 19.8493 19.6667 19.987 19.8 20.163C19.9333 20.339 20 20.5263 20 20.725V20.975C20 21.2583 19.904 21.5 19.712 21.7C19.52 21.9 19.2827 22 19 22H7.5ZM7.5 20H16.825C16.725 19.7667 16.646 19.5293 16.588 19.288C16.53 19.0467 16.5007 18.784 16.5 18.5C16.5 18.2333 16.525 17.975 16.575 17.725C16.625 17.475 16.7083 17.2333 16.825 17H7.5C7.06667 17 6.70833 17.146 6.425 17.438C6.14167 17.73 6 18.084 6 18.5C6 18.9333 6.14167 19.2917 6.425 19.575C6.70833 19.8583 7.06667 20 7.5 20Z"
                                            fill="#516B86"
                                        />
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div
                            className="justify-start text-color-on-surface-primary text-l font-medium font-['Noto_Sans'] leading-normal">
                            {
                                bookOptions.find(
                                    (b) => b.value === selectedBook,
                                )?.label
                            }
                        </div>
                    </div>
                    <div
                        className="w-20 p-4 max-h-12 border-l border-neutral-200 flex justify-start items-center gap-2">
                        <div
                            className="justify-start text-color-on-surface-primary text-l font-medium font-['Noto_Sans'] leading-normal">
                            {selectedChapter}
                        </div>
                    </div>
                </div>

                {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg> */}
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border">
                    <input
                        type="text"
                        placeholder={t("Search Book placeholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border-b focus:outline-none text-color-on-surface-tertiary text-l italic font-[Noto_Sans] leading-10"
                    />

                    <div className="flex flex-col items start p-2 max-h-[75vh] overflow-y-scroll">
                        {filteredOptions.map((option) => (
                            <React.Fragment key={option.value}>
                                <button
                                    type="button"
                                    className="flex-start p-2 hover:bg-gray-100 cursor-pointer text-left"
                                    onClick={() =>
                                        handleBookClick(option.value)
                                    }
                                >
                                    <div className="flex justify-between">
                                        <div>{option.label}</div>

                                        <ShowWhen
                                            when={progress && language?.code != null && option.value != null && progress[language.code][option.value] && Object.keys(progress[language.code][option.value]).length > 0}>
                                            <Chip variant={"outlined"} label={"In Progress"}/>
                                        </ShowWhen>
                                    </div>
                                </button>
                                {openBook === option.value && (
                                    <div
                                        className="self-stretch inline-flex justify-start items-start gap-0.5 flex-wrap content-start">
                                        {chapters.map((chapter) => (
                                            <button
                                                type="button"
                                                key={chapter}
                                                className="flex-1 flex-none max-w-20 min-w-14 p-2 bg-zinc-100 hover:bg-neutral-400 rounded-lg inline-flex flex-col justify-center items-center gap-2"
                                                onClick={() =>
                                                    handleChapterClick(chapter)
                                                }
                                            >
                                                {chapter}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDropdown;
