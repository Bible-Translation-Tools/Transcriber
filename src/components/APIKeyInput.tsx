import React, { useState } from 'react';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';

interface APIKeyInputProps {
  onApiKeyStored: (apiKey: string) => void; // Type the prop,
  apiKeyStatus: ApiKeyStatus
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onApiKeyStored, apiKeyStatus }) => {
  const [apiKey, setApiKey] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [maskedApiKey, setMaskedApiKey] = useState(''); // Store the masked version
  const isInvalid = apiKeyStatus === ApiKeyStatus.Invalid

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault(); // Prevent default paste behavior

    const pastedText = event.clipboardData.getData('text');
    const trimmedKey = pastedText.trim();

    setApiKey(trimmedKey);
    setShowPlaceholder(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = event.target.value; // Value with asterisks
    const diff = enteredValue.length - apiKey.length; // Calculate the change

    if (diff > 0) { // Characters were added
      const pos = event.target.selectionStart; // Get cursor position
      const newApiKey = apiKey.slice(0, pos - diff) + enteredValue.slice(pos - diff) + apiKey.slice(pos);
      setApiKey(newApiKey);
      setMaskedApiKey("*".repeat(newApiKey.length));
    } else if (diff < 0) { // Characters were deleted
      const pos = event.target.selectionStart;
      const newApiKey = apiKey.slice(0, pos);
      setApiKey(newApiKey);
      setMaskedApiKey("*".repeat(newApiKey.length));
    }
  }

  const handleGetStarted = () => {
    if (apiKey) {
      onApiKeyStored(apiKey)
    }
  };

  //const maskedApiKey = showPlaceholder ? "" : "*".repeat(apiKey.length);

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
          className={`w-full px-2 py-2 border rounded-md text-base bg-gray-100 ${isInvalid ? 'border-red-500' : 'border-gray-300'}`}
        />
        {!showPlaceholder &&
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={() => { navigator.clipboard.writeText(apiKey) }}
          >
            copy
          </span>}
      </div>
      {isInvalid && <p className="text-red-500 mt-2">Invalid API Key</p>} {/* Error message */}
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