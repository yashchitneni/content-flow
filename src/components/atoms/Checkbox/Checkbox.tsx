import React from 'react'
import { CheckboxProps } from './Checkbox.types'
import { Icon } from '../Icon'

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
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
  const checkboxRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const sizeStyles = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  }

  const labelSizeStyles = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const baseStyles = `
    rounded border-2
    transition-all duration-200
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `

  const stateStyles = error
    ? `
      border-error-500 
      bg-white
      checked:bg-error-500 checked:border-error-500
      focus:ring-error-100
      hover:border-error-600
    `
    : disabled
    ? `
      border-gray-300 
      bg-gray-50
      cursor-not-allowed
      checked:bg-gray-400 checked:border-gray-400
    `
    : `
      border-gray-300 
      bg-white
      hover:border-gray-400
      checked:bg-primary-500 checked:border-primary-500
      focus:ring-primary-100
      indeterminate:bg-primary-500 indeterminate:border-primary-500
    `

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(e)
    }
  }

  const checkbox = (
    <div className="relative inline-flex items-center">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={`${baseStyles} ${stateStyles} ${sizeStyles[size]} ${className} appearance-none`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        {...props}
      />
      {(checked || indeterminate) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Icon
            name={indeterminate ? 'minus' : 'check'}
            size={size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'}
            color="white"
          />
        </div>
      )}
    </div>
  )

  if (label || description) {
    return (
      <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        {checkbox}
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

  return checkbox
}