// Task #14: Hook for importing transcripts with automatic tag extraction
import { useState } from 'react';
import { invoke } from '../lib/tauri-wrapper';
import { tagExtractionService } from '../services/tag-extraction.service';
import { toast } from 'sonner';
import { useAppStore } from '../store/app.store';
import { WorkflowOrchestrator } from '../workflows';

export interface TranscriptImportResult {
  success: boolean;
  imported_transcripts: Array<{
    id: string;
    file_path: string;
    filename: string;
    content: string;
    word_count: number;
    language: string;
    status: string;
  }>;
  errors: Array<{
    file_path: string;
    error: string;
  }>;
}

export const useTranscriptImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // Get automation settings from store
  const { 
    isAutoGenerateEnabled, 
    defaultAutomationTemplateId, 
    apiKeys,
    addNotification 
  } = useAppStore();

  const importTranscripts = async (filePaths: string[]) => {
    setIsImporting(true);
    setImportProgress(0);
    const toastId = toast.loading('Importing transcripts...');

    try {
      // First validate the files
      const validFiles = await invoke<string[]>('validate_transcript_files', {
        filePaths
      });

      if (validFiles.length === 0) {
        toast.error('No valid transcript files found', { id: toastId });
        return null;
      }

      setImportProgress(25);

      // Import the transcripts
      const result = await invoke<TranscriptImportResult>('import_transcript_files', {
        request: { file_paths: validFiles }
      });

      setImportProgress(50);

      if (result.success && result.imported_transcripts.length > 0) {
        toast.success(
          `Imported ${result.imported_transcripts.length} transcript${
            result.imported_transcripts.length > 1 ? 's' : ''
          }`,
          { id: toastId }
        );

        // Task #14: Automatically extract tags for imported transcripts
        setImportProgress(75);
        const tagToastId = toast.loading('Extracting tags from transcripts...');

        try {
          const transcriptIds = result.imported_transcripts.map(t => t.id);
          await tagExtractionService.processNewTranscripts(transcriptIds);
          toast.success('Tags extracted successfully!', { id: tagToastId });
        } catch (error) {
          console.error('Tag extraction failed:', error);
          toast.error('Failed to extract tags, but transcripts were imported', { id: tagToastId });
        }

        // Phase 3: Automation Mode - Generate content automatically if enabled
        if (isAutoGenerateEnabled && defaultAutomationTemplateId) {
          setImportProgress(85);
          
          try {
            // Get the template details
            const template = await invoke<{
              template_id: string;
              template_name: string;
              template_type: string;
              prompt: string;
            }>('get_template', { templateId: defaultAutomationTemplateId });
            
            if (template) {
              // Prepare transcript data for content generation
              const transcriptData = result.imported_transcripts.map(t => ({
                id: t.id,
                content: t.content
              }));
              
              // Map template type to workflow type
              const templateTypeMap: Record<string, 'thread' | 'carousel' | 'newsletter' | 'blog' | 'video-script'> = {
                'thread': 'thread',
                'carousel': 'carousel',
                'article': 'blog',
                'blog': 'blog',
                'newsletter': 'newsletter',
                'script': 'video-script',
                'video-script': 'video-script',
                'custom': 'blog' // Default custom templates to blog format
              };
              
              const workflowType = templateTypeMap[template.template_type] || 'blog';
              
              // Initialize workflow with API keys
              const workflow = new WorkflowOrchestrator({
                apiKeys: {
                  openai: apiKeys.openai || '',
                  anthropic: apiKeys.claude || ''
                },
                aiProvider: apiKeys.openai ? 'openai' : 'anthropic'
              });
              
              // Generate content in the background
              workflow.generateContent(
                transcriptData,
                workflowType,
                {}, // Use default constraints from template
                template.template_id
              ).then(workflowResult => {
                if (workflowResult && !workflowResult.error) {
                  const firstTranscript = result.imported_transcripts[0];
                  addNotification(
                    'success', 
                    `Content automatically generated from "${firstTranscript.filename}" using template "${template.template_name}"`
                  );
                } else {
                  addNotification(
                    'error', 
                    `Auto-generation failed: ${workflowResult?.error || 'Unknown error'}`
                  );
                }
              }).catch(error => {
                console.error('Auto-generation error:', error);
                addNotification(
                  'error', 
                  `Auto-generation failed: ${error.message || 'Unknown error'}`
                );
              });
              
              toast.info('Background content generation started...', { duration: 3000 });
            }
          } catch (error) {
            console.error('Failed to start auto-generation:', error);
            // Don't show error to user - automation failure shouldn't interrupt import
          }
        }

        setImportProgress(100);
        return result;
      } else {
        const errorMessages = result.errors.map(e => e.error).join(', ');
        toast.error(`Import failed: ${errorMessages}`, { id: toastId });
        return null;
      }
    } catch (error) {
      console.error('Transcript import error:', error);
      toast.error('Failed to import transcripts', { id: toastId });
      return null;
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return {
    importTranscripts,
    isImporting,
    importProgress
  };
};