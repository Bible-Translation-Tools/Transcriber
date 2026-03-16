import DocumentViewer from "@components/image/Pagination.tsx";
import { useState } from "react";
import type { TranscribableDocument } from "@src/data/TranscribableDocument.ts";
import EmptyProject from "@src/pages/transcription/EmptyProject.tsx";
import { TranscriptionWorkspace } from "@src/pages/transcription/TranscriptionWorkspace.tsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
	const [isVertical, setIsVertical] = useState(true);

	if (!images || images.length === 0) {
		return <EmptyProject />;
	}

	const panelDirection = isVertical ? "vertical" : "horizontal";
	const resizeHandleClass =
		isVertical
			? "h-2 bg-gray-200 flex items-center justify-center"
			: "w-2 bg-gray-200 flex items-center justify-center";
	const resizeGripClass =
		isVertical ? "h-1 w-6 bg-gray-400 rounded-full" : "w-1 h-6 bg-gray-400 rounded-full";

	return (
		<div className="flex h-full w-full flex-col gap-2">
			<div className="flex justify-end px-2">
				<button
					type="button"
					onClick={() => setIsVertical((prev) => !prev)}
					className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
				>
					{isVertical ? "Switch to side-by-side" : "Switch to stacked"}
				</button>
			</div>

			<div className="flex-1 min-h-0">
				<PanelGroup direction={panelDirection} className="h-full w-full">
					<Panel minSize={20}>
						<DocumentViewer
							image={selectedImage}
							onRetryTranscription={handleResubmitImage}
						/>
					</Panel>
					<PanelResizeHandle className={resizeHandleClass}>
						<div className={resizeGripClass} />
					</PanelResizeHandle>
					<Panel defaultSize={40} minSize={30}>
						<TranscriptionWorkspace
							key={selectedImage?.id}
							selectedImage={selectedImage}
							onRangeChange={handleVerseRangeChange}
							status={selectedImage?.status}
							transcription={selectedImage?.transcription}
							isVerticalLayout={isVertical}
							onChange={(text) => {
								handleTextChange(text);
							}}
						/>
					</Panel>
				</PanelGroup>
			</div>
		</div>
	);
}
