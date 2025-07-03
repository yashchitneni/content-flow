import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        transition-all duration-300 ease-out
        ${theme === 'dark' 
          ? 'bg-dark-800 hover:bg-dark-700 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-yellow-500'
        }
        border ${theme === 'dark' ? 'border-dark-200' : 'border-gray-300'}
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${theme === 'dark' ? 'focus:ring-offset-dark-900' : 'focus:ring-offset-white'}
        group
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (⌘⇧L)`}
    >
      <div className="relative w-6 h-6">
        {/* Sun icon - visible in light mode */}
        <svg
          className={`
            absolute inset-0 w-6 h-6
            transition-all duration-300
            ${theme === 'dark' 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        
        {/* Moon icon - visible in dark mode */}
        <svg
          className={`
            absolute inset-0 w-6 h-6
            transition-all duration-300
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          ${theme === 'dark' 
            ? 'bg-yellow-400/10' 
            : 'bg-yellow-500/10'
          }
        `}
      />
    </button>
  );
};