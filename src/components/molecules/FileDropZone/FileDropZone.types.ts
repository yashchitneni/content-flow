export interface FileDropZoneProps {
  onFilesSelected: (files: string[]) => void;
  isUploading?: boolean;
  acceptedFormats?: string[];
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export interface FileImportRequest {
  file_paths: string[];
}

export interface ImportedFile {
  id: string;
  original_path: string;
  filename: string;
  file_size: number;
  format: string;
  status: string;
}

export interface FileImportError {
  file_path: string;
  error: string;
}

export interface FileImportResult {
  success: boolean;
  imported_files: ImportedFile[];
  errors: FileImportError[];
}