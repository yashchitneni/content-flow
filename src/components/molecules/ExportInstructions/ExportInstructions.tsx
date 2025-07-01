import React from 'react';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { ExportInstructionsProps } from './ExportInstructions.types';

export const ExportInstructions: React.FC<ExportInstructionsProps> = ({
  title,
  steps,
  exportFolder,
  importantNotes,
  onOpenFolder,
  onDismiss
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon 
            name="alert-circle" 
            className="w-6 h-6 text-yellow-600"
          />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Follow these steps to export your transcripts:
            </h4>
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 flex-1">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white bg-opacity-60 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Export Location:
                </p>
                <p className="text-sm text-gray-900 font-mono mt-1">
                  {exportFolder}
                </p>
              </div>
              {onOpenFolder && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onOpenFolder}
                  icon={<Icon name="folder-open" className="w-4 h-4" />}
                >
                  Open Folder
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {importantNotes.map((note, index) => (
              <p key={index} className="text-sm text-gray-600">
                {note}
              </p>
            ))}
          </div>

          {onDismiss && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={onDismiss}
              >
                Got it
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};