import React, { createContext, useState, useEffect, useRef } from 'react';
import getTranscription from '../domain/getTranscription';

export interface ImageData {
    url: string; // Key for IndexedDB
    data: any;
    transcription: string | undefined | null; // Optional transcription
    loading?: boolean
}

interface ImageContextType {
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

    const loadImagesFromDB = () => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction('images', 'readonly');
            const objectStore = transaction.objectStore('images');
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                const storedImages = (event.target as IDBRequest).result;
                const kickOffTranscriptions = storedImages.map(
                    (image: ImageData) => {
                        if (image.transcription != null) {
                            image.loading = false;
                        } else {

                        }
                        return image
                    }
                )
                setImages(kickOffTranscriptions || []);
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

            const request = objectStore.put(image);

            request.onerror = (event) => {
                console.error("Error saving image to IndexedDB:", event);
            };

            request.onsuccess = () => {
                setImages((prevImages) => [...prevImages, image]);

                (async () => {
                    const transcription = await getTranscription(image.data)
                    if (transcription.success == true) {
                        image.transcription = transcription.transcription
                        updateImage(image)
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
        updateImage({url: imageToUpdate.url, data: imageToUpdate.data, transcription: null, loading: true});
        (async () => {
            const transcription = await getTranscription(imageToUpdate.data)
            if (transcription.success == true) {
                imageToUpdate.transcription = transcription.transcription
                updateImage(imageToUpdate, true)
            }
        })();
    }

    return (
        <ImageContext.Provider value={{ images, selectedImage, setImages, setSelectedImage, addImage, updateImage, updateTranscription, resubmitImageForTranscription }}>
            {children}
        </ImageContext.Provider>
    );
};