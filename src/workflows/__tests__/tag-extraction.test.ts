// Task #14: Tests for AI-powered tag extraction
import { TranscriptAnalysisWorkflow } from '../transcript-analysis.workflow';
import { loadConfig } from '../../config/workflow.config';

describe('Tag Extraction', () => {
  let workflow: TranscriptAnalysisWorkflow;

  beforeEach(() => {
    const config = loadConfig();
    workflow = new TranscriptAnalysisWorkflow(config);
  });

  it('should extract tags with relevance scores', async () => {
    const mockTranscript = `
      In this comprehensive tutorial, we'll explore machine learning fundamentals and 
      dive deep into neural networks. We'll cover Python programming, data science 
      concepts, and artificial intelligence applications. This educational content 
      is perfect for beginners learning about AI and deep learning frameworks like 
      TensorFlow and PyTorch. We'll also discuss natural language processing and 
      computer vision techniques.
    `;

    const result = await workflow.run({
      transcript: mockTranscript,
      messages: [],
    });

    expect(result.analysis).toBeDefined();
    expect(result.analysis?.tags).toBeDefined();
    expect(result.analysis?.tags.length).toBeGreaterThan(0);
    expect(result.analysis?.tags.length).toBeLessThanOrEqual(10);
    
    // Check that we have tag scores
    expect(result.analysis?.tagScores).toBeDefined();
    
    // Check content score
    expect(result.analysis?.contentScore).toBeDefined();
    expect(result.analysis?.contentScore).toBeGreaterThan(0);
    expect(result.analysis?.contentScore).toBeLessThanOrEqual(1);
    
    // Check platform scores
    expect(result.analysis?.platformScores).toBeDefined();
    expect(result.analysis?.platformScores?.thread).toBeGreaterThan(0);
    expect(result.analysis?.platformScores?.carousel).toBeGreaterThan(0);
    expect(result.analysis?.platformScores?.blog).toBeGreaterThan(0);
  });

  it('should calculate appropriate platform scores based on content', async () => {
    const shortTranscript = `Quick tip: Use keyboard shortcuts to speed up your workflow.`;
    
    const result = await workflow.run({
      transcript: shortTranscript,
      messages: [],
    });

    // Short content should have lower blog score
    expect(result.analysis?.platformScores?.blog).toBeLessThan(0.7);
  });

  it('should handle empty transcripts gracefully', async () => {
    const result = await workflow.run({
      transcript: '',
      messages: [],
    });

    expect(result.error).toBeDefined();
  });
});