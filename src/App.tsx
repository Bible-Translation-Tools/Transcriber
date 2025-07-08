import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "./index.css";
import SettingsPage from "@src/pages/SettingsPage.tsx";
import {LanguageProvider} from "./context/LanguageContext.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import TranscriptionPage from "./pages/transcription/TranscriptionPage.tsx";
import "./i18n";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import LogRocket from "logrocket";
import {TRANSCRIBE_ROUTE} from "./constants.ts";

LogRocket.init("ct7zyg/handwriting-transcription");
const queryClient = new QueryClient();
connectUserWithAnalytics();

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route
					path={TRANSCRIBE_ROUTE}
					element={<TranscriptionPage />}
				/>
			</Routes>
			<ToastContainer />
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

function connectUserWithAnalytics() {
	const userId = localStorage.getItem("userId");
	const userName = localStorage.getItem("userName");
	const userEmail = localStorage.getItem("userEmail");

	if (userId !== null && userName !== null && userEmail !== null) {
		LogRocket.identify(userId, {
			name: userName,
			email: userEmail,
		});
	}
}
