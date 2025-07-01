import { getLogger } from './logger';
import { WorkflowConfig } from '../config/workflow.config';

export class WorkflowError extends Error {
  constructor(
    message: string,
    public workflowName: string,
    public stepName?: string,
    public cause?: Error,
    public context?: any
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export class RetryableError extends WorkflowError {
  constructor(
    message: string,
    workflowName: string,
    stepName?: string,
    cause?: Error,
    context?: any
  ) {
    super(message, workflowName, stepName, cause, context);
    this.name = 'RetryableError';
  }
}

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  context: { workflowName: string; stepName: string }
): Promise<T> {
  let lastError: Error | undefined;
  let delay = options.initialDelay;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (!(error instanceof RetryableError) && attempt === options.maxRetries) {
        throw error;
      }
      
      getLogger().warn(`Retry attempt ${attempt + 1}/${options.maxRetries} for ${context.workflowName}.${context.stepName}`, {
        error: lastError.message,
        delay,
      });
      
      if (attempt < options.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
      }
    }
  }
  
  throw new WorkflowError(
    `Failed after ${options.maxRetries} retries`,
    context.workflowName,
    context.stepName,
    lastError
  );
}

export function createErrorHandler(workflowName: string) {
  return (error: Error, stepName?: string, context?: any): never => {
    const workflowError = error instanceof WorkflowError 
      ? error 
      : new WorkflowError(
          error.message,
          workflowName,
          stepName,
          error,
          context
        );
    
    getLogger().error(`Workflow error in ${workflowName}${stepName ? `.${stepName}` : ''}`, {
      error: workflowError.message,
      stack: workflowError.stack,
      cause: workflowError.cause?.message,
      context: workflowError.context,
    });
    
    throw workflowError;
  };
}

export function gracefulShutdown(reason: string): void {
  getLogger().info(`Graceful shutdown initiated: ${reason}`);
  
  // Add any cleanup logic here
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT received'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM received'));
process.on('uncaughtException', (error) => {
  getLogger().error('Uncaught exception', { error: error.message, stack: error.stack });
  gracefulShutdown('Uncaught exception');
});
process.on('unhandledRejection', (reason, promise) => {
  getLogger().error('Unhandled rejection', { reason, promise });
  gracefulShutdown('Unhandled rejection');
});