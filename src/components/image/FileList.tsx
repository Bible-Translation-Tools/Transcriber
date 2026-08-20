import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { TranscriptionStatus } from "@src/data/TranscriptionStatus.ts";
import type React from "react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";

interface FileListItemProps {
	fileName: string;
	selected: boolean;
	id: string;
	index: number;
	project: string;
	onImageSelected: (imageNumber: number) => void;
	onMoveImage: (image: number) => void;
	onDeleteImage: (image: number) => void;
	isLoading?: boolean;
}

const FileListItem: React.FC<FileListItemProps> = ({
	selected,
	fileName,
	index,
	project,
	isLoading,
	onImageSelected,
	onMoveImage,
	onDeleteImage,
}) => {
	const { t } = useTranslation();
	// The menu is fixed-positioned at the ⋮ button's on-screen rect: the list
	// scrolls inside an overflow container, so an absolutely positioned menu
	// would either be clipped by it or (with no positioned ancestor) land at
	// the document's flow position - off-screen for items far down the list.
	const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
	const [menuPosition, setMenuPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const isMenuOpen = menuAnchor != null;
	const menuRef = useRef<HTMLDivElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	const closeMenu = useCallback((): void => {
		setMenuAnchor(null);
		setMenuPosition(null);
	}, []);

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				!menuButtonRef.current?.contains(event.target as Node)
			) {
				closeMenu();
			}
		};
		// A fixed menu does not track its button, so any scroll or resize
		// would leave it floating detached - close it instead.
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("scroll", closeMenu, true);
		window.addEventListener("resize", closeMenu);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("scroll", closeMenu, true);
			window.removeEventListener("resize", closeMenu);
		};
	}, [isMenuOpen, closeMenu]);

	// Placed only once the menu has rendered and its size is measurable:
	// below the button when it fits, flipped above it when it would run off
	// the bottom of the viewport.
	useLayoutEffect(() => {
		if (!menuAnchor || !menuRef.current) {
			return;
		}
		const menu = menuRef.current;
		const top =
			menuAnchor.bottom + menu.offsetHeight > window.innerHeight
				? Math.max(8, menuAnchor.top - menu.offsetHeight)
				: menuAnchor.bottom;
		const left = Math.min(
			menuAnchor.left,
			window.innerWidth - menu.offsetWidth - 8,
		);
		setMenuPosition({ top, left });
	}, [menuAnchor]);

	const handleMenuClick = (
		event: React.MouseEvent<HTMLButtonElement>,
	): void => {
		if (isMenuOpen) {
			closeMenu();
			return;
		}
		setMenuAnchor(event.currentTarget.getBoundingClientRect());
	};

	const handleMoveClick = (): void => {
		onMoveImage(index);
		closeMenu();
	};

	const handleDeleteClick = (): void => {
		onDeleteImage(index);
		closeMenu();
	};

	const handleImageSelected = (): void => {
		onImageSelected(index);
	};

	const selectedStyle = (): string => {
		if (selected) {
			return "bg-gray-200 border border-[#E6E6E6]";
		}
		return "";
	};

	return (
		<div
			className={`border-b border-gray-200 hover:bg-gray-200 pr-4 ${selectedStyle()}`}
		>
			<div className="flex items-center justify-between">
				<button
					type="button"
					className="flex flex-1 min-w-0 flex-col items-start gap-0.5 p-4 text-left"
					onClick={handleImageSelected}
				>
					<span className="w-full truncate">{fileName}</span>
					<span className="text-xs text-gray-500">{project}</span>
				</button>
				{isLoading ? (
					// biome-ignore lint/style/useSelfClosingElements: <explanation>
					<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-500"></div>
				) : (
					<button
						ref={menuButtonRef}
						type={"button"}
						onClick={handleMenuClick}
						className="flex-shrink-0 w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-400"
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
					className="fixed z-50 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
					// Hidden until the layout effect has measured it and set a
					// real position, so it never flashes at the wrong spot.
					style={
						menuPosition
							? { top: menuPosition.top, left: menuPosition.left }
							: { top: 0, left: 0, visibility: "hidden" }
					}
				>
					<div className="py-1">
						{/* <button
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
						</button> */}
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
		<div className="flex-1 min-h-0 overflow-y-auto bg-white">
			{images.map((image, index) => {
				return (
					<FileListItem
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						selected={selectedId === image.id}
						id={image.id}
						index={index}
						fileName={image.filename}
						project={`${image.languageCode} · ${image.bookCode} ${image.chapter}`}
						// todo: wk: we moved away from this, so for now gonna set to false.  This might make more sense if we have lazily image by image the data from idb, but doesn't make sense I don't think with just fetchign all from rq. SEtting to ?? to false for now
						isLoading={
							TranscriptionStatus.IN_PROGRESS === image?.status
						}
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
