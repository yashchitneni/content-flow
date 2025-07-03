// Task #15: Build Transcript Library UI - EmptyState component
import React from 'react';
import { EmptyStateProps } from './EmptyState.types';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {icon && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-dark-700 rounded-full">
          <Icon 
            name={icon} 
            size="lg" 
            className="text-gray-400 dark:text-dark-400 w-12 h-12"
          />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-dark-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant="primary"
          size="medium"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};