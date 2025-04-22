import type React from "react";
import { useTranslation } from "react-i18next";

import {
	TransformComponent,
	TransformWrapper,
	useControls,
} from "react-zoom-pan-pinch";

const Controls = () => {
	const { t } = useTranslation();
	const { zoomIn, zoomOut, resetTransform } = useControls();

	return (
		<div className="hidden group-hover:block tools tools absolute top-4 left-4 flex space-x-2 z-1">
			<button
				type="button"
				className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
				onClick={() => zoomIn()}
			>
				{t('Zoom In +')}
			</button>
			<button
				type="button"
				className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
				onClick={() => zoomOut()}
			>
				{t('Zoom Out -')}
			</button>
			<button
				type="button"
				className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
				onClick={() => resetTransform()}
			>
				{t('Reset Zoom')}
			</button>
		</div>
	);
};

interface ZoomableImageProps {
	src: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src }) => {
	return (
		<TransformWrapper
			initialScale={1}
			initialPositionX={200}
			initialPositionY={100}
		>
			{() => (
				<>
					<Controls />
					<div className="cursor-move">
						<TransformComponent>
							<img src={src} alt="test" />
						</TransformComponent>
					</div>
				</>
			)}
		</TransformWrapper>
	);
};

export default ZoomableImage;
