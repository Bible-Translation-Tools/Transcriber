import "../../App.css";
import {toast} from "react-toastify";
// @ts-ignore
import {pdf2image} from "@pardnchiu/pdf2image";
import {useMemo, useState} from "react";
import NavBar from "@components/navigation/NavBar.tsx";
import MoveImageModal from "@components/forms/MoveImageModal.tsx";
import {useUploadImage} from "@src/hooks/useUploadImage.ts";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {resubmitImageForTranscription, updateImage, updateTranscription} from "@src/domain/ImageActions.ts";
import type {TranscriptionErrorCode} from "@api/ai/TranscriptionResponse.ts";
import {UploadFileErrorToast} from "@src/toasts/UploadFileErrorToast.tsx";
import {ImageSubmittedToast} from "@src/toasts/ImageSubmittedToast.tsx";
import {ShowWhen} from "@components/utils/ShowWhen.tsx";
import EditorWrapper from "@src/pages/transcription/EditorWrapper.tsx";
import ProjectContents from "@src/pages/transcription/ProjectContents.tsx";
import IndexedDBImageRepository from "@src/persistence/IndexedDBImageRepository.ts";

function TranscriptionPage() {
    const store = useTranscriptionStore();

    const uploadImage = useUploadImage();
    const {images, selectedImage, setSelectedImage} = store;

    useMemo(() => {
        images.sort((a, b) => {
            return a.created - b.created
        })
    }, [images])

    const [isModalOpen, setIsMoveImageModalOpen] = useState(true);
    const [modalImage, setMoveImageModalImage] = useState<TranscribableDocument | null>(null);

    const handleOpenMoveImageModal = (page: number) => {
        setMoveImageModalImage(images[page]);
        setIsMoveImageModalOpen(true);

        console.log(page);
    }

    const handleCloseModal = () => {
        setIsMoveImageModalOpen(false);
        setMoveImageModalImage(null);
    };

    const handleSaveModal = async (
        image: TranscribableDocument,
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
        await updateImage(
            store,
            {
                ...image,
                languageCode: language,
                bookCode: book,
                chapter: chapter,
                startVerse: startVerse,
                endVerse: endVerse
            },
            true
        );
        store.refreshProject();
        setMoveImageModalImage(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files);
            handleFiles(fileArray);
        }
    };

    const handleFiles = (files: File[]) => {
        uploadImage(files)
        // uploadFiles(store, files, addImage, handleTranscriptionError);
    };

    const handleResubmitImage = () => {
        if (selectedImage != null) {
            toast.success(ImageSubmittedToast, {data: "Submitted Image for Transcription."});
            resubmitImageForTranscription(store, IndexedDBImageRepository.getInstance(), selectedImage);
        }
    };

    // change to explicitly be a useCallback?
    const handleTextChange = (newText: string) => {
        if (selectedImage != null) {
            updateTranscription(
                store,
                IndexedDBImageRepository.getInstance(),
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
        } else {
            setSelectedImage(images[0]);
        }
    };

    const handleTranscriptionError = (_: TranscriptionErrorCode, errorMessage: string): void => {
        toast.error(UploadFileErrorToast, {data: errorMessage})
    }

    const handleVerseRangeChange = (start: number, end: number) => {
        const validVerseRange = validateVerseRange(start, end);
        if (validVerseRange && selectedImage) {
            selectedImage.startVerse = start;
            selectedImage.endVerse = end;
            updateTranscription(store, IndexedDBImageRepository.getInstance(), selectedImage);
        }
    }

    const validateVerseRange = (start: number, end: number) => {
        if (end < start) return false;
        if (end > 176) return false;
        if (start < 0) return false;
        return true;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <NavBar/>
            <div className="flex overflow-y-auto">
                <ProjectContents
                    images={images}
                    selectedImage={selectedImage}
                    handleImageUpload={handleImageUpload}
                    handleOpenMoveImageModal={handleOpenMoveImageModal}
                    handlePageChange={handlePageChange}
                />
                <EditorWrapper
                    images={images}
                    selectedImage={selectedImage}
                    handleResubmitImage={handleResubmitImage}
                    handleTextChange={handleTextChange}
                    handleVerseRangeChange={handleVerseRangeChange}
                />
                <ShowWhen when={!!modalImage}>
                    <MoveImageModal
                        key={modalImage?.id}
                        // biome-ignore lint/style/noNonNullAssertion: <explanation>
                        image={modalImage!}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveModal}>
                    </MoveImageModal>
                </ShowWhen>
            </div>
        </div>
    );
}

export default TranscriptionPage;
