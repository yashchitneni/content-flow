export * from './base-workflow';
export * from './transcript-analysis.workflow';
export * from './content-generation.workflow';
export * from './multi-source.workflow';

import { WorkflowConfig, loadConfig } from '../config/workflow.config';
import { initializeLogger } from '../lib/logger';
import { TranscriptAnalysisWorkflow } from './transcript-analysis.workflow';
import { ContentGenerationWorkflow } from './content-generation.workflow';
import { MultiSourceWorkflow } from './multi-source.workflow';

export class WorkflowOrchestrator {
  private config: WorkflowConfig;
  private transcriptAnalysis: TranscriptAnalysisWorkflow;
  private contentGeneration: ContentGenerationWorkflow;
  private multiSource: MultiSourceWorkflow;
  
  constructor(configOverrides?: Partial<WorkflowConfig>) {
    this.config = loadConfig(configOverrides);
    initializeLogger(this.config.logging);
    
    this.transcriptAnalysis = new TranscriptAnalysisWorkflow(this.config);
    this.contentGeneration = new ContentGenerationWorkflow(this.config);
    this.multiSource = new MultiSourceWorkflow(this.config);
  }
  
  async analyzeTranscript(transcript: string) {
    return this.transcriptAnalysis.execute({
      transcript,
      messages: [],
    });
  }
  
  async generateContent(
    transcripts: Array<{ id: string; content: string; analysis?: any }>,
    templateType: 'thread' | 'carousel' | 'newsletter' | 'blog' | 'video-script',
    templateConstraints?: Record<string, any>
  ) {
    return this.contentGeneration.execute({
      transcripts,
      template: {
        type: templateType,
        constraints: templateConstraints,
      },
      messages: [],
    });
  }
  
  async processMultipleSources(
    sources: Array<{ id: string; type: 'transcript' | 'note' | 'outline'; content: string }>,
    options: {
      analyzeFirst?: boolean;
      combineStrategy?: 'merge' | 'sequential' | 'thematic';
      outputTemplate?: string;
    } = {}
  ) {
    return this.multiSource.execute({
      sources,
      processingOptions: {
        analyzeFirst: options.analyzeFirst ?? true,
        combineStrategy: options.combineStrategy ?? 'merge',
        outputTemplate: options.outputTemplate ?? 'blog',
      },
      messages: [],
    });
  }
  
  updateConfig(overrides: Partial<WorkflowConfig>): void {
    this.config = loadConfig({ ...this.config, ...overrides });
    initializeLogger(this.config.logging);
    
    // Recreate workflows with new config
    this.transcriptAnalysis = new TranscriptAnalysisWorkflow(this.config);
    this.contentGeneration = new ContentGenerationWorkflow(this.config);
    this.multiSource = new MultiSourceWorkflow(this.config);
  }
  
  getConfig(): WorkflowConfig {
    return { ...this.config };
  }
}

// Default export for easy usage
export default WorkflowOrchestrator;