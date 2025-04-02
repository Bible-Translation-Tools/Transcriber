import React, {useState} from 'react';
import BookDropdown from "@components/BookDropdown.tsx";
import LanguageDropdown, {LanguageOption} from "@components/LanguageDropdown.tsx";
import {useTranscriptionContext} from "@src/context/useTranscriptionContext.tsx";
import {useLanguageContext} from "@src/context/useLanguageContext.tsx";
import {ImageData} from "@src/context/TranscriptionContext.tsx";

interface MoveImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (image: ImageData, languageCode: string, bookCode: string, chapter: number, startVerse: number, endVerse: number) => void;
    image: ImageData;
    initialLanguage?: string;
    initialBook?: string;
    initialChapter?: number;
    initialStartVerse?: number;
    initialEndVerse?: number;
}

const MoveImageModal: React.FC<MoveImageModalProps> = (
    {
        isOpen,
        onClose,
        onSave,
        image,
        initialLanguage = 'en',
        initialBook = 'mat',
        initialChapter = 1,
        initialStartVerse = 8,
        initialEndVerse = 15,
    }
) => {

    const {recentLanguages} = useTranscriptionContext();
    const {languages} = useLanguageContext();

    const [language, setLanguage] = useState<LanguageOption>(initialLanguage);
    const [book, setBook] = useState(initialBook);
    const [chapter, setChapter] = useState(initialChapter);
    const [startVerse, setStartVerse] = useState(initialStartVerse);
    const [endVerse, setEndVerse] = useState(initialEndVerse);

    const handleBookChapterSelect = (book: string, chapter: number) => {
        setBook(book);
        setChapter(chapter);
        console.log(`Book: ${book}, Chapter: ${chapter || "None"}`);
    };

    const handleSave = () => {
        console.log("moving to: ", language.code, book, chapter, startVerse, endVerse);
        onSave(image, language.code, book, chapter, startVerse, endVerse);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 flex">
            {/*<div className="bg-white rounded-lg p-6">*/}
                <div className="flex flex-row items-center justify-between">
                    <div className="pr-4 max-w-fit">
                        <img src={image.data} alt="Image to Move" className="rounded-lg object-contain w-[25vw]"/>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">Move Image</h2>
                        <div className="mb-4">
                            <LanguageDropdown
                                languageOptions={languages}
                                recentLanguages={recentLanguages}
                                onSelect={setLanguage}
                                selectedLanguage={language}
                            />
                        </div>

                        <div className="mb-4">
                            <BookDropdown
                                onSelect={handleBookChapterSelect}
                                selectedBook={book}
                                selectedChapter={chapter}
                            />
                        </div>

                        <div className="flex mb-4 space-x-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Verse Start</label>
                                <input
                                    type="number"
                                    value={startVerse}
                                    onChange={(e) => setStartVerse(parseInt(e.target.value))}
                                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Verse End</label>
                                <input
                                    type="number"
                                    value={endVerse}
                                    onChange={(e) => setEndVerse(parseInt(e.target.value))}
                                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            {/*</div>*/}
        </div>
        </div>
    );
};

export default MoveImageModal;