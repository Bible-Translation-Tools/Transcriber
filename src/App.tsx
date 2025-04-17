import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import SettingsPage from "@src/pages/SettingsPage.tsx";
import { LanguageProvider } from "./context/LanguageContext.tsx";
import Home from "./pages/Home.tsx";

import TranscriptionPage from "./pages/transcription/TranscriptionPage.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/transcriber" element={<TranscriptionPage />} />
			</Routes>
		</Router>
	);
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<LanguageProvider>
				<App />
			</LanguageProvider>
		</QueryClientProvider>
	</StrictMode>,
);
