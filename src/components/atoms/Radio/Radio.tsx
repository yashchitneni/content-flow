import React from 'react'
import { RadioProps } from './Radio.types'

export const Radio: React.FC<RadioProps> = ({
  checked = false,
  onChange,
  disabled = false,
  error = false,
  label,
  description,
  size = 'medium',
  name,
  value,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  const sizeStyles = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  }

  const dotSizeStyles = {
    small: 'h-1.5 w-1.5',
    medium: 'h-2 w-2',
    large: 'h-2.5 w-2.5'
  }

  const labelSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const baseStyles = `
    rounded-full border-2
    transition-all duration-200
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
    appearance-none
    relative
  `

  const stateStyles = error
    ? `
      border-error-500 
      bg-white
      checked:border-error-500
      focus:ring-error-100
      hover:border-error-600
    `
    : disabled
    ? `
      border-gray-300 
      bg-gray-50
      cursor-not-allowed
      checked:border-gray-400
    `
    : `
      border-gray-300 
      bg-white
      hover:border-gray-400
      checked:border-primary-500
      focus:ring-primary-100
    `

  const radio = (
    <div className="relative inline-flex items-center justify-center">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`${baseStyles} ${stateStyles} ${sizeStyles[size]} ${className}`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        {...props}
      />
      {checked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className={`
              ${dotSizeStyles[size]} 
              rounded-full 
              ${error ? 'bg-error-500' : disabled ? 'bg-gray-400' : 'bg-primary-500'}
            `} 
          />
        </div>
      )}
    </div>
  )

  if (label || description) {
    return (
      <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {radio}
        <div className="flex-1">
          {label && (
            <span className={`block font-medium text-gray-900 ${labelSizeStyles[size]} ${disabled ? 'text-gray-500' : ''}`}>
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-gray-500 mt-1">
              {description}
            </span>
          )}
        </div>
      </label>
    )
  }

  return radio
}