import React, { useState } from 'react';

interface APIKeyInputProps {
  onApiKeyStored: (apiKey: string) => void; // Type the prop
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onApiKeyStored }) => {
  const [apiKey, setApiKey] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault(); // Prevent default paste behavior

    const pastedText = event.clipboardData.getData('text');
    const trimmedKey = pastedText.trim();

    setApiKey(trimmedKey);
    setShowPlaceholder(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredKey = event.target.value;
    const trimmedKey = enteredKey.trim();
    setApiKey(trimmedKey);
    setShowPlaceholder(trimmedKey === "");
  }

  const handleGetStarted = () => {
    if (apiKey) {
      onApiKeyStored(apiKey)
    }
  };

  const maskedApiKey = showPlaceholder ? "" : "*".repeat(apiKey.length);

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm w-[800px]">
      <label htmlFor="apiKey" className="block mb-2 text-gray-800">
        API Key
      </label>
      <div className="relative">
        <input
          type="text"
          id="apiKey"
          value={maskedApiKey} // Display asterisks
          onPaste={handlePaste}
          onChange={handleChange}
          placeholder={showPlaceholder ? "Paste the API key included in your email here." : ""}
          className="w-full px-2 py-2 border border-gray-300 rounded-md text-base bg-gray-100"
        />
        {!showPlaceholder &&
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => { navigator.clipboard.writeText(apiKey) }}
          >
            copy
          </span>}
      </div>
      <button
        onClick={handleGetStarted}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 border-none cursor-pointer"
      >
        Get Started
      </button>
    </div>
  );
};

export default APIKeyInput;