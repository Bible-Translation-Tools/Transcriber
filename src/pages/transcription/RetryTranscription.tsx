import {debounce} from "lodash"; // Or your preferred debounce implementation
import type React from "react";
import {useCallback} from "react";
import {useTranslation} from "react-i18next";

interface Props {
	onRetryTranscription: () => void;
	debounceDelay?: number;
}

const RetryTranscription: React.FC<Props> = ({
	onRetryTranscription,
	debounceDelay = 1000,
}) => {
	const { t } = useTranslation();
	const debouncedRetry = useCallback(
		debounce(() => {
			onRetryTranscription();
		}, debounceDelay),
		//   ℹ Outer scope values, ie debounceDelay and onRetryTranscription aren't valid dependencies because mutating them doesn't re-render the component.
		[onRetryTranscription, debounceDelay],
	);

	const isTranscribing = false; // Replace with your actual state

	return (
		<div>
			{isTranscribing ? (
				<TranscriptionStatus onRetryTranscription={debouncedRetry} />
			) : (
				<div className="mt-4 text-sm text-gray-500">
					<button
						type={"button"}
						onClick={debouncedRetry}
						className="ml-1 pr-1 text-blue-500 hover:underline focus:outline"
					>
						{t("Retry transcription part 1")}
					</button>
					{t("Retry transcription part 2")}
				</div>
			)}
		</div>
	);
};

const TranscriptionStatus: React.FC<Props> = () => {
	const { t } = useTranslation();

	return (
		<div className="mt-4 p-4 bg-gray-100 rounded-md shadow-sm">
			<p className="text-sm font-semibold text-gray-700">
				{t("This Image is Being Processed.")}
			</p>
			<p className="text-xs text-gray-500 mt-1">
				{t("Please Be Patient message")}
			</p>
		</div>
	);
};

export default RetryTranscription;
