import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md'
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-full
    transition-colors duration-200
  `

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
    secondary: 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
    success: 'bg-success-100 text-success-700 hover:bg-success-200',
    warning: 'bg-warning-100 text-warning-700 hover:bg-warning-200',
    error: 'bg-error-100 text-error-700 hover:bg-error-200',
    info: 'bg-info-100 text-info-700 hover:bg-info-200'
  }

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}