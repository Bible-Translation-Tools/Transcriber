import Pagination from "@components/image/Pagination.tsx";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.ts";
import EmptyProject from "@src/pages/transcription/EmptyProject.tsx";
import {TranscriptionWorkspace} from "@src/pages/transcription/TranscriptionWorkspace.tsx";

type EditorWrapperProps = {
	images: TranscribableDocument[] | undefined;
	selectedImage: TranscribableDocument | null;
	handleResubmitImage: () => void;
	handleTextChange: (text: string) => void;
	handleVerseRangeChange: (start: number, end: number) => void;
};

export default function EditorWrapper({
	images,
	selectedImage,
	handleResubmitImage,
	handleTextChange,
	handleVerseRangeChange,
}: EditorWrapperProps) {
	if (!images || images.length === 0) {
		return <EmptyProject />;
	}

	return (
		<div className="grow flex flex-row">
			<Pagination
				image={selectedImage}
				onRetryTranscription={handleResubmitImage}
			/>
			<div className="flex-2">
				<TranscriptionWorkspace
					key={selectedImage?.id}
					selectedImage={selectedImage}
					onRangeChange={handleVerseRangeChange}
					status={selectedImage?.status}
					transcription={selectedImage?.transcription}
					onChange={(text) => {
						handleTextChange(text);
					}}
				/>
			</div>
		</div>
	);
}
