import type { TranscribableDocument } from "@src/data/TranscribableDocument";
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
		<div className="relative w-[451px] flex flex-col justify-content items-center p-6">
			<div className="grow relative flex-start group ">
				{image ? <ZoomableImage src={image.data} /> : <div />}
			</div>
			{image ? (
				<div className="flex-end flex">
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
