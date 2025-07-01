import React from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { AuthStatus } from '../molecules/AuthStatus';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
}) => {
  const { authState, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication status...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to ContentFlow
            </h1>
            <p className="text-gray-600">
              Connect your Descript account to get started
            </p>
          </div>
          
          <AuthStatus />
          
          {fallback && (
            <div className="mt-6">
              {fallback}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};