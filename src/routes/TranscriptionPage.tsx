import "../App.css";
// @ts-ignore
import { pdf2image } from "@pardnchiu/pdf2image";
import { useState } from "react";
import ImagePreviewList from "../components/ImagePreviewList";
import NavBar from "../components/NavBar";
import Pagination from "../components/Pagination";
import TextEditor from "../components/TextEditor";
import type { ImageData } from "../context/ImageContext";
import { useImageContext } from "../context/useImageContext";

function TranscriptionPage() {
	const {
		images,
		selectedImage,
		setSelectedImage,
		addImage,
		updateTranscription,
		resubmitImageForTranscription,
	} = useImageContext();
	const [currentPage, setCurrentPage] = useState(0);

	for (let i = 0; i < images.length; i++) {
		console.log(images[i].url);
	}

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const fileArray = Array.from(files);
			handleFiles(fileArray);
		}
	};

	const handleFiles = (files: File[]) => {
		const validFiles = files.filter((file) => {
			const fileType = file.type;
			return (
				fileType === "image/jpeg" ||
				fileType === "image/png" ||
				fileType === "application/pdf"
			);
		});

		if (validFiles.length !== files.length) {
			console.log("Only JPEG, PNG, and PDF files are allowed.");
		}

		validFiles.forEach((file) => {
			if (file.type !== "application/pdf") {
				const reader = new FileReader();

				reader.onloadend = () => {
					const base64String = reader.result;
					const url = URL.createObjectURL(file);
					const image: ImageData = {
						url,
						data: base64String,
						transcription: null,
					}; // Type the image object

					addImage(image);
				};

				reader.readAsDataURL(file);
			} else {
				const reader = new FileReader();

				(async () => {
					reader.onload = async (e) => {
						const _this = e.target;
						if (_this?.result != null) {
							const converter = new pdf2image({
								filename: `${file.name} yyyy-MM-DD`,
								file: _this.result,
								scale: 4,
								type: "jpeg",
							});

							await converter.convert();

							converter.images.forEach((imageData: any) => {
								const url = URL.createObjectURL(file);
								const image: ImageData = {
									url,
									data: imageData,
									transcription: null,
								}; // Type the image object
								addImage(image);
							});
						}
					};
				})();

				reader.readAsArrayBuffer(file);
			}
		});
	};

	const handleResubmitImage = () => {
		if (selectedImage != null) {
			resubmitImageForTranscription(selectedImage);
		}
	};

	// change to explicitly be a useCallback?
	const handleTextChange = (newText: string) => {
		if (selectedImage != null) {
			updateTranscription({
				...selectedImage,
				transcription: newText,
			});
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

	return (
		<div className="flex flex-col h-screen bg-gray-100">
			<NavBar />
			<div className="flex grow">
				<div className="flex flex-col gap-2 w-24 p-4 overflow-y-auto">
					<label
						htmlFor="imageUpload"
						className="cursor-pointer relative w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center"
					>
						<div className="relative w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
							{" "}
							{/* Outer container */}
							<div className="">
								<svg
									width="64"
									height="64"
									viewBox="0 0 64 64"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect
										width="64"
										height="64"
										rx="8"
										fill="#EEF0FF"
									/>
									<path
										d="M25 41C24.45 41 23.9793 40.8043 23.588 40.413C23.1967 40.0217 23.0007 39.5507 23 39V25C23 24.45 23.196 23.9793 23.588 23.588C23.98 23.1967 24.4507 23.0007 25 23H32.45C32.7833 23 33.0377 23.146 33.213 23.438C33.3883 23.73 33.409 24.0423 33.275 24.375C33.1917 24.6417 33.125 24.9083 33.075 25.175C33.025 25.4417 33 25.7167 33 26C33 27.3833 33.4877 28.5627 34.463 29.538C35.4383 30.5133 36.6173 31.0007 38 31C38.2833 31 38.5583 30.975 38.825 30.925C39.0917 30.875 39.3583 30.8083 39.625 30.725C39.9583 30.6083 40.271 30.6333 40.563 30.8C40.855 30.9667 41.0007 31.2167 41 31.55V39C41 39.55 40.8043 40.021 40.413 40.413C40.0217 40.805 39.5507 41.0007 39 41H25ZM26 37H38L34.25 32L31.25 36L29 33L26 37ZM38 29C37.7167 29 37.4793 28.904 37.288 28.712C37.0967 28.52 37.0007 28.2827 37 28V27H36C35.7167 27 35.4793 26.904 35.288 26.712C35.0967 26.52 35.0007 26.2827 35 26C34.9993 25.7173 35.0953 25.48 35.288 25.288C35.4807 25.096 35.718 25 36 25H37V24C37 23.7167 37.096 23.4793 37.288 23.288C37.48 23.0967 37.7173 23.0007 38 23C38.2827 22.9993 38.5203 23.0953 38.713 23.288C38.9057 23.4807 39.0013 23.718 39 24V25H40C40.2833 25 40.521 25.096 40.713 25.288C40.905 25.48 41.0007 25.7173 41 26C40.9993 26.2827 40.9033 26.5203 40.712 26.713C40.5207 26.9057 40.2833 27.0013 40 27H39V28C39 28.2833 38.904 28.521 38.712 28.713C38.52 28.905 38.2827 29.0007 38 29Z"
										fill="#0056D1"
									/>
								</svg>
							</div>
						</div>
						<input
							type="file"
							id="imageUpload"
							multiple
							className="hidden"
							onChange={handleImageUpload}
						/>
					</label>
					<ImagePreviewList
						images={images}
						currentImage={currentPage}
						onImageSelected={handlePageChange}
					/>
				</div>
				<Pagination
					image={selectedImage}
					currentPage={currentPage}
					totalImages={images.length}
					onPageChange={handlePageChange}
				/>
				<div className="relative flex-1 p-4 grow overflow-y-auto">
					{" "}
					{/* Relative wrapper for positioning */}
					<div className="h-full flex flex-col">
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
						<div className="absolute inset-0 flex items-center justify-center bg-gray-800 opacity-60 rounded-lg">
							{" "}
							{/* Overlay with rounded corners */}
							<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default TranscriptionPage;
