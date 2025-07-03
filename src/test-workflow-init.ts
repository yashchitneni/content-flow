// Test that workflows can be initialized without API keys
import { TranscriptAnalysisWorkflow } from './workflows/transcript-analysis.workflow';
import { ContentGenerationWorkflow } from './workflows/content-generation.workflow';
import { loadConfig } from './config/workflow.config';

console.log('Testing workflow initialization without API keys...');

try {
  const config = loadConfig();
  console.log('Config loaded successfully');
  
  // These should not throw errors on initialization
  const transcriptWorkflow = new TranscriptAnalysisWorkflow(config);
  console.log('✅ TranscriptAnalysisWorkflow initialized successfully');
  
  const contentWorkflow = new ContentGenerationWorkflow(config);
  console.log('✅ ContentGenerationWorkflow initialized successfully');
  
  console.log('\nWorkflows can be initialized without API keys!');
  console.log('API keys will only be required when actually running the workflows.');
} catch (error) {
  console.error('❌ Error during initialization:', error.message);
}