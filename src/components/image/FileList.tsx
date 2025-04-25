import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface FileListItemProps {
	fileName: string;
	selected: boolean;
	id: string;
	index: number;
	onImageSelected: (imageNumber: number) => void;
	onMoveImage: (image: number) => void;
	onDeleteImage: (image: number) => void;
	isLoading?: boolean;
}

const FileListItem: React.FC<FileListItemProps> = ({
	selected,
	fileName,
	index,
	isLoading,
	onImageSelected,
	onMoveImage,
	onDeleteImage,
}) => {
	const { t } = useTranslation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isMenuOpen]);

	const handleMenuClick = (): void => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleMoveClick = (): void => {
		onMoveImage(index);
		setIsMenuOpen(false);
	};

	const handleDeleteClick = (): void => {
		onDeleteImage(index);
		setIsMenuOpen(false);
	};

	const handleImageSelected = (): void => {
		onImageSelected(index);
	};

	const selectedStyle = (): string => {
		if (selected) {
			return "rounded-2xl bg-white";
		}
		return "";
	};

	return (
		<div
			className={`border-b border-gray-200 hover:bg-gray-200 ${selectedStyle()}`}
		>
			<div className="flex items-center justify-between">
				<button
					type="button"
					className="flex items-center p-4 w-full"
					onClick={handleImageSelected}
				>
					<span className="truncate">{fileName}</span>
				</button>
				{isLoading ? (
					// biome-ignore lint/style/useSelfClosingElements: <explanation>
					<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500"></div>
				) : (
					<button
						type={"button"}
						onClick={handleMenuClick}
						className="w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-400"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
						</svg>
					</button>
				)}
			</div>

			{isMenuOpen && (
				<div
					ref={menuRef}
					className="absolute z-1 ml-[18vw] mb-8 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
				>
					<div className="py-1">
						<button
							type={"button"}
							onClick={handleMoveClick}
							className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-2 text-blue-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
								/>
							</svg>
							{t("Move Image")}
						</button>
						<button
							type={"button"}
							onClick={handleDeleteClick}
							className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-2 text-red-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							{t("Delete Image")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

interface FileListProps {
	selectedId: string | undefined;
	images: TranscribableDocument[];
	onImageSelected: (imageNumber: number) => void;
	onMoveImage: (image: number) => void;
	onDeleteImage: (image: number) => void;
}

const FileList: React.FC<FileListProps> = ({
	selectedId,
	images,
	onImageSelected,
	onMoveImage,
	onDeleteImage,
}) => {
	return (
		<div className="w-[20vw] h-screen overflow-y-scroll">
			{images.map((image, index) => {
				return (
					<FileListItem
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						selected={selectedId === image.id}
						id={image.id}
						index={index}
						fileName={image.filename}
						isLoading={image?.loading ?? true}
						onImageSelected={onImageSelected}
						onMoveImage={onMoveImage}
						onDeleteImage={onDeleteImage}
					/>
				);
			})}
		</div>
	);
};

export default FileList;
