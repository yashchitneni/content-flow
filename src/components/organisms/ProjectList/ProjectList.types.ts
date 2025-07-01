export interface DescriptProject {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
  status: 'ready' | 'uploading' | 'manual_export_required';
}

export interface ProjectListProps {
  projects: DescriptProject[];
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onUploadFiles: (projectId: string) => void;
  isLoading?: boolean;
}