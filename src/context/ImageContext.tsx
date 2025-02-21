import React, { createContext, useState, useEffect, useRef } from 'react';
import { useModelContext } from './useModelContext';

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
}

export const ImageContext = createContext<ImageContextType>({
    images: [],
    selectedImage: null,
    setImages: () => { },
    setSelectedImage: () => { },
    addImage: () => { },
    updateImage: () => { },
});

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { model } = useModelContext();
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
                    if (model != null) {
                        const transcription = await model.transcribe(image.data)
                        if (transcription.success == true) {
                            image.transcription = transcription.transcription
                            updateImage(image)
                        }
                    }
                })();
            };
        }
    };

    const updateImage = (updatedImage: ImageData) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction('images', 'readwrite');
            const objectStore = transaction.objectStore('images');

            const request = objectStore.put(updatedImage);

            request.onerror = (event) => {
                console.error("Error updating image in IndexedDB:", event);
            };

            request.onsuccess = () => {
                setImages((prevImages) =>
                    prevImages.map((image) =>
                        image.url === updatedImage.url ? updatedImage : image
                    )
                );
                if (selectedImage && selectedImage.url === updatedImage.url) {
                    setSelectedImage(updatedImage);
                }
            };
        }
    };


    return (
        <ImageContext.Provider value={{ images, selectedImage, setImages, setSelectedImage, addImage, updateImage }}>
            {children}
        </ImageContext.Provider>
    );
};