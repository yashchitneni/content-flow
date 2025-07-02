import React from 'react';
import { Icon, IconName } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { Spinner } from '../../atoms/Spinner';
import { FileListProps, FileListItemProps } from './FileList.types';

const FileListItem: React.FC<FileListItemProps> = ({ 
  file, 
  onSelect, 
  isSelected = false 
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (format: string): IconName => {
    switch (format.toLowerCase()) {
      case 'mp4':
        return 'video';
      case 'mov':
        return 'video';
      case 'avi':
        return 'video';
      case 'mkv':
        return 'video';
      default:
        return 'file';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'imported':
        return <Badge variant="success">Imported</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div 
      className={`
        flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
      onClick={() => onSelect?.(file)}
    >
      <div className="flex-shrink-0 mr-4">
        <Icon 
          name={getFileIcon(file.format)} 
          className="w-8 h-8 text-gray-400"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {file.filename}
          </h4>
          {getStatusBadge(file.status)}
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{formatFileSize(file.file_size)}</span>
          <span className="uppercase">{file.format}</span>
          <span>ID: {file.id.slice(0, 8)}...</span>
        </div>
      </div>
      
      <div className="flex-shrink-0 ml-4">
        <Icon 
          name="folder" 
          className="w-4 h-4 text-gray-400"
        />
      </div>
    </div>
  );
};

export const FileList: React.FC<FileListProps> = ({
  files,
  isLoading = false,
  onFileSelect,
  onRefresh,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center p-8">
          <Spinner className="w-6 h-6 text-primary-500" />
          <span className="ml-2 text-sm text-gray-600">Loading files...</span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Icon name="video" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No files imported yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Import your first video files to get started
          </p>
          {onRefresh && (
            <Button 
              variant="secondary" 
              size="sm"
              icon={<Icon name="refresh" className="w-4 h-4" />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Imported Files ({files.length})
        </h3>
        {onRefresh && (
          <Button 
            variant="secondary" 
            size="sm"
            icon={<Icon name="refresh" className="w-4 h-4" />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {files.map((file) => (
          <FileListItem
            key={file.id}
            file={file}
            onSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
};