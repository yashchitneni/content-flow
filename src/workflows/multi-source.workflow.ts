import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { BaseWorkflow, BaseWorkflowState } from './base-workflow';
import { WorkflowConfig } from '../config/workflow.config';
import { TranscriptAnalysisWorkflow } from './transcript-analysis.workflow';
import { ContentGenerationWorkflow } from './content-generation.workflow';

export interface MultiSourceState extends BaseWorkflowState {
  sources: Array<{
    id: string;
    type: 'transcript' | 'note' | 'outline';
    content: string;
    metadata?: Record<string, any>;
  }>;
  processingOptions: {
    analyzeFirst: boolean;
    combineStrategy: 'merge' | 'sequential' | 'thematic';
    outputTemplate: string;
  };
  processedSources?: Array<{
    id: string;
    original: any;
    analysis?: any;
  }>;
  finalOutput?: {
    combined: any;
    individual: any[];
  };
}

export class MultiSourceWorkflow extends BaseWorkflow<MultiSourceState> {
  private analysisWorkflow: TranscriptAnalysisWorkflow;
  private generationWorkflow: ContentGenerationWorkflow;
  
  constructor(config: WorkflowConfig) {
    super('MultiSource', config, {
      messages: {
        value: (x?: BaseMessage[], y?: BaseMessage[]) => (y ?? x) ?? [],
      },
      sources: {
        value: (x?: any[], y?: any[]) => y ?? x ?? [],
      },
      processingOptions: {
        value: (x?: any, y?: any) => y ?? x ?? {},
      },
      processedSources: {
        value: (x?: any[], y?: any[]) => y ?? x ?? [],
      },
      finalOutput: {
        value: (x?: any, y?: any) => y ?? x,
      },
      error: {
        value: (x?: string, y?: string) => y ?? x,
      },
      metadata: {
        value: (x?: Record<string, any>, y?: Record<string, any>) => ({ ...x, ...y }),
      },
    });
    
    this.analysisWorkflow = new TranscriptAnalysisWorkflow(config);
    this.generationWorkflow = new ContentGenerationWorkflow(config);
  }
  
  protected buildGraph(): void {
    this.graph.addNode('validateSources', this.validateSources.bind(this));
    this.graph.addNode('analyzeSources', this.analyzeSources.bind(this));
    this.graph.addNode('combineSources', this.combineSources.bind(this));
    this.graph.addNode('generateOutput', this.generateOutput.bind(this));
    
    this.graph.setEntryPoint('validateSources');
    
    this.graph.addConditionalEdges('validateSources', 
      (state) => state.processingOptions?.analyzeFirst ? 'analyze' : 'combine',
      {
        analyze: 'analyzeSources',
        combine: 'combineSources',
      }
    );
    
    this.graph.addEdge('analyzeSources', 'combineSources');
    this.graph.addEdge('combineSources', 'generateOutput');
  }
  
  private async validateSources(state: MultiSourceState): Promise<MultiSourceState> {
    this.logStep('validateSources', { 
      sourceCount: state.sources?.length,
      options: state.processingOptions,
    });
    
    if (!state.sources || state.sources.length === 0) {
      return this.handleStepError(
        new Error('No sources provided'),
        'validateSources',
        state
      );
    }
    
    if (!state.processingOptions || !state.processingOptions.combineStrategy) {
      return {
        ...state,
        processingOptions: {
          ...state.processingOptions,
          analyzeFirst: true,
          combineStrategy: 'merge',
          outputTemplate: state.processingOptions?.outputTemplate || 'blog',
        },
      };
    }
    
    return state;
  }
  
  private async analyzeSources(state: MultiSourceState): Promise<MultiSourceState> {
    this.logStep('analyzeSources', { sourceCount: state.sources.length });
    
    const processedSources = [];
    
    for (const source of state.sources) {
      try {
        if (source.type === 'transcript') {
          const analysisResult = await this.analysisWorkflow.execute({
            transcript: source.content,
            messages: [],
          });
          
          processedSources.push({
            id: source.id,
            original: source,
            analysis: analysisResult.analysis,
          });
        } else {
          // For non-transcript sources, just pass through
          processedSources.push({
            id: source.id,
            original: source,
            analysis: {
              summary: source.content.substring(0, 200) + '...',
              keyPoints: [],
              tags: source.metadata?.tags || [],
            },
          });
        }
      } catch (error) {
        this.logStep('analyzeSources', { 
          error: `Failed to analyze source ${source.id}: ${(error as Error).message}` 
        });
        
        processedSources.push({
          id: source.id,
          original: source,
          analysis: null,
        });
      }
    }
    
    return {
      ...state,
      processedSources,
    };
  }
  
  private async combineSources(state: MultiSourceState): Promise<MultiSourceState> {
    this.logStep('combineSources', { strategy: state.processingOptions.combineStrategy });
    
    const sources = state.processedSources || state.sources.map(s => ({
      id: s.id,
      original: s,
      analysis: null,
    }));
    
    let combinedContent: any;
    
    switch (state.processingOptions.combineStrategy) {
      case 'merge':
        combinedContent = this.mergeStrategy(sources);
        break;
        
      case 'sequential':
        combinedContent = this.sequentialStrategy(sources);
        break;
        
      case 'thematic':
        combinedContent = this.thematicStrategy(sources);
        break;
        
      default:
        combinedContent = this.mergeStrategy(sources);
    }
    
    return {
      ...state,
      metadata: {
        ...state.metadata,
        combinedContent,
      },
    };
  }
  
  private mergeStrategy(sources: any[]): any {
    const allContent = sources.map(s => s.original.content).join('\n\n---\n\n');
    const allTags = Array.from(new Set(
      sources.flatMap(s => s.analysis?.tags || [])
    ));
    const allKeyPoints = sources.flatMap(s => s.analysis?.keyPoints || []);
    
    return {
      content: allContent,
      metadata: {
        tags: allTags,
        keyPoints: allKeyPoints,
        sourceCount: sources.length,
      },
    };
  }
  
  private sequentialStrategy(sources: any[]): any {
    const sections = sources.map((s, index) => ({
      order: index + 1,
      title: s.original.metadata?.title || `Section ${index + 1}`,
      content: s.original.content,
      summary: s.analysis?.summary,
    }));
    
    return {
      sections,
      metadata: {
        structure: 'sequential',
        sectionCount: sections.length,
      },
    };
  }
  
  private thematicStrategy(sources: any[]): any {
    // Group sources by common tags/themes
    const themes: Record<string, any[]> = {};
    
    sources.forEach(source => {
      const tags = source.analysis?.tags || ['uncategorized'];
      tags.forEach((tag: string) => {
        if (!themes[tag]) {
          themes[tag] = [];
        }
        themes[tag].push(source);
      });
    });
    
    return {
      themes,
      metadata: {
        structure: 'thematic',
        themeCount: Object.keys(themes).length,
      },
    };
  }
  
  private async generateOutput(state: MultiSourceState): Promise<MultiSourceState> {
    this.logStep('generateOutput');
    
    try {
      const combinedContent = state.metadata?.combinedContent;
      
      if (!combinedContent) {
        return this.handleStepError(
          new Error('No combined content available'),
          'generateOutput',
          state
        );
      }
      
      // Prepare transcripts for content generation
      const transcriptsForGeneration = state.processedSources?.map(ps => ({
        id: ps.id,
        content: ps.original.content,
        analysis: ps.analysis,
      })) || state.sources.map(s => ({
        id: s.id,
        content: s.content,
      }));
      
      const generationResult = await this.generationWorkflow.execute({
        transcripts: transcriptsForGeneration,
        template: {
          type: state.processingOptions.outputTemplate as any,
        },
        messages: [],
      });
      
      return {
        ...state,
        finalOutput: {
          combined: generationResult.generatedContent,
          individual: state.processedSources || [],
        },
        messages: [
          ...state.messages,
          new AIMessage(`Multi-source processing completed. Generated ${state.processingOptions.outputTemplate} from ${state.sources.length} sources.`),
        ],
      };
    } catch (error) {
      return this.handleStepError(error as Error, 'generateOutput', state);
    }
  }
}