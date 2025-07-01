import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

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

export const defaultConfig: WorkflowConfig = {
  aiProvider: 'openai',
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
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