import React, { createContext, useState, useEffect, useRef } from 'react';
import getTranscription from '../domain/getTranscription';

export interface ImageData {
    url: string; // Key for IndexedDB
    data: any;
    transcription: string | undefined | null; // Optional transcription
    languageCode: string,
    bookCode: string,
    chapter: number,
    loading?: boolean
}

interface ImageContextType {
    languageCode: string,
    setLanguageCode: (code: string) => void,
    bookCode: string,
    setBookCode: (code: string) => void,
    chapter: number,
    setChapter: (chapter: number) => void,
    images: ImageData[];
    selectedImage: ImageData | null;
    setImages: (images: ImageData[]) => void;
    setSelectedImage: (image: ImageData | null) => void;
    addImage: (image: ImageData) => void;
    updateImage: (updatedImage: ImageData) => void; // For updating transcription
    updateTranscription: (updatedImage: ImageData) => void; // For updating transcription
    resubmitImageForTranscription: (imageToUpdate: ImageData) => void;
}

export const ImageContext = createContext<ImageContextType>({
    languageCode: "en",
    setLanguageCode: () => { },
    bookCode: "gen",
    setBookCode: () => { },
    chapter: 1,
    setChapter: () => { },
    images: [],
    selectedImage: null,
    setImages: () => { },
    setSelectedImage: () => { },
    addImage: () => { },
    updateImage: () => { },
    updateTranscription: () => { },
    resubmitImageForTranscription: () => { },
});

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [languageCode, updateLanguageCode] = useState("en")
    const [bookCode, updateBookCode] = useState("gen")
    const [chapter, updateChapter] = useState(1)
    const [images, setImages] = useState<ImageData[]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const dbRef = useRef<IDBDatabase | null>(null);

    useEffect(() => {
        const request = indexedDB.open('imageDB', 2); // Increment version if schema changes

        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (event.oldVersion < 2) { // Only create the object store if it doesn't exist
                db.createObjectStore('images', { keyPath: 'url' });
            }
        };

        request.onsuccess = (event) => {
            dbRef.current = (event.target as IDBOpenDBRequest).result;
            loadImagesFromDB();
        };
    }, []);

    const loadImagesFromDB = (
        languageToLoad = languageCode,
        bookToLoad = bookCode,
        chapterToLoad = chapter
    ) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction('images', 'readonly');
            const objectStore = transaction.objectStore('images');
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                const storedImages = (event.target as IDBRequest).result;
                const kickOffTranscriptions = storedImages
                    .filter((image: ImageData) => {
                        if (image.languageCode !== languageToLoad) return false;
                        if (image.bookCode !== bookToLoad) return false;
                        if (image.chapter !== chapterToLoad) return false;
                        return true;
                     })
                    .map(
                        (image: ImageData) => {
                            if (image.transcription != null) {
                                image.loading = false;
                            } else {

                            }
                            return image
                        }
                    )

                setImages(kickOffTranscriptions || []);
                if (kickOffTranscriptions.length > 0) {
                    setSelectedImage(kickOffTranscriptions[0])
                } else {
                    setSelectedImage(null)
                }
            };

            request.onerror = (event) => {
                console.error("Error loading images from IndexedDB:", event);
            };
        }
    };

    const addImage = (image: ImageData) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction('images', 'readwrite');
            const objectStore = transaction.objectStore('images');

            const imageWithCurrentMetadata = {...image, languageCode: languageCode, bookCode: bookCode, chapter: chapter}

            const request = objectStore.put(imageWithCurrentMetadata);

            request.onerror = (event) => {
                console.error("Error saving image to IndexedDB:", event);
            };

            request.onsuccess = () => {
                setImages((prevImages) => [...prevImages, imageWithCurrentMetadata]);

                (async () => {
                    const transcription = await getTranscription(imageWithCurrentMetadata.data)
                    if (transcription.success == true) {
                        imageWithCurrentMetadata.transcription = transcription.transcription
                        updateImage(imageWithCurrentMetadata)
                    }
                })();
            };
        }
    };

    const updateImage = (updatedImage: ImageData, reloadOnSuccess = true) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction('images', 'readwrite');
            const objectStore = transaction.objectStore('images');

            const request = objectStore.put(updatedImage);

            request.onerror = (event) => {
                console.error("Error updating image in IndexedDB:", event);
            };

            request.onsuccess = () => {
                for (var i = 0; i < images.length; i++) {
                    if (images[i].url === updatedImage.url) {
                        images[i].transcription = updatedImage.transcription
                    }
                }

                if (reloadOnSuccess) {
                    setImages((prevImages) =>
                        prevImages.map((image) =>
                            image.url === updatedImage.url ? updatedImage : image
                        )
                    );
                    if (selectedImage && selectedImage.url === updatedImage.url) {
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
            const transcription = await getTranscription(imageToUpdate.data)
            if (transcription.success == true) {
                imageToUpdate.transcription = transcription.transcription
                updateImage(imageToUpdate, true)
            }
        })();
    }

    const setLanguageCode = (languageCode: string) => {
        updateLanguageCode(languageCode)
        loadImagesFromDB(languageCode)
    }

    const setBookCode = (bookCode: string) => {
        updateBookCode(bookCode)
        //loadImagesFromDB(languageCode)
    }

    const setChapter = (chapter: number) => {
        updateChapter(chapter)
        loadImagesFromDB(languageCode, bookCode, chapter)
    }

    return (
        <ImageContext.Provider value={{
            languageCode,
            setLanguageCode,
            bookCode,
            setBookCode,
            chapter,
            setChapter,
            images,
            selectedImage,
            setImages,
            setSelectedImage,
            addImage,
            updateImage,
            updateTranscription,
            resubmitImageForTranscription
        }}>
            {children}
        </ImageContext.Provider>
    );
};