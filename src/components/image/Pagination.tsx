import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import { useImageBlobUrl } from "@src/hooks/useImageBlobUrl.ts";
import RetryTranscription from "@src/pages/transcription/RetryTranscription.tsx";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();
	// Bytes come from the local blob cache, or are fetched once and cached.
	const imageUrl = useImageBlobUrl(image?.id);

	return (
		<div className="h-full flex flex-col items-center">
			<div className="relative flex-1 min-h-0 w-full min-w-0 group">
				{image && imageUrl ? (
					<ZoomableImage
						src={imageUrl}
						isVerticalLayout={isVerticalLayout}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-gray-400">
						{image ? t("Loading image...") : null}
					</div>
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
