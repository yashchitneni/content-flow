// Task #14: Hook for importing transcripts with automatic tag extraction
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { tagExtractionService } from '../services/tag-extraction.service';
import { toast } from 'sonner';

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