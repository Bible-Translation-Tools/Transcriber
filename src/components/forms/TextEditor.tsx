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
	const [scrollTop, setScrollTop] = useState(0); // scroll position of the textarea
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

		// The mirror is styled to match the textarea (font, padding, wrapping, width).
		// By rendering only the text *before* the caret, we can drop a marker node at the
		// exact caret position and ask the browser where that marker ended up vertically.
		mirror.textContent = "";
		mirror.append(document.createTextNode(before));

		const marker = document.createElement("span");
		// Use a zero-width character so the marker participates in layout without
		// changing what the user sees. The span then has a measurable `offsetTop`.
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
		// Keep mirror width aligned with the textarea so line-wrapping matches.
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
			// If the textarea resizes, wrapping changes, which changes the caret's line.
			mirror.style.width = `${textarea.clientWidth}px`;
			updateCaretPosition();
		});
		ro.observe(textarea);
		return () => ro.disconnect();
	}, []);

	const highlightStyle = useMemo(() => {
		// Convert caret position in document space to viewport space by removing scroll.
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
				// Keep the highlight in sync when the caret moves without changing text
				// (mouse clicks, selection changes, arrow keys, etc.).
				onSelect={updateCaretPosition}
				onKeyUp={updateCaretPosition}
				onClick={updateCaretPosition}
				onScroll={(e) => {
					// sync highlight position when scrolling
					setScrollTop(e.currentTarget.scrollTop);
				}}
				className="textEditorTextarea"
			/>
		</div>
	);
};

export default TextEditor;
