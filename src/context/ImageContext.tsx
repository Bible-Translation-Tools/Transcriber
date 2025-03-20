import { DetaultTranscriptionPrompt, TranscriptionModel, TranscriptionRequest } from "@api/domain/TranscriptionRequest";
import { LanguageOption } from "@src/components/LanguageDropdown";
import getTranscription from "@src/domain/getTranscription";
import type React from "react";
import { createContext, useEffect, useRef, useState } from "react";

export interface ImageData {
    id: string;
    url: string; // Key for IndexedDB
    data: any;
    transcription: string | undefined | null; // Optional transcription
    languageCode: string;
    bookCode: string;
    chapter: number;
    loading?: boolean;
}

interface ImageContextType {
    language: LanguageOption | null;
    setLanguage: (option: LanguageOption) => void;
    recentLanguages: string[];
    bookCode: string;
    setBookCode: (code: string) => void;
    chapter: number;
    setChapter: (chapter: number) => void;
    images: ImageData[];
    selectedImage: ImageData | null;
    systemPrompt: string;
    setSystemPrompt: (prompt: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    setImages: (images: ImageData[]) => void;
    setSelectedImage: (image: ImageData | null) => void;
    addImage: (image: ImageData) => void;
    updateImage: (updatedImage: ImageData) => void; // For updating transcription
    updateTranscription: (updatedImage: ImageData) => void; // For updating transcription
    resubmitImageForTranscription: (imageToUpdate: ImageData) => void;
}

export const ImageContext = createContext<ImageContextType>({
    language: null,
    setLanguage: () => { },
    recentLanguages: [],
    bookCode: "gen",
    setBookCode: () => { },
    chapter: 1,
    setChapter: () => { },
    images: [],
    selectedImage: null,
    systemPrompt: localStorage.getItem('systemPrompt') || DetaultTranscriptionPrompt.SYSTEM,
    setSystemPrompt: () => { },
    prompt: localStorage.getItem('prompt') || DetaultTranscriptionPrompt.PROMPT,
    setPrompt: () => { },
    setImages: () => { },
    setSelectedImage: () => { },
    addImage: () => { },
    updateImage: () => { },
    updateTranscription: () => { },
    resubmitImageForTranscription: () => { },
});

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {

    const storedSelectedLanguage = localStorage.getItem('selectedLanguage')
    let restoredLanguage = null
    if (storedSelectedLanguage != null) {
        try {
        restoredLanguage = JSON.parse(storedSelectedLanguage)
        } catch {}
    }

    const [language, updateLanguage] = useState<LanguageOption | null>(restoredLanguage);
    const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
    const [bookCode, updateBookCode] = useState("gen");
    const [chapter, updateChapter] = useState(1);
    const [images, setImages] = useState<ImageData[]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [systemPrompt, updateSystemPrompt] = useState<string>(localStorage.getItem('systemPrompt') || DetaultTranscriptionPrompt.SYSTEM)
    const [prompt, updatePrompt] = useState<string>(localStorage.getItem('prompt') || DetaultTranscriptionPrompt.PROMPT)
    const dbRef = useRef<IDBDatabase | null>(null);

    useEffect(() => {
        const request = indexedDB.open("imageDB", 2); // Increment version if schema changes

        request.onerror = (event) => {
            console.error("Error opening IndexedDB:", event);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (event.oldVersion < 2) {
                // Only create the object store if it doesn't exist
                db.createObjectStore("images", { keyPath: "url" });
            }
        };

        request.onsuccess = (event) => {
            dbRef.current = (event.target as IDBOpenDBRequest).result;
            loadImagesFromDB();
        };
    }, []);

    const loadImagesFromDB = (
        languageToLoad = language.code,
        bookToLoad = bookCode,
        chapterToLoad = chapter,
    ) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction("images", "readonly");
            const objectStore = transaction.objectStore("images");
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                const storedImages = (event.target as IDBRequest).result;

                const recentLangs = [
                    ...new Set<string>(
                        storedImages.map(
                            (image: ImageData) => image.languageCode,
                        ),
                    ),
                ];
                setRecentLanguages(recentLangs);

                const kickOffTranscriptions = storedImages
                    .filter((image: ImageData) => {
                        if (image.languageCode !== languageToLoad) return false;
                        if (image.bookCode !== bookToLoad) return false;
                        if (image.chapter !== chapterToLoad) return false;
                        return true;
                    })
                    .map((image: ImageData) => {
                        if (image.transcription != null) {
                            image.loading = false;
                        } else {
                        }
                        return image;
                    });

                setImages(kickOffTranscriptions || []);
                if (kickOffTranscriptions.length > 0) {
                    setSelectedImage(kickOffTranscriptions[0]);
                } else {
                    setSelectedImage(null);
                }
            };

            request.onerror = (event) => {
                console.error("Error loading images from IndexedDB:", event);
            };
        }
    };

    const addImage = (image: ImageData) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction(
                "images",
                "readwrite",
            );
            const objectStore = transaction.objectStore("images");

            const imageWithCurrentMetadata: ImageData = {
                ...image,
                id: self.crypto.randomUUID(),
                languageCode: language.code,
                bookCode: bookCode,
                chapter: chapter,
            };

            const request = objectStore.put(imageWithCurrentMetadata);

            request.onerror = (event) => {
                console.error("Error saving image to IndexedDB:", event);
            };

            request.onsuccess = () => {
                setImages((prevImages) => [
                    ...prevImages,
                    imageWithCurrentMetadata,
                ]);

                (async () => {
                    const transcription = await getTranscription(
                        {
                            image: imageWithCurrentMetadata.data,
                            imageId: imageWithCurrentMetadata.id,
                            bookCode: imageWithCurrentMetadata.bookCode,
                            languageCode: imageWithCurrentMetadata.languageCode,
                            chapter: imageWithCurrentMetadata.chapter,
                            model: TranscriptionModel.OPENAI,
                            systemPrompt: systemPrompt,
                            prompt: prompt
                        },
                    );
                    if (transcription.success) {
                        // imageWithCurrentMetadata.transcription =
                        //   transcription.transcription;
                        updateImage({
                            ...imageWithCurrentMetadata,
                            transcription: transcription.transcription,
                        });
                    }
                })();
            };
        }
    };

    const updateImage = (updatedImage: ImageData, reloadOnSuccess = true) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction(
                "images",
                "readwrite",
            );
            const objectStore = transaction.objectStore("images");

            const request = objectStore.put(updatedImage);

            request.onerror = (event) => {
                console.error("Error updating image in IndexedDB:", event);
            };

            request.onsuccess = () => {
                for (let i = 0; i < images.length; i++) {
                    if (images[i].url === updatedImage.url) {
                        images[i].transcription = updatedImage.transcription;
                    }
                }

                if (reloadOnSuccess) {
                    setImages((prevImages) =>
                        prevImages.map((image) =>
                            image.url === updatedImage.url
                                ? updatedImage
                                : image,
                        ),
                    );
                    if (
                        selectedImage &&
                        selectedImage.url === updatedImage.url
                    ) {
                        setSelectedImage(updatedImage);
                    }
                }
            };
        }
    };

    const updateTranscription = (imageToUpdate: ImageData) => {
        updateImage(imageToUpdate, false);
    };

    const resubmitImageForTranscription = (imageToUpdate: ImageData) => {
        updateImage({ ...imageToUpdate, transcription: null, loading: true });
        (async () => {
            const request: TranscriptionRequest = {
                model: TranscriptionModel.OPENAI,
                image: imageToUpdate.data,
                imageId: imageToUpdate.id,
                languageCode: imageToUpdate.languageCode,
                bookCode: imageToUpdate.bookCode,
                chapter: imageToUpdate.chapter,
                systemPrompt: systemPrompt,
                prompt: prompt
            }
            const transcription = await getTranscription(request);
            if (transcription.success) {
                imageToUpdate.transcription = transcription.transcription;
                updateImage(imageToUpdate, true);
            }
        })();
    };

    const setLanguage = (lang: LanguageOption) => {
        localStorage.setItem("selectedLanguage", JSON.stringify(lang))
        updateLanguage(lang);
        loadImagesFromDB(lang.code);
    };

    const setBookCode = (bookCode: string) => {
        updateBookCode(bookCode);
        //loadImagesFromDB(languageCode)
    };

    const setChapter = (chapter: number) => {
        updateChapter(chapter);
        loadImagesFromDB(language.code, bookCode, chapter);
    };

    const setPrompt = (prompt: string) => {
        localStorage.setItem('prompt', prompt);
        updatePrompt(prompt);
    }

    const setSystemPrompt = (prompt: string) => {
        localStorage.setItem('systemPrompt', prompt);
        updateSystemPrompt(prompt);
    }

    return (
        <ImageContext.Provider
            value={{
                language,
                setLanguage,
                recentLanguages,
                bookCode,
                setBookCode,
                chapter,
                setChapter,
                images,
                selectedImage,
                systemPrompt,
                setSystemPrompt,
                prompt,
                setPrompt,
                setImages,
                setSelectedImage,
                addImage,
                updateImage,
                updateTranscription,
                resubmitImageForTranscription,
            }}
        >
            {children}
        </ImageContext.Provider>
    );
};
