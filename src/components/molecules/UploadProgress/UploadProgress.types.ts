export interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'manual_export_required';
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export interface UploadProgressItem {
  id: string;
  fileName: string;
  filePath: string;
  progress: number;
  status: UploadProgressProps['status'];
  error?: string;
}