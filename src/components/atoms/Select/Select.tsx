// Task #15: Build Transcript Library UI - Select atom component
import React from 'react';
import { SelectProps } from './Select.types';
import { Icon } from '../Icon';

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  size = 'medium',
  disabled = false,
  className = '',
  error = false,
  errorMessage
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };

  const baseClasses = `
    relative w-full rounded-md
    bg-white dark:bg-dark-800
    border ${error ? 'border-red-500' : 'border-gray-300 dark:border-dark-600'}
    text-gray-900 dark:text-white
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-colors duration-200
    appearance-none
    pr-10
  `;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <Icon 
          name="chevron-down" 
          size="sm" 
          className={`text-gray-400 dark:text-dark-400 ${disabled ? 'opacity-50' : ''}`}
        />
      </div>
      
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};