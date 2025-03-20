import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import "./index.css";
import { ImageProvider } from "./context/ImageContext";
import Home from "./routes/Home";
import Login from "./routes/Login.tsx";
import TranscriptionPage from "./routes/TranscriptionPage.tsx";
import SettingsPage from "@src/routes/SettingsPage.tsx";

const Main = () => {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<Home />} />
                <Route path="/settings" element={<SettingsPage/>} />
				<Route path="/transcriber" element={<TranscriptionPage />} />
			</Routes>
		</Router>
	);
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ImageProvider>
			<Main />
		</ImageProvider>
	</StrictMode>,
);
