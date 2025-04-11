import "../App.css";
// @ts-ignore
import {pdf2image} from "@pardnchiu/pdf2image";
import {useState} from "react";
import NavBar from "../components/NavBar";
import Pagination from "../components/Pagination";
import TextEditor from "../components/TextEditor";
import RangeInput from "@components/RangeInput.tsx";
import FileList from "@components/FileList.tsx";
import MoveImageModal from "@components/MoveImageModal.tsx";
import EmptyProject from "@src/context/EmptyProject.tsx";
import uploadFiles from "@src/domain/uploadFiles.ts";
import {ImageData} from "@src/data/ImageData.tsx";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {
    addImage,
    resubmitImageForTranscription,
    updateImage,
    updateTranscription
} from "@src/domain/useTranscription.ts";

function TranscriptionPage() {
    const store = useTranscriptionStore();
    const {images, selectedImage, setSelectedImage} = store;

    const [currentPage, setCurrentPage] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(true);
    const [modalImage, setModalImage] = useState<ImageData | null>(null);

    const handleOpenModal = (page: number) => {
        setModalImage(images[page]);
        setIsModalOpen(true);

        console.log(page);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

    const handleSaveModal = (
        image: ImageData,
        language: string,
        book: string,
        chapter: number,
        startVerse: number,
        endVerse: number
    ) => {
        if (language == null || book == null || chapter == null || startVerse == null || endVerse == null) {
            console.log("Incomplete information for moving image, aborting.");
            return;
        }
        console.log('Saved:', language, book, chapter, startVerse, endVerse);
        updateImage(
            store,
            {
                ...image,
                languageCode: language,
                bookCode: book,
                chapter: chapter,
                startVerse: startVerse,
                endVerse: endVerse
            }, true);
        setModalImage(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files);
            handleFiles(fileArray);
        }
    };

    const handleFiles = (files: File[]) => {
        uploadFiles(store, files, addImage);
    };

    const handleResubmitImage = () => {
        if (selectedImage != null) {
            resubmitImageForTranscription(store, selectedImage);
        }
    };

    // change to explicitly be a useCallback?
    const handleTextChange = (newText: string) => {
        if (selectedImage != null) {
            updateTranscription(
                store,
                {
                    ...selectedImage,
                    transcription: newText,
                }
            );
        }
    };

    const handlePageChange = (page: number) => {
        if (page < images.length && page >= 0) {
            setSelectedImage(images[page]);
            setCurrentPage(page);
        } else {
            setSelectedImage(images[0]);
            setCurrentPage(0);
        }
    };

    const handleVerseRangeChange = (start: number, end: number) => {
        debugger
        const validVerseRange = validateVerseRange(start, end);
        if (validVerseRange && selectedImage) {
            selectedImage.startVerse = start;
            selectedImage.endVerse = end;
            updateTranscription(store, selectedImage);
        }
    }

    const validateVerseRange = (start: number, end: number) => {
        debugger
        if (end < start) return false;
        if (end > 176) return false;
        if (start < 0) return false;
        return true;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <NavBar/>
            <div className="flex overflow-y-auto">
                <div className="flex flex-col p-4 overflow-y-auto">
                    <label
                        htmlFor="imageUpload"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-4 py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="material-symbols:add-photo-alternate-rounded">
                                <path id="Vector"
                                      d="M5 21C4.45 21 3.97933 20.8043 3.588 20.413C3.19667 20.0217 3.00067 19.5507 3 19V5C3 4.45 3.196 3.97934 3.588 3.588C3.98 3.19667 4.45067 3.00067 5 3H12.45C12.7833 3 13.0377 3.146 13.213 3.438C13.3883 3.73 13.409 4.04234 13.275 4.375C13.1917 4.64167 13.125 4.90834 13.075 5.175C13.025 5.44167 13 5.71667 13 6C13 7.38334 13.4877 8.56267 14.463 9.538C15.4383 10.5133 16.6173 11.0007 18 11C18.2833 11 18.5583 10.975 18.825 10.925C19.0917 10.875 19.3583 10.8083 19.625 10.725C19.9583 10.6083 20.271 10.6333 20.563 10.8C20.855 10.9667 21.0007 11.2167 21 11.55V19C21 19.55 20.8043 20.021 20.413 20.413C20.0217 20.805 19.5507 21.0007 19 21H5ZM6 17H18L14.25 12L11.25 16L9 13L6 17ZM18 9C17.7167 9 17.4793 8.904 17.288 8.712C17.0967 8.52 17.0007 8.28267 17 8V7H16C15.7167 7 15.4793 6.904 15.288 6.712C15.0967 6.52 15.0007 6.28267 15 6C14.9993 5.71734 15.0953 5.48 15.288 5.288C15.4807 5.096 15.718 5 16 5H17V4C17 3.71667 17.096 3.47934 17.288 3.288C17.48 3.09667 17.7173 3.00067 18 3C18.2827 2.99934 18.5203 3.09534 18.713 3.288C18.9057 3.48067 19.0013 3.718 19 4V5H20C20.2833 5 20.521 5.096 20.713 5.288C20.905 5.48 21.0007 5.71734 21 6C20.9993 6.28267 20.9033 6.52034 20.712 6.713C20.5207 6.90567 20.2833 7.00134 20 7H19V8C19 8.28334 18.904 8.521 18.712 8.713C18.52 8.905 18.2827 9.00067 18 9Z"
                                      fill="white"/>
                            </g>
                        </svg>
                        Add Images...
                        <input
                            type="file"
                            id="imageUpload"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                    <FileList
                        selectedId={selectedImage?.id}
                        images={images}
                        onImageSelected={handlePageChange}
                        onMoveImage={handleOpenModal}
                        onDeleteImage={handleOpenModal}
                    />
                </div>
                {(images?.length > 0) ?
                    <div className="grow flex flex-row">
                        <Pagination
                            image={selectedImage}
                            currentPage={currentPage}
                            totalImages={images.length}
                            onPageChange={handlePageChange}
                        />
                        <div className="flex-2 relative p-4 overflow-y-auto">
                            <div className="h-full flex flex-col">
                                {selectedImage ?
                                    <RangeInput
                                        key={selectedImage?.id}
                                        startVerse={selectedImage?.startVerse}
                                        endVerse={selectedImage?.endVerse}
                                        onRangeChange={handleVerseRangeChange}>
                                    </RangeInput>
                                    :
                                    <></>
                                }
                                <button
                                    onClick={handleResubmitImage}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50 mb-2"
                                    type="button"
                                >
                                    Clear Document and Refresh Transcription
                                </button>
                                <TextEditor
                                    text={selectedImage?.transcription ?? ""}
                                    onChange={(text) => {
                                        handleTextChange(text);
                                    }}
                                />
                            </div>
                            {selectedImage?.transcription == null && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-gray-800 opacity-60 rounded-lg">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"/>
                                </div>
                            )}
                        </div>
                    </div> : <EmptyProject/>}
                {modalImage ?
                    <MoveImageModal
                        key={modalImage?.id}
                        image={modalImage}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveModal}>
                    </MoveImageModal> : <></>
                }
            </div>
        </div>
    );
}

export default TranscriptionPage;
