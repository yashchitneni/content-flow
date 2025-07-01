import React from 'react'
import { colors, spacing, borders, typography } from '@/tokens'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success'
  fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = `
    px-3 py-2 
    text-base font-normal
    rounded-lg
    border
    transition-all duration-300
    focus:outline-none focus:ring-2
  `

  const variantClasses = {
    default: `
      border-gray-300 
      bg-white 
      text-gray-900
      placeholder-gray-500
      hover:border-gray-400
      focus:border-primary-500 focus:ring-primary-500/20
    `,
    error: `
      border-red-500 
      bg-red-50 
      text-gray-900
      placeholder-gray-500
      focus:border-red-500 focus:ring-red-500/20
    `,
    success: `
      border-green-500 
      bg-green-50 
      text-gray-900
      placeholder-gray-500
      focus:border-green-500 focus:ring-green-500/20
    `
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <input
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`.trim()}
      {...props}
    />
  )
}