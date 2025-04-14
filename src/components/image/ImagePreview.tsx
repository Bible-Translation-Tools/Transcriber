import type React from "react";

interface ImagePreviewProps {
	image: any;
	index: number;
	onImageSelected: (imageNumber: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
	image,
	index,
	onImageSelected,
}) => {
	const handleImageSelected = () => {
		onImageSelected(index);
	};

	return (
		<div className="relative">
			{" "}
			{/* Relative wrapper for positioning */}
			<button
				onClick={handleImageSelected}
				type="button"
				className="relative"
			>
				{" "}
				{/* Added relative here too */}
				<img
					className="w-16 h-16 opacity-80 rounded-lg"
					style={{
						background:
							"linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)",
					}}
					src={image.data}
					alt={`Transcription ${index + 1}`}
				/>
			</button>
			{/* Conditionally render the progress spinner */}
			{image.transcription == null && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-800 opacity-60 rounded-lg">
					{" "}
					{/* Overlay with rounded corners */}
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500" />
				</div>
			)}
		</div>
	);
};

export default ImagePreview;
