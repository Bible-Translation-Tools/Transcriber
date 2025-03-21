import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";

// 3. Create a Custom Hook to use the Context
export const useLanguageContext = () => {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error(
			"useLanguageContext must be used within an LanguageProvider",
		);
	}
	return context;
};
