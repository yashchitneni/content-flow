import React from 'react';
import { Spinner } from '../../atoms/Spinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  inline?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  inline = false
}) => {
  const containerClasses = [
    inline ? 'inline-flex' : 'flex',
    'flex-col items-center justify-center gap-3',
    inline ? '' : 'p-8',
    fullScreen ? 'min-h-screen' : 'min-h-0',
    inline ? 'w-auto' : 'w-full'
  ].join(' ');

  const messageSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <Spinner size={size} />
      {message && <p className={`${messageSizeClasses[size]} text-gray-600 m-0`}>{message}</p>}
    </div>
  );
};