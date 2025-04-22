import BookDropdown from "@components/navigation/BookDropdown.tsx";
import LanguageDropdown from "@components/navigation/LanguageDropdown.tsx";
import {useLanguageContext} from "@src/context/useLanguageContext.tsx";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";
import type {LanguageOption} from "@src/data/LanguageOption.tsx";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import type React from 'react';
import {useState} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface MoveImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (image: TranscribableDocument, languageCode: string, bookCode: string, chapter: number, startVerse: number, endVerse: number) => void;
    image: TranscribableDocument;
}

const MoveImageModal: React.FC<MoveImageModalProps> = (
    {
        isOpen,
        onClose,
        onSave,
        image
    }
) => {
    const { t } = useTranslation();
    const {recentLanguages} = useTranscriptionStore();
    const {languages} = useLanguageContext();

    const [language, setLanguage] = useState<LanguageOption>(
        languages.find(
            (lang) => {
                return lang.code === image.languageCode
            }
        ) ?? languages[0]
    );

    const [book, setBook] = useState(image.bookCode);
    const [chapter, setChapter] = useState(image.chapter);
    const [startVerse, setStartVerse] = useState(image?.startVerse ?? 1);
    const [endVerse, setEndVerse] = useState(image?.endVerse ?? 1);

    const handleBookChapterSelect = (book: string, chapter: number) => {
        setBook(book);
        setChapter(chapter);
        console.log(`Book: ${book}, Chapter: ${chapter || "None"}`);
    };

    const handleSave = () => {
        console.log("moving to: ", language.code, book, chapter, startVerse, endVerse);
        onSave(image, language.code, book, chapter, startVerse, endVerse);
        toast.success("Your progress has been saved!", { position: 'bottom-center', autoClose: 5000, hideProgressBar: true });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 flex">
                <div className="flex flex-row items-center justify-between">
                    <div className="pr-4 max-w-fit">
                        {/* biome-ignore lint/a11y/noRedundantAlt: <explanation> */}
                        <img src={image.data} alt="Image to Move" className="rounded-lg object-contain w-[25vw]"/>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">{t('Move Image')}</h2>
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
                                // @ts-ignore
                                onSelect={handleBookChapterSelect}
                                selectedBook={book}
                                selectedChapter={chapter}
                            />
                        </div>

                        <div className="flex mb-4 space-x-4">
                            <div>
                                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                <label className="block text-sm font-medium text-gray-700">{t('Verse Start')}</label>
                                <input
                                    type="number"
                                    value={startVerse}
                                    onChange={(e) => setStartVerse(Number.parseInt(e.target.value))}
                                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                            <div>
                                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                <label className="block text-sm font-medium text-gray-700">{t('Verse End')}</label>
                                <input
                                    type="number"
                                    value={endVerse}
                                    onChange={(e) => setEndVerse(Number.parseInt(e.target.value))}
                                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type={"button"}
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            >
                                {t('Save')}
                            </button>
                            <button
                                type={"button"}
                                onClick={onClose}
                                className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded"
                            >
                                {t('Cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoveImageModal;