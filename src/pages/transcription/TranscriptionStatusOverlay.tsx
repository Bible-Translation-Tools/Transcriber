import type React from "react";

interface Props {
	mainMessage: string;
	subMessage: string;
}

const TranscriptionStatusOverlay: React.FC<Props> = ({
	mainMessage,
	subMessage,
}) => {
	return (
		<div className="h-full inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-md">
			<p className="text-center text-gray-700 text-xl font-medium p-4">
				{mainMessage}
			</p>
			<p className="text-md text-gray-700">{subMessage}</p>
		</div>
	);
};

export default TranscriptionStatusOverlay;
