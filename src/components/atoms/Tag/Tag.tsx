import React from 'react'

export interface TagProps {
  children: React.ReactNode
  onRemove?: () => void
  color?: 'primary' | 'secondary' | 'gray'
}

export const Tag: React.FC<TagProps> = ({
  children,
  onRemove,
  color = 'gray'
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
    secondary: 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }

  return (
    <span className={`
      inline-flex items-center gap-1 
      px-2 py-1 
      text-sm font-medium 
      rounded-md 
      transition-colors duration-200
      ${colorClasses[color]}
    `}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 -mr-1 h-4 w-4 rounded hover:bg-black/10 flex items-center justify-center"
          aria-label="Remove tag"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M8.707 3.293a1 1 0 00-1.414 0L6 4.586 4.707 3.293a1 1 0 00-1.414 1.414L4.586 6 3.293 7.293a1 1 0 101.414 1.414L6 7.414l1.293 1.293a1 1 0 001.414-1.414L7.414 6l1.293-1.293a1 1 0 000-1.414z" />
          </svg>
        </button>
      )}
    </span>
  )
}