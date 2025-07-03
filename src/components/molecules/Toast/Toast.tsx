import React, { useEffect } from 'react';
import { Icon } from '../../atoms/Icon';
import { ToastProps } from './Toast.types';

const variantIcons = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info-circle'
} as const;

const variantClasses = {
  success: 'border-success-500 bg-success-50 text-success-500',
  error: 'border-error-500 bg-error-50 text-error-500',
  warning: 'border-warning-500 bg-warning-50 text-warning-500',
  info: 'border-info-500 bg-info-50 text-info-500'
} as const;

export const Toast: React.FC<ToastProps> = ({
  variant,
  title,
  message,
  duration = 5000,
  action,
  onClose,
  isClosable = true
}) => {
  useEffect(() => {
    if (duration && duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-md shadow-md bg-white border min-w-[320px] max-w-[480px] transition-all duration-300 relative ${variantClasses[variant]}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon
          name={variantIcons[variant]}
          size="md"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold leading-6 text-gray-900 m-0">{title}</h3>
        {message && <p className="text-sm leading-5 text-gray-700 mt-1">{message}</p>}
        
        {action && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-primary-600 bg-transparent border-none px-2 py-1 rounded cursor-pointer transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      
      {isClosable && onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="absolute top-2 right-2 p-1 bg-transparent border-none rounded cursor-pointer text-gray-500 transition-all duration-150 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        >
          <Icon name="x" size="sm" />
        </button>
      )}
    </div>
  );
};