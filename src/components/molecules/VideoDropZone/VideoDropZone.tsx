// Task #5: Implement Video File Drag-and-Drop Import
import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Progress } from '../../atoms/Progress';
import { Badge } from '../../atoms/Badge';
import { invoke } from '@tauri-apps/api/core';

export interface VideoFile {
  id: string;
  filename: string;
  file_size: number;
  format: string;
  status: string;
  original_path: string;
}

export interface VideoDropZoneProps {
  onVideosImported: (videos: VideoFile[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export const VideoDropZone: React.FC<VideoDropZoneProps> = ({
  onVideosImported,
  acceptedFormats = ['.mp4', '.mov', '.avi', '.mkv'],
  maxFiles = 20,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const processFiles = async (files: File[]) => {
    setIsImporting(true);
    setErrors([]);
    setImportProgress(0);

    try {
      // Filter for video files
      const videoFiles = files.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedFormats.includes(ext);
      });

      if (videoFiles.length === 0) {
        setErrors(['No valid video files found. Accepted formats: ' + acceptedFormats.join(', ')]);
        setIsImporting(false);
        return;
      }

      if (videoFiles.length > maxFiles) {
        setErrors([`Too many files. Maximum ${maxFiles} files allowed.`]);
        setIsImporting(false);
        return;
      }

      // Get file paths (in Tauri, we need to work with paths)
      // For now, we'll use the file names as paths - in a real implementation,
      // we'd need to handle file paths properly
      const filePaths = videoFiles.map(f => f.name);
      
      // Validate files first
      const validPaths = await invoke<string[]>('validate_video_files', { 
        filePaths 
      });

      if (validPaths.length === 0) {
        setErrors(['No valid video files found.']);
        setIsImporting(false);
        return;
      }

      // Import the valid files
      const result = await invoke<{
        success: boolean;
        imported_files: VideoFile[];
        errors: Array<{ file_path: string; error: string }>;
      }>('import_video_files', {
        request: { file_paths: validPaths }
      });

      if (result.errors.length > 0) {
        setErrors(result.errors.map(e => `${e.file_path}: ${e.error}`));
      }

      if (result.imported_files.length > 0) {
        onVideosImported(result.imported_files);
        
        // Show success message
        setTimeout(() => {
          alert(`✅ Successfully imported ${result.imported_files.length} video${result.imported_files.length > 1 ? 's' : ''}!`);
        }, 100);
      }

      setImportProgress(100);
    } catch (error) {
      console.error('Import error:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to import videos']);
    } finally {
      setIsImporting(false);
      setTimeout(() => {
        setImportProgress(0);
        setErrors([]);
      }, 3000);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isImporting) return;

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, [disabled, isImporting, acceptedFormats, maxFiles, onVideosImported]);

  const handleFileSelect = async () => {
    if (disabled || isImporting) return;
    
    // File browser functionality will be added when Tauri dialog is properly configured
    alert('Please drag and drop video files into the drop zone');
  };

  return (
    <div className={`${className}`}>
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isImporting ? 'pointer-events-none' : ''}
        `}
      >
        {isImporting ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto animate-pulse">
              <Icon name="video" className="w-full h-full text-primary-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Importing Videos...</p>
              <p className="text-sm text-gray-600 mt-1">Please wait while we process your files</p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress value={importProgress} size="small" />
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <Icon 
                name="video" 
                className={`w-full h-full ${isDragOver ? 'text-primary-600' : 'text-gray-400'}`} 
              />
            </div>
            
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Drop videos here' : 'Drag & drop video files'}
            </p>
            
            <p className="text-sm text-gray-600 mb-4">
              or click to browse
            </p>
            
            <Button
              variant="secondary"
              size="small"
              onClick={handleFileSelect}
              disabled={disabled}
              icon={<Icon name="folder-open" className="w-4 h-4" />}
            >
              Browse Files
            </Button>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {acceptedFormats.map(format => (
                <Badge key={format} variant="secondary" size="sm">
                  {format}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 