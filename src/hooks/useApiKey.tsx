import { useState, useEffect } from 'react';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';
import OpenAIModel from '../domain/OpenAIModel';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('apiKey'));
  const [apiKeyStatus, setApiKeyStatus] = useState(ApiKeyStatus.Missing);

  useEffect(() => {
    const handleStorageChange = () => {
      setApiKey(localStorage.getItem('apiKey'));
    };

    window.addEventListener('storage', handleStorageChange);

    (async () => {
      if (apiKey != null) {
        setApiKeyStatus(await new OpenAIModel(apiKey).keyIsValid())
      }
    }
    )();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const storeApiKey = async (newApiKey: string) => {
    localStorage.setItem('apiKey', newApiKey);
    const model = new OpenAIModel(newApiKey)
    const status = await model.keyIsValid()
    setApiKey(newApiKey);
    setApiKeyStatus(status)
  };

  const clearApiKey = () => {
    localStorage.removeItem('apiKey');
    setApiKey(null);
  }

  return { apiKey, apiKeyStatus, storeApiKey, clearApiKey };
};