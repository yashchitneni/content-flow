import React, { useState } from 'react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';

export interface ApiKeyInputProps {
  service: string;
  label: string;
  value?: string;
  isSet: boolean;
  createdAt?: string;
  lastUsed?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSave: () => Promise<void>;
  onRemove: () => void;
  onVerify?: () => Promise<boolean>;
  disabled?: boolean;
  error?: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  service,
  label,
  value = '',
  isSet,
  createdAt,
  lastUsed,
  placeholder = 'Enter API key',
  onChange,
  onSave,
  onRemove,
  onVerify,
  disabled = false,
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setTempValue('');
    onChange(''); // Clear parent state
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempValue('');
    onChange(''); // Clear parent state
  };

  const handleSave = async () => {
    console.log('[ApiKeyInput] Attempting to save with value:', tempValue ? 'PROVIDED' : 'EMPTY');
    
    if (!tempValue.trim()) {
      alert('Please enter a valid API key');
      return;
    }

    setIsSaving(true);
    
    try {
      // Call parent save function
      await onSave();
      
      // If we get here, save was successful
      // Exit editing mode
      setIsEditing(false);
      setTempValue('');
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('[ApiKeyInput] Value changed, length:', newValue.length);
    setTempValue(newValue);
    onChange(newValue);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Show editing UI if:
  // 1. Key is not set and we're not editing (first time setup)
  // 2. User clicked "Update" button
  const showEditingUI = !isSet || isEditing;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-white">{label}</label>
        {isSet && !isEditing && (
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">Configured</Badge>
            {createdAt && (
              <span className="text-xs text-gray-500 dark:text-dark-500">
                Added {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {showEditingUI ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={isVisible ? 'text' : 'password'}
              value={tempValue}
              onChange={handleChange}
              placeholder={placeholder}
              disabled={disabled || isSaving}
              variant={error ? 'error' : 'default'}
            />
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-600"
              disabled={isSaving}
            >
              <Icon name={isVisible ? 'eye-slash' : 'eye'} size="sm" />
            </button>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-error-400">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="small"
              onClick={handleSave}
              disabled={!tempValue.trim() || isSaving}
              className={`${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {(isSet || isEditing) && (
              <Button
                size="small"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            {isSet && (
              <Button
                size="small"
                variant="destructive"
                onClick={onRemove}
                disabled={isSaving}
              >
                Remove
              </Button>
            )}
          </div>
          
          {isSaving && (
            <p className="text-sm text-gray-500 dark:text-dark-500 italic">Saving your API key...</p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon name="key" size="sm" className="text-gray-400 dark:text-dark-400" />
            <span className="text-sm text-gray-600 dark:text-dark-600">API key configured</span>
            {lastUsed && (
              <span className="text-xs text-gray-400 dark:text-dark-400">
                Last used {new Date(lastUsed).toLocaleDateString()}
              </span>
            )}
          </div>
          <Button size="small" variant="secondary" onClick={handleEdit}>
            Update
          </Button>
        </div>
      )}
    </div>
  );
};