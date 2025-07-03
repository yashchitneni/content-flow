import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { invoke, listen } from '../tauri-wrapper';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  expiresAt: number | null;
}

interface AuthContextType {
  authState: AuthState;
  isLoading: boolean;
  error: string | null;
  initiateAuth: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: null,
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();

    // Listen for auth events
    const unlisten = Promise.all([
      listen('auth-success', (event) => {
        checkAuthState();
      }),
      listen('auth-refreshed', (event) => {
        checkAuthState();
      }),
      listen('auth-logout', () => {
        setAuthState({
          isAuthenticated: false,
          userEmail: null,
          expiresAt: null,
        });
      }),
    ]);

    return () => {
      unlisten.then(unlisteners => {
        unlisteners.forEach(fn => fn());
      });
    };
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const state = await invoke<AuthState>('get_auth_state');
      setAuthState({
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        expiresAt: state.expiresAt,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to check auth state:', err);
      setError('Failed to check authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateAuth = async () => {
    try {
      setError(null);
      const { auth_url, state } = await invoke<{ auth_url: string; state: string }>('initiate_auth');
      
      // Store state in session storage for callback handling
      sessionStorage.setItem('descript_auth_state', state);
      
      // Open auth URL in default browser
      await invoke('open_external', { url: auth_url });
    } catch (err) {
      console.error('Failed to initiate auth:', err);
      setError('Failed to start authentication');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await invoke('logout');
      setAuthState({
        isAuthenticated: false,
        userEmail: null,
        expiresAt: null,
      });
    } catch (err) {
      console.error('Failed to logout:', err);
      setError('Failed to logout');
      throw err;
    }
  };

  const refreshAuth = async () => {
    try {
      setError(null);
      const state = await invoke<AuthState>('refresh_auth');
      setAuthState({
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        expiresAt: state.expiresAt,
      });
    } catch (err) {
      console.error('Failed to refresh auth:', err);
      setError('Failed to refresh authentication');
      throw err;
    }
  };

  const getAccessToken = async (): Promise<string> => {
    try {
      return await invoke<string>('get_access_token');
    } catch (err) {
      console.error('Failed to get access token:', err);
      throw new Error('Failed to get access token');
    }
  };

  return (
    <AuthContext.Provider value={{
      authState,
      isLoading,
      error,
      initiateAuth,
      logout,
      refreshAuth,
      getAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};