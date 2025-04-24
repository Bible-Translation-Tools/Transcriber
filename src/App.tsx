import {StrictMode, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {ToastContainer} from 'react-toastify';
import "./index.css";
import SettingsPage from "@src/pages/SettingsPage.tsx";
import {LanguageProvider} from "./context/LanguageContext.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import TranscriptionPage from "./pages/transcription/TranscriptionPage.tsx";
import {useTranscriptionStore} from "@src/persistence/store/TranscriptionStore.ts";
import './i18n';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

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
                <Route path="/login" element={<Login/>}/>
                <Route path="/" element={<HomeRedirect/>}/>
                <Route path="/welcome" element={<Home/>}/>
                <Route path="/settings" element={<SettingsPage/>}/>
                <Route path="/transcriber" element={<TranscriptionPage/>}/>
            </Routes>
            <ToastContainer/>
        </Router>
    );
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <App/>
            </LanguageProvider>
        </QueryClientProvider>
    </StrictMode>,
);
