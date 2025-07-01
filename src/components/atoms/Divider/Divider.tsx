import React from 'react'
import { DividerProps } from './Divider.types'

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  color = 'gray',
  size = 'medium',
  spacing = 'medium',
  label,
  labelPosition = 'center',
  className = '',
  ...props
}) => {
  const orientationStyles = {
    horizontal: 'w-full',
    vertical: 'h-full'
  }

  const variantStyles = {
    solid: '',
    dashed: orientation === 'horizontal' ? 'border-dashed' : 'border-l-dashed',
    dotted: orientation === 'horizontal' ? 'border-dotted' : 'border-l-dotted'
  }

  const colorStyles = {
    gray: 'border-gray-300',
    primary: 'border-primary-300',
    secondary: 'border-secondary-300'
  }

  const sizeStyles = {
    thin: orientation === 'horizontal' ? 'border-t' : 'border-l',
    medium: orientation === 'horizontal' ? 'border-t-2' : 'border-l-2',
    thick: orientation === 'horizontal' ? 'border-t-4' : 'border-l-4'
  }

  const spacingStyles = {
    none: '',
    small: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    medium: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    large: orientation === 'horizontal' ? 'my-6' : 'mx-6'
  }

  const labelPositionStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end'
  }

  if (label && orientation === 'horizontal') {
    return (
      <div 
        className={`flex items-center ${spacingStyles[spacing]} ${className}`} 
        role="separator"
        {...props}
      >
        <div className={`
          flex-1 
          ${sizeStyles[size]} 
          ${variantStyles[variant]} 
          ${colorStyles[color]}
          ${labelPosition === 'center' || labelPosition === 'end' ? '' : 'hidden'}
        `} />
        <span className={`
          px-4 
          text-sm 
          font-medium 
          text-gray-500
          flex
          ${labelPositionStyles[labelPosition]}
        `}>
          {label}
        </span>
        <div className={`
          flex-1 
          ${sizeStyles[size]} 
          ${variantStyles[variant]} 
          ${colorStyles[color]}
          ${labelPosition === 'center' || labelPosition === 'start' ? '' : 'hidden'}
        `} />
      </div>
    )
  }

  return (
    <hr
      className={`
        border-0
        ${orientationStyles[orientation]}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${colorStyles[color]}
        ${spacingStyles[spacing]}
        ${className}
      `}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  )
}