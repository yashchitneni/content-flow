// Browser-compatible logger that mimics Winston's interface
import { WorkflowConfig } from '../config/workflow.config';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: any;
}

class BrowserLogger {
  private level: LogLevel;
  private format: 'json' | 'pretty';
  private logs: LogEntry[] = [];

  constructor(config: WorkflowConfig['logging']) {
    this.level = config.level as LogLevel;
    this.format = config.format;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLog(entry: LogEntry): string {
    if (this.format === 'pretty') {
      let msg = `${entry.timestamp} [${entry.level.toUpperCase()}]: ${entry.message}`;
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        msg += ` ${JSON.stringify(entry.metadata, null, 2)}`;
      }
      return msg;
    }
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, metadata?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.logs.push(entry);
    const formatted = this.formatLog(entry);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'debug':
        console.debug(formatted);
        break;
    }
  }

  error(message: string, metadata?: any): void {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: any): void {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: any): void {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: any): void {
    this.log('debug', message, metadata);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

let logger: BrowserLogger;

export function createLogger(config: WorkflowConfig['logging']): BrowserLogger {
  return new BrowserLogger(config);
}

export function initializeLogger(config: WorkflowConfig['logging']): void {
  logger = createLogger(config);
}

export function getLogger(): BrowserLogger {
  if (!logger) {
    // Create a default logger if not initialized
    logger = new BrowserLogger({ level: 'info', format: 'pretty' });
  }
  return logger;
}

export function logWorkflowStart(workflowName: string, input: any): void {
  getLogger().info(`Starting workflow: ${workflowName}`, { 
    workflow: workflowName,
    inputKeys: Object.keys(input),
  });
}

export function logWorkflowStep(workflowName: string, stepName: string, data?: any): void {
  getLogger().info(`Workflow step: ${workflowName}.${stepName}`, { 
    workflow: workflowName,
    step: stepName,
    data,
  });
}

export function logWorkflowError(workflowName: string, error: Error, context?: any): void {
  getLogger().error(`Workflow error: ${workflowName}`, { 
    workflow: workflowName,
    error: error.message,
    stack: error.stack,
    context,
  });
}

export function logWorkflowComplete(workflowName: string, result: any): void {
  getLogger().info(`Workflow completed: ${workflowName}`, { 
    workflow: workflowName,
    resultKeys: result ? Object.keys(result) : [],
  });
}