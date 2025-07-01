import { AppError, ErrorType, RetryConfig } from '../errors/types';

export interface RetryOptions extends Partial<RetryConfig> {
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  signal?: AbortSignal;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.RATE_LIMIT
  ]
};

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  let lastError: Error;
  let delay = config.initialDelay;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Check if operation was aborted
      if (options.signal?.aborted) {
        throw new Error('Operation aborted');
      }
      
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Check if this is the last attempt
      if (attempt === config.maxAttempts) {
        throw error;
      }
      
      // Check if error is retryable
      if (!shouldRetryError(error as Error, attempt, config)) {
        throw error;
      }
      
      // Call retry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt, error as Error);
      }
      
      // Wait before next attempt
      await sleep(delay);
      
      // Calculate next delay with exponential backoff
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
    }
  }
  
  throw lastError!;
}

export function createRetryableOperation<T>(
  operation: () => Promise<T>,
  defaultOptions?: RetryOptions
) {
  return (overrideOptions?: RetryOptions) => {
    const options = { ...defaultOptions, ...overrideOptions };
    return retry(operation, options);
  };
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return retry(operation, {
    maxAttempts,
    initialDelay: baseDelay,
    backoffMultiplier: 2
  });
}

export async function retryWithJitter<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const withJitter = { ...options };
  const originalOnRetry = options.onRetry;
  
  withJitter.onRetry = (attempt, error) => {
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    const delay = (options.initialDelay || DEFAULT_RETRY_CONFIG.initialDelay) + jitter;
    
    if (originalOnRetry) {
      originalOnRetry(attempt, error);
    }
  };
  
  return retry(operation, withJitter);
}

function shouldRetryError(
  error: Error,
  attempt: number,
  config: RetryConfig & RetryOptions
): boolean {
  // Check custom retry logic
  if (config.shouldRetry) {
    return config.shouldRetry(error, attempt);
  }
  
  // Check if error is an AppError with retryable flag
  if (isAppError(error)) {
    const appError = error as AppError;
    
    // Check if error type is in retryable list
    if (config.retryableErrors && !config.retryableErrors.includes(appError.type)) {
      return false;
    }
    
    return appError.retryable;
  }
  
  // Default retry logic for standard errors
  const retryableMessages = [
    'network',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'rate limit',
    '429',
    '503',
    '502'
  ];
  
  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

function isAppError(error: any): error is AppError {
  return error && 'type' in error && 'severity' in error && 'userMessage' in error;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Circuit breaker implementation
export class CircuitBreaker<T> {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private operation: () => Promise<T>,
    private options: {
      failureThreshold: number;
      resetTimeout: number;
      onStateChange?: (state: 'closed' | 'open' | 'half-open') => void;
    }
  ) {}
  
  async execute(): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.setState('half-open');
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await this.operation();
      
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.options.failureThreshold) {
      this.setState('open');
    }
  }
  
  private reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.setState('closed');
  }
  
  private setState(state: 'closed' | 'open' | 'half-open') {
    if (this.state !== state) {
      this.state = state;
      this.options.onStateChange?.(state);
    }
  }
}