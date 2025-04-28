import RangeInput from "@components/forms/RangeInput.tsx";
import TextEditor from "@components/forms/TextEditor.tsx";
import Pagination from "@components/image/Pagination.tsx";
import {ShowWhen} from "@components/utils/ShowWhen.tsx";
import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {TranscriptionStatus} from "@src/data/TranscriptionStatus.ts";
import EmptyProject from "@src/pages/transcription/EmptyProject.tsx";
import TranscriptionStatusOverlay from "@src/pages/transcription/TranscriptionStatusOverlay.tsx";
import {useTranslation} from "react-i18next";

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
	const { t } = useTranslation();

	if (!images || images.length === 0) {
		return <EmptyProject />;
	}
	return (
		<div className="grow flex flex-row">
			<Pagination
				image={selectedImage}
				onRetryTranscription={handleResubmitImage}
			/>
			<div className="flex-2 p-4">
				<div className="h-full flex flex-col">
					<ShowWhen when={!!selectedImage}>
						<RangeInput
							key={selectedImage?.id}
							selectedImage={selectedImage}
							onRangeChange={handleVerseRangeChange}
						/>
					</ShowWhen>
					<div className="h-full flex-1 flex-col">
						<ShowWhen
							when={
								selectedImage?.status ===
								TranscriptionStatus.IN_PROGRESS
							}
						>
							<TranscriptionStatusOverlay
								mainMessage={t(
									"This Image is Being Processed.",
								)}
								subMessage={t("Please Be Patient message")}
							/>
						</ShowWhen>
						<ShowWhen
							when={
								selectedImage?.status ===
								TranscriptionStatus.TRANSCRIPTION_ERROR
							}
						>
							<TranscriptionStatusOverlay
								mainMessage={t("Transcription Errored")}
								subMessage={t("Please Retry Message")}
							/>
						</ShowWhen>
						<ShowWhen
							when={
								selectedImage?.status ===
								TranscriptionStatus.COMPLETED
							}
						>
							<TextEditor
								text={selectedImage?.transcription ?? ""}
								onChange={(text) => {
									handleTextChange(text);
								}}
							/>
						</ShowWhen>
					</div>
				</div>
			</div>
		</div>
	);
}
