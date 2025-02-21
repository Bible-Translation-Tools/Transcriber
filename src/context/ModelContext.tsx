import React, { createContext } from 'react';
import { useModel } from '../hooks/useModel';
import Model from '../domain/Model';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';
import { useApiKey } from '../hooks/useApiKey';

interface ModelContextType {
    model: Model | null;
    apiKeyStatus: ApiKeyStatus,
    apiKey: string | null,
    storeApiKey: any
}

export const ModelContext = createContext<ModelContextType>({
    model: null,
    apiKeyStatus: ApiKeyStatus.Missing,
    apiKey: "",
    storeApiKey: null,
});

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { model, apiKeyStatus } = useModel();
    const { apiKey, storeApiKey } = useApiKey();

    return (
        <ModelContext.Provider value={{ model, apiKeyStatus, apiKey, storeApiKey }}>
            {children}
        </ModelContext.Provider>
    );
};