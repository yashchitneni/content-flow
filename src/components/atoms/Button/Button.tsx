import React from 'react'
import { ButtonProps } from './Button.types'
import { Spinner } from '../Spinner'

const variantStyles = {
  primary: `
    bg-primary-500 text-white border-none
    hover:bg-primary-600 hover:-translate-y-px
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
    active:bg-primary-700 active:translate-y-0
    disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none
  `,
  secondary: `
    bg-secondary-500 text-white border-none
    hover:bg-secondary-600 hover:-translate-y-px
    focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2
    active:bg-secondary-700 active:translate-y-0
    disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none
  `,
  tertiary: `
    bg-gray-100 text-gray-900 border border-gray-300
    hover:bg-gray-200 hover:-translate-y-px
    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
    active:bg-gray-300 active:translate-y-0
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none
  `,
  ghost: `
    bg-transparent text-gray-700 border border-transparent
    hover:bg-gray-100 hover:border-gray-200
    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
    active:bg-gray-200
    disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-transparent
  `,
  destructive: `
    bg-error-500 text-white border-none
    hover:bg-red-600 hover:-translate-y-px
    focus:outline-none focus:ring-2 focus:ring-error-400 focus:ring-offset-2
    active:bg-red-700 active:translate-y-0
    disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none
  `,
}

const sizeStyles = {
  small: 'h-8 px-3 text-sm gap-2 min-w-[64px]',
  medium: 'h-10 px-4 text-base gap-2 min-w-[80px]',
  large: 'h-12 px-6 text-lg gap-3 min-w-[96px]',
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
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center 
    font-medium rounded-md 
    transition-all duration-300
    transform-gpu
    touch-manipulation
    select-none
  `
  
  const widthStyles = fullWidth ? 'w-full' : ''
  const loadingStyles = loading ? 'cursor-wait' : ''
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${loadingStyles} ${className}`.trim()

  // Ensure minimum tap target size for touch devices
  const touchTargetStyles = size === 'small' ? 'min-h-[44px] md:min-h-[32px]' : ''

  return (
    <button
      type={type}
      className={`${combinedStyles} ${touchTargetStyles}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" color="currentColor" />
          {children && <span className="opacity-70">{children}</span>}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}