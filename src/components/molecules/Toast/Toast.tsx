import React, { useEffect } from 'react';
import { Icon } from '../../atoms/Icon';
import { ToastProps } from './Toast.types';
import { toastStyles, getVariantStyles } from './Toast.styles';

const variantIcons = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info-circle'
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

  const variantStyle = getVariantStyles(variant);
  
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        ...toastStyles.container,
        borderColor: variantStyle.borderColor,
        backgroundColor: variantStyle.backgroundColor
      }}
    >
      <div style={toastStyles.iconContainer}>
        <Icon
          name={variantIcons[variant]}
          size="md"
          color={variantStyle.iconColor}
        />
      </div>
      
      <div style={toastStyles.content}>
        <h3 style={toastStyles.title}>{title}</h3>
        {message && <p style={toastStyles.message}>{message}</p>}
        
        {action && (
          <div style={toastStyles.actions}>
            <button
              onClick={action.onClick}
              style={toastStyles.actionButton}
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
          style={toastStyles.closeButton}
        >
          <Icon name="x" size="sm" />
        </button>
      )}
    </div>
  );
};