interface TextEditorProps {
    text: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, onChange }) => (
    <textarea
        value={text}
        onChange={onChange}
        className="w-full h-full border border-gray-300 p-2 text-lg resize-none"
    />
);

export default TextEditor;