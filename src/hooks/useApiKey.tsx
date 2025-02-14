import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('apiKey'));

  useEffect(() => {
    const handleStorageChange = () => {
      setApiKey(localStorage.getItem('apiKey'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const storeApiKey = (newApiKey: string) => {
    localStorage.setItem('apiKey', newApiKey);
    setApiKey(newApiKey);
  };

  const clearApiKey = () => {
      localStorage.removeItem('apiKey');
      setApiKey(null);
  }

  return { apiKey, storeApiKey, clearApiKey };
};