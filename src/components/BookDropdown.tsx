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
        <div className="relative w-64" ref={dropdownRef}>
            <div
                className="flex items-center justify-between p-2 border rounded cursor-pointer"
                onClick={toggleDropdown}
            >
                <span>{selectedBook && selectedChapter ? `${bookOptions.find((b) => b.value === selectedBook)?.label} ${selectedChapter}` : "Select Book"}</span>
                <svg
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
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border">
                    <input
                        type="text"
                        placeholder="Search “Genesis” or “1jhn”..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border-b focus:outline-none text-color-on-surface-tertiary text-l italic font-[Noto_Sans] leading-10"
                    />

                    <div className="p-2 max-h-[75vh] overflow-y-scroll">
                        {filteredOptions.map((option) => (
                            <React.Fragment key={option.value}>
                                <div
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleBookClick(option.value)}
                                >
                                    {option.label}
                                </div>
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