import { AppError, ErrorType, ErrorSeverity, ErrorRecoveryStrategy, RetryConfig } from './types';
import { AppErrorFactory } from './error-factory';

export type ErrorHandler = (error: AppError) => void;
export type ErrorLogger = (error: AppError, context?: any) => void;

interface ErrorHandlerConfig {
  onError?: ErrorHandler;
  onLog?: ErrorLogger;
  defaultRecoveryStrategies?: Map<ErrorType, ErrorRecoveryStrategy>;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private handlers: Map<ErrorType, ErrorHandler[]> = new Map();
  private config: ErrorHandlerConfig = {};

  private constructor() {}

  static getInstance(): GlobalErrorHandler {
    if (!this.instance) {
      this.instance = new GlobalErrorHandler();
    }
    return this.instance;
  }

  configure(config: ErrorHandlerConfig): void {
    this.config = { ...this.config, ...config };
  }

  registerHandler(type: ErrorType, handler: ErrorHandler): void {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  async handle(error: Error | AppError, context?: any): Promise<void> {
    const appError = this.normalizeError(error);
    
    // Log the error
    if (this.config.onLog) {
      this.config.onLog(appError, context);
    }
    
    // Execute type-specific handlers
    const handlers = this.handlers.get(appError.type) || [];
    for (const handler of handlers) {
      try {
        handler(appError);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }
    
    // Execute global handler
    if (this.config.onError) {
      this.config.onError(appError);
    }
    
    // Apply recovery strategy if configured
    const strategy = this.config.defaultRecoveryStrategies?.get(appError.type);
    if (strategy) {
      await this.applyRecoveryStrategy(appError, strategy);
    }
  }

  async handleWithRecovery<T>(
    operation: () => Promise<T>,
    strategy: ErrorRecoveryStrategy,
    context?: any
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const appError = this.normalizeError(error as Error);
      
      if (strategy.type === 'retry' && appError.retryable) {
        return await this.retryOperation(operation, strategy.config as RetryConfig);
      } else if (strategy.type === 'fallback' && strategy.fallbackAction) {
        return await strategy.fallbackAction();
      } else if (strategy.type === 'ignore') {
        return null as any;
      }
      
      // Propagate the error
      await this.handle(appError, context);
      throw appError;
    }
  }

  private normalizeError(error: Error | AppError): AppError {
    if (this.isAppError(error)) {
      return error;
    }
    
    // Convert standard errors to AppError
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return AppErrorFactory.networkError(error.message);
    }
    
    if (error.name === 'ValidationError') {
      return AppErrorFactory.validationError('field', error.message);
    }
    
    if (error.name === 'TimeoutError') {
      return AppErrorFactory.timeoutError('operation', 0);
    }
    
    // Default to unknown error
    return AppErrorFactory.create(
      ErrorType.UNKNOWN,
      error.message,
      'An unexpected error occurred. Please try again.',
      {
        severity: ErrorSeverity.HIGH,
        retryable: false,
        cause: error
      }
    );
  }

  private isAppError(error: any): error is AppError {
    return error.type && error.severity && error.userMessage && error.timestamp;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error;
    let delay = config.initialDelay;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === config.maxAttempts) {
          throw error;
        }
        
        // Check if error is retryable
        if (config.retryableErrors) {
          const appError = this.normalizeError(error as Error);
          if (!config.retryableErrors.includes(appError.type)) {
            throw error;
          }
        }
        
        // Wait before next attempt
        await this.delay(delay);
        
        // Calculate next delay with backoff
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
    
    throw lastError!;
  }

  private async applyRecoveryStrategy(
    error: AppError,
    strategy: ErrorRecoveryStrategy
  ): Promise<void> {
    switch (strategy.type) {
      case 'retry':
        // Retry logic would be handled at the operation level
        break;
      case 'fallback':
        if (strategy.fallbackAction) {
          await strategy.fallbackAction();
        }
        break;
      case 'ignore':
        // Do nothing
        break;
      case 'propagate':
      default:
        throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Convenience functions
export const errorHandler = GlobalErrorHandler.getInstance();

export function handleError(error: Error | AppError, context?: any): Promise<void> {
  return errorHandler.handle(error, context);
}

export function withErrorHandling<T>(
  operation: () => Promise<T>,
  strategy?: ErrorRecoveryStrategy
): Promise<T> {
  return errorHandler.handleWithRecovery(
    operation,
    strategy || { type: 'propagate' }
  );
}