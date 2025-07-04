// Task #17: Create Content Generation UI
import React, { useState } from 'react';
import { TemplateSelector, ContentTemplate } from '../components/molecules/TemplateSelector';
import { TranscriptDropZone, TranscriptSummary, FileData } from '../components/molecules/TranscriptDropZone';
import { ContentPreviewModal } from '../components/molecules/ContentPreviewModal';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { useTranscriptStore } from '../store/transcript.store';
import { useApiKeyStore } from '../store/apiKey.store';
import { useUIStore } from '../store/ui.store';
import WorkflowOrchestrator from '../workflows';

export const ContentStudio: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'transcripts' | 'templates' | 'generate'>('transcripts');
  const [generatedContent, setGeneratedContent] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Use domain-specific stores
  const { 
    transcripts, 
    selectedTranscriptIds, 
    setSelectedTranscripts, 
    addTranscripts
  } = useTranscriptStore();
  
  const { 
    hasApiKey, 
    apiKeys
  } = useApiKeyStore();
  
  const { addNotification } = useUIStore();

  const handleTranscriptsImported = (fileData: FileData[] | string[]) => {
    // Handle both file data and string array for backward compatibility
    if (Array.isArray(fileData) && fileData.length > 0) {
      if (typeof fileData[0] === 'string') {
        // Legacy string array handling
        setSelectedTranscripts(fileData as string[]);
      } else {
        // New file data handling
        const files = fileData as FileData[];
        
        // For now, just add to local state without Tauri
        const newTranscripts = files.map((file, index) => ({
          id: `imported-${Date.now()}-${index}`,
          filename: file.name,
          word_count: file.content.split(/\s+/).length,
          language: 'en',
          content_preview: file.content.substring(0, 200) + '...',
          full_content: file.content,
          imported_at: new Date().toISOString(),
          status: 'imported' as const
        }));
        
        addTranscripts(newTranscripts);
        setSelectedTranscripts(newTranscripts.map(t => t.id));
        addNotification('success', `Successfully imported ${files.length} transcript${files.length > 1 ? 's' : ''}!`);
      }
      
      // Move to template selection
      setStep('templates');
    }
  };

  const handleGenerate = async (e?: React.MouseEvent) => {
    // Prevent any default form submission behavior
    if (e) {
      e.preventDefault();
    }
    
    console.log('=== CONTENT GENERATION DEBUG START ===');
    console.log('[ContentStudio] Generate button clicked');
    console.log('[ContentStudio] Selected template:', selectedTemplate);
    console.log('[ContentStudio] Selected transcript IDs:', selectedTranscriptIds);
    console.log('[ContentStudio] Number of transcripts available:', transcripts.length);
    console.log('[ContentStudio] API keys status:', {
      hasOpenAI: !!apiKeys.openai,
      openAILength: apiKeys.openai?.length,
      hasClaude: !!apiKeys.claude,
      claudeLength: apiKeys.claude?.length
    });
    console.log('[ContentStudio] localStorage check:', localStorage.getItem('contentflow-storage'));
    
    // Parse localStorage to check actual stored value
    try {
      const stored = localStorage.getItem('contentflow-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[ContentStudio] Parsed localStorage:', parsed);
        console.log('[ContentStudio] Stored apiKeys:', parsed.state?.apiKeys);
      }
    } catch (e) {
      console.error('[ContentStudio] Failed to parse localStorage:', e);
    }
    
    if (!selectedTemplate || transcripts.length === 0) {
      console.error('[ContentStudio] Missing template or transcripts');
      return;
    }
    
    // Check if API key exists in global store
    if (!hasApiKey('openai')) {
      console.error('[ContentStudio] No OpenAI API key found');
      addNotification('error', 'OpenAI API Key required. Please add it in Settings.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Use real LangGraph workflow
      console.log('[ContentStudio] Using LangGraph workflow');
      console.log('[ContentStudio] Selected template:', selectedTemplate);
      console.log('[ContentStudio] Selected transcripts:', selectedTranscriptIds);
      console.log('[ContentStudio] API Keys:', { openai: !!apiKeys.openai });
      
      // Prepare transcript data - use selected transcripts
      const selectedTranscriptData = transcripts.filter(t => selectedTranscriptIds.includes(t.id));
      console.log('[ContentStudio] Selected transcript data:', selectedTranscriptData.length, 'transcripts');
      console.log('[ContentStudio] First transcript sample:', selectedTranscriptData[0]);
      
      if (selectedTranscriptData.length === 0) {
        console.error('[ContentStudio] No transcripts selected!');
        addNotification('error', 'Please select at least one transcript');
        setIsGenerating(false);
        return;
      }
      
      const transcriptData = selectedTranscriptData.map(transcript => ({
        id: transcript.id,
        content: transcript.full_content || transcript.content_preview || transcript.content
      }));
      
      console.log('[ContentStudio] Transcript data prepared:', transcriptData.map(t => ({
        id: t.id,
        contentLength: t.content?.length || 0,
        contentSample: t.content?.substring(0, 100) + '...'
      })));
      
      const templateConstraints = {
        'twitter-thread': { maxLength: 280, maxTweets: 10 },
        'instagram-carousel': { maxSlides: 10, maxCaptionLength: 2200 },
        'linkedin-article': { maxLength: 3000 },
        'youtube-script': { targetDuration: '5-10 minutes' }
      };
      
      // Initialize workflow with API key
      const workflow = new WorkflowOrchestrator({
        apiKeys: {
          openai: apiKeys.openai || '',
          anthropic: apiKeys.claude || ''
        },
        aiProvider: apiKeys.openai ? 'openai' : 'anthropic'
      });
      
      // Map template names to workflow types
      const templateTypeMap: Record<string, 'thread' | 'carousel' | 'newsletter' | 'blog' | 'video-script'> = {
        'twitter-thread': 'thread',
        'instagram-carousel': 'carousel',
        'linkedin-article': 'blog',
        'youtube-script': 'video-script'
      };
      
      // Generate content using LangGraph
      const result = await workflow.generateContent(
        transcriptData,
        templateTypeMap[selectedTemplate || 'twitter-thread'] || 'thread',
        templateConstraints[selectedTemplate || 'twitter-thread'],
        selectedTemplate // Pass the template ID for saving
      );
      
      console.log('[ContentStudio] Workflow execution complete. Full result:', result);
      setIsGenerating(false);
      
      if (result && result.generatedContent) {
        // Show the generated content
        const { generatedContent } = result;
        const content = Array.isArray(generatedContent.content) 
          ? generatedContent.content.join('\n\n')
          : generatedContent.content;
        
        console.log('[ContentStudio] Generated content details:', {
          title: generatedContent.title,
          format: generatedContent.format,
          wordCount: generatedContent.metadata?.wordCount,
          contentType: typeof generatedContent.content,
          contentLength: content?.length
        });
        
        addNotification('success', 'Content generated successfully!');
        
        // Store the generated content and show preview
        setGeneratedContent(generatedContent);
        setShowPreview(true);
      } else {
        console.error('[ContentStudio] No content generated. Result:', result);
        console.error('[ContentStudio] Result error:', result?.error);
        addNotification('error', result?.error || 'No content was generated');
      }
      
    } catch (error) {
      console.error('[ContentStudio] Generation error:', error);
      setIsGenerating(false);
      addNotification('error', `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-theme-primary dark:bg-gradient-text dark:bg-clip-text dark:text-transparent mb-2">
            Content Studio
          </h1>
          <p className="text-lg text-theme-secondary">
            Transform your Descript transcripts into engaging social media content
          </p>
        </div>

        {/* Premium Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {['transcripts', 'templates', 'generate'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300 transform
                    ${step === stepName || 
                      (stepName === 'transcripts' && transcripts.length > 0) || 
                      (stepName === 'templates' && selectedTemplate) ||
                      (stepName === 'generate' && selectedTemplate && step === 'generate')
                      ? 'bg-gradient-button-primary text-white shadow-glow scale-110' 
                      : 'glass text-theme-tertiary hover:scale-105'
                    }
                  `}
                >
                  {index + 1}
                </div>
                <span className="ml-3 text-sm font-medium text-theme-secondary capitalize">
                  {stepName}
                </span>
                {index < 2 && (
                  <div className="w-12 h-px bg-gradient-to-r from-theme to-transparent ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Transcript Import */}
        <div className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-8 mb-6 hover-lift">
          <h2 className="text-xl font-semibold text-theme-primary mb-4">
            Step 1: Import Descript Transcripts
          </h2>
          
          <TranscriptDropZone
            onTranscriptsSelected={handleTranscriptsImported}
            className="mb-6"
          />
          
          {transcripts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-theme-primary mb-4">
                Available Transcripts ({transcripts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transcripts.map((transcript) => (
                  <div 
                    key={transcript.id} 
                    onClick={() => {
                      if (selectedTranscriptIds.includes(transcript.id)) {
                        setSelectedTranscripts(selectedTranscriptIds.filter(id => id !== transcript.id));
                      } else {
                        setSelectedTranscripts([...selectedTranscriptIds, transcript.id]);
                      }
                    }}
                    className={`glass rounded-lg p-4 transition-all cursor-pointer hover-lift ${
                      selectedTranscriptIds.includes(transcript.id)
                        ? 'border-primary-500 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 shadow-glow-subtle' 
                        : 'border-theme hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-theme-primary truncate flex-1">{transcript.filename}</h4>
                      {selectedTranscriptIds.includes(transcript.id) && (
                        <Icon name="check-circle" className="w-5 h-5 text-primary-400 ml-2 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-theme-secondary mt-1">{transcript.word_count} words</p>
                    <p className="text-xs text-theme-tertiary mt-2 line-clamp-3">{transcript.content_preview}</p>
                  </div>
                ))}
              </div>
              
              {transcripts.length > 0 && step === 'transcripts' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => setStep('templates')}
                    disabled={selectedTranscriptIds.length === 0}
                    icon={<Icon name="chevron-right" className="w-4 h-4" />}
                  >
                    Continue to Templates ({selectedTranscriptIds.length} selected)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Template Selection */}
        {(step === 'templates' || step === 'generate') && (
          <div className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-8 mb-6 hover-lift animate-fade-in">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">
              Step 2: Choose Content Template
            </h2>
            
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={(template) => {
                setSelectedTemplate(template);
                setStep('generate');
              }}
              disabled={isGenerating}
            />
          </div>
        )}

        {/* Step 3: Generate Content */}
        {step === 'generate' && selectedTemplate && (
          <div className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-theme-primary mb-4">
              Step 3: Generate Content
            </h2>
            
            <div className="glass rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-theme-primary">Ready to Generate</h3>
                  <p className="text-sm text-theme-secondary mt-1">
                    Template: {selectedTemplate.replace('-', ' ')} • 
                    Transcripts: {selectedTranscriptIds.length} selected
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  size="large"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  icon={isGenerating ? undefined : <Icon name="brain" className="w-5 h-5" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Content'}
                </Button>
              </div>
            </div>
            
            {/* API Key Warning */}
            {!hasApiKey('openai') && (
              <div className="glass border border-warning-400/30 rounded-lg p-4 bg-gradient-to-br from-warning-500/10 to-transparent">
                <div className="flex items-start space-x-3">
                  <Icon name="alert-triangle" className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-sm text-theme-primary">
                    <div className="font-medium mb-1 text-warning-400">API Key Required</div>
                    <div className="text-theme-secondary">Please add your OpenAI API key in Settings to generate content with AI.</div>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-theme-tertiary">
                      <li>Click "Settings" button in the top right</li>
                      <li>Enter your OpenAI API key</li>
                      <li>Click "Save"</li>
                      <li>Return here to generate content</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section - Premium Glass Style */}
        <div className="mt-6 glass-ultra rounded-xl shadow-theme-glass border border-theme p-6 hover-lift">
          <div className="flex items-start gap-4">
            <div className="p-2 glass rounded-lg">
              <Icon name="check-circle" className="w-5 h-5 text-success-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-theme-primary">Workflow Ready</h3>
                <Badge variant="success" size="sm">Live Folder System</Badge>
              </div>
              <ol className="space-y-2 text-theme-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-success-400 font-medium">1.</span>
                  <span>Export transcript from Descript as .txt or .srt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-400 font-medium">2.</span>
                  <span>Drop the file here or click anywhere in the box</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-400 font-medium">3.</span>
                  <span>Select template and generate content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-400 font-medium">4.</span>
                  <span>Content will be created using LangGraph workflows</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Preview Modal */}
      {generatedContent && (
        <ContentPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={generatedContent.title}
          content={generatedContent.content}
          format={generatedContent.format}
          metadata={generatedContent.metadata}
          onEdit={() => {
            setShowPreview(false);
            addNotification('info', 'Edit functionality coming soon!');
          }}
          onExport={() => {
            setShowPreview(false);
            addNotification('info', 'Export functionality coming soon!');
          }}
        />
      )}
    </div>
  );
};