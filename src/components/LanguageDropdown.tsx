import React, { useState, useRef, useEffect } from 'react';

interface Option {
    label: string;
    value: string;
    code?: string;
}

interface DropdownProps {
    options: Option[];
    placeholder: string;
    onSelect: (value: string) => void;
    recentOptions?: Option[];
    searchable?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    placeholder,
    onSelect,
    recentOptions,
    searchable = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value: string) => {
        onSelect(value);
        setIsOpen(false);
    };

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOutsideClick = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <div className="relative w-64" ref={dropdownRef}>
            <div
                className="flex items-center justify-between p-2 border rounded cursor-pointer"
                onClick={toggleDropdown}
            >
                <span>{placeholder}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border">
                    {searchable && (
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border-b focus:outline-none"
                        />
                    )}

                    {recentOptions && recentOptions.length > 0 && (
                        <div className="p-2">
                            <h3 className="text-sm font-semibold mb-1">Recent Languages</h3>
                            {recentOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                                    onClick={() => handleOptionClick(option.value)}
                                >
                                    <span>{option.label}</span>
                                    {option.code && <span className="text-gray-500 text-sm">{option.code}</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-2">
                        <h3 className="text-sm font-semibold mb-1">All Languages</h3>
                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                                onClick={() => handleOptionClick(option.value)}
                            >
                                <span>{option.label}</span>
                                {option.code && <span className="text-gray-500 text-sm">{option.code}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface LanguageDropdownProps {
    onSelect: (value: string) => void;
    selectedLanguage: string;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ onSelect, selectedLanguage }) => {
    const languageOptions: Option[] = [
        { label: 'English', value: 'en', code: 'eng' },
        { label: 'Cebuano', value: 'ceb', code: 'cbo' },
        { label: 'Umutu', value: 'umu', code: 'uli' },
        { label: 'Amharic', value: 'am', code: 'am' },
        { label: 'Arabic', value: 'ar', code: 'ar' },
        { label: 'Arabic - Dominant Culture Variant', value: 'ar-x-dcv', code: 'ar-x-dcv' },
        { label: 'Assamese', value: 'as', code: 'as' },
        { label: 'Bislama', value: 'bi', code: 'bi' },
        { label: 'Bengali, Bangla', value: 'bn', code: 'bn' },
        // ... more languages
    ];

    const recentLanguages: Option[] = [
        { label: 'English', value: 'en', code: 'eng' },
        { label: 'Cebuano', value: 'ceb', code: 'cbo' },
        { label: 'Umutu', value: 'umu', code: 'uli' },
    ];

    return (
        <Dropdown
            options={languageOptions}
            placeholder="Select Language"
            onSelect={onSelect}
            recentOptions={recentLanguages}
        />
    );
};

export default LanguageDropdown;