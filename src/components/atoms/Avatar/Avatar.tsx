import React from 'react'
import { AvatarProps } from './Avatar.types'
import { Icon } from '../Icon'

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'medium',
  variant = 'circle',
  status,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false)

  const sizeStyles = {
    small: 'h-8 w-8 text-xs',
    medium: 'h-10 w-10 text-sm',
    large: 'h-12 w-12 text-base',
    xlarge: 'h-16 w-16 text-lg'
  }

  const variantStyles = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  }

  const statusSizeStyles = {
    small: 'h-2 w-2',
    medium: 'h-2.5 w-2.5',
    large: 'h-3 w-3',
    xlarge: 'h-4 w-4'
  }

  const statusPositionStyles = {
    small: 'bottom-0 right-0',
    medium: 'bottom-0 right-0',
    large: 'bottom-0 right-0',
    xlarge: 'bottom-0.5 right-0.5'
  }

  const statusColorStyles = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    busy: 'bg-warning-500',
    away: 'bg-warning-400'
  }

  const getInitials = (name: string) => {
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
  }

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${variantStyles[variant]}`}
          onError={() => setImageError(true)}
        />
      )
    }

    if (name) {
      return (
        <div className={`
          w-full h-full 
          flex items-center justify-center 
          bg-primary-500 text-white 
          font-medium
          ${variantStyles[variant]}
        `}>
          {getInitials(name)}
        </div>
      )
    }

    return (
      <div className={`
        w-full h-full 
        flex items-center justify-center 
        bg-gray-200 text-gray-500
        ${variantStyles[variant]}
      `}>
        <Icon name="user" size={size === 'small' ? 'sm' : size === 'xlarge' ? 'lg' : 'md'} />
      </div>
    )
  }

  return (
    <div 
      className={`
        relative inline-block 
        ${sizeStyles[size]} 
        ${className}
      `}
      {...props}
    >
      {renderContent()}
      {status && (
        <span 
          className={`
            absolute 
            ${statusPositionStyles[size]}
            ${statusSizeStyles[size]} 
            ${statusColorStyles[status]}
            rounded-full
            ring-2 ring-white
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}