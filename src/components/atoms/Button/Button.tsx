import React from 'react'
import { ButtonProps } from './Button.types'
import { Spinner } from '../Spinner'

const variantStyles = {
  primary: `
    bg-gradient-button-primary text-white border-none shadow-glow-subtle
    hover:bg-gradient-button-hover hover:scale-102 hover:-translate-y-0.5 hover:shadow-glow
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
    active:scale-98 active:translate-y-0
    disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    focus:ring-offset-white dark:focus:ring-offset-gray-900
    transition-all duration-300 ease-out
  `,
  secondary: `
    glass text-theme-primary border-theme
    hover:scale-102 hover:-translate-y-0.5 hover:shadow-md
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
    active:scale-98 active:translate-y-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:backdrop-filter-none
    focus:ring-offset-white dark:focus:ring-offset-gray-900
    transition-all duration-300 ease-out
  `,
  tertiary: `
    bg-transparent text-theme-secondary border border-theme
    hover:bg-theme-hover hover:text-theme-primary hover:scale-102 hover:-translate-y-0.5
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
    active:scale-98 active:translate-y-0
    disabled:text-theme-disabled disabled:cursor-not-allowed disabled:bg-transparent disabled:transform-none
    focus:ring-offset-white dark:focus:ring-offset-gray-900
    transition-all duration-300 ease-out
  `,
  ghost: `
    bg-transparent text-theme-secondary border border-transparent
    hover:bg-theme-hover hover:text-theme-primary hover:scale-102 hover:-translate-y-0.5
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
    active:scale-98
    disabled:text-theme-disabled disabled:cursor-not-allowed disabled:bg-transparent disabled:border-transparent disabled:transform-none
    focus:ring-offset-white dark:focus:ring-offset-gray-900
    transition-all duration-300 ease-out
  `,
  destructive: `
    bg-error-500 text-white border-none shadow-md
    hover:bg-error-600 hover:scale-102 hover:-translate-y-0.5 hover:shadow-glow-subtle
    focus:outline-none focus:ring-2 focus:ring-error-400 focus:ring-offset-2
    active:scale-98 active:bg-error-700 active:translate-y-0
    disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
    focus:ring-offset-white dark:focus:ring-offset-gray-900
    transition-all duration-300 ease-out
  `,
}

const sizeStyles = {
  sm: 'h-7 px-2 text-xs gap-1 min-w-[56px]',
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
    font-medium rounded-lg 
    transition-all duration-300
    transform-gpu
    touch-manipulation
    select-none
    relative overflow-hidden
  `
  
  const widthStyles = fullWidth ? 'w-full' : ''
  const loadingStyles = loading ? 'cursor-wait' : ''
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${loadingStyles} ${className}`.trim()

  // Ensure minimum tap target size for touch devices
  const touchTargetStyles = (size === 'sm' || size === 'small') ? 'min-h-[44px] md:min-h-[32px]' : ''

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