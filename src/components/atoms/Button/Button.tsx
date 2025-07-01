import React from 'react'
import { ButtonProps } from './Button.types'

const variantStyles = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400',
  tertiary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
  destructive: 'bg-error-500 text-white hover:bg-red-600 focus:ring-error-400',
}

const sizeStyles = {
  small: 'h-8 px-3 text-sm',
  medium: 'h-10 px-4 text-base',
  large: 'h-12 px-6 text-lg',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  onClick,
  children,
  type = 'button',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-normal focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const widthStyles = fullWidth ? 'w-full' : ''
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`

  return (
    <button
      type={type}
      className={combinedStyles}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}