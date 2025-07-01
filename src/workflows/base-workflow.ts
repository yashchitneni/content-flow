import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { WorkflowConfig } from '../config/workflow.config';
import { getLogger, logWorkflowStart, logWorkflowComplete, logWorkflowStep, logWorkflowError } from '../lib/logger';
import { createErrorHandler, withRetry, WorkflowError } from '../lib/error-handler';

export interface BaseWorkflowState {
  messages: BaseMessage[];
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseWorkflow<TState extends BaseWorkflowState> {
  protected graph: StateGraph<TState>;
  protected config: WorkflowConfig;
  protected name: string;
  protected errorHandler: ReturnType<typeof createErrorHandler>;
  
  constructor(name: string, config: WorkflowConfig, stateSchema: StateGraphArgs<TState>['channels']) {
    this.name = name;
    this.config = config;
    this.errorHandler = createErrorHandler(name);
    this.graph = new StateGraph<TState>({ channels: stateSchema });
    
    getLogger().info(`Initializing workflow: ${name}`);
  }
  
  protected abstract buildGraph(): void;
  
  public async compile() {
    try {
      this.buildGraph();
      return this.graph.compile();
    } catch (error) {
      this.errorHandler(error as Error, 'compile');
    }
  }
  
  public async execute(input: Partial<TState>): Promise<TState> {
    logWorkflowStart(this.name, input);
    
    try {
      const workflow = await this.compile();
      const result = await workflow.invoke(input as TState);
      
      logWorkflowComplete(this.name, result);
      return result;
    } catch (error) {
      if (error instanceof WorkflowError) {
        throw error;
      }
      this.errorHandler(error as Error, 'execute', { input });
    }
  }
  
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    stepName: string
  ): Promise<T> {
    return withRetry(
      fn,
      this.config.retryConfig,
      { workflowName: this.name, stepName }
    );
  }
  
  protected logStep(stepName: string, data?: any): void {
    logWorkflowStep(this.name, stepName, data);
  }
  
  protected handleStepError(error: Error, stepName: string, state: TState): TState {
    logWorkflowError(this.name, error, { stepName, state });
    
    return {
      ...state,
      error: `Error in ${stepName}: ${error.message}`,
    };
  }
}