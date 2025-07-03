import { z } from 'zod';

export const WorkflowConfigSchema = z.object({
  aiProvider: z.enum(['openai', 'anthropic']).default('openai'),
  apiKeys: z.object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
  }),
  models: z.object({
    analysis: z.string().default('gpt-4-turbo-preview'),
    generation: z.string().default('gpt-4-turbo-preview'),
    summarization: z.string().default('gpt-3.5-turbo'),
  }),
  temperature: z.object({
    analysis: z.number().min(0).max(2).default(0.3),
    generation: z.number().min(0).max(2).default(0.7),
    summarization: z.number().min(0).max(2).default(0.2),
  }),
  maxTokens: z.object({
    analysis: z.number().default(2000),
    generation: z.number().default(4000),
    summarization: z.number().default(1000),
  }),
  retryConfig: z.object({
    maxRetries: z.number().default(3),
    initialDelay: z.number().default(1000),
    maxDelay: z.number().default(10000),
    backoffMultiplier: z.number().default(2),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'pretty']).default('pretty'),
  }),
});

export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

// Browser-compatible environment variable access
const getEnvVar = (key: string): string | undefined => {
  // In a browser environment, these would typically come from:
  // 1. Build-time environment variables (Vite's import.meta.env)
  // 2. Runtime configuration loaded from a server
  // 3. Local storage for development
  // For now, we'll use empty strings to avoid errors
  return undefined;
};

export const defaultConfig: WorkflowConfig = {
  aiProvider: 'openai',
  apiKeys: {
    openai: getEnvVar('OPENAI_API_KEY'),
    anthropic: getEnvVar('ANTHROPIC_API_KEY'),
  },
  models: {
    analysis: 'gpt-4-turbo-preview',
    generation: 'gpt-4-turbo-preview',
    summarization: 'gpt-3.5-turbo',
  },
  temperature: {
    analysis: 0.3,
    generation: 0.7,
    summarization: 0.2,
  },
  maxTokens: {
    analysis: 2000,
    generation: 4000,
    summarization: 1000,
  },
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  logging: {
    level: 'info',
    format: 'pretty',
  },
};

export function loadConfig(overrides?: Partial<WorkflowConfig>): WorkflowConfig {
  const config = {
    ...defaultConfig,
    ...overrides,
  };
  
  return WorkflowConfigSchema.parse(config);
}