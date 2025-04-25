import { useTranslation } from "react-i18next";
import {
	DetaultTranscriptionPrompt,
	TranscriptionModel,
} from "@api/domain/TranscriptionRequest.ts";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranscriptionStore } from "@src/persistence/store/TranscriptionStore.ts";
import { toast, type ToastContentProps } from "react-toastify";
import { useRetranscribe } from "@src/hooks/useRetranscribe.ts";
import { LOGOUT_PATH } from "@api/auth/router";
import { TRANSCRIBE_ROUTE } from "@src/constants";

const Settings: React.FC = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const store = useTranscriptionStore();
	const {
		systemPrompt,
		setSystemPrompt,
		prompt,
		setPrompt,
		model,
		setModel,
	} = store;
	const retranscribe = useRetranscribe();

	const [language, setLanguage] = useState(i18n.language || "en"); // Default to 'en' if no language is set
	const [theme, setTheme] = useState("light");
	const [updatedModel, setUpdatedModel] = useState<TranscriptionModel>(
		model as TranscriptionModel,
	);
	const [updatedPrompt, setUpdatedPrompt] = useState(prompt);
	const [updatedSystemPrompt, setUpdatedSystemPrompt] =
		useState(systemPrompt);

	const handleLanguageChange = (lang: string) => {
		setLanguage(lang);
		i18n.changeLanguage(lang); // 👈 updates i18n language
	};

	const handleThemeChange = (selectedTheme: "light" | "dark") => {
		setTheme(selectedTheme);
	};

	const onClose = () => {
		navigate(TRANSCRIBE_ROUTE);
	};

	const handleSave = () => {
		setPrompt(updatedPrompt);
		setSystemPrompt(updatedSystemPrompt);
		setModel(updatedModel);
		toast(SettingsNotificationToast, {
			className: "w-[800px]",
			position: "bottom-center",
			autoClose: 50000,
			hideProgressBar: true,
		});
		onClose();
	};

	const resetPrompt = () => {
		setUpdatedPrompt(DetaultTranscriptionPrompt.PROMPT);
	};

	const resetSystemPrompt = () => {
		setUpdatedSystemPrompt(DetaultTranscriptionPrompt.SYSTEM);
	};

	const SettingsNotificationToast = ({ closeToast }: ToastContentProps) => {
		const transcribeAgain = () => {
			closeToast();
			const selectedImage = store.selectedImage;
			if (selectedImage != null) {
				retranscribe(selectedImage);
			}
		};

		return (
			<div className="flex flex-col w-full">
				<div className="text-sm text-blue-900">
					{t("Your transcription settings have changed.")}
					<button
						type={"button"}
						className="ml-2 text-blue-600 font-medium hover:underline hover:cursor"
						onClick={transcribeAgain}
					>
						{t("Transcribe Again")}
					</button>
				</div>
			</div>
		);
	};

	return (
		<div className="h-screen flex flex-col bg-gray-100 mx-auto">
			<div className="flex justify-between items-center px-8 pt-8">
				<h1 className="text-4xl font-semibold">{t("Settings")}</h1>
				<div className="space-x-4">
					<button
						type="button"
						className="text-xl bg-transparent hover:bg-gray-200 py-2 px-4 rounded"
						onClick={onClose}
					>
						{t("Cancel")}
					</button>
					<button
						type="button"
						className="text-xl bg-white hover:bg-gray-200 py-2 px-4 rounded"
						onClick={handleSave}
					>
						{t("Save and Close")}
					</button>
				</div>
			</div>
			<div className="overflow-y-scroll">
				<div className="p-8">
					<section className="py-4 border-t border-gray-300 grid grid-cols-2">
						<div>
							<h2 className="text-2xl font-semibold mb-2">
								{t("App Language")}
							</h2>
							<p className="text-xl text-gray-600">
								{t("Change Language message")}
							</p>
						</div>
						<div className="flex justify-end">
							<div className="flex flex-col h-full w-full justify-center items-start">
								<select
									value={language}
									onChange={(e) =>
										handleLanguageChange(e.target.value)
									}
									className="border rounded p-2 w-full max-w-sm"
								>
									<option value="en">English</option>
									<option value="es">Español</option>
									<option value="fr">Français</option>
									<option value="de">Deutsch</option>
									<option value="pt">Português</option>
									<option value="vi">Tiếng Việt</option>
									{/* Add more language options here */}
								</select>
							</div>
						</div>
					</section>

					<section className="py-4 border-t border-gray-300 grid grid-cols-2">
						<div>
							<h2 className="text-2xl font-semibold mb-2">
								{t("Interface Theme")}
							</h2>
							<p className="text-xl text-gray-600">
								{t("Select how the app is displayed for you.")}
							</p>
						</div>
						<div className="flex justify-start">
							<div className="flex space-x-4">
								<button
									type="button"
									className={`flex flex-col items-start space-x-2 p-2 rounded ${theme === "dark" ? "border-blue-500" : "border-gray-300"}`}
									onClick={() => handleThemeChange("dark")}
								>
									<div className="w-32 h-24 rounded-md bg-gradient-to-r from-gray-800 to-gray-900 shadow-inner relative">
										<div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500" />
										<div className="absolute top-1 left-4 w-2 h-2 rounded-full bg-yellow-400" />
										<div className="absolute top-1 left-7 w-2 h-2 rounded-full bg-green-500" />
										<div className="absolute top-4 left-2 w-8 h-3 rounded bg-blue-500" />
										<div className="absolute top-3 right-1 w-5 h-3 rounded bg-gray-700" />
									</div>
									<span>{t("Dark")}</span>
								</button>
								<button
									type="button"
									className={`flex flex-col items-center space-x-2 p-2 rounded ${theme === "light" ? "border-blue-500" : "border-gray-300"}`}
									onClick={() => handleThemeChange("light")}
								>
									<div className="w-32 h-24 rounded-md bg-white shadow-inner border border-gray-300 relative">
										<div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500" />
										<div className="absolute top-1 left-4 w-2 h-2 rounded-full bg-yellow-400" />
										<div className="absolute top-1 left-7 w-2 h-2 rounded-full bg-green-500" />
										<div className="absolute top-4 left-2 w-8 h-3 rounded bg-blue-500" />
										<div className="absolute top-3 right-1 w-5 h-3 rounded bg-gray-200" />
									</div>
									<span>{t("Light")}</span>
								</button>
							</div>
						</div>
					</section>

					<section className="py-4 border-t border-gray-300 grid grid-cols-2">
						<div>
							<h2 className="text-2xl font-semibold mb-2">
								{t("Transcription Settings")}
							</h2>
							<p className="text-xl text-gray-600">
								{t(
									"Modify how your transcriptions are processed.",
								)}
							</p>
						</div>
						<div className="flex flex-col justify-between content-between">
							<div className="flex flex-col">
								<label
									htmlFor="modelSelect"
									className="block text-lg font-light text-gray-700"
								>
									{t("Model")}
								</label>
								<div className="flex justify-start">
									<select
										id="modelSelect"
										value={updatedModel}
										onChange={(e) => {
											setUpdatedModel(
												e.target
													.value as TranscriptionModel,
											);
										}}
										className="mt-1 block w-full max-w-sm border rounded p-2"
									>
										<option
											value={TranscriptionModel.OPENAI}
										>
											OpenAI
										</option>
										<option
											value={TranscriptionModel.PIXTRAL}
										>
											Pixtral
										</option>
									</select>
								</div>
							</div>
							<div className="flex flex-col content-between justify-between pt-8 pb-8">
								<label
									htmlFor="systemPromptArea"
									className="block text-lg font-light text-gray-700"
								>
									{t("System Prompt")}
								</label>
								<textarea
									id="systemPromptArea"
									rows={4}
									value={updatedSystemPrompt}
									onChange={(e) =>
										setUpdatedSystemPrompt(e.target.value)
									}
									className="mt-1 block w-full border rounded p-2"
								/>
								<div className="pt-4">
									<button
										type="button"
										className="text-xl bg-white hover:bg-gray-200 py-2 px-4 rounded"
										onClick={resetSystemPrompt}
									>
										{t("Reset Default")}
									</button>
								</div>
							</div>
							<div>
								<label
									htmlFor="promptArea"
									className="block text-lg font-light text-gray-700"
								>
									{t("Prompt")}
								</label>
								<textarea
									id="promptArea"
									rows={4}
									value={updatedPrompt}
									onChange={(e) =>
										setUpdatedPrompt(e.target.value)
									}
									className="mt-1 block w-full border rounded p-2"
								/>
								<div className="pt-4">
									<button
										type="button"
										className="text-xl bg-white hover:bg-gray-200 py-2 px-4 rounded"
										onClick={resetPrompt}
									>
										{t("Reset Default")}
									</button>
								</div>
							</div>
						</div>
					</section>
					<section className="py-4 border-t border-gray-300">
						<a
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
							href={LOGOUT_PATH}
						>
							{t("Logout")}
						</a>
					</section>
				</div>
			</div>
		</div>
	);
};

export default Settings;
