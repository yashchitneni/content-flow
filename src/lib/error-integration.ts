import { errorHandler, AppError, ErrorType } from './errors';
import { logger } from './logging';
import { useToast } from '../components/organisms/ToastContainer';

// Configure error handler with logging
errorHandler.configure({
  onLog: (error: AppError, context?: any) => {
    logger.logAppError(error, context);
  },
  onError: (error: AppError) => {
    // This would be called in a React component context
    // For now, we'll just log it
    console.error('Global error handler:', error);
  },
  defaultRecoveryStrategies: new Map([
    [ErrorType.NETWORK, {
      type: 'retry',
      config: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2
      }
    }],
    [ErrorType.RATE_LIMIT, {
      type: 'retry',
      config: {
        maxAttempts: 5,
        initialDelay: 60000, // 1 minute
        maxDelay: 300000, // 5 minutes
        backoffMultiplier: 1
      }
    }]
  ])
});

// Hook for error handling in React components
export function useErrorHandler() {
  const toast = useToast();
  
  const handleError = (error: Error | AppError) => {
    // Log the error
    errorHandler.handle(error);
    
    // Show appropriate toast based on error type
    if ('type' in error && 'userMessage' in error) {
      const appError = error as AppError;
      
      switch (appError.severity) {
        case 'LOW':
          toast.showInfo(appError.userMessage);
          break;
        case 'MEDIUM':
          toast.showWarning(appError.userMessage);
          break;
        case 'HIGH':
        case 'CRITICAL':
          toast.showError(
            appError.userMessage,
            appError.retryable ? 'This operation can be retried.' : undefined
          );
          break;
      }
    } else {
      // Generic error
      toast.showError(
        'An unexpected error occurred',
        'Please try again or contact support if the issue persists.'
      );
    }
  };
  
  return { handleError };
}

// Tauri command error wrapper
export async function invokeTauriCommand<T>(
  command: string,
  args?: any,
  options?: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<T> {
  try {
    // This would integrate with Tauri's invoke function
    // For now, we'll simulate it
    const result = await simulateTauriCommand<T>(command, args);
    
    if (options?.successMessage) {
      // Show success toast
      console.log('Success:', options.successMessage);
    }
    
    return result;
  } catch (error) {
    logger.error(`Tauri command failed: ${command}`, error as Error, { args });
    
    // Transform to AppError if needed
    const appError = errorHandler['normalizeError'](error as Error);
    
    if (options?.errorMessage) {
      appError.userMessage = options.errorMessage;
    }
    
    throw appError;
  }
}

// Simulate Tauri command for demo
async function simulateTauriCommand<T>(command: string, args?: any): Promise<T> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate success
  return {} as T;
}

// Export everything for easy access
export * from './errors';
export * from './retry';
export * from './logging';

// Re-export commonly used components
export { ToastProvider, useToast } from '../components/organisms/ToastContainer';
export { ErrorBoundary, withErrorBoundary } from '../components/organisms/ErrorBoundary';
export { ProgressModal } from '../components/molecules/ProgressModal';
export { LoadingState } from '../components/molecules/LoadingState';