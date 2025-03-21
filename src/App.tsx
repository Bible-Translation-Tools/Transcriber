import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useNavigate,
} from "react-router-dom";
import "./index.css";
import SettingsPage from "@src/routes/SettingsPage.tsx";
import { ImageProvider } from "./context/ImageContext.tsx";
import { LanguageProvider } from "./context/LanguageContext.tsx";
import Home from "./routes/Home.tsx";
import Login from "./routes/Login.tsx";
import TranscriptionPage from "./routes/TranscriptionPage.tsx";

const App = () => {
	function HomeRedirect() {
		useEffect(() => {
			window.location.href = "/welcome";
		});
		return null;
	}

	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<HomeRedirect />} />
				<Route path="/welcome" element={<Home />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/transcriber" element={<TranscriptionPage />} />
			</Routes>
		</Router>
	);
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<LanguageProvider>
			<ImageProvider>
				<App />
			</ImageProvider>
		</LanguageProvider>
	</StrictMode>,
);
