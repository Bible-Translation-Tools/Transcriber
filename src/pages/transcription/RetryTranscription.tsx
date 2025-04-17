import type React from 'react';
import {useCallback} from 'react';
import {debounce} from 'lodash'; // Or your preferred debounce implementation

interface Props {
    onRetryTranscription: () => void;
    debounceDelay?: number;
};

const RetryTranscription: React.FC<Props> = ({onRetryTranscription, debounceDelay = 1000}) => {

    const debouncedRetry = useCallback(
        debounce(() => {
            onRetryTranscription();
        }, debounceDelay),
        [onRetryTranscription, debounceDelay]
    );

    const isTranscribing = false; // Replace with your actual state

    return (
        <div>
            {isTranscribing ? (
                <TranscriptionStatus onRetryTranscription={debouncedRetry}/>
            ) : (
                <div className="mt-4 text-sm text-gray-500">
                    <button
                        type={"button"}
                        onClick={debouncedRetry}
                        className="ml-1 pr-1 text-blue-500 hover:underline focus:outline"
                    >
                        Retry
                    </button>
                    your transcription if there is a problem.
                </div>
            )}
        </div>
    );
};

const TranscriptionStatus: React.FC<Props> = () => {
    return (
        <div className="mt-4 p-4 bg-gray-100 rounded-md shadow-sm">
            <p className="text-sm font-semibold text-gray-700">This Image is Being Processed.</p>
            <p className="text-xs text-gray-500 mt-1">
                Please be patient as this may take several minutes, depending on internet connection.
            </p>
        </div>
    );
};

export default RetryTranscription;