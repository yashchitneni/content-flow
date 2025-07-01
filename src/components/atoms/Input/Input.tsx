import React from 'react'
import { InputProps } from './Input.types'

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  variant = 'default',
  icon,
  maxLength,
  fullWidth = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const baseClasses = `
    h-10 px-3 py-2 
    text-base font-normal text-gray-900
    bg-white
    rounded-lg
    border
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-0
    placeholder:text-gray-500
  `

  const stateClasses = error
    ? `
      border-error-500 
      focus:border-error-500 focus:ring-error-100
      hover:border-error-600
    `
    : disabled
    ? `
      bg-gray-50 
      text-gray-500 
      border-gray-200
      cursor-not-allowed
      placeholder:text-gray-400
    `
    : `
      border-gray-300 
      hover:border-gray-400
      focus:border-primary-500 focus:ring-primary-100
    `

  const widthClass = fullWidth ? 'w-full' : ''
  const iconPaddingClass = icon ? 'pl-10' : ''

  const inputElement = (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      className={`${baseClasses} ${stateClasses} ${widthClass} ${iconPaddingClass} ${className}`.trim()}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid || error}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  )

  if (icon) {
    return (
      <div className={`relative ${widthClass}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </div>
        {inputElement}
      </div>
    )
  }

  return inputElement
}