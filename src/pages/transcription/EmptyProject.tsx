import UploadImages from "@components/image/UploadImages.tsx";
import TranscriptionTips from "@src/pages/transcription/TranscriptionTips.tsx";

function EmptyProject() {
	return (
		<div className="flex h-full w-full min-h-0 items-stretch">
			<UploadImages />
			<TranscriptionTips />
		</div>
	);
}

export default EmptyProject;
