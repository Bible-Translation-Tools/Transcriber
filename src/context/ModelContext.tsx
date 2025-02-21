import React, { createContext } from 'react';
import { useModel } from '../hooks/useModel';
import Model from '../domain/Model';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';

interface ModelContextType {
    model: Model | null;
    apiKeyStatus: ApiKeyStatus
}

export const ModelContext = createContext<ModelContextType>({
    model: null,
    apiKeyStatus: ApiKeyStatus.Missing
});

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { model, apiKeyStatus } = useModel();

    return (
        <ModelContext.Provider value={{ model, apiKeyStatus }}>
            {children}
        </ModelContext.Provider>
    );
};