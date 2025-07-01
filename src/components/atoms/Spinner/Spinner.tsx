import React from 'react';
import { colors } from '../../../tokens';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 32
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = colors.primary[500],
  className = ''
}) => {
  const spinnerSize = sizes[size];
  const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;
  
  return (
    <svg
      className={className}
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 50 50"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="80, 200"
        strokeDashoffset="0"
        style={{
          transformOrigin: 'center',
          animation: 'dash 1.5s ease-in-out infinite'
        }}
      />
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
          }
        }
      `}</style>
    </svg>
  );
};