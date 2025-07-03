import React from 'react';
import { Icon } from '../../atoms/Icon';

export interface PreferenceItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'number' | 'text' | 'color';
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface PreferenceGroupProps {
  title: string;
  description?: string;
  icon?: string;
  items: PreferenceItem[];
  onChange: (id: string, value: any) => void;
}

export const PreferenceGroup: React.FC<PreferenceGroupProps> = ({
  title,
  description,
  icon,
  items,
  onChange,
}) => {
  const renderInput = (item: PreferenceItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={item.value}
              onChange={(e) => onChange(item.id, e.target.checked)}
            />
            <div className="w-11 h-6 bg-dark-700 light:bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-200 light:after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 dark:peer-checked:bg-primary-400"></div>
          </label>
        );

      case 'select':
        return (
          <select
            value={item.value}
            onChange={(e) => onChange(item.id, e.target.value)}
            className="block w-full px-3 py-2 text-sm bg-dark-800 light:bg-white text-white light:text-gray-900 border border-dark-200 light:border-gray-300 rounded-md focus:ring-primary-400 focus:border-primary-400"
          >
            {item.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={item.value}
              onChange={(e) => onChange(item.id, parseInt(e.target.value))}
              min={item.min}
              max={item.max}
              className="block w-24 px-3 py-2 text-sm bg-dark-800 light:bg-white text-white light:text-gray-900 border border-dark-200 light:border-gray-300 rounded-md focus:ring-primary-400 focus:border-primary-400"
            />
            {item.unit && <span className="text-sm text-dark-500 light:text-gray-500">{item.unit}</span>}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={item.value}
            onChange={(e) => onChange(item.id, e.target.value)}
            className="block w-full px-3 py-2 text-sm bg-dark-800 light:bg-white text-white light:text-gray-900 border border-dark-200 light:border-gray-300 rounded-md focus:ring-primary-400 focus:border-primary-400"
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={item.value}
              onChange={(e) => onChange(item.id, e.target.value)}
              className="block h-10 w-20 border border-dark-200 light:border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => onChange(item.id, e.target.value)}
              className="block w-28 px-3 py-2 text-sm bg-dark-800 light:bg-white text-white light:text-gray-900 border border-dark-200 light:border-gray-300 rounded-md focus:ring-primary-400 focus:border-primary-400"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-dark-800 light:bg-white rounded-lg border border-dark-200 light:border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-dark-200 light:border-gray-200">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-dark-700 light:bg-gray-100 rounded-lg">
              <Icon name={icon} size="sm" className="text-dark-600 light:text-gray-600" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-white light:text-gray-900">{title}</h3>
            {description && <p className="text-sm text-dark-500 light:text-gray-500 mt-1">{description}</p>}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <label className="text-sm font-medium text-white light:text-gray-700">{item.label}</label>
              {item.description && (
                <p className="text-sm text-dark-500 light:text-gray-500 mt-1">{item.description}</p>
              )}
            </div>
            <div className="flex-shrink-0">{renderInput(item)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};