import UploadImages from "@components/image/UploadImages.tsx";
import TranscriptionTips from "@src/pages/transcription/TranscriptionTips.tsx";

function EmptyProject() {
	return (
		<div className="flex justify-center items-center grow">
			<UploadImages />
			<TranscriptionTips />
		</div>
	);
}

export default EmptyProject;
