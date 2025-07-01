import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseWorkflow, BaseWorkflowState } from './base-workflow';
import { WorkflowConfig } from '../config/workflow.config';
import { RetryableError } from '../lib/error-handler';

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
  private model: ChatOpenAI | ChatAnthropic;
  
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
    
    if (config.aiProvider === 'openai') {
      this.model = new ChatOpenAI({
        modelName: config.models.generation,
        temperature: config.temperature.generation,
        maxTokens: config.maxTokens.generation,
        openAIApiKey: config.apiKeys.openai,
      });
    } else {
      this.model = new ChatAnthropic({
        modelName: config.models.generation,
        temperature: config.temperature.generation,
        maxTokens: config.maxTokens.generation,
        anthropicApiKey: config.apiKeys.anthropic,
      });
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
  }
  
  private async validateInput(state: ContentGenerationState): Promise<ContentGenerationState> {
    this.logStep('validateInput', { 
      transcriptCount: state.transcripts?.length,
      templateType: state.template?.type,
    });
    
    if (!state.transcripts || state.transcripts.length === 0) {
      return this.handleStepError(
        new Error('No transcripts provided'),
        'validateInput',
        state
      );
    }
    
    if (!state.template || !state.template.type) {
      return this.handleStepError(
        new Error('No template type specified'),
        'validateInput',
        state
      );
    }
    
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
    
    try {
      const constraints = state.metadata?.context?.templateConstraints || {};
      const transcriptSummaries = state.transcripts
        .map(t => t.analysis?.summary || 'No summary available')
        .join('\n\n');
      
      const prompt = this.buildGenerationPrompt(state.template.type, transcriptSummaries, constraints);
      
      const response = await this.executeWithRetry(async () => {
        const result = await this.model.invoke([new HumanMessage(prompt)]);
        
        try {
          const content = result.content.toString();
          return JSON.parse(content);
        } catch (parseError) {
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
  
  private buildGenerationPrompt(type: string, summaries: string, constraints: Record<string, any>): string {
    const prompts: Record<string, string> = {
      thread: `Create a Twitter/X thread based on these transcript summaries. 
Constraints: ${JSON.stringify(constraints)}

Summaries:
${summaries}

Generate a JSON response with:
{
  "title": "Thread title/hook",
  "content": ["Tweet 1", "Tweet 2", ...]
}`,
      
      carousel: `Create an Instagram carousel post based on these transcript summaries.
Constraints: ${JSON.stringify(constraints)}

Summaries:
${summaries}

Generate a JSON response with:
{
  "title": "Carousel caption",
  "content": ["Slide 1 text", "Slide 2 text", ...]
}`,
      
      newsletter: `Create a newsletter section based on these transcript summaries.
Constraints: ${JSON.stringify(constraints)}

Summaries:
${summaries}

Generate a JSON response with:
{
  "title": "Newsletter section title",
  "content": "Full newsletter content with proper formatting"
}`,
      
      blog: `Create a blog post based on these transcript summaries.
Constraints: ${JSON.stringify(constraints)}

Summaries:
${summaries}

Generate a JSON response with:
{
  "title": "Blog post title",
  "content": "Full blog post content with headings and paragraphs"
}`,
      
      'video-script': `Create a video script based on these transcript summaries.
Constraints: ${JSON.stringify(constraints)}

Summaries:
${summaries}

Generate a JSON response with:
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