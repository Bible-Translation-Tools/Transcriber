import ZoomableImage from "./ZoomableImage.tsx";
import {ImageData} from "@src/data/ImageData.tsx";

interface PaginationProps {
	image: ImageData | null;
	currentPage: number;
	totalImages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
	image,
	currentPage,
	totalImages,
	onPageChange,
}) => {
	return (
		<div className="relative w-[451px] flex flex-col justify-content items-center p-6">
			<div className="grow relative flex-start group ">
				{image ? <ZoomableImage src={image.data} /> : <div />}
			</div>
			{ image ?
			<div className="flex-end flex">
				<button
					type="button"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 0}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
				>
					Previous
				</button>
				<span className="mx-2">{`${currentPage + 1} / ${totalImages}`}</span>
				<button
					type="button"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalImages - 1} // Disable "Next" on the last page
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
				>
					Next
				</button>
			</div> : <></> }
		</div>
	);
};

export default Pagination;
