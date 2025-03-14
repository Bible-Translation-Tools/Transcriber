import React, { Component } from "react";

import {
    TransformWrapper,
    TransformComponent,
    useControls,
} from "react-zoom-pan-pinch";

const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
        <div className="tools tools absolute top-4 left-4 flex space-x-2 z-10">
            <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                onClick={() => zoomIn()}>
                    Zoom In +
            </button>
            <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                onClick={() => zoomOut()}>
                Zoom Out -
            </button>
            <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                onClick={() => resetTransform()}>
                Reset Zoom
            </button>
        </div>
    );
};

interface ZoomableImageProps {
    src: string
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src }) => {
    return (
        <TransformWrapper
            initialScale={1}
            initialPositionX={200}
            initialPositionY={100}
        >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                    <Controls />
                    <TransformComponent>
                        <img src={src} alt="test" />
                    </TransformComponent>
                </>
            )}
        </TransformWrapper>
    );
};

export default ZoomableImage;