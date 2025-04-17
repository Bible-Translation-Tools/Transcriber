import TranscriptionTips from "@src/pages/transcription/TranscriptionTips.tsx";
import UploadImages from "@components/image/UploadImages.tsx";

type EmptyProjectProps = {
	handleFiles: (files: File[]) => Promise<void>;
};
function EmptyProject({ handleFiles }: EmptyProjectProps) {
	return (
		<div className="flex justify-center items-center grow">
			<UploadImages handleFiles={handleFiles} />
			<TranscriptionTips />
		</div>
	);
}

export default EmptyProject;
