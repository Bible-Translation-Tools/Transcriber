import RangeInput from "@components/forms/RangeInput.tsx";
import TextEditor from "@components/forms/TextEditor.tsx";
import Pagination from "@components/image/Pagination.tsx";
import { ShowWhen } from "@components/utils/ShowWhen.tsx";
import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import EmptyProject from "@src/pages/transcription/EmptyProject.tsx";

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
			<div className="flex-2 relative p-4 overflow-y-auto">
				<div className="h-full flex flex-col">
					<ShowWhen when={!!selectedImage}>
						<RangeInput
							key={selectedImage?.id}
							selectedImage={selectedImage}
							onRangeChange={handleVerseRangeChange}
						/>
					</ShowWhen>
					<TextEditor
						// key={textEditorKey()}
						text={selectedImage?.transcription ?? ""}
						onChange={(text) => {
							handleTextChange(text);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
