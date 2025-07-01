import React, { useState, useRef, useEffect } from 'react'
import { TooltipProps } from './Tooltip.types'

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 500,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1'
  }

  const arrowDirection = {
    top: 'border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right: 'border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent'
  }

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      let newPosition = position

      // Check if tooltip would overflow viewport
      if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
        newPosition = 'bottom'
      } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewport.height) {
        newPosition = 'top'
      } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
        newPosition = 'right'
      } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewport.width) {
        newPosition = 'left'
      }

      setActualPosition(newPosition)
    }
  }, [isVisible, position])

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleFocus = () => {
    setIsVisible(true)
  }

  const handleBlur = () => {
    setIsVisible(false)
  }

  return (
    <div 
      className="relative inline-block"
      ref={triggerRef}
      {...props}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
      </div>
      {isVisible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute z-50
            ${positionStyles[actualPosition]}
            ${className}
          `}
        >
          <div className="
            bg-gray-900 text-white 
            text-sm font-normal
            px-3 py-2 
            rounded-md 
            shadow-lg
            max-w-xs
            whitespace-normal
          ">
            {content}
          </div>
          <div 
            className={`
              absolute 
              ${arrowStyles[actualPosition]}
              w-0 h-0 
              border-4 
              ${arrowDirection[actualPosition]}
            `} 
          />
        </div>
      )}
    </div>
  )
}