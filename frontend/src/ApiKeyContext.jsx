import React, { createContext, useContext, useEffect, useState } from 'react';

const ApiKeyContext = createContext(null);

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tide_api_key') || '');

  useEffect(() => {
    if (apiKey) localStorage.setItem('tide_api_key', apiKey);
    else localStorage.removeItem('tide_api_key');
  }, [apiKey]);

  return <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
