import ZoomableImage from "./ZoomableImage.tsx";
import {ImageData} from "@src/data/ImageData.tsx";
import RetryTranscription from "@src/pages/transcription/RetryTranscription.tsx";

interface PaginationProps {
	image: ImageData | null;
	onRetryTranscription: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
	image,
    onRetryTranscription,
}) => {
	return (
		<div className="relative w-[451px] flex flex-col justify-content items-center p-6">
			<div className="grow relative flex-start group ">
				{image ? <ZoomableImage src={image.data} /> : <div />}
			</div>
			{ image ?
			<div className="flex-end flex">
				<RetryTranscription onRetryTranscription={onRetryTranscription} />
			</div> : <></> }
		</div>
	);
};

export default Pagination;
