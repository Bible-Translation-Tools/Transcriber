import React from 'react';

const TranscriptionTips: React.FC = () => {
	return (
		<div className="flex-2 bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
			<div className="flex items-center mb-12">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 mr-2 text-blue-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.364 6.364l-.707-.707m12.728 0l-.707.707M6.364 17.636l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
				<h2 className="text-4xl font-bold text-gray-800">Tips</h2>
			</div>

			<div className="mb-12">
				<h3 className="text-2xl font-bold text-gray-700 mb-1">Paper Style and Layout</h3>
				<p className="text-2xl text-gray-600 mb-1">
					Use lined paper using a verse-by-verse format, written on one side only.
				</p>
				<p className="text-2xl text-gray-600">
					Ensure text is straight, with consistent margins on all sides.
				</p>
			</div>

			<div className="mb-12">
				<h3 className="text-2xl font-bold text-gray-700 mb-1">Edits</h3>
				<p className="text-2xl text-gray-600">
					Avoid crossing out mistakes. You can fix these once the document is done being transcribed.
				</p>
			</div>

			<div className="mb-12">
				<h3 className="text-2xl font-bold text-gray-700 mb-1">Text Style</h3>
				<p className="text-2xl text-gray-600 mb-1">
					Write in block letters with even spacing between letters and words.
				</p>
				<p className="text-2xl text-gray-600">
					Do not use superscripts or subscripts.
				</p>
			</div>

			<div>
				<h3 className="text-2xl font-bold text-gray-700 mb-1">Verify Your Results</h3>
				<p className="text-2xl text-gray-600">
					Always check your results for missing content or incorrect words.
				</p>
			</div>
		</div>
	);
};

export default TranscriptionTips;