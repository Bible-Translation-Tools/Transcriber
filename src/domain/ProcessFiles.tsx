// @ts-ignore
import {pdf2image} from "@pardnchiu/pdf2image";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";

export async function processFiles(files: File[]): Promise<Partial<TranscribableDocument>[]> {
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
            const img= await processImage(file, index);
            images.push(img);
        }
        const imgs = await processPdf(file);
        for (const img of imgs) {
            images.push(img);
        }
    }
    return images;
}

async function processImage(file: File, fileNumber: number): Promise<Partial<TranscribableDocument>> {
    const reader = new FileReader();

    const read = await new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsText(file);
    });

    const base64String = read;
    const url = URL.createObjectURL(file);

    const image: Partial<TranscribableDocument> = {
        url: url,
        filename: file.name,
        created: Date.now() + (fileNumber + 100),
        data: base64String,
    };

    return image;
}

async function processPdf(file: File): Promise<Partial<TranscribableDocument>[]> {
    const reader = new FileReader();

    const read = await new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    });


    const converter = new pdf2image({
        filename: `${file.name} yyyy-MM-DD`,
        file: read,
        scale: 4,
        type: "jpeg",
    });

    await converter.convert();

    const createdTime = Date.now();

    return converter.images.map((imageData: any, index: number) => {
        const url = URL.createObjectURL(file);
        const pageNumber = index + 1;
        const parts = file.name.split('.');
        const baseName = parts.slice(0, -1).join('.');
        const extension = parts.length > 1 ? `.${parts.pop()}` : '';

        // @ts-ignore
        const image: Partial<TranscribableDocument> = {
            url: url,
            filename: `${baseName}-${pageNumber}${extension}`,
            created: createdTime + (index + 100), // pad out a little for the number of pages so they sort correctly
            data: imageData
        };
        return image;
    });
}
