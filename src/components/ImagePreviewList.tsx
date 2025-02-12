import ImagePreview from "./ImagePreview";

interface ImagePreviewListProps {
    images: any[];
    currentImage: number;
    onImageSelected: (imageNumber: number) => void;
}

const ImagePreviewList: React.FC<ImagePreviewListProps> = ({ images, onImageSelected }) => {
    return (
        <div className="flex flex-col gap-2 overflow-y-auto">
            {images.map((image, index) => (
                <ImagePreview key={index} image={image} index={index} onImageSelected={onImageSelected} />
            ))}
        </div>
    );
};

export default ImagePreviewList