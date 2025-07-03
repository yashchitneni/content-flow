import React, { useState, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from '../../molecules/Toast';
import { ToastProps, ToastVariant } from '../../molecules/Toast/Toast.types';

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

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div 
          className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 pointer-events-none`}
          aria-live="polite"
        >
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className="pointer-events-auto animate-slide-up"
            >
              <Toast
                {...toast}
                onClose={() => hideToast(toast.id)}
              />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};