import React from 'react'
import { ProgressProps } from './Progress.types'

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'medium',
  showLabel = false,
  label,
  indeterminate = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeStyles = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  }

  const variantStyles = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500'
  }

  const indeterminateAnimation = indeterminate ? `
    relative overflow-hidden
    before:content-[''] 
    before:absolute 
    before:inset-0 
    before:bg-gradient-to-r 
    before:from-transparent 
    before:via-white/30 
    before:to-transparent
    before:animate-[shimmer_1.5s_infinite]
  ` : ''

  return (
    <div className={`w-full ${className}`} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showLabel && !indeterminate && (
            <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div 
        className={`
          w-full 
          bg-gray-200 
          rounded-full 
          overflow-hidden
          ${sizeStyles[size]}
        `}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label}
      >
        <div 
          className={`
            h-full 
            rounded-full 
            transition-all duration-300 ease-out
            ${variantStyles[variant]}
            ${indeterminateAnimation}
          `}
          style={indeterminate ? { width: '100%' } : { width: `${percentage}%` }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}