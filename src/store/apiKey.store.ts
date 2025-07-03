import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeys {
  openai?: string;
  claude?: string;
  descript?: string;
}

interface ApiKeyState {
  apiKeys: ApiKeys;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  removeApiKey: (provider: keyof ApiKeys) => void;
  hasApiKey: (provider: keyof ApiKeys) => boolean;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      // Initial state
      apiKeys: {},
      
      // Actions
      setApiKey: (provider, key) => {
        console.log(`[ApiKeyStore] Setting API key for ${provider}`);
        set((state) => {
          const newApiKeys = { ...state.apiKeys, [provider]: key };
          console.log('[ApiKeyStore] New API keys state:', newApiKeys);
          return { apiKeys: newApiKeys };
        });
      },
      
      removeApiKey: (provider) => {
        set((state) => {
          const newKeys = { ...state.apiKeys };
          delete newKeys[provider];
          return { apiKeys: newKeys };
        });
      },
      
      hasApiKey: (provider) => {
        const state = get();
        return !!state.apiKeys[provider];
      }
    }),
    {
      name: 'contentflow-apikeys',
      partialize: (state) => ({
        apiKeys: state.apiKeys
      })
    }
  )
); 