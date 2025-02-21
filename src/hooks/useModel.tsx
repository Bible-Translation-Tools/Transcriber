import { useState, useEffect, useRef, useMemo } from 'react';
import { useApiKey } from './useApiKey';
import OpenAIModel from '../domain/OpenAIModel';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';
import Model from '../domain/Model';

export const useModel = () => {
    const { apiKey } = useApiKey();
    const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>(ApiKeyStatus.Missing);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [model, setModel] = useState<Model | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (apiKeyStatus == ApiKeyStatus.Valid && model != null) return;
            if (checkingStatus == true) return;
            
            if (apiKey) {
                setCheckingStatus(true);
                console.log("Checking API Key Status");
                const potentialModel = new OpenAIModel(apiKey);
                const keyStatus = await potentialModel.keyStatus();
                setApiKeyStatus(keyStatus);
                setCheckingStatus(false);

                if (keyStatus === ApiKeyStatus.Valid) {
                    setModel(potentialModel);
                } else {
                  setModel(null); // Important: Reset model if key is invalid
                }
            }
        };
        checkApiKey();
    }, [apiKey, apiKeyStatus, checkingStatus, model]); // Add checkingStatus to the dependency array

    const memoizedModel = useMemo(() => model, [model]);

    return { model: memoizedModel, apiKeyStatus };
};
