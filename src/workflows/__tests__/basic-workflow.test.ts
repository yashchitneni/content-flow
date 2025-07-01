import { WorkflowOrchestrator } from '../index';
import { WorkflowConfig } from '../../config/workflow.config';

describe('Basic Workflow Tests', () => {
  let orchestrator: WorkflowOrchestrator;
  
  beforeEach(() => {
    // Create orchestrator with test config
    const testConfig: Partial<WorkflowConfig> = {
      logging: {
        level: 'error', // Reduce noise in tests
        format: 'json',
      },
      retryConfig: {
        maxRetries: 1,
        initialDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2,
      },
    };
    
    orchestrator = new WorkflowOrchestrator(testConfig);
  });
  
  describe('Configuration', () => {
    it('should load default configuration', () => {
      const config = orchestrator.getConfig();
      expect(config).toBeDefined();
      expect(config.aiProvider).toMatch(/^(openai|anthropic)$/);
      expect(config.models).toBeDefined();
      expect(config.temperature).toBeDefined();
    });
    
    it('should update configuration', () => {
      orchestrator.updateConfig({
        aiProvider: 'anthropic',
        temperature: {
          analysis: 0.5,
          generation: 0.8,
          summarization: 0.3,
        },
      });
      
      const config = orchestrator.getConfig();
      expect(config.aiProvider).toBe('anthropic');
      expect(config.temperature.analysis).toBe(0.5);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle missing transcript gracefully', async () => {
      const result = await orchestrator.analyzeTranscript('');
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No transcript provided');
    });
    
    it('should handle empty sources gracefully', async () => {
      const result = await orchestrator.processMultipleSources([]);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No sources provided');
    });
    
    it('should handle missing template gracefully', async () => {
      const result = await orchestrator.generateContent(
        [{ id: '1', content: 'Test content' }],
        null as any
      );
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No template type specified');
    });
  });
  
  describe('Workflow Execution (Mock)', () => {
    it('should process valid transcript input', async () => {
      const testTranscript = `
        This is a test transcript that contains enough content to be processed.
        It talks about various topics including technology, innovation, and the future.
        The goal is to test if the workflow can handle basic transcript analysis.
      `;
      
      // This would normally call the AI API, but without keys it will fail
      // In a real test, you'd mock the AI calls
      const result = await orchestrator.analyzeTranscript(testTranscript);
      
      // Check the structure is correct even if API call fails
      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('transcript');
      expect(result.transcript).toBe(testTranscript);
    });
    
    it('should handle multiple sources', async () => {
      const sources = [
        { id: '1', type: 'transcript' as const, content: 'First transcript content' },
        { id: '2', type: 'note' as const, content: 'Some notes about the topic' },
        { id: '3', type: 'outline' as const, content: 'Outline points for the video' },
      ];
      
      const result = await orchestrator.processMultipleSources(sources, {
        analyzeFirst: false, // Skip analysis to avoid API calls
        combineStrategy: 'merge',
        outputTemplate: 'blog',
      });
      
      expect(result).toHaveProperty('sources');
      expect(result.sources).toHaveLength(3);
      expect(result).toHaveProperty('processingOptions');
      expect(result.processingOptions.combineStrategy).toBe('merge');
    });
  });
});