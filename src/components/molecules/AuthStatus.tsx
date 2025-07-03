import React from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../atoms/Button';

export const AuthStatus: React.FC = () => {
  const { authState, isLoading, error, initiateAuth, logout } = useAuth();

  const formatExpiryTime = (expiresAt: number | null) => {
    if (!expiresAt) return '';
    
    const now = Date.now() / 1000;
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
        <span className="text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (authState.isAuthenticated) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">
                Connected to Descript
              </p>
              {authState.userEmail && (
                <p className="text-sm text-green-700">{authState.userEmail}</p>
              )}
              {authState.expiresAt && (
                <p className="text-xs text-green-600 mt-1">
                  Token expires in {formatExpiryTime(authState.expiresAt)}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={logout}
            variant="destructive"
            size="small"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Not connected to Descript
            </p>
            <p className="text-sm text-blue-700">
              Connect your account to start using ContentFlow
            </p>
          </div>
        </div>
        <Button
          onClick={initiateAuth}
          variant="primary"
          size="small"
        >
          Connect Descript
        </Button>
      </div>
    </div>
  );
};