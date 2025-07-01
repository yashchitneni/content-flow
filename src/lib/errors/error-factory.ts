import { ErrorType, ErrorSeverity, AppError, ErrorContext } from './types';

export class AppErrorFactory {
  static create(
    type: ErrorType,
    message: string,
    userMessage: string,
    options?: {
      severity?: ErrorSeverity;
      code?: string;
      context?: Record<string, any>;
      retryable?: boolean;
      cause?: Error;
    }
  ): AppError {
    const error = new Error(message) as AppError;
    
    error.type = type;
    error.severity = options?.severity || this.getDefaultSeverity(type);
    error.code = options?.code;
    error.context = options?.context;
    error.userMessage = userMessage;
    error.technicalMessage = message;
    error.retryable = options?.retryable ?? this.isRetryableByDefault(type);
    error.timestamp = new Date();
    error.cause = options?.cause;
    
    return error;
  }

  static networkError(
    message: string,
    userMessage: string = 'Network connection failed. Please check your internet connection.',
    context?: Record<string, any>
  ): AppError {
    return this.create(ErrorType.NETWORK, message, userMessage, {
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      context
    });
  }

  static validationError(
    field: string,
    message: string,
    userMessage?: string
  ): AppError {
    return this.create(
      ErrorType.VALIDATION,
      `Validation failed for field: ${field} - ${message}`,
      userMessage || `Invalid ${field}. ${message}`,
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        context: { field }
      }
    );
  }

  static fileSystemError(
    operation: string,
    path: string,
    message: string,
    userMessage?: string
  ): AppError {
    return this.create(
      ErrorType.FILE_SYSTEM,
      `File system error during ${operation}: ${message}`,
      userMessage || `Unable to ${operation} file. Please check permissions.`,
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        context: { operation, path }
      }
    );
  }

  static apiError(
    endpoint: string,
    statusCode: number,
    message: string,
    userMessage?: string
  ): AppError {
    const defaultUserMessage = this.getApiErrorMessage(statusCode);
    return this.create(
      ErrorType.API,
      `API error at ${endpoint}: ${statusCode} - ${message}`,
      userMessage || defaultUserMessage,
      {
        severity: this.getApiErrorSeverity(statusCode),
        code: `API_${statusCode}`,
        retryable: this.isRetryableStatusCode(statusCode),
        context: { endpoint, statusCode }
      }
    );
  }

  static authError(
    message: string,
    userMessage: string = 'Authentication failed. Please check your credentials.'
  ): AppError {
    return this.create(ErrorType.AUTH, message, userMessage, {
      severity: ErrorSeverity.HIGH,
      retryable: false
    });
  }

  static permissionError(
    resource: string,
    action: string,
    userMessage?: string
  ): AppError {
    return this.create(
      ErrorType.PERMISSION,
      `Permission denied for ${action} on ${resource}`,
      userMessage || `You don't have permission to ${action} this ${resource}.`,
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        context: { resource, action }
      }
    );
  }

  static timeoutError(
    operation: string,
    timeoutMs: number,
    userMessage?: string
  ): AppError {
    return this.create(
      ErrorType.TIMEOUT,
      `Operation '${operation}' timed out after ${timeoutMs}ms`,
      userMessage || 'Operation took too long. Please try again.',
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        context: { operation, timeoutMs }
      }
    );
  }

  static rateLimitError(
    service: string,
    retryAfter?: number,
    userMessage?: string
  ): AppError {
    const defaultMessage = retryAfter
      ? `Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
      : 'Too many requests. Please try again later.';
    
    return this.create(
      ErrorType.RATE_LIMIT,
      `Rate limit exceeded for ${service}`,
      userMessage || defaultMessage,
      {
        severity: ErrorSeverity.LOW,
        retryable: true,
        context: { service, retryAfter }
      }
    );
  }

  private static getDefaultSeverity(type: ErrorType): ErrorSeverity {
    const severityMap: Record<ErrorType, ErrorSeverity> = {
      [ErrorType.NETWORK]: ErrorSeverity.MEDIUM,
      [ErrorType.VALIDATION]: ErrorSeverity.LOW,
      [ErrorType.FILE_SYSTEM]: ErrorSeverity.MEDIUM,
      [ErrorType.API]: ErrorSeverity.MEDIUM,
      [ErrorType.AUTH]: ErrorSeverity.HIGH,
      [ErrorType.PERMISSION]: ErrorSeverity.MEDIUM,
      [ErrorType.TIMEOUT]: ErrorSeverity.MEDIUM,
      [ErrorType.RATE_LIMIT]: ErrorSeverity.LOW,
      [ErrorType.UNKNOWN]: ErrorSeverity.HIGH
    };
    
    return severityMap[type] || ErrorSeverity.MEDIUM;
  }

  private static isRetryableByDefault(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.RATE_LIMIT
    ];
    
    return retryableTypes.includes(type);
  }

  private static isRetryableStatusCode(statusCode: number): boolean {
    return statusCode === 429 || statusCode === 503 || statusCode >= 500;
  }

  private static getApiErrorMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please sign in.',
      403: 'Access denied. You don\'t have permission for this action.',
      404: 'Requested resource not found.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable. Please try again.',
      503: 'Service unavailable. Please try again later.'
    };
    
    return messages[statusCode] || 'An unexpected error occurred. Please try again.';
  }

  private static getApiErrorSeverity(statusCode: number): ErrorSeverity {
    if (statusCode >= 500) return ErrorSeverity.HIGH;
    if (statusCode === 401 || statusCode === 403) return ErrorSeverity.HIGH;
    if (statusCode === 429) return ErrorSeverity.LOW;
    return ErrorSeverity.MEDIUM;
  }
}