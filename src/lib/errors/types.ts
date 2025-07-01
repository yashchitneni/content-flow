export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  FILE_SYSTEM = 'FILE_SYSTEM',
  API = 'API',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  userMessage: string;
  technicalMessage?: string;
  retryable: boolean;
  timestamp: Date;
}

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: ErrorType[];
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'ignore' | 'propagate';
  config?: RetryConfig | any;
  fallbackAction?: () => Promise<any>;
}