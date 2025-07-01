import React, { useState, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from '../../molecules/Toast';
import { ToastProps, ToastVariant } from '../../molecules/Toast/Toast.types';
import { zIndex, spacing, animation } from '../../../tokens';

interface ToastContextValue {
  showToast: (options: Omit<ToastProps, 'id'>) => string;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const showToast = useCallback((options: Omit<ToastProps, 'id'>): string => {
    const id = generateId();
    const newToast: ToastProps = { ...options, id };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      // Keep only the latest maxToasts
      return updated.slice(-maxToasts);
    });
    
    return id;
  }, [maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string): string => {
    return showToast({ variant: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string): string => {
    return showToast({ variant: 'error', title, message, duration: 0 }); // Errors don't auto-dismiss
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string): string => {
    return showToast({ variant: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string): string => {
    return showToast({ variant: 'info', title, message });
  }, [showToast]);

  const contextValue: ToastContextValue = {
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  const positionStyles = {
    'top-right': { top: spacing[4], right: spacing[4] },
    'top-left': { top: spacing[4], left: spacing[4] },
    'bottom-right': { bottom: spacing[4], right: spacing[4] },
    'bottom-left': { bottom: spacing[4], left: spacing[4] },
    'top-center': { top: spacing[4], left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: spacing[4], left: '50%', transform: 'translateX(-50%)' }
  };

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    zIndex: zIndex.notification,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    pointerEvents: 'none'
  };

  const toastWrapperStyles: React.CSSProperties = {
    pointerEvents: 'auto',
    animation: `slideIn ${animation.duration.normal} ${animation.easing.out}`
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div style={containerStyles} aria-live="polite">
          {toasts.map(toast => (
            <div key={toast.id} style={toastWrapperStyles}>
              <Toast
                {...toast}
                onClose={() => hideToast(toast.id)}
              />
            </div>
          ))}
        </div>,
        document.body
      )}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};