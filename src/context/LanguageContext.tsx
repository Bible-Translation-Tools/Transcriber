import { getLanguagesPublicDataApi } from "@src/services/LanguageApi.ts";
import { createContext, useEffect, useState } from "react";
import {LanguageOption} from "@src/data/LanguageOption.tsx";

interface LanguageContextType {
	languages: LanguageOption[];
}

export const LanguageContext = createContext<LanguageContextType>({
	languages: [],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [languages, setLanguages] = useState<LanguageOption[]>([]);

	useEffect(() => {
		const getLangs = async () => {
			const data = await getLanguagesPublicDataApi();
			console.log("Got the languages!");
			if (data != null) {
				setLanguages(data);
			}
		};
		console.log("ran the hook");
		getLangs();
	}, []);

	return (
		<LanguageContext.Provider
			value={{
				languages,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};
