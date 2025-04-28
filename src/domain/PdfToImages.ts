import type {TranscribableDocument} from "@src/data/TranscribableDocument";
import {TranscriptionStatus} from "@src/data/TranscriptionStatus.ts";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";

const worker = new pdfjsWorker();
pdfjsLib.GlobalWorkerOptions.workerPort = worker;

type PageInfo = {
	index: number;
};

export async function parsePdfFile(file: File) {
	const arrayBuffer = await file.arrayBuffer();
	const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
	// Initialize page info with dimensions (get first page to determine default size)
	const pages: PageInfo[] = Array.from(
		{ length: pdfDoc.numPages },
		(_, i) => ({
			index: i + 1,
		}),
	);
	const createdTime = Date.now();
	const transcribableDocuments = await Promise.all(
		pages.map(async (pageIdx) => {
			const page = await pdfDoc.getPage(pageIdx.index);
			const canvas = document.createElement("canvas");
			const viewport = page.getViewport({ scale: 1 });
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			const context = canvas.getContext("2d");
			if (!context) {
				throw new Error("Failed to get canvas context");
			}
			await page.render({ canvasContext: context, viewport }).promise;
			const base64String = canvas.toDataURL("image/jpeg");
			const parts = file.name.split(".");
			const baseName = parts.slice(0, -1).join(".");
			const extension = parts.length > 1 ? `.${parts.pop()}` : "";

			const image: Partial<TranscribableDocument> = {
				filename: `${baseName}-${pageIdx.index}${extension}`,
				created: createdTime + (pageIdx.index + 100), // pad out a little for the number of pages so they sort correctly
				data: base64String,
				transcription: null,
				status: TranscriptionStatus.IN_PROGRESS,
			};
			canvas.remove();
			return image;
		}),
	);
	return transcribableDocuments;
}
