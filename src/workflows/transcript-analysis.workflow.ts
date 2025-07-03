import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseWorkflow, BaseWorkflowState } from './base-workflow';
import { WorkflowConfig } from '../config/workflow.config';
import { RetryableError } from '../lib/browser-error-handler';
import { END } from '@langchain/langgraph';

export interface TranscriptAnalysisState extends BaseWorkflowState {
  transcript: string;
  transcriptId?: string; // Task #14: For database updates
  analysis?: {
    summary: string;
    keyPoints: string[];
    tags: string[];
    tagScores?: Record<string, number>; // Task #14: Tag relevance scores
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    contentType: string;
    contentScore?: number; // Task #14: Overall content quality score
    platformScores?: { // Task #14: Platform-specific content potential scores
      thread: number;
      carousel: number;
      blog: number;
    };
  };
}

export class TranscriptAnalysisWorkflow extends BaseWorkflow<TranscriptAnalysisState> {
  private model: ChatOpenAI | ChatAnthropic | null = null;
  private config: WorkflowConfig;
  
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
    
    this.config = config;
    // Don't initialize the model in constructor - do it lazily when needed
  }

  private initializeModel(): void {
    if (this.model) return; // Already initialized

    try {
      if (this.config.aiProvider === 'openai') {
        if (!this.config.apiKeys.openai) {
          throw new Error('OpenAI API key is required for content generation. Please add it in Settings.');
        }
        this.model = new ChatOpenAI({
          modelName: this.config.models.analysis,
          temperature: this.config.temperature.analysis,
          maxTokens: this.config.maxTokens.analysis,
          openAIApiKey: this.config.apiKeys.openai,
        });
      } else {
        if (!this.config.apiKeys.anthropic) {
          throw new Error('Anthropic API key is required for content generation. Please add it in Settings.');
        }
        this.model = new ChatAnthropic({
          modelName: this.config.models.analysis,
          temperature: this.config.temperature.analysis,
          maxTokens: this.config.maxTokens.analysis,
          anthropicApiKey: this.config.apiKeys.anthropic,
        });
      }
    } catch (error) {
      throw new Error(`Failed to initialize AI model: ${error.message}`);
    }
  }
  
  protected buildGraph(): void {
    this.graph.addNode('validateInput', this.validateInput.bind(this));
    this.graph.addNode('analyzeTranscript', this.analyzeTranscript.bind(this));
    this.graph.addNode('extractTags', this.extractTags.bind(this));
    this.graph.addNode('calculatePlatformScores', this.calculatePlatformScores.bind(this)); // Task #14
    this.graph.addNode('summarize', this.summarize.bind(this));
    
    this.graph.setEntryPoint('validateInput');
    
    this.graph.addEdge('validateInput', 'analyzeTranscript');
    this.graph.addEdge('analyzeTranscript', 'extractTags');
    this.graph.addEdge('extractTags', 'calculatePlatformScores'); // Task #14
    this.graph.addEdge('calculatePlatformScores', 'summarize'); // Task #14
    this.graph.addEdge('summarize', END);
  }
  
  private async validateInput(state: TranscriptAnalysisState): Promise<Partial<TranscriptAnalysisState>> {
    this.logStep('validateInput', { transcriptLength: state.transcript?.length });
    
    if (!state.transcript || state.transcript.trim().length === 0) {
      throw new Error('Transcript is required');
    }
    
    if (state.transcript.length < 100) {
      throw new Error('Transcript is too short for meaningful analysis');
    }
    
    if (state.transcript.length > 50000) {
      throw new Error('Transcript is too long. Please use a shorter transcript or split it into sections.');
    }
    
    return {
      messages: [
        ...state.messages,
        new HumanMessage(`Analyze the following transcript: ${state.transcript}`),
      ],
    };
  }
  
  private async analyzeTranscript(state: TranscriptAnalysisState): Promise<Partial<TranscriptAnalysisState>> {
    try {
      this.logStep('analyzeTranscript');
      
      // Initialize model only when needed
      this.initializeModel();
      if (!this.model) {
        throw new Error('AI model not initialized. Please check your API keys in Settings.');
      }
      
      const response = await this.executeWithRetry(
        () => this.model!.invoke([
          new HumanMessage(`Analyze this transcript and provide:
1. A brief summary (2-3 sentences)
2. 3-5 key points
3. The overall sentiment (positive, negative, neutral, or mixed)
4. The type of content (interview, tutorial, presentation, etc.)

Transcript: ${state.transcript}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "sentiment": "positive|negative|neutral|mixed",
  "contentType": "..."
}`),
        ]),
        'analyzeTranscript'
      );
      
      const analysis = JSON.parse(response.content as string);
      
      return {
        analysis: {
          ...state.analysis,
          ...analysis,
        },
        messages: [...state.messages, response],
      };
    } catch (error) {
      if (error.message.includes('API key')) {
        return this.handleStepError(error, 'analyzeTranscript', state);
      }
      throw new RetryableError(
        `Failed to analyze transcript: ${error.message}`,
        this.name,
        'analyzeTranscript',
        error
      );
    }
  }
  
  // Task #14: Enhanced tag extraction with AI
  private async extractTags(state: TranscriptAnalysisState): Promise<Partial<TranscriptAnalysisState>> {
    try {
      this.logStep('extractTags');
      
      // Initialize model only when needed
      this.initializeModel();
      if (!this.model) {
        throw new Error('AI model not initialized. Please check your API keys in Settings.');
      }
      
      const response = await this.executeWithRetry(
        () => this.model!.invoke([
          new HumanMessage(`Based on this transcript analysis, generate 5-10 relevant tags with relevance scores.
Also calculate an overall content quality score (0.0-1.0) based on:
- Clarity and coherence
- Information density
- Engagement potential
- Production value indicators

Transcript: ${state.transcript}
Current Analysis: ${JSON.stringify(state.analysis)}

Respond in JSON format:
{
  "tags": {
    "tag1": 0.95,
    "tag2": 0.87,
    ...
  },
  "contentScore": 0.85
}`),
        ]),
        'extractTags'
      );
      
      const tagData = JSON.parse(response.content as string);
      
      return {
        analysis: {
          ...state.analysis!,
          tags: Object.keys(tagData.tags),
          tagScores: tagData.tags,
          contentScore: tagData.contentScore,
        },
        messages: [...state.messages, response],
      };
    } catch (error) {
      if (error.message.includes('API key')) {
        return this.handleStepError(error, 'extractTags', state);
      }
      // If extraction fails, use basic tags from content
      const basicTags = this.extractBasicTags(state.transcript);
      return {
        analysis: {
          ...state.analysis!,
          tags: basicTags,
          tagScores: Object.fromEntries(basicTags.map(tag => [tag, 0.5])),
          contentScore: 0.5,
        },
      };
    }
  }
  
  // Task #14: Calculate platform-specific scores
  private async calculatePlatformScores(state: TranscriptAnalysisState): Promise<Partial<TranscriptAnalysisState>> {
    try {
      this.logStep('calculatePlatformScores');
      
      // Initialize model only when needed
      this.initializeModel();
      if (!this.model) {
        throw new Error('AI model not initialized. Please check your API keys in Settings.');
      }
      
      const response = await this.executeWithRetry(
        () => this.model!.invoke([
          new HumanMessage(`Based on this transcript and analysis, calculate content potential scores (0.0-1.0) for different platforms:

Transcript length: ${state.transcript.length} characters
Analysis: ${JSON.stringify(state.analysis)}

Score based on:
- Thread potential: Is it good for Twitter/X threads? (information density, natural breakpoints)
- Carousel potential: Is it good for Instagram/LinkedIn carousels? (visual concepts, step-by-step)
- Blog potential: Is it good for long-form blog posts? (depth, educational value)

Respond in JSON format:
{
  "thread": 0.85,
  "carousel": 0.72,
  "blog": 0.91
}`),
        ]),
        'calculatePlatformScores'
      );
      
      const scores = JSON.parse(response.content as string);
      
      return {
        analysis: {
          ...state.analysis!,
          platformScores: scores,
        },
        messages: [...state.messages, response],
      };
    } catch (error) {
      if (error.message.includes('API key')) {
        return this.handleStepError(error, 'calculatePlatformScores', state);
      }
      // Fallback to basic scoring
      return {
        analysis: {
          ...state.analysis!,
          platformScores: {
            thread: 0.5,
            carousel: 0.5,
            blog: 0.5,
          },
        },
      };
    }
  }
  
  private async summarize(state: TranscriptAnalysisState): Promise<Partial<TranscriptAnalysisState>> {
    try {
      this.logStep('summarize', { analysis: state.analysis });
      
      // Initialize model only when needed
      this.initializeModel();
      if (!this.model) {
        throw new Error('AI model not initialized. Please check your API keys in Settings.');
      }
      
      const response = await this.executeWithRetry(
        () => this.model!.invoke([
          new HumanMessage(`Create a concise summary of the analysis results:
${JSON.stringify(state.analysis, null, 2)}`),
        ]),
        'summarize'
      );
      
      return {
        messages: [...state.messages, response],
        metadata: {
          ...state.metadata,
          summaryGenerated: true,
          completedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error.message.includes('API key')) {
        return this.handleStepError(error, 'summarize', state);
      }
      throw error;
    }
  }
  
  // Helper method for basic tag extraction when AI is not available
  private extractBasicTags(transcript: string): string[] {
    const words = transcript.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    // Count word frequency (excluding common words)
    const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'with', 'it', 'that', 'this', 'these', 'those', 'i', 'you', 'we', 'they', 'he', 'she', 'or', 'but', 'if', 'then', 'so', 'all', 'there', 'their', 'when', 'where', 'how', 'why', 'what', 'who']);
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Get top 5-10 words as tags
    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }
}