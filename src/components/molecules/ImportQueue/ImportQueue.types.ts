// Task #6: Create File Import Progress Tracking

export interface QueuedFile {
  id: string;
  file_path: string;
  filename: string;
  size: number;
  status: 'pending' | 'validating' | 'importing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  startTime?: number;
  completedTime?: number;
}

export interface ImportQueueProps {
  files: QueuedFile[];
  onCancel?: (fileId: string) => void;
  onCancelAll?: () => void;
  onRetry?: (fileId: string) => void;
  onClear?: () => void;
  className?: string;
}

export interface ImportQueueItemProps {
  file: QueuedFile;
  onCancel?: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
}

export interface ImportProgress {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  currentFile?: string;
}