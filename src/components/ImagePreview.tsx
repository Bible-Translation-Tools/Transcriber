import React, { useState } from 'react';

interface ImagePreviewProps {
    image: any;
    index: number;
    onImageSelected: (imageNumber: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, index, onImageSelected }) => {

    const handleImageSelected = () => {
        onImageSelected(index)
    };

    return (
        <button onClick={handleImageSelected}>
            <img
                style={{ width: 64, height: 64, opacity: 0.80, background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)', borderRadius: 8 }}
                src={image.data}
                // alt={`Image ${startIndex + index + 1}`}
            />
        </button>
    );
};

export default ImagePreview