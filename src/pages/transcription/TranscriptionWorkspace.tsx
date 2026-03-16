import RangeInput from "@components/forms/RangeInput.tsx";
import TextEditor from "@components/forms/TextEditor.tsx";
import { ShowWhen } from "@components/utils/ShowWhen.tsx";
import type { TranscribableDocument } from "@src/data/TranscribableDocument.ts";
import { TranscriptionStatus } from "@src/data/TranscriptionStatus.ts";
import TranscriptionStatusOverlay from "@src/pages/transcription/TranscriptionStatusOverlay.tsx";
import { useTranslation } from "react-i18next";

export function TranscriptionWorkspace(props: {
	selectedImage: TranscribableDocument | null;
	onRangeChange: (start: number, end: number) => void;
	status: TranscriptionStatus | undefined;
	transcription: string | undefined | null;
	isVerticalLayout?: boolean;
	onChange: (text: string) => void;
}) {
	const { t } = useTranslation();

	return (
		<div className="h-full flex flex-col p-4">
			<ShowWhen when={!!props.selectedImage}>
				<RangeInput
					selectedImage={props.selectedImage}
					onRangeChange={props.onRangeChange}
				/>
			</ShowWhen>
			<div className="h-full flex-1 flex-col">
				<ShowWhen
					when={props.status === TranscriptionStatus.IN_PROGRESS}
				>
					<TranscriptionStatusOverlay
						mainMessage={t("This Image is Being Processed.")}
						subMessage={t("Please Be Patient message")}
					/>
				</ShowWhen>
				<ShowWhen
					when={
						props.status === TranscriptionStatus.TRANSCRIPTION_ERROR
					}
				>
					<TranscriptionStatusOverlay
						mainMessage={t("Transcription Errored")}
						subMessage={t("Please Retry Message")}
					/>
				</ShowWhen>
				<ShowWhen when={props.status === TranscriptionStatus.COMPLETED}>
					<div className="flex h-full w-full justify-center">
						<div className={props.isVerticalLayout ? "w-3/5" : "w-full"}>
							<TextEditor
								text={props.transcription ?? ""}
								onChange={props.onChange}
							/>
						</div>
					</div>
				</ShowWhen>
			</div>
		</div>
	);
}
