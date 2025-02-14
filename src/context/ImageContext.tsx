import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

interface ImageContextType {
    images: any[];
    selectedImage: any | null;
    setImages: (images: any[]) => void;
    setSelectedImage: (image: any | null) => void;
    addImage: (image: any) => void; // Add a function to add images
}

export const ImageContext = createContext<ImageContextType>({
    images: [],
    selectedImage: null,
    setImages: () => { },
    setSelectedImage: () => { },
    addImage: () => { }, // Initialize the new function
});

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [images, setImages] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const dbRef = useRef<IDBDatabase | null>(null);

    useEffect(() => {
        const request = indexedDB.open('imageDB', 1);

        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('images', { keyPath: 'url' });
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
                setImages(storedImages || []);
            };

            request.onerror = (event) => {
                console.error("Error loading images from IndexedDB:", event);
            }
        }
    };

    const addImage = (image: any) => {
        if (dbRef.current) {
            const transaction = dbRef.current.transaction('images', 'readwrite');
            const objectStore = transaction.objectStore('images');

            const request = objectStore.put(image);

            request.onerror = (event) => {
                console.error("Error saving image to IndexedDB:", event);
            }

            request.onsuccess = () => {
                setImages((prevImages) => [...prevImages, image]);
            };
        }
    };

    return (
        <ImageContext.Provider value={{ images, selectedImage, setImages, setSelectedImage, addImage }}>
            {children}
        </ImageContext.Provider>
    );
};