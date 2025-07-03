// Task #14: Tag Cloud Component for displaying extracted tags
import React, { useEffect, useState } from 'react';
import { tagExtractionService } from '../../../services/tag-extraction.service';
import { Badge } from '../../atoms/Badge';

interface Tag {
  tag: string;
  count: number;
}

export interface TagCloudProps {
  onTagClick?: (tag: string) => void;
  maxTags?: number;
  className?: string;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  onTagClick,
  maxTags = 30,
  className = ''
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const allTags = await tagExtractionService.getAllTags();
      // Sort by count and take top N
      const topTags = allTags
        .sort((a, b) => b.count - a.count)
        .slice(0, maxTags);
      setTags(topTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTagSize = (count: number, maxCount: number): 'sm' | 'md' | 'lg' => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'lg';
    if (ratio > 0.3) return 'md';
    return 'sm';
  };

  const getTagVariant = (count: number, maxCount: number): 'primary' | 'secondary' | 'info' => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'primary';
    if (ratio > 0.3) return 'secondary';
    return 'info';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded-full w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <p>No tags found. Import and analyze transcripts to see tags.</p>
      </div>
    );
  }

  const maxCount = Math.max(...tags.map(t => t.count));

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2 justify-center">
        {tags.map((tag) => (
          <button
            key={tag.tag}
            onClick={() => onTagClick?.(tag.tag)}
            className="transition-transform hover:scale-110"
            title={`${tag.count} transcript${tag.count > 1 ? 's' : ''}`}
          >
            <Badge
              variant={getTagVariant(tag.count, maxCount)}
              size={getTagSize(tag.count, maxCount)}
            >
              {tag.tag} ({tag.count})
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
};