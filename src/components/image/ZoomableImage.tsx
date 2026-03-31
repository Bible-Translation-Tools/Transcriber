import type React from "react";
import ZoomIn from "@mui/icons-material/ZoomIn";
import ZoomOut from "@mui/icons-material/ZoomOut";
import { useRef } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import {
	getCenterPosition,
	TransformComponent,
	TransformWrapper,
	useControls,
} from "react-zoom-pan-pinch";

/** Horizontal center (library math), vertical pinned to top: positionY = 0. */
function applyTopCenterTransform(ref: ReactZoomPanPinchRef | null) {
	if (!ref) return;
	const inst = ref.instance;
	const wrapper = inst.wrapperComponent;
	const content = inst.contentComponent;
	if (!wrapper || !content) return;
	const scale = inst.transformState.scale;
	const { positionX } = getCenterPosition(scale, wrapper, content);
	ref.setTransform(positionX, 0, scale, 0);
}

const Controls = () => {
	const { zoomIn, zoomOut } = useControls();

	return (
		<div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 ">
			<button
				type="button"
				className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#0F2F4C] shadow-sm transition-transform transition-shadow hover:scale-105 hover:bg-gray-50 hover:shadow-md"
				onClick={() => zoomIn()}
				aria-label="Zoom in"
			>
				<ZoomIn fontSize="medium" />
			</button>
			<button
				type="button"
				className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#0F2F4C] shadow-sm transition-transform transition-shadow hover:scale-105 hover:bg-gray-50 hover:shadow-md"
				onClick={() => zoomOut()}
				aria-label="Zoom out"
			>
				<ZoomOut fontSize="medium" />
			</button>
		</div>
	);
};

interface ZoomableImageProps {
	src: string;
	isVerticalLayout: boolean;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
	src,
	isVerticalLayout,
}) => {
	const transformRef = useRef<ReactZoomPanPinchRef>(null);

	return (
		<TransformWrapper
			ref={transformRef}
			key={`${src}-${isVerticalLayout ? "vertical" : "horizontal"}`}
			initialScale={isVerticalLayout ? 2.5 : 1.25}
			initialPositionX={0}
			initialPositionY={0}
			centerOnInit={false}
			smooth={true}
			wheel={{
				step: 0.5,
				smoothStep: isVerticalLayout ? 0.004 : 0.002, // lower scroll-zoom speed when photo is vertical
			}}
			onInit={(ctx) => applyTopCenterTransform(ctx)}
		>
			{() => (
				<div className="relative h-full w-full p-2">
					<Controls />
					<div className="cursor-move h-full w-full pb-[50px]">
						<TransformComponent
							wrapperClass="w-full h-full overflow-hidden"
							contentClass="w-full h-full flex items-center justify-center"
							wrapperStyle={{ width: "100%", height: "100%" }}
							contentStyle={{ width: "100%", height: "100%" }}
						>
							<img
								className="w-full h-full object-contain block"
								src={src}
								alt="test"
								onLoad={() => applyTopCenterTransform(transformRef.current)}
							/>
						</TransformComponent>
					</div>
				</div>
			)}
		</TransformWrapper>
	);
};

export default ZoomableImage;
