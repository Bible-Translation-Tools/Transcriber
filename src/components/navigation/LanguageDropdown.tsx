import type React from "react";
import {LanguageOption} from "@src/data/LanguageOption.tsx";
import {Dropdown} from "@components/navigation/Dropdown.tsx";

interface LanguageDropdownProps {
	onSelect: (value: LanguageOption) => void;
	selectedLanguage: LanguageOption;
	languageOptions: LanguageOption[];
	recentLanguages: string[];
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
	onSelect,
	selectedLanguage,
	languageOptions,
	recentLanguages,
}) => {
	const recentLangs: LanguageOption[] = languageOptions.filter((option) => {
		if (recentLanguages.includes(option.code ?? "")) return true;
	});

	const handleSelect = (value: LanguageOption) => {
		const selectedOption = languageOptions.find(
			(option) => option.code === value.code,
		);
		if (selectedOption !== undefined) {
			onSelect(selectedOption);
		}
	};

	return (
		<Dropdown
			options={languageOptions}
			placeholder="Select Language"
			onSelect={handleSelect} // Use handleSelect here
			recentOptions={recentLangs}
			selectedLabel={selectedLanguage?.anglicized ?? ""} // Pass selectedLabel
		/>
	);
};

export default LanguageDropdown;
