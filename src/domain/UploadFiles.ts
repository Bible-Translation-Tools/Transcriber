// @ts-ignore.  no types
import { pdf2image } from "@pardnchiu/pdf2image";
import type { ProjectImageData } from "@src/data/ImageData.tsx";

export async function getFilesAsImages(files: File[]) {
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
	const promises: Array<Promise<PartialImageData[]>> = validFiles.flatMap(
		async (file) => {
			if (file.type !== "application/pdf") {
				const reader = new FileReader();
				return new Promise((resolve) => {
					reader.onloadend = () => {
						const base64String = reader.result;
						const url = URL.createObjectURL(file);
						const image: PartialImageData = {
							url: url,
							filename: file.name,
							created: Date.now(),
							data: base64String,
							transcription: null,
						};
						resolve([image]);
					};
					reader.readAsDataURL(file);
				});
			}
			// pdfs:
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = async (e) => {
					const buffer = e.target?.result;
					if (!buffer) return;

					const converter = new pdf2image({
						filename: `${file.name} yyyy-MM-DD`,
						file: buffer,
						scale: 4,
						type: "jpeg",
					});
					await converter.convert();

					const createdTime = Date.now();
					const parts = file.name.split(".");
					const baseName = parts.slice(0, -1).join(".");
					const extension = parts.length > 1 ? `.${parts.pop()}` : "";

					const images: ProjectImageData[] = converter.images.map(
						(imageData: string, index: number) => ({
							url: URL.createObjectURL(file),
							filename: `${baseName}-${index + 1}${extension}`,
							created: createdTime + index,
							data: imageData,
							transcription: null,
						}),
					);

					resolve(images);
				};
				reader.readAsArrayBuffer(file);
			});
		},
	);
	const imgs = (await Promise.all(promises)).flat();
	return imgs;
}

type PartialImageData = Omit<
	ProjectImageData,
	"id" | "languageCode" | "bookCode" | "chapter"
>;
