import { pdf2image } from "@pardnchiu/pdf2image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { ImageData } from "../context/ImageContext";
import { useImageContext } from "../context/useImageContext";

function UploadImages() {
	const { addImage } = useImageContext(); // Destructure only addImage
	const [errorMessage, setErrorMessage] = useState("");

	// todo: investigate the error thrown by biome here on more deps than necessary: addImage
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			handleFiles(acceptedFiles);
		},
		[addImage],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
	});

	const handleBrowseClick = () => {
		document.getElementById("fileInput")?.click(); // Optional chaining for safety
	};

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (files) {
			const fileArray = Array.from(files);
			handleFiles(fileArray);
		}
	};

	const handleFiles = (files: File[]) => {
		setErrorMessage("");

		const validFiles = files.filter((file) => {
			const fileType = file.type;
			return (
				fileType === "image/jpeg" ||
				fileType === "image/png" ||
				fileType === "application/pdf"
			);
		});

		if (validFiles.length !== files.length) {
			setErrorMessage("Only JPEG, PNG, and PDF files are allowed.");
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

	return (
		<div
			{...getRootProps()} // Connect to react-dropzone
			style={{
				width: "868px",
				height: "492px",
				padding: "40px",
				background: "#EEF0FF",
				borderRadius: "40px",
				border: "1px #0056D1 dashed",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "16px",
				cursor: "pointer", // Indicate that the area is clickable/droppable
			}}
		>
			<input
				{...getInputProps()}
				id="fileInput"
				className="hidden"
				onChange={handleFileInputChange}
			/>{" "}
			{/* Hidden file input */}
			{isDragActive ? (
				<p
					style={{
						color: "#0F2F4C",
						fontSize: "26px",
						fontFamily: "Noto Sans",
						fontWeight: "600",
						lineHeight: "29.90px",
					}}
				>
					Drop the files here ...
				</p>
			) : (
				<>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<svg
							width="80"
							height="80"
							viewBox="0 0 80 80"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							{/* ... SVG Path Data ... */}
							<path
								opacity="0.5"
								d="M63.3332 6.66669H16.6665C14.017 6.67547 11.4786 7.73186 9.60514 9.60533C7.73168 11.4788 6.67529 14.0172 6.6665 16.6667V46.2L19.5998 33.2667C21.5055 31.4529 24.0356 30.4413 26.6665 30.4413C29.2974 30.4413 31.8275 31.4529 33.7332 33.2667L43.3032 42.89L46.2632 39.93C48.1427 38.0634 50.6842 37.0159 53.3332 37.0159C55.9821 37.0159 58.5236 38.0634 60.4032 39.93L73.3332 52.8667V16.6667C73.3244 14.0172 72.268 11.4788 70.3945 9.60533C68.5211 7.73186 65.9826 6.67547 63.3332 6.66669Z"
								fill="#0056D1"
							/>
							<path
								d="M33.7332 33.2667C31.8275 31.4529 29.2974 30.4413 26.6665 30.4413C24.0356 30.4413 21.5055 31.4529 19.5998 33.2667L6.6665 46.2V63.3333C6.67529 65.9828 7.73168 68.5212 9.60514 70.3947C11.4786 72.2682 14.017 73.3246 16.6665 73.3333H63.3332C64.6778 73.3325 66.0085 73.0605 67.2456 72.5336C68.4827 72.0067 69.6009 71.2357 70.5332 70.2667L33.7332 33.2667Z"
								fill="#0056D1"
							/>
							<path
								opacity="0.25"
								d="M73.3332 52.86L60.4032 39.93C58.5236 38.0634 55.9822 37.0159 53.3332 37.0159C50.6843 37.0159 48.1428 38.0634 46.2632 39.93L43.3032 42.89L70.5199 70.2533C72.3266 68.4033 73.3366 65.92 73.3332 63.3333V52.86Z"
								fill="#0056D1"
							/>
						</svg>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<div
							style={{
								textAlign: "center",
								color: "#0F2F4C",
								fontSize: "26px",
								fontFamily: "Noto Sans",
								fontWeight: "600",
								lineHeight: "29.90px",
							}}
						>
							Drag and Drop Images Here
						</div>
						<div style={{ textAlign: "center" }}>
							<span
								style={{
									color: "#516B86",
									fontSize: "20px",
									fontFamily: "Noto Sans",
									fontWeight: "400",
									lineHeight: "40px",
								}}
							>
								Or{" "}
							</span>
							<span
								style={{
									color: "#0056D1",
									fontSize: "20px",
									fontFamily: "Noto Sans",
									fontWeight: "400",
									textDecoration: "underline",
									lineHeight: "40px",
									cursor: "pointer", // Indicate that it's clickable
								}}
								onClick={handleBrowseClick} // Attach click handler
								onKeyUp={handleBrowseClick} // Attach keydown handler
							>
								click to browse
							</span>
							<span
								style={{
									color: "#516B86",
									fontSize: "20px",
									fontFamily: "Noto Sans",
									fontWeight: "400",
									lineHeight: "40px",
								}}
							>
								{" "}
								instead. This app supports most image formats,
								such as: PNG, JPG, PDF.
							</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default UploadImages;
