import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import RetryTranscription from "@src/pages/transcription/RetryTranscription.tsx";
import ZoomableImage from "./ZoomableImage.tsx";

interface PaginationProps {
	image: TranscribableDocument | null;
	onRetryTranscription: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
	image,
	onRetryTranscription,
}) => {
	return (
		<div className="h-full flex flex-col justify-between items-center">
			<div className="relative flex-start group flex-1 min-h-0 min-w-0 overflow-hidden">
				{image ? <ZoomableImage src={image.data} /> : <div />}
			</div>
			{image ? (
				<div className="flex-none mt-auto pt-4 pb-4 ">
					<RetryTranscription
						onRetryTranscription={onRetryTranscription}
					/>
				</div>
			) : (
				<></>
			)}
		</div>
	);
};

export default Pagination;
