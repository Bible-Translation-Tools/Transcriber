import ImagePreview from "./ImagePreview";

interface ImagePreviewListProps {
    images: string[];
    currentPage: number;
    imagesPerPage: number;
}

const ImagePreviewList: React.FC<ImagePreviewListProps> = ({ images, currentPage, imagesPerPage }) => {
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const displayedImages = images.slice(startIndex, endIndex);

    return (
        <div className="flex flex-col gap-2">
            {displayedImages.map((image, index) => (
                <ImagePreview key={index} image={image} index={index} startIndex={startIndex} />
            ))}
        </div>
    );
};

export default ImagePreviewList