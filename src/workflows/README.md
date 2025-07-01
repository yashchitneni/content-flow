# ContentFlow LangGraph Workflows

This directory contains the AI-powered workflow system for ContentFlow, built with LangGraph.

## Architecture

### Core Components

1. **Base Workflow** (`base-workflow.ts`)
   - Abstract base class for all workflows
   - Provides error handling, logging, and retry mechanisms
   - Ensures consistent behavior across all workflows

2. **Transcript Analysis** (`transcript-analysis.workflow.ts`)
   - Analyzes single transcripts
   - Extracts key points, sentiment, and tags
   - Generates summaries

3. **Content Generation** (`content-generation.workflow.ts`)
   - Generates social media content from transcripts
   - Supports multiple templates (thread, carousel, newsletter, blog, video-script)
   - Validates output against template constraints

4. **Multi-Source Processing** (`multi-source.workflow.ts`)
   - Combines multiple sources (transcripts, notes, outlines)
   - Supports different combination strategies
   - Orchestrates analysis and generation workflows

### Configuration System

- Flexible configuration via `workflow.config.ts`
- Supports OpenAI and Anthropic providers
- Environment-based configuration with `.env` file
- Runtime configuration updates

### Error Handling

- Graceful error handling that doesn't crash the system
- Retryable errors with exponential backoff
- Comprehensive error logging and context preservation
- Workflow-specific error recovery strategies

### Logging

- Winston-based logging system
- Structured logging for workflow steps
- Separate error and combined log files
- Configurable log levels and formats

## Usage

### Basic Usage

```typescript
import WorkflowOrchestrator from './workflows';

// Initialize orchestrator
const orchestrator = new WorkflowOrchestrator({
  aiProvider: 'openai',
  logging: { level: 'info', format: 'pretty' }
});

// Analyze a transcript
const analysis = await orchestrator.analyzeTranscript("Your transcript content here");

// Generate content
const content = await orchestrator.generateContent(
  [{ id: '1', content: 'transcript', analysis }],
  'thread'
);

// Process multiple sources
const result = await orchestrator.processMultipleSources(
  [
    { id: '1', type: 'transcript', content: '...' },
    { id: '2', type: 'note', content: '...' }
  ],
  { combineStrategy: 'merge', outputTemplate: 'blog' }
);
```

### Configuration

Set up your `.env` file:

```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
AI_PROVIDER=openai
LOG_LEVEL=info
```

### Error Handling

All workflows return a state object with an optional `error` field:

```typescript
const result = await orchestrator.analyzeTranscript(transcript);
if (result.error) {
  console.error('Workflow failed:', result.error);
} else {
  console.log('Analysis:', result.analysis);
}
```

## Testing

Run tests with:

```bash
npm test
npm run test:workflows
```

## Workflow States

Each workflow maintains its own state structure:

- **TranscriptAnalysisState**: transcript, analysis, messages, error
- **ContentGenerationState**: transcripts, template, generatedContent, error
- **MultiSourceState**: sources, processingOptions, processedSources, finalOutput, error

## Integration Points

The workflow system integrates with:
- Tauri backend via IPC commands
- Frontend state management (Zustand)
- Database for storing results
- Export system for generated content