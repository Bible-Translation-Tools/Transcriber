import React, { useState } from 'react';

interface ImagePreviewProps {
  image: string;
  index: number;
  startIndex: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, index, startIndex }) => (
  <img
    style={{width: 64, height: 64, opacity: 0.80, background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)', borderRadius: 8}}
    src={image}
    alt={`Image ${startIndex + index + 1}`}
    // className="w-full max-h-48 object-cover cursor-pointer"
  />
);

export default ImagePreview