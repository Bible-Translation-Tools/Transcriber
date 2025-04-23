import type React from 'react';
import {useState} from 'react';
import { useTranslation } from 'react-i18next';
import type {TranscribableDocument} from "@src/data/TranscribableDocument.tsx";

interface RangeInputProps {
    selectedImage: TranscribableDocument | null;
    onRangeChange: (start: number, end: number) => void;
}

const RangeInput: React.FC<RangeInputProps> = ({selectedImage, onRangeChange}) => {

    const { t } = useTranslation();

    const { startVerse, endVerse } = selectedImage || {};
    const [start, setStart] = useState<string>(`${startVerse || 1}`);
    const [end, setEnd] = useState<string>(`${endVerse || 1}`);

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,3}$/.test(value)) {
            setStart(value);

            onRangeChange(Number.parseInt(value, 10), Number.parseInt(end, 10));
        }
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,3}$/.test(value)) {
            setEnd(value);
            onRangeChange(Number.parseInt(start, 10), Number.parseInt(value, 10));
        }
    };

    if (!selectedImage) {
        return null;
    }
    return (
        <div className="flex items-center space-x-4 pb-3">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-gray-700">{t('Start')}</label>
            <input
                type="text"
                value={start}
                onChange={handleStartChange}
                className="border rounded px-3 py-2 w-20 text-center"
            />
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-gray-700">{t('End')}</label>
            <input
                type="text"
                value={end}
                onChange={handleEndChange}
                className="border rounded px-3 py-2 w-20 text-center"
            />
        </div>
    );
};

export default RangeInput;