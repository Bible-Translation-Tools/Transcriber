import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n.use(Backend)
	.use(LanguageDetector) // Detect language from browser/localStorage
	.use(initReactI18next) // Pass i18n instance to react-i18next
	.init({
		supportedLngs: ["en", "fr", "es", "de", "pt", "vi"],
		fallbackLng: "en",
		detection: {
			order: ["querystring", "cookie", "localStorage", "navigator"],
			caches: ["cookie"],
		},
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
