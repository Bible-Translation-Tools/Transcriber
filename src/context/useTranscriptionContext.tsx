import { useContext } from "react";
import { TranscriptionContext } from "./TranscriptionContext.tsx";

// 3. Create a Custom Hook to use the Context
export const useTranscriptionContext = () => {
	const context = useContext(TranscriptionContext);
	if (!context) {
		throw new Error("useTranscriptionContext must be used within an TranscriptionProvider");
	}
	return context;
};
