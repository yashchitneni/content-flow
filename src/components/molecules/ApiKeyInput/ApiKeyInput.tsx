import React, { useState, useEffect } from 'react';
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
  onSave: () => void;
  onRemove: () => void;
  onVerify?: () => Promise<boolean>;
  disabled?: boolean;
  error?: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
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
  const [isEditing, setIsEditing] = useState(!isSet);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempValue, setTempValue] = useState('');

  // Initialize editing state based on whether key is set
  useEffect(() => {
    setIsEditing(!isSet);
    setTempValue('');
  }, [isSet]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempValue('');
    onChange('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempValue('');
    onChange('');
  };

  const handleSave = async () => {
    if (onVerify) {
      setIsVerifying(true);
      const isValid = await onVerify();
      setIsVerifying(false);
      
      if (!isValid) {
        return;
      }
    }
    
    onSave();
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTempValue(newValue);
    onChange(newValue);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isSet && !isEditing && (
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">Configured</Badge>
            {createdAt && (
              <span className="text-xs text-gray-500">
                Added {new Date(createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={isVisible ? 'text' : 'password'}
              value={tempValue}
              onChange={handleChange}
              placeholder={placeholder}
              disabled={disabled || isVerifying}
              variant={error ? 'error' : 'default'}
            />
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <Icon name={isVisible ? 'eye-slash' : 'eye'} size="sm" />
            </button>
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="small"
              onClick={handleSave}
              disabled={!tempValue || isVerifying}
              loading={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Save'}
            </Button>
            <Button
              size="small"
              variant="ghost"
              onClick={handleCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            {isSet && (
              <Button
                size="small"
                variant="destructive"
                onClick={onRemove}
                disabled={isVerifying}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon name="key" size="sm" className="text-gray-400" />
            <span className="text-sm text-gray-600">API key configured</span>
            {lastUsed && (
              <span className="text-xs text-gray-400">
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