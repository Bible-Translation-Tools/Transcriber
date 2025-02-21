import { useContext } from 'react';
import { ModelContext } from "./ModelContext";

// 3. Create a Custom Hook to use the Context
export const useModelContext = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModelContext must be used within an ModelProvider');
    }
    return context;
};