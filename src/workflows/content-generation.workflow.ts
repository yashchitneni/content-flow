import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseWorkflow, BaseWorkflowState } from './base-workflow';
import { WorkflowConfig } from '../config/workflow.config';
import { RetryableError } from '../lib/browser-error-handler';
import { END } from '@langchain/langgraph';
import { invoke } from '../lib/tauri-wrapper';

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
    templateId?: string; // Add template ID for saving
  };
  generatedContent?: {
    title: string;
    content: string | string[];
    format: string;
    metadata: Record<string, any>;
    contentId?: string; // ID after saving
  };
}

export class ContentGenerationWorkflow extends BaseWorkflow<ContentGenerationState> {
  private model: ChatOpenAI | ChatAnthropic | null = null;
  protected config: WorkflowConfig;
  private timings: Record<string, { start: number; end?: number; duration?: number }> = {};
  
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

  private startTimer(step: string): void {
    this.timings[step] = { start: performance.now() };
    console.log(`[TIMING] ${step} started at ${new Date().toISOString()}`);
  }

  private endTimer(step: string): void {
    if (this.timings[step]) {
      const end = performance.now();
      const duration = end - this.timings[step].start;
      this.timings[step].end = end;
      this.timings[step].duration = duration;
      console.log(`[TIMING] ${step} completed in ${duration.toFixed(2)}ms (${(duration/1000).toFixed(2)}s)`);
    }
  }

  private logTimingSummary(): void {
    console.log('\n[TIMING SUMMARY] Content Generation Workflow:');
    console.log('==========================================');
    let totalDuration = 0;
    
    Object.entries(this.timings).forEach(([step, timing]) => {
      if (timing.duration) {
        console.log(`${step}: ${timing.duration.toFixed(2)}ms (${(timing.duration/1000).toFixed(2)}s)`);
        totalDuration += timing.duration;
      }
    });
    
    console.log('------------------------------------------');
    console.log(`TOTAL: ${totalDuration.toFixed(2)}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log('==========================================\n');
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
    this.graph.addNode('saveContent', this.saveContent.bind(this));
    this.graph.addNode('validateOutput', this.validateOutput.bind(this));
    
    this.graph.setEntryPoint('validateInput');
    
    this.graph.addEdge('validateInput', 'prepareContext');
    this.graph.addEdge('prepareContext', 'generateContent');
    this.graph.addEdge('generateContent', 'formatContent');
    this.graph.addEdge('formatContent', 'saveContent');
    this.graph.addEdge('saveContent', 'validateOutput');
    this.graph.addEdge('validateOutput', END);
  }
  
  private async validateInput(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.startTimer('validateInput');
    
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
      this.endTimer('validateInput');
      return this.handleStepError(
        new Error('No transcripts provided'),
        'validateInput',
        state
      );
    }
    
    if (!state.template || !state.template.type) {
      console.error('[ContentGeneration] No template type specified!');
      this.endTimer('validateInput');
      return this.handleStepError(
        new Error('No template type specified'),
        'validateInput',
        state
      );
    }
    
    console.log('[ContentGeneration] validateInput passed');
    this.endTimer('validateInput');
    return state;
  }
  
  private async prepareContext(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.startTimer('prepareContext');
    this.logStep('prepareContext');
    
    const context = {
      transcriptCount: state.transcripts.length,
      totalWords: state.transcripts.reduce((sum, t) => sum + t.content.split(' ').length, 0),
      combinedTags: Array.from(new Set(
        state.transcripts.flatMap(t => t.analysis?.tags || [])
      )),
      templateConstraints: this.getTemplateConstraints(state.template.type),
    };
    
    this.endTimer('prepareContext');
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
    this.startTimer('generateContent');
    this.logStep('generateContent');
    console.log('[ContentGeneration] Starting content generation with state:', {
      transcripts: state.transcripts.length,
      template: state.template.type,
      hasApiKey: !!this.config.apiKeys.openai,
      transcriptSample: state.transcripts[0]?.content?.substring(0, 100) + '...'
    });
    
    try {
      // Initialize model only when needed
      this.startTimer('initializeModel');
      this.initializeModel();
      this.endTimer('initializeModel');
      
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
        
        this.startTimer('aiModelInvoke');
        const result = await this.model!.invoke([new HumanMessage(prompt)]);
        this.endTimer('aiModelInvoke');
        
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
      
      this.endTimer('generateContent');
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
      this.endTimer('generateContent');
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
    this.startTimer('formatContent');
    this.logStep('formatContent');
    
    if (!state.generatedContent) {
      this.endTimer('formatContent');
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
    
    this.endTimer('formatContent');
    return state;
  }
  
  private async saveContent(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.startTimer('saveContent');
    this.logStep('saveContent');
    
    if (!state.generatedContent) {
      this.endTimer('saveContent');
      return state;
    }
    
    try {
      // Get or create template ID
      let templateId = state.template.templateId;
      let templateName = state.template.type;
      
      // Try to get template info from Tauri first
      try {
        if (!templateId) {
          // Get default template ID based on type
          const templates = await invoke<Array<{ template_id: string; template_type: string; template_name: string; is_default: boolean }>>('get_all_templates');
          const defaultTemplate = templates.find(t => 
            t.template_type === state.template.type && t.is_default
          );
          
          if (defaultTemplate) {
            templateId = defaultTemplate.template_id;
            templateName = defaultTemplate.template_name;
          } else {
            // Use a default template ID if none found
            templateId = `default-${state.template.type}`;
          }
        }
        
        // Prepare content data
        const contentData = {
          title: state.generatedContent.title,
          content: state.generatedContent.content,
          metadata: state.generatedContent.metadata,
        };
        
        // Save to database
        const contentId = await invoke<string>('save_generated_content', {
          request: {
            template_id: templateId,
            title: state.generatedContent.title,
            content: contentData,
            source_transcript_ids: state.transcripts.map(t => t.id),
          },
        });
        
        console.log('[ContentGeneration] Content saved to Tauri database with ID:', contentId);
        
        this.endTimer('saveContent');
        return {
          ...state,
          generatedContent: {
            ...state.generatedContent,
            contentId,
          },
        };
      } catch (tauriError) {
        console.warn('[ContentGeneration] Tauri save failed, using localStorage fallback:', tauriError);
        
        // Fallback to localStorage via content store
        const { useContentStore } = await import('../store/content.store');
        const { addContent } = useContentStore.getState();
        
        // Map template type to friendly name
        const templateTypeToName: Record<string, string> = {
          'thread': 'Twitter Thread',
          'twitter-thread': 'Twitter Thread',
          'carousel': 'Instagram Carousel',
          'instagram-carousel': 'Instagram Carousel',
          'newsletter': 'Newsletter',
          'blog': 'Blog Post',
          'linkedin-article': 'LinkedIn Article',
          'video-script': 'Video Script',
          'youtube-script': 'YouTube Script',
        };
        
        const contentId = addContent({
          templateId: templateId || `default-${state.template.type}`,
          templateName: templateTypeToName[state.template.templateId || state.template.type] || templateName,
          templateType: state.template.templateId || state.template.type,
          title: state.generatedContent.title,
          contentData: {
            title: state.generatedContent.title,
            content: state.generatedContent.content,
            metadata: state.generatedContent.metadata,
          },
          status: 'draft',
          sourceTranscriptIds: state.transcripts.map(t => t.id),
        });
        
        console.log('[ContentGeneration] Content saved to localStorage with ID:', contentId);
        
        this.endTimer('saveContent');
        return {
          ...state,
          generatedContent: {
            ...state.generatedContent,
            contentId,
          },
        };
      }
    } catch (error) {
      console.error('[ContentGeneration] Failed to save content:', error);
      // Don't fail the whole workflow if saving fails
      this.logStep('saveContent', { 
        warning: `Failed to save content: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      this.endTimer('saveContent');
      return state;
    }
  }
  
  private async validateOutput(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.startTimer('validateOutput');
    this.logStep('validateOutput');
    
    if (!state.generatedContent) {
      this.endTimer('validateOutput');
      this.logTimingSummary();
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
    
    this.endTimer('validateOutput');
    this.logTimingSummary();
    
    return {
      ...state,
      messages: [
        ...state.messages,
        new AIMessage(`Content generated successfully: ${state.generatedContent.title}`),
      ],
    };
  }
}