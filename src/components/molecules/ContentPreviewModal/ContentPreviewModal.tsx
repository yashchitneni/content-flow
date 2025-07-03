import React from 'react';
import { Modal } from '../../atoms/Modal';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';

export interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | string[];
  format: string;
  metadata?: {
    generatedAt: string;
    wordCount: number;
  };
  onEdit?: () => void;
  onExport?: () => void;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  format,
  metadata,
  onEdit,
  onExport,
}) => {
  const formatContent = () => {
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} className="mb-4 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-dark-300 whitespace-pre-wrap">{item}</p>
        </div>
      ));
    }
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-gray-700 dark:text-dark-300">{content}</pre>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Header with metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              {format.replace('-', ' ').toUpperCase()}
            </Badge>
            {metadata && (
              <span className="text-sm text-gray-500 dark:text-dark-500">
                {metadata.wordCount} words
              </span>
            )}
          </div>
          {metadata && (
            <span className="text-xs text-gray-400 dark:text-dark-600">
              Generated {new Date(metadata.generatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Content preview */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-dark-700 rounded-lg p-4">
          {formatContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-dark-700">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button variant="secondary" onClick={onEdit}>
              <Icon name="edit" className="w-4 h-4 mr-2" />
              Edit Content
            </Button>
          )}
          {onExport && (
            <Button variant="primary" onClick={onExport}>
              <Icon name="download" className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};