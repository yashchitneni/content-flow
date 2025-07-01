import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseWorkflow, BaseWorkflowState } from './base-workflow';
import { WorkflowConfig } from '../config/workflow.config';
import { RetryableError } from '../lib/error-handler';

export interface TranscriptAnalysisState extends BaseWorkflowState {
  transcript: string;
  analysis?: {
    summary: string;
    keyPoints: string[];
    tags: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    contentType: string;
  };
}

export class TranscriptAnalysisWorkflow extends BaseWorkflow<TranscriptAnalysisState> {
  private model: ChatOpenAI | ChatAnthropic;
  
  constructor(config: WorkflowConfig) {
    super('TranscriptAnalysis', config, {
      messages: {
        value: (x?: BaseMessage[], y?: BaseMessage[]) => (y ?? x) ?? [],
      },
      transcript: {
        value: (x?: string, y?: string) => y ?? x ?? '',
      },
      analysis: {
        value: (x?: any, y?: any) => y ?? x,
      },
      error: {
        value: (x?: string, y?: string) => y ?? x,
      },
      metadata: {
        value: (x?: Record<string, any>, y?: Record<string, any>) => ({ ...x, ...y }),
      },
    });
    
    if (config.aiProvider === 'openai') {
      this.model = new ChatOpenAI({
        modelName: config.models.analysis,
        temperature: config.temperature.analysis,
        maxTokens: config.maxTokens.analysis,
        openAIApiKey: config.apiKeys.openai,
      });
    } else {
      this.model = new ChatAnthropic({
        modelName: config.models.analysis,
        temperature: config.temperature.analysis,
        maxTokens: config.maxTokens.analysis,
        anthropicApiKey: config.apiKeys.anthropic,
      });
    }
  }
  
  protected buildGraph(): void {
    this.graph.addNode('validateInput', this.validateInput.bind(this));
    this.graph.addNode('analyzeTranscript', this.analyzeTranscript.bind(this));
    this.graph.addNode('extractTags', this.extractTags.bind(this));
    this.graph.addNode('summarize', this.summarize.bind(this));
    
    this.graph.setEntryPoint('validateInput');
    
    this.graph.addEdge('validateInput', 'analyzeTranscript');
    this.graph.addEdge('analyzeTranscript', 'extractTags');
    this.graph.addEdge('extractTags', 'summarize');
  }
  
  private async validateInput(state: TranscriptAnalysisState): Promise<TranscriptAnalysisState> {
    this.logStep('validateInput', { hasTranscript: !!state.transcript });
    
    if (!state.transcript || state.transcript.trim().length === 0) {
      return this.handleStepError(
        new Error('No transcript provided'),
        'validateInput',
        state
      );
    }
    
    if (state.transcript.length < 50) {
      return this.handleStepError(
        new Error('Transcript too short for meaningful analysis'),
        'validateInput',
        state
      );
    }
    
    return state;
  }
  
  private async analyzeTranscript(state: TranscriptAnalysisState): Promise<TranscriptAnalysisState> {
    this.logStep('analyzeTranscript');
    
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await this.model.invoke([
          new HumanMessage(`Analyze the following transcript and provide:
1. Key points (3-5 bullet points)
2. Overall sentiment (positive, negative, neutral, or mixed)
3. Suggested content type (tutorial, review, vlog, educational, promotional, etc.)

Transcript:
${state.transcript}

Respond in JSON format:
{
  "keyPoints": ["point1", "point2", ...],
  "sentiment": "positive|negative|neutral|mixed",
  "contentType": "type"
}`),
        ]);
        
        try {
          const content = result.content.toString();
          return JSON.parse(content);
        } catch (parseError) {
          throw new RetryableError(
            'Failed to parse AI response',
            this.name,
            'analyzeTranscript',
            parseError as Error
          );
        }
      }, 'analyzeTranscript');
      
      return {
        ...state,
        analysis: {
          ...state.analysis,
          keyPoints: response.keyPoints,
          sentiment: response.sentiment,
          contentType: response.contentType,
        } as any,
      };
    } catch (error) {
      return this.handleStepError(error as Error, 'analyzeTranscript', state);
    }
  }
  
  private async extractTags(state: TranscriptAnalysisState): Promise<TranscriptAnalysisState> {
    this.logStep('extractTags');
    
    try {
      const response = await this.executeWithRetry(async () => {
        const result = await this.model.invoke([
          new HumanMessage(`Based on this transcript and its key points, generate 5-10 relevant tags for categorization and searchability.

Key Points:
${state.analysis?.keyPoints?.join('\n') || 'No key points available'}

Content Type: ${state.analysis?.contentType || 'Unknown'}

Respond with a JSON array of tags:
["tag1", "tag2", ...]`),
        ]);
        
        try {
          const content = result.content.toString();
          return JSON.parse(content);
        } catch (parseError) {
          throw new RetryableError(
            'Failed to parse tags response',
            this.name,
            'extractTags',
            parseError as Error
          );
        }
      }, 'extractTags');
      
      return {
        ...state,
        analysis: {
          ...state.analysis!,
          tags: response,
        },
      };
    } catch (error) {
      return this.handleStepError(error as Error, 'extractTags', state);
    }
  }
  
  private async summarize(state: TranscriptAnalysisState): Promise<TranscriptAnalysisState> {
    this.logStep('summarize');
    
    try {
      const summaryModel = this.config.aiProvider === 'openai'
        ? new ChatOpenAI({
            modelName: this.config.models.summarization,
            temperature: this.config.temperature.summarization,
            maxTokens: this.config.maxTokens.summarization,
            openAIApiKey: this.config.apiKeys.openai,
          })
        : new ChatAnthropic({
            modelName: this.config.models.summarization,
            temperature: this.config.temperature.summarization,
            maxTokens: this.config.maxTokens.summarization,
            anthropicApiKey: this.config.apiKeys.anthropic,
          });
      
      const response = await this.executeWithRetry(async () => {
        const result = await summaryModel.invoke([
          new HumanMessage(`Create a concise summary (2-3 sentences) of this transcript that captures the main topic and key message.

Transcript:
${state.transcript}

Key Points:
${state.analysis?.keyPoints?.join('\n') || 'No key points available'}`),
        ]);
        
        return result.content.toString();
      }, 'summarize');
      
      return {
        ...state,
        analysis: {
          ...state.analysis!,
          summary: response,
        },
        messages: [
          ...state.messages,
          new AIMessage(`Transcript analysis completed. Summary: ${response}`),
        ],
      };
    } catch (error) {
      return this.handleStepError(error as Error, 'summarize', state);
    }
  }
}