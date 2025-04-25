import type { TranscribableDocument } from "@src/data/TranscribableDocument";
import ImagePreview from "./ImagePreview.tsx";

interface ImagePreviewListProps {
	images: TranscribableDocument[];
	currentImage: number;
	onImageSelected: (imageNumber: number) => void;
}

const ImagePreviewList: React.FC<ImagePreviewListProps> = ({
	images,
	onImageSelected,
}) => {
	return (
		<div className="flex flex-col gap-2 overflow-y-auto">
			{images.map((image, index) => (
				<ImagePreview
					key={image.id}
					image={image}
					index={index}
					onImageSelected={onImageSelected}
				/>
			))}
		</div>
	);
};

export default ImagePreviewList;
