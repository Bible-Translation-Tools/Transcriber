import DocumentViewer from "@components/image/Pagination.tsx";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.ts";
import EmptyProject from "@src/pages/transcription/EmptyProject.tsx";
import {TranscriptionWorkspace} from "@src/pages/transcription/TranscriptionWorkspace.tsx";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";

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
		<PanelGroup direction="horizontal">
			<Panel minSize={20}>
				<DocumentViewer
					image={selectedImage}
					onRetryTranscription={handleResubmitImage}
				/>
			</Panel>
			<PanelResizeHandle className="w-2 bg-gray-200 flex items-center justify-center">
				<div className="w-1 h-6 bg-gray-400 rounded-full" />
			</PanelResizeHandle>
			<Panel defaultSize={40} minSize={30}>
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
			</Panel>
		</PanelGroup>
	);
}
