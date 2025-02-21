import React, { useState, useEffect } from 'react';

interface TextEditorProps {
    text: string;
    onChange: (newText: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange }) => {
    const [inputValue, setInputValue] = useState(text);
    const [typing, setTyping] = useState(false);
    const [doneTyping, setDoneTyping] = useState(false);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        let typingTimer: NodeJS.Timeout | null = null;
        const doneTypingInterval = 500;

        const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement> | Event) => {
            const newValue = (event as React.ChangeEvent<HTMLTextAreaElement>)?.target?.value;

            if (newValue !== undefined) {
                setInputValue(newValue);
                setTyping(true);

                if (typingTimer) {
                    clearTimeout(typingTimer);
                }

                typingTimer = setTimeout(() => {
                    setTyping(false);
                    setDoneTyping(true);

                    console.log("saving changes...")
                    onChange(newValue);

                    setDoneTyping(false);

                }, doneTypingInterval);
            } else {
                console.error("Event or event.target is undefined:", event);
            }
        };

        const textArea = textAreaRef.current;

        if (textArea) {
            textArea.addEventListener('input', handleInputChange);

            return () => {
                textArea.removeEventListener('input', handleInputChange);
                if (typingTimer) {
                    clearTimeout(typingTimer);
                }
            };
        }

    }, []);

    useEffect(() => {
        setInputValue(text);
    }, [text]);

    return (
        <textarea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
            className="w-full h-full border border-gray-300 p-2 text-lg resize-none"
        />
    );
};

export default TextEditor;