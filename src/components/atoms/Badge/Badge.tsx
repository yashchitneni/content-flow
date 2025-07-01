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
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    error: 'bg-red-100 text-red-700 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  }

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}