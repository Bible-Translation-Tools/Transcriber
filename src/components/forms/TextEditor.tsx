import type React from "react";
import { useEffect, useState } from "react";

interface TextEditorProps {
	text: string;
	onChange: (newText: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange }) => {
	const [inputValue, setInputValue] = useState(text);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
		null,
	);

	// biome-ignore lint/suspicious/noExplicitAny: <fine for just debouncing to take any args and forward>
	const debounce = (func: (...args: any[]) => void, delay: number) => {
		let timer: NodeJS.Timeout;

		// biome-ignore lint/suspicious/noExplicitAny: <same>
		return (...args: any[]) => {
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
			timer = setTimeout(() => func(...args), delay);
			setTypingTimeout(timer);
		};
	};
	const debouncedOnChange = debounce(onChange, 500);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		debouncedOnChange(newValue);
	};

	useEffect(() => {
		setInputValue(text);
	}, [text]);

	return (
		<textarea
			value={inputValue}
			defaultValue={text}
			onChange={handleChange}
			className="w-full grow-1 flex-1 border border-gray-300 bg-white p-2 text-lg resize-none"
		/>
	);
};

export default TextEditor;
