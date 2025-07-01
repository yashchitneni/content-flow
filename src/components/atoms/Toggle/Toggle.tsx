import React from 'react'
import { ToggleProps } from './Toggle.types'

export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  error = false,
  label,
  description,
  size = 'medium',
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  const sizeStyles = {
    small: {
      track: 'h-5 w-9',
      thumb: 'h-3 w-3',
      translate: 'translate-x-4'
    },
    medium: {
      track: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: 'translate-x-5'
    },
    large: {
      track: 'h-7 w-14',
      thumb: 'h-5 w-5',
      translate: 'translate-x-7'
    }
  }

  const labelSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const trackBaseStyles = `
    relative inline-block
    rounded-full
    transition-colors duration-200
    cursor-pointer
  `

  const trackStateStyles = error
    ? checked
      ? 'bg-error-500'
      : 'bg-gray-200'
    : disabled
    ? checked
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-gray-200 cursor-not-allowed'
    : checked
    ? 'bg-primary-500'
    : 'bg-gray-200 hover:bg-gray-300'

  const thumbStyles = `
    absolute top-1 left-1
    bg-white rounded-full
    shadow-sm
    transition-transform duration-200
    ${checked ? sizeStyles[size].translate : 'translate-x-0'}
  `

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e)
    }
  }

  const toggle = (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        {...props}
      />
      <div 
        className={`${trackBaseStyles} ${trackStateStyles} ${sizeStyles[size].track} ${className}`}
        onClick={() => {
          if (!disabled && onChange) {
            const event = {
              target: { checked: !checked }
            } as React.ChangeEvent<HTMLInputElement>
            onChange(event)
          }
        }}
      >
        <span className={`${thumbStyles} ${sizeStyles[size].thumb}`} />
      </div>
    </div>
  )

  if (label || description) {
    return (
      <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {toggle}
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

  return toggle
}