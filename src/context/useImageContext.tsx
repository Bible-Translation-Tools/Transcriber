import { useContext } from "react";
import { ImageContext } from "./ImageContext";

// 3. Create a Custom Hook to use the Context
export const useImageContext = () => {
	const context = useContext(ImageContext);
	if (!context) {
		throw new Error("useImageContext must be used within an ImageProvider");
	}
	return context;
};
