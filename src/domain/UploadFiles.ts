import type { TranscribableDocument } from "@src/data/TranscribableDocument.tsx";
import type { TranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import type { TranscriptionErrorCode } from "@api/ai/TranscriptionResponse.ts";
import { parsePdfFile } from "@src/domain/PdfToImages.ts";

export default async function uploadFiles(
	store: TranscriptionStore,
	files: File[],
	addImage: (
		store: TranscriptionStore,
		image: TranscribableDocument,
		onError: (err: TranscriptionErrorCode, errorMessage: string) => void,
	) => void,
	onError: (err: TranscriptionErrorCode, errorMessage: string) => void,
) {
	const validFiles = files.filter((file) => {
		const fileType = file.type;
		return (
			fileType === "image/jpeg" ||
			fileType === "image/png" ||
			fileType === "application/pdf"
		);
	});

	if (validFiles.length !== files.length) {
		console.log("Only JPEG, PNG, and PDF files are allowed.");
	}
	// No need to await, the callback will update state
	validFiles.map(async (file, fileIdx) => {
		if (file.type !== "application/pdf") {
			const base64String = await file2Base64(file);
			const url = URL.createObjectURL(file);
			// @ts-ignore
			const image: TranscribableDocument = {
				url: url,
				filename: file.name,
				created: Date.now() + (fileIdx + 100),
				data: base64String,
				transcription: null,
			};
			addImage(store, image, onError);
		} else {
			const transcribableImages = await parsePdfFile(file);
			for (const transcribableDoc of transcribableImages) {
				addImage(store, transcribableDoc, onError);
			}
			console.log(transcribableImages);
		}
	});
}

const file2Base64 = (file: File): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result?.toString() || "");
		reader.onerror = (error) => reject(error);
	});
};
