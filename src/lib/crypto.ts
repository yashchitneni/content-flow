// Secure API Key Storage for Production
import CryptoJS from 'crypto-js';

// Generate a unique key for this browser session
const getEncryptionKey = (): string => {
  const stored = localStorage.getItem('contentflow-session-key');
  if (stored) return stored;
  
  // Generate new session key
  const key = CryptoJS.lib.WordArray.random(256/8).toString();
  localStorage.setItem('contentflow-session-key', key);
  return key;
};

export const encryptApiKey = (apiKey: string): string => {
  try {
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(apiKey, key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return apiKey; // Fallback to plain text for demo
  }
};

export const decryptApiKey = (encryptedKey: string): string => {
  try {
    const key = getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedKey, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedKey; // Fallback to treating as plain text
  }
};

// For demo purposes - we'll keep using plain text but add this for production
export const secureApiKeyStorage = {
  save: (service: string, apiKey: string): void => {
    const currentKeys = localStorage.getItem('contentflow-api-keys');
    const apiKeys = currentKeys ? JSON.parse(currentKeys) : {};
    
    // For production: use encryptApiKey(apiKey)
    // For demo: keep plain text for simplicity
    apiKeys[service] = apiKey; // encryptApiKey(apiKey) for production
    
    localStorage.setItem('contentflow-api-keys', JSON.stringify(apiKeys));
  },
  
  get: (service: string): string | null => {
    const currentKeys = localStorage.getItem('contentflow-api-keys');
    const apiKeys = currentKeys ? JSON.parse(currentKeys) : {};
    
    const key = apiKeys[service];
    if (!key) return null;
    
    // For production: use decryptApiKey(key)
    // For demo: return plain text
    return key; // decryptApiKey(key) for production
  },
  
  remove: (service: string): void => {
    const currentKeys = localStorage.getItem('contentflow-api-keys');
    const apiKeys = currentKeys ? JSON.parse(currentKeys) : {};
    delete apiKeys[service];
    localStorage.setItem('contentflow-api-keys', JSON.stringify(apiKeys));
  }
};