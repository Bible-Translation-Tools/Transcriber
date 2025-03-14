import React, { useState, useRef, useEffect } from 'react';

interface Option {
    label: string;
    value: string;
}

interface BookDropdownProps {
    onSelect: (book: string, chapter?: number) => void;
    selectedBook: string;
    selectedChapter?: number | null;
}

const BookDropdown: React.FC<BookDropdownProps> = ({
    onSelect,
    selectedBook,
    selectedChapter,
}) => {
    const bookOptions: Option[] = [
        { label: 'Genesis', value: 'gen' },
        { label: 'Exodus', value: 'exod' },
        { label: 'Leviticus', value: 'lev' },
        { label: 'Numbers', value: 'num' },
        { label: 'Deuteronomy', value: 'deut' },
        { label: 'Joshua', value: 'josh' },
        { label: 'Judges', value: 'judg' },
        { label: 'Ruth', value: 'ruth' },
        { label: '1 Samuel', value: '1sam' },
        { label: '2 Samuel', value: '2sam' },
        { label: '1 Kings', value: '1kgs' },
        // ... more books
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
        onSelect(openBook || '', chapter);
        setIsOpen(false);
        setOpenBook(null);
    };

    const filteredOptions = bookOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOutsideClick = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
            setOpenBook(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const getChapters = (book: string): number[] => {
        switch (book) {
            case 'gen':
                return Array.from({ length: 50 }, (_, i) => i + 1);
            case 'exod':
                return Array.from({ length: 40 }, (_, i) => i + 1);
            case 'lev':
                return Array.from({ length: 27 }, (_, i) => i + 1);
            case '1sam':
                return Array.from({ length: 31 }, (_, i) => i + 1);
            case '2sam':
                return Array.from({ length: 24 }, (_, i) => i + 1);
            case '1kgs':
                return Array.from({ length: 22 }, (_, i) => i + 1);
            // ... add chapter data for other books
            default:
                return [];
        }
    };

    const chapters = openBook ? getChapters(openBook) : [];

    return (
        <div className="relative w-96" ref={dropdownRef}>
            <button
                className="w-96 max-w-96 max-h-12 bg-gray-100 bg-color-surface-secondary rounded-xl inline-flex justify-start items-center"
                onClick={toggleDropdown}
            >
                <div class="w-96 max-w-96 max-h-12 bg-color-surface-secondary rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center">
                    <div class="flex-1 p-4 flex justify-start items-center gap-2">
                        <div class="w-6 h-6 relative overflow-hidden">
                            <div class="w-4 h-5 bg-color-on-surface-secondary">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g id="material-symbols:book-2-outline-rounded">
                                        <path id="Vector" d="M6 15.325C6.23333 15.2083 6.475 15.125 6.725 15.075C6.975 15.025 7.23333 15 7.5 15H8V4H7.5C7.08333 4 6.72933 4.146 6.438 4.438C6.14667 4.73 6.00067 5.084 6 5.5V15.325ZM10 15H18V4H10V15ZM7.5 22C6.53333 22 5.70833 21.6583 5.025 20.975C4.34167 20.2917 4 19.4667 4 18.5V5.5C4 4.53333 4.34167 3.70833 5.025 3.025C5.70833 2.34167 6.53333 2 7.5 2H18C18.55 2 19.021 2.19567 19.413 2.587C19.805 2.97833 20.0007 3.44933 20 4V16.525C20 16.6583 19.946 16.7793 19.838 16.888C19.73 16.9967 19.534 17.1173 19.25 17.25C19.0167 17.3667 18.8333 17.5333 18.7 17.75C18.5667 17.9667 18.5 18.2167 18.5 18.5C18.5 18.7833 18.5667 19.0377 18.7 19.263C18.8333 19.4883 19.0167 19.6507 19.25 19.75C19.4833 19.8493 19.6667 19.987 19.8 20.163C19.9333 20.339 20 20.5263 20 20.725V20.975C20 21.2583 19.904 21.5 19.712 21.7C19.52 21.9 19.2827 22 19 22H7.5ZM7.5 20H16.825C16.725 19.7667 16.646 19.5293 16.588 19.288C16.53 19.0467 16.5007 18.784 16.5 18.5C16.5 18.2333 16.525 17.975 16.575 17.725C16.625 17.475 16.7083 17.2333 16.825 17H7.5C7.06667 17 6.70833 17.146 6.425 17.438C6.14167 17.73 6 18.084 6 18.5C6 18.9333 6.14167 19.2917 6.425 19.575C6.70833 19.8583 7.06667 20 7.5 20Z" fill="#516B86" />
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div class="justify-start text-color-on-surface-primary text-l font-medium font-['Noto_Sans'] leading-normal">{bookOptions.find((b) => b.value === selectedBook)?.label}</div>
                    </div>
                    <div class="w-20 p-4 max-h-12 border-l border-neutral-200 flex justify-start items-center gap-2">
                        <div class="justify-start text-color-on-surface-primary text-l font-medium font-['Noto_Sans'] leading-normal">{selectedChapter}</div>
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
                        placeholder="Search “Genesis” or “1jhn”..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border-b focus:outline-none text-color-on-surface-tertiary text-l italic font-[Noto_Sans] leading-10"
                    />

                    <div className="flex flex-col items start p-2 max-h-[75vh] overflow-y-scroll">
                        {filteredOptions.map((option) => (
                            <React.Fragment key={option.value}>
                                <button
                                    className="flex-start p-2 hover:bg-gray-100 cursor-pointer text-left"
                                    onClick={() => handleBookClick(option.value)}
                                    role="button"
                                >
                                    {option.label}
                                </button>
                                {openBook === option.value && (
                                    <div className="self-stretch inline-flex justify-start items-start gap-0.5 flex-wrap content-start">
                                        {chapters.map((chapter) => (
                                            <button
                                                key={chapter}
                                                className="flex-1 flex-none max-w-20 min-w-14 p-2 bg-zinc-100 hover:bg-neutral-400 rounded-lg inline-flex flex-col justify-center items-center gap-2"
                                                onClick={() => handleChapterClick(chapter)}
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