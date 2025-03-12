import React, { useState, useEffect } from 'react';

interface TextEditorProps {
    text: string;
    onChange: (newText: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange }) => {
    const [inputValue, setInputValue] = useState(text);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timer: NodeJS.Timeout;
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
            className="w-full flex-grow  grow-1 flex-1 border border-gray-300 p-2 text-lg resize-none"
        />
    );
};

export default TextEditor;

