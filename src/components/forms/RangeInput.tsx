import React, {useState} from 'react';
import { useTranslation } from 'react-i18next';

interface RangeInputProps {
    startVerse: number | undefined;
    endVerse: number | undefined;
    onRangeChange: (start: number, end: number) => void;
}

const RangeInput: React.FC<RangeInputProps> = ({startVerse, endVerse, onRangeChange}) => {

    const { t } = useTranslation();
    const [start, setStart] = useState<string>(`${startVerse || 1}`);
    const [end, setEnd] = useState<string>(`${endVerse || 1}`);

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,3}$/.test(value)) {
            setStart(value);

            onRangeChange(parseInt(value, 10), parseInt(end, 10));
        }
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d{0,3}$/.test(value)) {
            setEnd(value);
            onRangeChange(parseInt(start, 10), parseInt(value, 10));
        }
    };

    return (
        <div className="flex items-center space-x-4 pb-3">
            <label className="text-gray-700">{t('Start:')}</label>
            <input
                type="text"
                value={start}
                onChange={handleStartChange}
                className="border rounded px-3 py-2 w-20 text-center"
            />
            <label className="text-gray-700">{t('End:')}</label>
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