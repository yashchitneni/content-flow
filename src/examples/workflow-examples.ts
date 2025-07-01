import WorkflowOrchestrator from '../workflows';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runExamples() {
  // Initialize the orchestrator
  const orchestrator = new WorkflowOrchestrator({
    logging: {
      level: 'info',
      format: 'pretty',
    },
  });
  
  console.log('🚀 ContentFlow Workflow Examples\n');
  
  // Example 1: Analyze a single transcript
  console.log('📝 Example 1: Analyzing a transcript...');
  const transcriptExample = `
    Welcome to today's video where we're going to explore the latest developments in AI technology.
    We'll be covering three main areas: natural language processing, computer vision, and robotics.
    
    First, let's talk about NLP. The recent advances in large language models have been incredible.
    Models like GPT-4 and Claude are now capable of understanding context and nuance in ways that
    were impossible just a few years ago.
    
    In computer vision, we're seeing amazing progress in real-time object detection and segmentation.
    This technology is being applied in autonomous vehicles, medical imaging, and augmented reality.
    
    Finally, robotics is becoming more accessible with affordable hardware and better software frameworks.
    We're seeing robots that can learn from demonstration and adapt to new environments.
    
    What's your take on these developments? Let me know in the comments below!
  `;
  
  try {
    const analysisResult = await orchestrator.analyzeTranscript(transcriptExample);
    
    if (analysisResult.error) {
      console.error('❌ Analysis failed:', analysisResult.error);
    } else {
      console.log('✅ Analysis complete:');
      console.log('  Summary:', analysisResult.analysis?.summary);
      console.log('  Key Points:', analysisResult.analysis?.keyPoints);
      console.log('  Tags:', analysisResult.analysis?.tags);
      console.log('  Sentiment:', analysisResult.analysis?.sentiment);
      console.log('  Content Type:', analysisResult.analysis?.contentType);
    }
  } catch (error) {
    console.error('❌ Example 1 failed:', error);
  }
  
  console.log('\n---\n');
  
  // Example 2: Generate content from transcripts
  console.log('🎨 Example 2: Generating Twitter thread...');
  const transcripts = [
    {
      id: '1',
      content: transcriptExample,
      analysis: {
        summary: 'Overview of AI advances in NLP, computer vision, and robotics',
        keyPoints: [
          'Large language models show incredible progress',
          'Computer vision enables real-time applications',
          'Robotics becoming more accessible',
        ],
        tags: ['AI', 'technology', 'NLP', 'computer-vision', 'robotics'],
      },
    },
  ];
  
  try {
    const threadResult = await orchestrator.generateContent(
      transcripts,
      'thread'
    );
    
    if (threadResult.error) {
      console.error('❌ Generation failed:', threadResult.error);
    } else {
      console.log('✅ Thread generated:');
      console.log('  Title:', threadResult.generatedContent?.title);
      console.log('  Tweets:');
      (threadResult.generatedContent?.content as string[])?.forEach((tweet, i) => {
        console.log(`    ${i + 1}. ${tweet}`);
      });
    }
  } catch (error) {
    console.error('❌ Example 2 failed:', error);
  }
  
  console.log('\n---\n');
  
  // Example 3: Process multiple sources
  console.log('🔄 Example 3: Processing multiple sources...');
  const sources = [
    {
      id: 'transcript-1',
      type: 'transcript' as const,
      content: transcriptExample,
    },
    {
      id: 'note-1',
      type: 'note' as const,
      content: `
        Additional notes on AI trends:
        - Multimodal models are the future
        - Edge computing for AI is growing
        - Privacy-preserving ML techniques
      `,
    },
    {
      id: 'outline-1',
      type: 'outline' as const,
      content: `
        Blog post outline:
        1. Introduction to AI revolution
        2. Deep dive into each technology
        3. Real-world applications
        4. Future predictions
        5. Call to action
      `,
    },
  ];
  
  try {
    const multiResult = await orchestrator.processMultipleSources(sources, {
      analyzeFirst: true,
      combineStrategy: 'thematic',
      outputTemplate: 'blog',
    });
    
    if (multiResult.error) {
      console.error('❌ Multi-source processing failed:', multiResult.error);
    } else {
      console.log('✅ Multi-source processing complete:');
      console.log('  Sources processed:', multiResult.processedSources?.length);
      console.log('  Final output:', multiResult.finalOutput?.combined?.title);
      console.log('  Content preview:', 
        multiResult.finalOutput?.combined?.content?.substring(0, 200) + '...'
      );
    }
  } catch (error) {
    console.error('❌ Example 3 failed:', error);
  }
  
  console.log('\n✨ Examples complete!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { runExamples };