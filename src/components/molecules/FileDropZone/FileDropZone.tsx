import React, { useState, useRef } from 'react';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Progress } from '../../atoms/Progress';
import { FileDropZoneProps, FileImportResult } from './FileDropZone.types';

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesSelected,
  isUploading = false,
  acceptedFormats = ['.mp4', '.mov', '.avi', '.mkv'],
  maxFiles = 50,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    // For now, we'll handle this as a placeholder
    // In Tauri, drag and drop will provide full file paths
    setErrors(['Drag and drop functionality requires Tauri integration']);
  };

  const handleBrowseClick = async () => {
    if (disabled || isUploading) return;

    try {
      // Import Tauri APIs dynamically for better compatibility
      const { open } = await import('@tauri-apps/api/dialog');
      
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Video Files',
          extensions: acceptedFormats.map(ext => ext.replace('.', ''))
        }]
      });

      if (selected && Array.isArray(selected)) {
        await processFiles(selected);
      } else if (selected && typeof selected === 'string') {
        await processFiles([selected]);
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      setErrors(['Failed to open file browser. Make sure you are running in Tauri.']);
    }
  };

  const processFiles = async (filePaths: string[]) => {
    setIsProcessing(true);
    setErrors([]);
    setProgress(0);

    try {
      // Import Tauri invoke function dynamically
      const { invoke } = await import('@tauri-apps/api/tauri');
      
      // Validate files first
      const validFiles = await invoke<string[]>('validate_video_files', {
        filePaths
      });

      if (validFiles.length === 0) {
        setErrors(['No valid video files found. Please select .mp4, .mov, .avi, or .mkv files.']);
        return;
      }

      if (validFiles.length > maxFiles) {
        setErrors([`Too many files selected. Maximum ${maxFiles} files allowed.`]);
        return;
      }

      // Import files
      setProgress(25);
      const result = await invoke<FileImportResult>('import_video_files', {
        request: { file_paths: validFiles }
      });

      setProgress(75);

      if (result.errors.length > 0) {
        setErrors(result.errors.map((err: any) => `${err.file_path}: ${err.error}`));
      }

      if (result.imported_files.length > 0) {
        onFilesSelected(result.imported_files.map((file: any) => file.original_path));
      }

      setProgress(100);
    } catch (error) {
      console.error('Error processing files:', error);
      setErrors([`Failed to import files: ${error}`]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const baseClasses = `
    relative
    border-2 border-dashed
    rounded-lg
    p-8
    text-center
    transition-all duration-300
    cursor-pointer
    min-h-48
    flex flex-col
    items-center
    justify-center
    space-y-4
  `;

  const stateClasses = disabled || isUploading
    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
    : isDragOver
    ? 'border-primary-500 bg-primary-100 transform scale-105'
    : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-100';

  return (
    <div className={`${className}`}>
      <div
        className={`${baseClasses} ${stateClasses}`.trim()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          className="hidden"
          onChange={() => {}} // Handled by browse click
        />

        <div className="flex flex-col items-center space-y-3">
          <Icon 
            name="upload" 
            className={`w-12 h-12 ${
              isDragOver ? 'text-primary-600' : 'text-gray-400'
            }`}
          />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop your video files here' : 'Import Video Files'}
            </h3>
            <p className="text-sm text-gray-600">
              Drag and drop your videos, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports: {acceptedFormats.join(', ')} • Max {maxFiles} files
            </p>
          </div>

          {!disabled && !isUploading && (
            <Button 
              variant="primary" 
              size="sm"
              icon={<Icon name="folder-open" className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Files
            </Button>
          )}
        </div>

        {(isProcessing || isUploading) && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center space-y-4">
            <Icon name="upload" className="w-8 h-8 text-primary-500 animate-pulse" />
            <div className="w-full max-w-xs">
              <Progress 
                value={progress} 
                className="h-2"
                variant="primary"
              />
            </div>
            <p className="text-sm text-gray-600">
              {isProcessing ? 'Processing files...' : 'Uploading files...'}
            </p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="alert-circle" className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-error-800 mb-2">
                Import Errors
              </h4>
              <ul className="text-sm text-error-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};