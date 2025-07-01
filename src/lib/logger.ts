import winston from 'winston';
import { WorkflowConfig } from '../config/workflow.config';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const prettyFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

export function createLogger(config: WorkflowConfig['logging']): winston.Logger {
  const formats = [];
  
  formats.push(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }));
  formats.push(errors({ stack: true }));
  
  if (config.format === 'pretty') {
    formats.push(colorize());
    formats.push(prettyFormat);
  } else {
    formats.push(json());
  }
  
  return winston.createLogger({
    level: config.level,
    format: combine(...formats),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ 
        filename: 'workflow-errors.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'workflow-combined.log' 
      }),
    ],
  });
}

let logger: winston.Logger;

export function initializeLogger(config: WorkflowConfig['logging']): void {
  logger = createLogger(config);
}

export function getLogger(): winston.Logger {
  if (!logger) {
    throw new Error('Logger not initialized. Call initializeLogger first.');
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