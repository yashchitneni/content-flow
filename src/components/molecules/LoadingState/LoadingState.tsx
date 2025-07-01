import React from 'react';
import { Spinner } from '../../atoms/Spinner';
import { colors, spacing } from '../../../tokens';

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
  const containerStyles: React.CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: inline ? 0 : spacing[8],
    minHeight: fullScreen ? '100vh' : 'auto',
    width: inline ? 'auto' : '100%'
  };

  const messageStyles: React.CSSProperties = {
    fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
    color: colors.gray[600],
    margin: 0
  };

  return (
    <div style={containerStyles} role="status" aria-live="polite">
      <Spinner size={size} />
      {message && <p style={messageStyles}>{message}</p>}
    </div>
  );
};