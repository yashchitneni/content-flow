import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../atoms/Modal';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';

export interface ContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    content: string | string[];
    format: string;
    metadata?: {
      generatedAt: string;
      wordCount: number;
    };
  };
  onSave: (updatedContent: { title: string; content: string | string[] }) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  isOpen,
  onClose,
  content,
  onSave,
}) => {
  const [title, setTitle] = useState(content.title);
  const [editedContent, setEditedContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize content when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(content.title);
      // Convert content to editable string format
      if (Array.isArray(content.content)) {
        setEditedContent(content.content.join('\n\n'));
      } else {
        setEditedContent(content.content);
      }
      setHasUnsavedChanges(false);
      setLastSaved(null);
    }
  }, [isOpen, content]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for auto-save (30 seconds)
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 30000);
    }

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, editedContent, title]);

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    
    // Convert content back to appropriate format
    let savedContent: string | string[];
    if (content.format === 'thread' || content.format === 'carousel') {
      // Split by double newlines for thread/carousel
      savedContent = editedContent.split('\n\n').filter(item => item.trim());
    } else {
      savedContent = editedContent;
    }

    try {
      await onSave({ title, content: savedContent });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getWordCount = () => {
    return editedContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getStatusText = () => {
    if (isSaving) return 'Saving...';
    if (lastSaved) return `Last saved ${lastSaved.toLocaleTimeString()}`;
    if (hasUnsavedChanges) return 'Unsaved changes';
    return 'No changes';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Edit Content" size="xl">
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="primary" size="sm">
              {content.format.replace('-', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">
              {getWordCount()} words
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${hasUnsavedChanges ? 'text-yellow-600' : 'text-gray-500'}`}>
              {getStatusText()}
            </span>
            {hasUnsavedChanges && !isSaving && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-2 mb-4 text-lg font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Content title..."
        />

        {/* Content editor */}
        <div className="flex-1 relative">
          <textarea
            value={editedContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
            placeholder={
              content.format === 'thread' 
                ? 'Write your tweets separated by double line breaks...' 
                : content.format === 'carousel'
                ? 'Write your slides separated by double line breaks...'
                : 'Write your content here...'
            }
          />
          
          {/* Format hint */}
          {(content.format === 'thread' || content.format === 'carousel') && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
              Separate {content.format === 'thread' ? 'tweets' : 'slides'} with empty lines
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500">
            Auto-save enabled (every 30 seconds)
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleSave(false)}
              disabled={!hasUnsavedChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  Save & Close
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 