import { useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';

interface DescriptApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

interface DescriptApiResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useDescriptApi<T = any>() {
  const { getAccessToken, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const makeRequest = useCallback(async (
    endpoint: string,
    options: DescriptApiOptions = {}
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get fresh access token
      const accessToken = await getAccessToken();

      const url = endpoint.startsWith('http') 
        ? endpoint 
        : `https://api.descript.com/v2${endpoint}`;

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (response.status === 401) {
        // Token might be expired, try refreshing
        await refreshAuth();
        const newToken = await getAccessToken();
        
        // Retry the request with new token
        const retryResponse = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        const data = await retryResponse.json();
        return data;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API request failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, refreshAuth]);

  const get = useCallback((endpoint: string, options?: Omit<DescriptApiOptions, 'method'>) => {
    return makeRequest(endpoint, { ...options, method: 'GET' });
  }, [makeRequest]);

  const post = useCallback((endpoint: string, body?: any, options?: Omit<DescriptApiOptions, 'method' | 'body'>) => {
    return makeRequest(endpoint, { ...options, method: 'POST', body });
  }, [makeRequest]);

  const put = useCallback((endpoint: string, body?: any, options?: Omit<DescriptApiOptions, 'method' | 'body'>) => {
    return makeRequest(endpoint, { ...options, method: 'PUT', body });
  }, [makeRequest]);

  const patch = useCallback((endpoint: string, body?: any, options?: Omit<DescriptApiOptions, 'method' | 'body'>) => {
    return makeRequest(endpoint, { ...options, method: 'PATCH', body });
  }, [makeRequest]);

  const del = useCallback((endpoint: string, options?: Omit<DescriptApiOptions, 'method'>) => {
    return makeRequest(endpoint, { ...options, method: 'DELETE' });
  }, [makeRequest]);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    isLoading,
    error,
  };
}