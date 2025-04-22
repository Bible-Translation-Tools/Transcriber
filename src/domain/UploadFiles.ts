// @ts-ignore
import {pdf2image} from "@pardnchiu/pdf2image";
import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";
import type {TranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import type {TranscriptionErrorCode} from "@api/ai/TranscriptionResponse.ts";

export default function uploadFiles(
    store: TranscriptionStore,
    files: File[],
    addImage: (
        store: TranscriptionStore,
        image: TranscribableDocument,
        onError: (err: TranscriptionErrorCode, errorMessage: string) => void,
    ) => void,
    onError: (err: TranscriptionErrorCode, errorMessage: string) => void,
){
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

    validFiles.forEach((file, index) => {
        if (file.type !== "application/pdf") {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result;
                const url = URL.createObjectURL(file);
                // @ts-ignore
                const image: TranscribableDocument = {
                    url: url,
                    filename: file.name,
                    created: Date.now() + (index + 100),
                    data: base64String,
                    transcription: null,
                }; // Type the image object

                addImage(store, image, onError);
            };

            reader.readAsDataURL(file);
        } else {
            const reader = new FileReader();

            (async () => {
                reader.onload = async (e) => {
                    const _this = e.target;
                    if (_this?.result != null) {
                        const converter = new pdf2image({
                            filename: `${file.name} yyyy-MM-DD`,
                            file: _this.result,
                            scale: 4,
                            type: "jpeg",
                        });

                        await converter.convert();

                        const createdTime = Date.now();
                        
                        converter.images.forEach((imageData: any, index: number) => {
                            const url = URL.createObjectURL(file);
                            const pageNumber = index + 1;
                            const parts = file.name.split('.');
                            const baseName = parts.slice(0, -1).join('.');
                            const extension = parts.length > 1 ? `.${parts.pop()}` : '';

                            // @ts-ignore
                            const image: TranscribableDocument = {
                                url:url,
                                filename: `${baseName}-${pageNumber}${extension}`,
                                created: createdTime +  (index + 100), // pad out a little for the number of pages so they sort correctly
                                data: imageData,
                                transcription: null,
                            }; // Type the image object
                            addImage(store, image, onError);
                        });
                    }
                };
            })();

            reader.readAsArrayBuffer(file);
        }
    });
}