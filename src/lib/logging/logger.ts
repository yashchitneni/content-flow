import { AppError } from '../errors/types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | AppError;
  userId?: string;
  sessionId?: string;
  component?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  metadata?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;
  
  private constructor() {
    this.config = {
      minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      batchSize: 50,
      flushInterval: 5000
    };
    
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }
  
  static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }
  
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.startFlushTimer();
  }
  
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  error(message: string, error?: Error | AppError, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...context, error: this.serializeError(error) }, error);
  }
  
  fatal(message: string, error?: Error | AppError, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, { ...context, error: this.serializeError(error) }, error);
    // Force flush on fatal errors
    this.flush();
  }
  
  logAppError(error: AppError, context?: Record<string, any>): void {
    const level = this.getLogLevelFromError(error);
    this.log(
      level,
      error.userMessage,
      {
        ...context,
        errorType: error.type,
        errorCode: error.code,
        errorContext: error.context,
        technicalMessage: error.technicalMessage
      },
      error
    );
  }
  
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error | AppError
  ): void {
    if (level < this.config.minLevel) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: {
        ...this.config.metadata,
        ...context
      },
      error,
      sessionId: this.sessionId,
      component: this.getCallerComponent()
    };
    
    // Log to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }
    
    // Add to buffer for remote logging
    if (this.config.enableRemote) {
      this.logBuffer.push(entry);
      
      // Flush if buffer is full
      if (this.logBuffer.length >= this.config.batchSize) {
        this.flush();
      }
    }
  }
  
  private logToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelName = levelNames[entry.level];
    const timestamp = entry.timestamp.toISOString();
    
    const consoleMethod = this.getConsoleMethod(entry.level);
    const prefix = `[${timestamp}] [${levelName}]`;
    
    if (entry.component) {
      console[consoleMethod](`${prefix} [${entry.component}]`, entry.message);
    } else {
      console[consoleMethod](prefix, entry.message);
    }
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      console[consoleMethod]('Context:', entry.context);
    }
    
    if (entry.error) {
      console[consoleMethod]('Error:', entry.error);
    }
  }
  
  private getConsoleMethod(level: LogLevel): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'log';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warn';
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return 'error';
      default:
        return 'log';
    }
  }
  
  private getLogLevelFromError(error: AppError): LogLevel {
    switch (error.severity) {
      case 'LOW':
        return LogLevel.INFO;
      case 'MEDIUM':
        return LogLevel.WARN;
      case 'HIGH':
        return LogLevel.ERROR;
      case 'CRITICAL':
        return LogLevel.FATAL;
      default:
        return LogLevel.ERROR;
    }
  }
  
  private serializeError(error?: Error | AppError): any {
    if (!error) return undefined;
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(this.isAppError(error) && {
        type: error.type,
        severity: error.severity,
        code: error.code,
        context: error.context,
        userMessage: error.userMessage,
        technicalMessage: error.technicalMessage,
        retryable: error.retryable
      })
    };
  }
  
  private isAppError(error: any): error is AppError {
    return error && 'type' in error && 'severity' in error && 'userMessage' in error;
  }
  
  private getCallerComponent(): string | undefined {
    // In a real implementation, this would extract the component name
    // from the stack trace or be set via a context
    return undefined;
  }
  
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private startFlushTimer(): void {
    if (this.config.enableRemote && this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }
  
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }
    
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    
    if (!this.config.remoteEndpoint) {
      console.warn('Remote logging enabled but no endpoint configured');
      return;
    }
    
    try {
      // In a real implementation, this would send logs to a remote service
      // For now, we'll just simulate it
      console.log(`Would send ${logsToSend.length} logs to ${this.config.remoteEndpoint}`);
    } catch (error) {
      console.error('Failed to send logs to remote endpoint:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToSend);
    }
  }
  
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (message: string, context?: Record<string, any>) => 
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, any>) => 
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, any>) => 
  logger.warn(message, context);

export const logError = (message: string, error?: Error | AppError, context?: Record<string, any>) => 
  logger.error(message, error, context);

export const logFatal = (message: string, error?: Error | AppError, context?: Record<string, any>) => 
  logger.fatal(message, error, context);