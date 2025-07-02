import { ImportedFile } from '../FileDropZone/FileDropZone.types';

export interface FileListProps {
  files: ImportedFile[];
  isLoading?: boolean;
  onFileSelect?: (file: ImportedFile) => void;
  onRefresh?: () => void;
  className?: string;
}

export interface FileListItemProps {
  file: ImportedFile;
  onSelect?: (file: ImportedFile) => void;
  isSelected?: boolean;
}