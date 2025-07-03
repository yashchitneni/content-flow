import React from 'react';
import { Select } from '../../atoms/Select';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';

export interface FilterBarProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  sortBy: 'date' | 'name' | 'duration' | 'relevance';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'name' | 'duration' | 'relevance', sortOrder: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onDateRangeChange?: (range: { start: Date; end: Date } | undefined) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onDateRangeChange,
}) => {
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'duration', label: 'Duration' },
    { value: 'relevance', label: 'Relevance' },
  ];

  return (
    <div className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-6 hover-lift">
      <div className="flex flex-wrap items-center gap-4">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm font-medium text-theme-secondary">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'primary' : 'secondary'}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <Icon name="x" className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
              {tags.length > 8 && (
                <Badge variant="secondary" size="sm">
                  +{tags.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-theme-secondary">Sort:</span>
          <Select
            value={sortBy}
            onChange={(value) => onSortChange(value as any, sortOrder)}
            options={sortOptions}
            size="small"
          />
          <Button
            size="small"
            variant="ghost"
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            icon={
              <Icon 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                className="w-4 h-4" 
              />
            }
          />
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-1 glass rounded-lg p-1">
          <Button
            size="small"
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            onClick={() => onViewModeChange('grid')}
            icon={<Icon name="grid" className="w-4 h-4" />}
          />
          <Button
            size="small"
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            onClick={() => onViewModeChange('list')}
            icon={<Icon name="list" className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between">
          <span className="text-sm text-theme-tertiary">
            Filtering by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Clear all tags
          </button>
        </div>
      )}
    </div>
  );
};