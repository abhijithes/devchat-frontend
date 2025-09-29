import { createContext, useContext, useState } from 'react';

const LoaderContext = createContext(undefined);

export const LoaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);

    return (
        <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
            {children}
        </LoaderContext.Provider>
    );
};

// Custom hook to use the context
export const useLoader = () => useContext(LoaderContext);
