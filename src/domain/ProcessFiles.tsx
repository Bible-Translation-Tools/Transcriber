import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {TranscriptionStatus} from "@src/data/TranscriptionStatus";
import {parsePdfFile} from "@src/domain/PdfToImages.ts";

export async function processFiles(
	files: File[],
): Promise<Partial<TranscribableDocument>[]> {
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
	const images: Partial<TranscribableDocument>[] = [];
	for (const file of validFiles) {
		const index = validFiles.indexOf(file);
		if (file.type !== "application/pdf") {
			const img = await processImage(file, index);
			images.push(img);
		} else {
			const transcribableImages = await parsePdfFile(file);
			transcribableImages.forEach((i) => images.push(i));
		}
	}
	return images;
	// No need to await, the callback will update state
}

const file2Base64 = (file: File): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result?.toString() || "");
		reader.onerror = (error) => reject(error);
	});
};

async function processImage(
	file: File,
	fileNumber: number,
): Promise<Partial<TranscribableDocument>> {
	const base64String = await file2Base64(file);

	const image: Partial<TranscribableDocument> = {
		filename: file.name,
		created: Date.now() + (fileNumber + 100),
		data: base64String,
		status: TranscriptionStatus.IN_PROGRESS,
	};

	return image;
}
