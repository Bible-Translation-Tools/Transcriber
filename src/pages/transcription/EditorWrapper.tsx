import DocumentViewer from "@components/image/Pagination.tsx";
import { useState } from "react";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
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
		<div className="relative h-full w-full">
			<button
				type="button"
				onClick={() => setIsVertical((prev) => !prev)}
				className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition-transform transition-shadow hover:scale-105 hover:bg-gray-50 hover:shadow-md"
				aria-label={
					isVertical ? "Switch to side-by-side layout" : "Switch to stacked layout"
				}
			>
				<SplitscreenIcon
					fontSize="medium"
					className={isVertical ? "" : "rotate-90"}
				/>
			</button>

			<div className="flex h-full w-full flex-col">
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
		</div>
	);
}
