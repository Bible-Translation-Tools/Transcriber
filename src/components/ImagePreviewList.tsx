import ImagePreview from "./ImagePreview";

interface ImagePreviewListProps {
    images: any[];
    currentImage: number;
    onImageSelected: (imageNumber: number) => void;
    isVerticalLayout?: boolean; // New prop to control layout
}

const ImagePreviewList: React.FC<ImagePreviewListProps> = ({ images, onImageSelected, isVerticalLayout = true }) => {
    return (
        <div className={`flex ${isVerticalLayout ? 'flex-col overflow-y-auto' : 'flex-row overflow-x-auto w-full img-thumbnail--horizontal' } gap-2`}>
            {images.map((image, index) => (
                <ImagePreview key={index} image={image} index={index} onImageSelected={onImageSelected} />
            ))}
        </div>
    );
};

export default ImagePreviewList