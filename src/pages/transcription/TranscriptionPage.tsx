import "../../App.css";
import DeleteConfirmationDialog from "@components/dialogs/DeleteConfirmationDialog.tsx";
import MoveImageModal from "@components/forms/MoveImageModal.tsx";
import NavBar from "@components/navigation/NavBar.tsx";
import {ShowWhen} from "@components/utils/ShowWhen.tsx";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {useDeleteImage} from "@src/hooks/useDeleteImage.ts";
import {useRetranscribe} from "@src/hooks/useRetranscribe";
import {useUpdateImage} from "@src/hooks/useUpdateImage";
import {useUploadImage} from "@src/hooks/useUploadImage.ts";
import EditorWrapper from "@src/pages/transcription/EditorWrapper.tsx";
import ProjectContents from "@src/pages/transcription/ProjectContents.tsx";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {ImageSubmittedToast} from "@src/toasts/ImageSubmittedToast.tsx";
import {useMemo, useState} from "react";
import {toast} from "react-toastify";

function TranscriptionPage() {
	const store = useTranscriptionStore();
	const uploadImage = useUploadImage();
	const updateImage = useUpdateImage();
	const deleteImage = useDeleteImage();
	const retranscribe = useRetranscribe();

	useMemo(() => {
		store.images.sort((a, b) => {
			return a.created - b.created;
		});
	}, [store.images]);

	const [isModalOpen, setIsMoveImageModalOpen] = useState(true);
	const [modalImage, setMoveImageModalImage] =
		useState<TranscribableDocument | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [imageToDelete, setImageToDelete] =
		useState<TranscribableDocument | null>(null);

	const handleOpenMoveImageModal = (page: number) => {
		setMoveImageModalImage(store.images[page]);
		setIsMoveImageModalOpen(true);

		console.log(page);
	};

	const handleOpenDeleteImageDialog = (page: number) => {
		setImageToDelete(store.images[page]);
		setIsDeleteDialogOpen(true);

		console.log(page);
	};

	const handleCloseModal = () => {
		setIsMoveImageModalOpen(false);
		setMoveImageModalImage(null);
	};

	const handleCloseDeleteDialog = () => {
		setIsDeleteDialogOpen(false);
		setImageToDelete(null);
	};

	const handleSaveModal = async (
		image: TranscribableDocument,
		language: string,
		book: string,
		chapter: number,
		startVerse: number,
		endVerse: number,
	) => {
		if (
			language == null ||
			book == null ||
			chapter == null ||
			startVerse == null ||
			endVerse == null
		) {
			console.log("Incomplete information for moving image, aborting.");
			return;
		}
		console.log("Saved:", language, book, chapter, startVerse, endVerse);
		await updateImage({
			...image,
			languageCode: language,
			bookCode: book,
			chapter: chapter,
			startVerse: startVerse,
			endVerse: endVerse,
		});
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
		uploadImage(files);
	};

	const handleResubmitImage = () => {
		if (store.selectedImage != null) {
			toast.success(ImageSubmittedToast, {
				data: "Submitted Image for Transcription.",
			});
			retranscribe(store.selectedImage);
		}
	};

	// change to explicitly be a useCallback?
	const handleTextChange = (newText: string) => {
		if (store.selectedImage != null) {
			updateImage({
				...store.selectedImage,
				transcription: newText,
			});
		}
	};

	const handlePageChange = (page: number) => {
		if (page < store.images.length && page >= 0) {
			store.setSelectedImage(store.images[page]);
		} else {
			store.setSelectedImage(store.images[0]);
		}
	};

	const handleDeleteImage = () => {
		if (imageToDelete != null) {
			deleteImage(imageToDelete);
		}
		setIsDeleteDialogOpen(false);
	};

	const handleVerseRangeChange = (start: number, end: number) => {
		const validVerseRange = validateVerseRange(start, end);
		if (validVerseRange && store.selectedImage) {
			store.selectedImage.startVerse = start;
			store.selectedImage.endVerse = end;
			updateImage(store.selectedImage);
		}
	};

	const validateVerseRange = (start: number, end: number) => {
		if (end < start) return false;
		if (end > 176) return false;
		if (start < 0) return false;
		return true;
	};

	return (
		<div className="flex flex-col h-screen bg-gray-100">
			<NavBar />
			<div className="flex overflow-y-auto">
				<ProjectContents
					key={store.images.length}
					images={store.images}
					selectedImage={store.selectedImage}
					handleImageUpload={handleImageUpload}
					handleOpenMoveImageModal={handleOpenMoveImageModal}
					handlePageChange={handlePageChange}
					handleDeleteImage={handleOpenDeleteImageDialog}
				/>
				<EditorWrapper
					images={store.images}
					selectedImage={store.selectedImage}
					handleResubmitImage={handleResubmitImage}
					handleTextChange={handleTextChange}
					handleVerseRangeChange={handleVerseRangeChange}
				/>
				<ShowWhen when={!!modalImage}>
					<MoveImageModal
						key={modalImage?.id}
						// biome-ignore lint/style/noNonNullAssertion: <Show Narrows>
						image={modalImage!}
						isOpen={isModalOpen}
						onClose={handleCloseModal}
						onSave={handleSaveModal}
					/>
				</ShowWhen>
				<ShowWhen when={!!imageToDelete}>
					<DeleteConfirmationDialog
						key={imageToDelete?.id}
						imageName={imageToDelete?.filename}
						isOpen={isDeleteDialogOpen}
						onClose={handleCloseDeleteDialog}
						onConfirmDelete={handleDeleteImage}
					/>
				</ShowWhen>
			</div>
		</div>
	);
}

export default TranscriptionPage;
