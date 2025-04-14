import {pdf2image} from "@pardnchiu/pdf2image";
import {ImageData} from "@src/data/ImageData.tsx";
import {TranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";

export default function uploadFiles(
    store: TranscriptionStore,
    files: File[],
    addImage: (store: TranscriptionStore, image: ImageData) => void,
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

    validFiles.forEach((file) => {
        if (file.type !== "application/pdf") {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result;
                const url = URL.createObjectURL(file);
                const image: ImageData = {
                    url: url,
                    filename: file.name,
                    created: Date.now(),
                    data: base64String,
                    transcription: null,
                }; // Type the image object

                addImage(store, image);
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

                            const image: ImageData = {
                                url:url,
                                filename: `${baseName}-${pageNumber}${extension}`,
                                created: createdTime + index, // pad out a little for the number of pages so they sort correctly
                                data: imageData,
                                transcription: null,
                            }; // Type the image object
                            addImage(store, image);
                        });
                    }
                };
            })();

            reader.readAsArrayBuffer(file);
        }
    });
}