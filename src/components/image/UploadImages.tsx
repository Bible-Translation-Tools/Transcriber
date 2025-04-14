// @ts-ignore
import { pdf2image } from "@pardnchiu/pdf2image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import uploadFiles from "@src/domain/UploadFiles.ts";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import {addImage} from "@src/domain/ImageActions.ts";

function UploadImages() {
	const store = useTranscriptionStore();

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
		uploadFiles(store, files, addImage);
	};

	return (
		<div
			{...getRootProps()}
			className="flex-1 h-[95%] p-10 bg-[#EEF0FF] rounded-[40px] border-2 border-dashed border-[#0056D1] flex flex-col items-center justify-center gap-4 cursor-pointer"
		>
			<input
				{...getInputProps()}
				id="fileInput"
				className="hidden"
				onChange={handleFileInputChange}
			/>
			{isDragActive ? (
				<p className="text-[26px] text-[#0F2F4C] font-semibold leading-[29.90px] font-noto-sans">
					Drop the files here ...
				</p>
			) : (
				<>
					<div className="flex justify-center items-center">
						<svg
							width="80"
							height="80"
							viewBox="0 0 80 80"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
					<div className="flex flex-col items-center gap-2">
						<div className="text-center text-[26px] text-[#0F2F4C] font-semibold leading-[29.90px] font-noto-sans">
							Drag and Drop Images Here
						</div>
						<div className="text-center">
                            <span className="text-[20px] text-[#516B86] font-normal leading-[40px] font-noto-sans">
                                Or{" "}
                            </span>
							<span
								className="text-[20px] text-[#0056D1] font-normal underline leading-[40px] font-noto-sans cursor-pointer"
								onClick={handleBrowseClick}
								onKeyUp={handleBrowseClick}
							>
                                click to browse
                            </span>
							<span className="text-[20px] text-[#516B86] font-normal leading-[40px] font-noto-sans">
                                {" "}
								instead. This app supports most image formats,
                                such as: PNG, JPG, PDF.
                            </span>
						</div>
					</div>
				</>
			)}
			{errorMessage && <p className="text-red-500">{errorMessage}</p>}
		</div>
	);
}

export default UploadImages;