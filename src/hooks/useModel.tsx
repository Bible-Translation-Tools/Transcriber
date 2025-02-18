import { useState, useEffect } from 'react';
import { useApiKey } from './useApiKey';
import OpenAIModel from '../domain/OpenAIModel';
import Model from '../domain/Model';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';

export const useModel = () => {
    const { apiKey } = useApiKey();
    const [model, setModel] = useState<Model | null>(null);

    useEffect(() => {
        (async () => {
            if (apiKey != null) {
                const model = new OpenAIModel(apiKey)
                const valid = await model.keyIsValid()
                if (valid == ApiKeyStatus.Valid) {
                    setModel(model)
                    alert("API Key is valid!")
                } else {
                    alert("API Key invalid!")
                }
            }
        })();
    }, [apiKey]);

    return { model }
}