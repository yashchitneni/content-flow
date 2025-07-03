// Task #15: Build Transcript Library UI - TranscriptCard component
import React from 'react';
import { TranscriptCardProps } from './TranscriptCard.types';
import { Badge } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import { Progress } from '../../atoms/Progress';

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  id,
  title,
  duration,
  wordCount,
  contentScore,
  summary,
  tags,
  createdAt,
  analyzedAt,
  platformScores,
  rating,
  viewMode = 'grid',
  onClick,
  onTagClick,
  onRatingChange,
  selected = false
}) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (currentRating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => {
              e.stopPropagation();
              onRatingChange?.(star);
            }}
            className="text-sm transition-all hover:scale-110"
            disabled={!onRatingChange}
          >
            <Icon 
              name="star" 
              className={`w-4 h-4 ${
                star <= currentRating 
                  ? 'text-warning-400 fill-warning-400' 
                  : 'text-theme-tertiary'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`
          glass rounded-lg
          ${selected ? 'border-primary-500 shadow-glow bg-gradient-to-br from-primary-500/10 to-secondary-500/10' : 'border-theme'}
          hover:shadow-glass hover:scale-[1.01] transition-all duration-300 cursor-pointer
          p-4 hover-lift
        `}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-theme-primary mb-1">
              {title}
            </h3>
            {summary && (
              <p className="text-sm text-theme-secondary line-clamp-2 mb-2">
                {summary}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-theme-tertiary">
              <span className="flex items-center gap-1">
                <Icon name="clock" size="sm" />
                {formatDuration(duration)}
              </span>
              <span>{wordCount.toLocaleString()} words</span>
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {rating !== undefined && renderStars(rating)}
            {contentScore !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-theme-secondary">Score:</span>
                <Progress value={contentScore * 100} className="w-20" />
              </div>
            )}
            {analyzedAt && (
              <Badge variant="success" size="sm">
                Analyzed
              </Badge>
            )}
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 5).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="cursor-pointer hover:shadow-sm hover:scale-105 transition-all duration-200"
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 5 && (
              <Badge variant="secondary" size="sm">
                +{tags.length - 5}
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className={`
        glass rounded-xl
        ${selected ? 'border-primary-500 shadow-glow bg-gradient-to-br from-primary-500/10 to-secondary-500/10' : 'border-theme'}
        hover:shadow-glass hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer
        p-5 h-full flex flex-col hover-lift
      `}
      onClick={onClick}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-theme-primary mb-2 line-clamp-2">
          {title}
        </h3>
        
        {summary && (
          <p className="text-sm text-theme-secondary line-clamp-3 mb-3">
            {summary}
          </p>
        )}
        
        <div className="space-y-2 text-sm text-theme-tertiary">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Icon name="clock" size="sm" />
              {formatDuration(duration)}
            </span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          
          {contentScore !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Content Score</span>
                <span className="text-xs font-medium">{Math.round(contentScore * 100)}%</span>
              </div>
              <Progress value={contentScore * 100} size="sm" />
            </div>
          )}
        </div>
      </div>
      
      {platformScores && (
        <div className="mt-3 pt-3 border-t border-theme">
          <p className="text-xs text-theme-secondary mb-2">Platform Potential</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <Icon name="message-circle" size="sm" className="mx-auto mb-1" />
              <div className="font-medium">{Math.round(platformScores.thread * 100)}%</div>
            </div>
            <div className="text-center">
              <Icon name="image" size="sm" className="mx-auto mb-1" />
              <div className="font-medium">{Math.round(platformScores.carousel * 100)}%</div>
            </div>
            <div className="text-center">
              <Icon name="file-text" size="sm" className="mx-auto mb-1" />
              <div className="font-medium">{Math.round(platformScores.blog * 100)}%</div>
            </div>
          </div>
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-theme">
          {tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-600"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" size="sm">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme text-xs text-theme-tertiary">
        <div className="flex items-center gap-3">
          <span>{formatDate(createdAt)}</span>
          {rating !== undefined && (
            <div className="flex items-center gap-1">
              {renderStars(rating)}
            </div>
          )}
        </div>
        {analyzedAt && (
          <Badge variant="success" size="sm">
            <Icon name="check-circle" size="sm" className="mr-1" />
            Analyzed
          </Badge>
        )}
      </div>
    </div>
  );
};