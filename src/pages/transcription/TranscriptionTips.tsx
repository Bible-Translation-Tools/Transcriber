import type React from "react";
import { useTranslation } from "react-i18next";

const TranscriptionTips: React.FC = () => {
	const { t } = useTranslation();

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
				<h3 className="text-2xl font-bold text-gray-700 mb-1">
					{t("Paper Style and Layout")}
				</h3>
				<p className="text-2xl text-gray-600 mb-1">
					{t("Use Lined Paper message")}
				</p>
				<p className="text-2xl text-gray-600">
					{t("Ensure Text Is Staight message")}
				</p>
			</div>

			<div className="mb-12">
				<h3 className="text-2xl font-bold text-gray-700 mb-1">
					{t("Edits")}
				</h3>
				<p className="text-2xl text-gray-600">
					{t("Avoid Crossing Out message")}
				</p>
			</div>

			<div className="mb-12">
				<h3 className="text-2xl font-bold text-gray-700 mb-1">
					{t("Text Style")}
				</h3>
				<p className="text-2xl text-gray-600 mb-1">
					{t("Write In Block message")}
				</p>
				<p className="text-2xl text-gray-600">
					{t("Do not use superscripts or subscripts.")}
				</p>
			</div>

			<div>
				<h3 className="text-2xl font-bold text-gray-700 mb-1">
					{t("Verify Your Results")}
				</h3>
				<p className="text-2xl text-gray-600">
					{t("Always Check message")}
				</p>
			</div>
		</div>
	);
};

export default TranscriptionTips;
