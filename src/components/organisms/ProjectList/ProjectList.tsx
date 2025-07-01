import React from 'react';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { LoadingState } from '../../molecules/LoadingState';
import { ProjectListProps } from './ProjectList.types';

const statusConfig = {
  ready: {
    label: 'Ready',
    variant: 'success' as const,
    icon: 'CheckCircle' as const
  },
  uploading: {
    label: 'Uploading',
    variant: 'primary' as const,
    icon: 'Upload' as const
  },
  manual_export_required: {
    label: 'Export Required',
    variant: 'warning' as const,
    icon: 'AlertCircle' as const
  }
};

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onUploadFiles,
  isLoading = false
}) => {
  if (isLoading) {
    return <LoadingState message="Loading projects..." />;
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Icon name="FolderOpen" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Descript Projects
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Create a new project to start uploading videos for transcription.
        </p>
        <Button
          variant="primary"
          onClick={onCreateProject}
          icon={<Icon name="Plus" className="w-4 h-4" />}
        >
          Create Project
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Descript Projects
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={onCreateProject}
          icon={<Icon name="Plus" className="w-4 h-4" />}
        >
          New Project
        </Button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {projects.map((project) => {
          const config = statusConfig[project.status];
          const isSelected = project.id === selectedProjectId;
          
          return (
            <div
              key={project.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      {project.name}
                    </h4>
                    <Badge variant={config.variant} size="sm">
                      <Icon name={config.icon} className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Icon name="Film" className="w-4 h-4 mr-1" />
                      {project.fileCount} {project.fileCount === 1 ? 'file' : 'files'}
                    </span>
                    <span className="flex items-center">
                      <Icon name="Calendar" className="w-4 h-4 mr-1" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {project.status === 'manual_export_required' && (
                    <p className="mt-2 text-sm text-yellow-700">
                      Upload complete. Export transcripts from Descript to continue.
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  {project.status === 'ready' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadFiles(project.id);
                      }}
                      icon={<Icon name="Upload" className="w-4 h-4" />}
                    >
                      Upload Files
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};