import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseWorkflow, BaseWorkflowState } from './base-workflow';
import { WorkflowConfig } from '../config/workflow.config';
import { RetryableError } from '../lib/browser-error-handler';
import { END } from '@langchain/langgraph';

export interface ContentGenerationState extends BaseWorkflowState {
  transcripts: Array<{
    id: string;
    content: string;
    analysis?: {
      summary: string;
      keyPoints: string[];
      tags: string[];
    };
  }>;
  template: {
    type: 'thread' | 'carousel' | 'newsletter' | 'blog' | 'video-script';
    format?: string;
    constraints?: Record<string, any>;
  };
  generatedContent?: {
    title: string;
    content: string | string[];
    format: string;
    metadata: Record<string, any>;
  };
}

export class ContentGenerationWorkflow extends BaseWorkflow<ContentGenerationState> {
  private model: ChatOpenAI | ChatAnthropic | null = null;
  private config: WorkflowConfig;
  
  constructor(config: WorkflowConfig) {
    super('ContentGeneration', config, {
      messages: {
        value: (x?: BaseMessage[], y?: BaseMessage[]) => (y ?? x) ?? [],
      },
      transcripts: {
        value: (x?: any[], y?: any[]) => y ?? x ?? [],
      },
      template: {
        value: (x?: any, y?: any) => y ?? x ?? {},
      },
      generatedContent: {
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
          modelName: this.config.models.generation,
          temperature: this.config.temperature.generation,
          maxTokens: this.config.maxTokens.generation,
          openAIApiKey: this.config.apiKeys.openai,
        });
      } else {
        if (!this.config.apiKeys.anthropic) {
          throw new Error('Anthropic API key is required for content generation. Please add it in Settings.');
        }
        this.model = new ChatAnthropic({
          modelName: this.config.models.generation,
          temperature: this.config.temperature.generation,
          maxTokens: this.config.maxTokens.generation,
          anthropicApiKey: this.config.apiKeys.anthropic,
        });
      }
    } catch (error) {
      console.error('[ContentGeneration] Model initialization error:', error);
      console.error('[ContentGeneration] Config state:', {
        provider: this.config.aiProvider,
        hasOpenAIKey: !!this.config.apiKeys.openai,
        hasAnthropicKey: !!this.config.apiKeys.anthropic,
        keyLength: this.config.apiKeys.openai?.length
      });
      throw new Error(`Failed to initialize AI model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  protected buildGraph(): void {
    this.graph.addNode('validateInput', this.validateInput.bind(this));
    this.graph.addNode('prepareContext', this.prepareContext.bind(this));
    this.graph.addNode('generateContent', this.generateContent.bind(this));
    this.graph.addNode('formatContent', this.formatContent.bind(this));
    this.graph.addNode('validateOutput', this.validateOutput.bind(this));
    
    this.graph.setEntryPoint('validateInput');
    
    this.graph.addEdge('validateInput', 'prepareContext');
    this.graph.addEdge('prepareContext', 'generateContent');
    this.graph.addEdge('generateContent', 'formatContent');
    this.graph.addEdge('formatContent', 'validateOutput');
    this.graph.addEdge('validateOutput', END);
  }
  
  private async validateInput(state: ContentGenerationState): Promise<ContentGenerationState> {
    console.log('[ContentGeneration] validateInput called with state:', {
      hasTranscripts: !!state.transcripts,
      transcriptCount: state.transcripts?.length,
      firstTranscript: state.transcripts?.[0],
      hasTemplate: !!state.template,
      templateType: state.template?.type,
    });
    
    this.logStep('validateInput', { 
      transcriptCount: state.transcripts?.length,
      templateType: state.template?.type,
    });
    
    if (!state.transcripts || state.transcripts.length === 0) {
      console.error('[ContentGeneration] No transcripts provided!');
      return this.handleStepError(
        new Error('No transcripts provided'),
        'validateInput',
        state
      );
    }
    
    if (!state.template || !state.template.type) {
      console.error('[ContentGeneration] No template type specified!');
      return this.handleStepError(
        new Error('No template type specified'),
        'validateInput',
        state
      );
    }
    
    console.log('[ContentGeneration] validateInput passed');
    return state;
  }
  
  private async prepareContext(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.logStep('prepareContext');
    
    const context = {
      transcriptCount: state.transcripts.length,
      totalWords: state.transcripts.reduce((sum, t) => sum + t.content.split(' ').length, 0),
      combinedTags: Array.from(new Set(
        state.transcripts.flatMap(t => t.analysis?.tags || [])
      )),
      templateConstraints: this.getTemplateConstraints(state.template.type),
    };
    
    return {
      ...state,
      metadata: {
        ...state.metadata,
        context,
      },
    };
  }
  
  private getTemplateConstraints(type: string): Record<string, any> {
    const constraints: Record<string, Record<string, any>> = {
      thread: {
        maxTweets: 10,
        charsPerTweet: 280,
        style: 'conversational, engaging',
      },
      carousel: {
        maxSlides: 10,
        charsPerSlide: 150,
        style: 'visual, punchy',
      },
      newsletter: {
        minWords: 500,
        maxWords: 1500,
        style: 'informative, professional',
      },
      blog: {
        minWords: 800,
        maxWords: 2000,
        style: 'comprehensive, SEO-friendly',
      },
      'video-script': {
        targetDuration: '5-10 minutes',
        style: 'conversational, structured',
      },
    };
    
    return constraints[type] || {};
  }
  
  private async generateContent(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.logStep('generateContent');
    console.log('[ContentGeneration] Starting content generation with state:', {
      transcripts: state.transcripts.length,
      template: state.template.type,
      hasApiKey: !!this.config.apiKeys.openai,
      transcriptSample: state.transcripts[0]?.content?.substring(0, 100) + '...'
    });
    
    try {
      // Initialize model only when needed
      this.initializeModel();
      if (!this.model) {
        throw new Error('AI model not initialized. Please check your API keys in Settings.');
      }

      const constraints = state.metadata?.context?.templateConstraints || {};
      // Use actual transcript content instead of summaries
      const transcriptContent = state.transcripts
        .map(t => {
          // If we have analysis with summary, use it, otherwise use the raw content
          if (t.analysis?.summary) {
            return `Summary: ${t.analysis.summary}`;
          }
          // For raw content, truncate if too long to avoid token limits
          const content = t.content || '';
          const maxLength = 2000; // Reasonable length for context
          if (content.length > maxLength) {
            return `Transcript (truncated): ${content.substring(0, maxLength)}...`;
          }
          return `Transcript: ${content}`;
        })
        .join('\n\n---\n\n');
      
      const prompt = this.buildGenerationPrompt(state.template.type, transcriptContent, constraints);
      console.log('[ContentGeneration] Built prompt:', {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 500) + '...',
        fullPrompt: prompt // This will show in debug panel
      });
      
      const response = await this.executeWithRetry(async () => {
        console.log('[ContentGeneration] Invoking AI model with prompt length:', prompt.length);
        const result = await this.model!.invoke([new HumanMessage(prompt)]);
        
        console.log('[ContentGeneration] AI model response received:', {
          hasContent: !!result.content,
          contentType: typeof result.content,
          contentLength: result.content?.toString().length,
          contentSample: result.content?.toString().substring(0, 200)
        });
        
        // Track token usage (estimate based on response length)
        // Note: In production, you'd use the actual token count from the API response
        const estimatedTokens = Math.ceil(prompt.length / 4) + Math.ceil(result.content.toString().length / 4);
        
        // Import and use the usage store
        if (typeof window !== 'undefined') {
          import('../store/usage.store').then(({ useUsageStore }) => {
            const trackUsage = this.config.aiProvider === 'openai' 
              ? useUsageStore.getState().trackOpenAIUsage 
              : useUsageStore.getState().trackClaudeUsage;
            trackUsage(estimatedTokens);
          });
        }
        
        try {
          const content = result.content.toString();
          console.log('[ContentGeneration] Attempting to parse JSON response:', content.substring(0, 500));
          
          // Clean the response - remove markdown code blocks if present
          const cleanedContent = content
            .replace(/^```json\s*\n?/i, '') // Remove opening ```json
            .replace(/\n?```\s*$/i, '')      // Remove closing ```
            .trim();
          
          console.log('[ContentGeneration] Cleaned content for parsing:', cleanedContent.substring(0, 500));
          
          const parsed = JSON.parse(cleanedContent);
          console.log('[ContentGeneration] Successfully parsed response:', {
            hasTitle: !!parsed.title,
            hasContent: !!parsed.content,
            contentType: Array.isArray(parsed.content) ? 'array' : typeof parsed.content
          });
          return parsed;
        } catch (parseError) {
          console.error('[ContentGeneration] Failed to parse AI response as JSON:', parseError);
          console.error('[ContentGeneration] Raw content that failed to parse:', result.content.toString());
          throw new RetryableError(
            'Failed to parse generated content',
            this.name,
            'generateContent',
            parseError as Error
          );
        }
      }, 'generateContent');
      
      return {
        ...state,
        generatedContent: {
          title: response.title,
          content: response.content,
          format: state.template.type,
          metadata: {
            generatedAt: new Date().toISOString(),
            wordCount: Array.isArray(response.content) 
              ? response.content.join(' ').split(' ').length
              : response.content.split(' ').length,
          },
        },
      };
    } catch (error) {
      return this.handleStepError(error as Error, 'generateContent', state);
    }
  }
  
  private buildGenerationPrompt(type: string, transcriptContent: string, constraints: Record<string, any>): string {
    const prompts: Record<string, string> = {
      thread: `Create a Twitter/X thread based on the following transcript content. Extract the key insights and transform them into an engaging thread.
Constraints: ${JSON.stringify(constraints)}

Transcript Content:
${transcriptContent}

Return ONLY a JSON object (no markdown formatting, no code blocks) with this structure:
{
  "title": "Thread title/hook",
  "content": ["Tweet 1", "Tweet 2", ...]
}`,
      
      carousel: `Create an Instagram carousel post based on the following transcript content. Transform the key points into visually engaging slides.
Constraints: ${JSON.stringify(constraints)}

Transcript Content:
${transcriptContent}

Return ONLY a JSON object (no markdown formatting, no code blocks) with this structure:
{
  "title": "Carousel caption",
  "content": ["Slide 1 text", "Slide 2 text", ...]
}`,
      
      newsletter: `Create a newsletter section based on the following transcript content. Extract and organize the main insights.
Constraints: ${JSON.stringify(constraints)}

Transcript Content:
${transcriptContent}

Return ONLY a JSON object (no markdown formatting, no code blocks) with this structure:
{
  "title": "Newsletter section title",
  "content": "Full newsletter content with proper formatting"
}`,
      
      blog: `Create a blog post based on the following transcript content. Expand on the key themes and insights.
Constraints: ${JSON.stringify(constraints)}

Transcript Content:
${transcriptContent}

Return ONLY a JSON object (no markdown formatting, no code blocks) with this structure:
{
  "title": "Blog post title",
  "content": "Full blog post content with headings and paragraphs"
}`,
      
      'video-script': `Create a video script based on the following transcript content. Structure it for engaging video delivery.
Constraints: ${JSON.stringify(constraints)}

Transcript Content:
${transcriptContent}

Return ONLY a JSON object (no markdown formatting, no code blocks) with this structure:
{
  "title": "Video title",
  "content": "Full video script with sections and timing cues"
}`,
    };
    
    return prompts[type] || prompts.blog;
  }
  
  private async formatContent(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.logStep('formatContent');
    
    if (!state.generatedContent) {
      return state;
    }
    
    // Apply template-specific formatting
    switch (state.template.type) {
      case 'thread':
        if (Array.isArray(state.generatedContent.content)) {
          state.generatedContent.content = state.generatedContent.content.map((tweet, i) => 
            `${i + 1}/${state.generatedContent.content.length} ${tweet}`
          );
        }
        break;
        
      case 'carousel':
        if (Array.isArray(state.generatedContent.content)) {
          state.generatedContent.content = state.generatedContent.content.map((slide, i) => 
            `[Slide ${i + 1}]\n${slide}`
          );
        }
        break;
        
      case 'blog':
      case 'newsletter':
        if (typeof state.generatedContent.content === 'string') {
          // Add basic markdown formatting if not present
          if (!state.generatedContent.content.includes('#')) {
            state.generatedContent.content = `# ${state.generatedContent.title}\n\n${state.generatedContent.content}`;
          }
        }
        break;
    }
    
    return state;
  }
  
  private async validateOutput(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.logStep('validateOutput');
    
    if (!state.generatedContent) {
      return this.handleStepError(
        new Error('No content was generated'),
        'validateOutput',
        state
      );
    }
    
    const constraints = state.metadata?.context?.templateConstraints || {};
    const content = state.generatedContent.content;
    
    // Validate based on template type
    switch (state.template.type) {
      case 'thread':
        if (Array.isArray(content) && content.length > constraints.maxTweets) {
          this.logStep('validateOutput', { 
            warning: `Thread has ${content.length} tweets, exceeding limit of ${constraints.maxTweets}` 
          });
        }
        break;
        
      case 'carousel':
        if (Array.isArray(content) && content.length > constraints.maxSlides) {
          this.logStep('validateOutput', { 
            warning: `Carousel has ${content.length} slides, exceeding limit of ${constraints.maxSlides}` 
          });
        }
        break;
        
      case 'blog':
      case 'newsletter':
        const wordCount = state.generatedContent.metadata.wordCount;
        if (wordCount < constraints.minWords || wordCount > constraints.maxWords) {
          this.logStep('validateOutput', { 
            warning: `Content has ${wordCount} words, outside range ${constraints.minWords}-${constraints.maxWords}` 
          });
        }
        break;
    }
    
    return {
      ...state,
      messages: [
        ...state.messages,
        new AIMessage(`Content generated successfully: ${state.generatedContent.title}`),
      ],
    };
  }
}