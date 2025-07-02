// Task #11: Build Transcript Auto-Import System
import React, { useState, useRef } from 'react';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Progress } from '../../atoms/Progress';
import { TranscriptDropZoneProps, TranscriptImportResult } from './TranscriptDropZone.types';

export const TranscriptDropZone: React.FC<TranscriptDropZoneProps> = ({
  onTranscriptsSelected,
  isImporting = false,
  acceptedFormats = ['.txt', '.srt', '.vtt'],
  maxFiles = 20,
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
    if (!disabled && !isImporting) {
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

    if (disabled || isImporting) return;

    const files = Array.from(e.dataTransfer.files);
    const transcriptFiles = files.filter(file => 
      acceptedFormats.some(format => file.name.toLowerCase().endsWith(format.replace('.', '')))
    );
    
    if (transcriptFiles.length > 0) {
      await processTranscripts(transcriptFiles);
    } else {
      setErrors(['Please drop valid transcript files (.txt, .srt, .vtt)']);
    }
  };

  const handleBrowseClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isImporting) return;
    
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const transcriptFiles = files.filter(file => 
      acceptedFormats.some(format => file.name.toLowerCase().endsWith(format.replace('.', '')))
    );
    
    if (transcriptFiles.length > 0) {
      await processTranscripts(transcriptFiles);
    } else {
      setErrors(['Please select valid transcript files (.txt, .srt, .vtt)']);
    }
    
    // Reset input
    e.target.value = '';
  };

  const processTranscripts = async (files: File[]) => {
    setIsProcessing(true);
    setErrors([]);
    setProgress(0);

    try {
      // Read file contents
      setProgress(25);
      
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const text = await file.text();
          return {
            name: file.name,
            content: text,
            size: file.size,
            lastModified: file.lastModified
          };
        })
      );
      
      setProgress(50);
      
      // Simulate processing time
      setTimeout(() => {
        setProgress(75);
        
        setTimeout(() => {
          setProgress(100);
          // Pass the actual file contents
          onTranscriptsSelected?.(fileContents as any);
          setIsProcessing(false);
          setProgress(0);
        }, 300);
      }, 500);
    } catch (error) {
      console.error('Error processing transcripts:', error);
      setErrors([`Failed to import transcripts: ${error}`]);
      setIsProcessing(false);
      setProgress(0);
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

  const stateClasses = disabled || isImporting
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
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center space-y-3">
          <Icon 
            name="file-text" 
            className={`w-12 h-12 ${
              isDragOver ? 'text-primary-600' : 'text-gray-400'
            }`}
          />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop your transcript files here' : 'Import Transcript Files'}
            </h3>
            <p className="text-sm text-gray-600">
              Drop exported Descript transcripts, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports: {acceptedFormats.join(', ')} • Max {maxFiles} files
            </p>
          </div>

          {!disabled && !isImporting && (
            <Button 
              variant="primary" 
              size="sm"
              icon={<Icon name="folder-open" className="w-4 h-4" />}
              onClick={handleBrowseClick}
            >
              Browse Files
            </Button>
          )}
        </div>

        {(isProcessing || isImporting) && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center space-y-4">
            <Icon name="file-text" className="w-8 h-8 text-primary-500 animate-pulse" />
            <div className="w-full max-w-xs">
              <Progress 
                value={progress} 
                className="h-2"
                variant="primary"
              />
            </div>
            <p className="text-sm text-gray-600">
              {isProcessing ? 'Processing transcripts...' : 'Importing transcripts...'}
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