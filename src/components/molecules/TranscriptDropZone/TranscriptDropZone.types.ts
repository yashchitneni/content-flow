// Task #11: Build Transcript Auto-Import System

export interface TranscriptDropZoneProps {
  onTranscriptsSelected: (transcripts: string[]) => void;
  isImporting?: boolean;
  acceptedFormats?: string[];
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export interface TranscriptImportRequest {
  file_paths: string[];
}

export interface ImportedTranscript {
  id: string;
  file_path: string;
  filename: string;
  content: string;
  word_count: number;
  language: string;
  status: string;
}

export interface TranscriptImportError {
  file_path: string;
  error: string;
}

export interface TranscriptImportResult {
  success: boolean;
  imported_transcripts: ImportedTranscript[];
  errors: TranscriptImportError[];
}

export interface TranscriptSummary {
  id: string;
  filename: string;
  word_count: number;
  language: string;
  content_preview: string;
  imported_at: string;
  status: string;
}