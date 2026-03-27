import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import RetryTranscription from "@src/pages/transcription/RetryTranscription.tsx";
import ZoomableImage from "./ZoomableImage.tsx";

interface PaginationProps {
	image: TranscribableDocument | null;
	onRetryTranscription: () => void;
	isVerticalLayout: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
	image,
	onRetryTranscription,
	isVerticalLayout,
}) => {
	return (
		<div className="h-full flex flex-col items-center">
			<div className="relative flex-1 min-h-0 w-full min-w-0 group">
				{image ? (
					<ZoomableImage
						src={image.data}
						isVerticalLayout={isVerticalLayout}
					/>
				) : (
					<div />
				)}
			</div>
			{image ? (
				<div className="flex-none py-2">
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
