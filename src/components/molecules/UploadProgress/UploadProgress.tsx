import React from 'react';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { Spinner } from '../../atoms/Spinner';
import { UploadProgressProps } from './UploadProgress.types';

const statusConfig = {
  queued: { 
    label: 'Queued', 
    variant: 'secondary' as const,
    icon: 'refresh' as const
  },
  uploading: { 
    label: 'Uploading', 
    variant: 'primary' as const,
    icon: 'upload' as const
  },
  processing: { 
    label: 'Processing', 
    variant: 'primary' as const,
    icon: 'refresh' as const
  },
  completed: { 
    label: 'Completed', 
    variant: 'success' as const,
    icon: 'check-circle' as const
  },
  failed: { 
    label: 'Failed', 
    variant: 'error' as const,
    icon: 'x-circle' as const
  },
  manual_export_required: { 
    label: 'Manual Export Required', 
    variant: 'warning' as const,
    icon: 'alert-circle' as const
  }
};

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  status,
  error,
  onRetry,
  onCancel
}) => {
  const config = statusConfig[status];
  const isActive = status === 'uploading' || status === 'processing';
  const showProgress = isActive || (status === 'failed' && progress > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {isActive ? (
              <Spinner size="sm" />
            ) : (
              <Icon 
                name={config.icon} 
                className={`w-5 h-5 ${
                  status === 'completed' ? 'text-green-500' :
                  status === 'failed' ? 'text-red-500' :
                  status === 'manual_export_required' ? 'text-yellow-500' :
                  'text-gray-400'
                }`}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <div className="mt-1">
              <Badge variant={config.variant} size="sm">
                {config.label}
              </Badge>
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
            {status === 'manual_export_required' && (
              <p className="mt-2 text-sm text-yellow-700">
                Upload complete. Please export the transcript from Descript manually.
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {status === 'failed' && onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {isActive && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div 
            className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
            style={{'--progress-width': `${progress}%`} as React.CSSProperties}
          >
            <div 
              className={`h-full transition-all duration-300 ease-out w-[var(--progress-width)] ${
                status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};