import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./TextEditor.css";

interface TextEditorProps {
	text: string;
	onChange: (newText: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange }) => {
	const [inputValue, setInputValue] = useState(text);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
		null,
	);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const mirrorRef = useRef<HTMLDivElement | null>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [caretTop, setCaretTop] = useState(0);
	const [lineHeight, setLineHeight] = useState(24);

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

	const updateCaretPosition = () => {
		const textarea = textareaRef.current;
		const mirror = mirrorRef.current;
		if (!textarea || !mirror) return;

		const caret = textarea.selectionStart ?? 0;
		const before = textarea.value.slice(0, caret);

		// Reset mirror content, then measure caret via a marker span.
		mirror.textContent = "";
		mirror.append(document.createTextNode(before));

		const marker = document.createElement("span");
		// Zero-width character so the span has a measurable position.
		marker.textContent = "\u200b";
		mirror.append(marker);

		setCaretTop(marker.offsetTop);
	};

	useEffect(() => {
		setInputValue(text);
	}, [text]);

	useEffect(() => {
		const textarea = textareaRef.current;
		const mirror = mirrorRef.current;
		if (!textarea || !mirror) return;

		const style = window.getComputedStyle(textarea);
		mirror.style.width = `${textarea.clientWidth}px`;

		const lh = Number.parseFloat(style.lineHeight || "0");
		if (Number.isFinite(lh) && lh > 0) setLineHeight(lh);

		updateCaretPosition();
	}, []);

	useEffect(() => {
		updateCaretPosition();
	}, [inputValue]);

	useEffect(() => {
		const textarea = textareaRef.current;
		const mirror = mirrorRef.current;
		if (!textarea || !mirror) return;

		const ro = new ResizeObserver(() => {
			mirror.style.width = `${textarea.clientWidth}px`;
			updateCaretPosition();
		});
		ro.observe(textarea);
		return () => ro.disconnect();
	}, []);

	const highlightStyle = useMemo(() => {
		const top = caretTop - scrollTop;
		return {
			top,
			height: lineHeight,
		} as const;
	}, [caretTop, lineHeight, scrollTop]);

	return (
		<div className="textEditorRoot">
			<div
				ref={mirrorRef}
				className="textEditorMirror"
				aria-hidden="true"
			/>
			<div
				className="textEditorActiveLine"
				style={highlightStyle}
			/>
			<textarea
				ref={textareaRef}
				value={inputValue}
				defaultValue={text}
				onChange={(e) => {
					handleChange(e);
					updateCaretPosition();
				}}
				onSelect={updateCaretPosition}
				onKeyUp={updateCaretPosition}
				onClick={updateCaretPosition}
				onScroll={(e) => {
					setScrollTop(e.currentTarget.scrollTop);
				}}
				className="textEditorTextarea"
			/>
		</div>
	);
};

export default TextEditor;
