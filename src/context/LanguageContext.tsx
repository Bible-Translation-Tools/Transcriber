import { getLanguagesPublicDataApi } from "@src/services/LanguageApi.ts";
import { createContext, useEffect, useState } from "react";
import type { LanguageOption } from "@src/data/LanguageOption.tsx";
import { useQuery } from "@tanstack/react-query";

interface LanguageContextType {
	languages: LanguageOption[];
	isError: boolean;
	isPending: boolean;
	error: Error | null;
}

export const LanguageContext = createContext<LanguageContextType>({
	languages: [],
	error: null,
	isError: false,
	isPending: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const initialData = [{ anglicized: "English", code: "en" }];
	const {
		data: languages,
		isError,
		isPending,
		error,
	} = useQuery({
		initialData,
		queryKey: ["pubDataLangs"],
		queryFn: getLanguagesPublicDataApi,
	});

	return (
		<LanguageContext.Provider
			value={{
				languages: languages || [],
				isError,
				isPending,
				error,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};
