import "../../App.css";
import DeleteConfirmationDialog from "@components/dialogs/DeleteConfirmationDialog.tsx";
import MoveImageModal from "@components/forms/MoveImageModal.tsx";
import NavBar from "@components/navigation/NavBar.tsx";
import { ShowWhen } from "@components/utils/ShowWhen.tsx";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { useDeleteImage } from "@src/hooks/useDeleteImage.ts";
import { useRetranscribe } from "@src/hooks/useRetranscribe";
import { useUpdateImage } from "@src/hooks/useUpdateImage";
import { useUploadImage } from "@src/hooks/useUploadImage.ts";
import EditorWrapper from "@src/pages/transcription/EditorWrapper.tsx";
import ProjectContents from "@src/pages/transcription/ProjectContents.tsx";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import { ImageSubmittedToast } from "@src/toasts/ImageSubmittedToast.tsx";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

function TranscriptionPage() {
	const { images, selectedImage, setSelectedImage, refreshProject } =
		useTranscriptionStore();
	const uploadImage = useUploadImage();
	const updateImage = useUpdateImage();
	const deleteImage = useDeleteImage();
	const retranscribe = useRetranscribe();

	useMemo(() => {
		images.sort((a, b) => {
			return a.created - b.created;
		});
	}, [images]);

	const [isModalOpen, setIsMoveImageModalOpen] = useState(true);
	const [modalImage, setMoveImageModalImage] =
		useState<TranscribableDocument | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [imageToDelete, setImageToDelete] =
		useState<TranscribableDocument | null>(null);
	const [isProjectContentsVisible, setIsProjectContentsVisible] = useState(true);

	const handleOpenMoveImageModal = (page: number) => {
		setMoveImageModalImage(images[page]);
		setIsMoveImageModalOpen(true);

		console.log(page);
	};

	const handleOpenDeleteImageDialog = (page: number) => {
		setImageToDelete(images[page]);
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
		refreshProject();
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
		if (selectedImage != null) {
			toast.success(ImageSubmittedToast, {
				data: "Submitted Image for Transcription.",
			});
			retranscribe(selectedImage);
		}
	};

	// change to explicitly be a useCallback?
	const handleTextChange = (newText: string) => {
		if (selectedImage != null) {
			updateImage({
				...selectedImage,
				transcription: newText,
			});
		}
	};

	const handlePageChange = (page: number) => {
		if (page < images.length && page >= 0) {
			setSelectedImage(images[page]);
		} else {
			setSelectedImage(images[0]);
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
		if (validVerseRange && selectedImage) {
			selectedImage.startVerse = start;
			selectedImage.endVerse = end;
			updateImage(selectedImage);
		}
	};

	const validateVerseRange = (start: number, end: number) => {
		if (end < start) return false;
		if (end > 176) return false;
		if (start < 0) return false;
		return true;
	};

	return (
		<div
			id="transcriptionPagePanels"
			className="flex flex-col h-screen bg-gray-100"
		>
			<NavBar />
			<div className="flex h-[calc(100%_-_5rem)] overflow-visible">
				{isProjectContentsVisible && (
					<div className="w-[240px] shrink-0 border-r border-gray-200 bg-gray-100">
						<div className="flex items-center justify-end px-4 pt-4">
							<button
								type="button"
								onClick={() => setIsProjectContentsVisible(false)}
								className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-[#0F2F4C] shadow-sm transition-transform transition-shadow hover:scale-105 hover:bg-gray-50 hover:shadow-md"
								aria-label="Hide project contents panel"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M17 1H3C1.89543 1 1 1.89543 1 3V17C1 18.1046 1.89543 19 3 19H17C18.1046 19 19 18.1046 19 17V3C19 1.89543 18.1046 1 17 1Z"
										stroke="#0F2F4C"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M7 1V19M14 13L11 10L14 7"
										stroke="#0F2F4C"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</div>
						<div className="h-[calc(100%-3rem)]">
							<ProjectContents
								key={images.length}
								images={images}
								selectedImage={selectedImage}
								handleImageUpload={handleImageUpload}
								handleOpenMoveImageModal={handleOpenMoveImageModal}
								handlePageChange={handlePageChange}
								handleDeleteImage={handleOpenDeleteImageDialog}
							/>
						</div>
					</div>
				)}
				<div className="relative h-full min-w-0 flex-1">
					{!isProjectContentsVisible && (
						<button
							type="button"
							onClick={() => setIsProjectContentsVisible(true)}
							className="absolute left-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-[#0F2F4C] shadow-sm transition-transform transition-shadow hover:scale-105 hover:bg-gray-50 hover:shadow-md"
							aria-label="Show project contents panel"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								className="-scale-x-100"
								aria-hidden="true"
							>
								<path
									d="M17 1H3C1.89543 1 1 1.89543 1 3V17C1 18.1046 1.89543 19 3 19H17C18.1046 19 19 18.1046 19 17V3C19 1.89543 18.1046 1 17 1Z"
									stroke="#0F2F4C"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M7 1V19M14 13L11 10L14 7"
									stroke="#0F2F4C"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					)}
					<EditorWrapper
						images={images}
						selectedImage={selectedImage}
						handleResubmitImage={handleResubmitImage}
						handleTextChange={handleTextChange}
						handleVerseRangeChange={handleVerseRangeChange}
					/>
				</div>
			</div>
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
					imageName={imageToDelete?.filename ?? ""}
					isOpen={isDeleteDialogOpen}
					onClose={handleCloseDeleteDialog}
					onConfirmDelete={handleDeleteImage}
				/>
			</ShowWhen>
		</div>
	);
}

export default TranscriptionPage;
