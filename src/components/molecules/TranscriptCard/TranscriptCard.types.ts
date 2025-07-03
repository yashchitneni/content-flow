// Task #15: Build Transcript Library UI - TranscriptCard types
export interface TranscriptCardProps {
  id: string;
  title: string;
  duration: number; // in seconds
  wordCount: number;
  contentScore?: number;
  summary?: string;
  tags: string[];
  createdAt: string;
  analyzedAt?: string;
  platformScores?: {
    thread: number;
    carousel: number;
    blog: number;
  };
  rating?: number; // 1-5 star rating
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
  onTagClick?: (tag: string) => void;
  onRatingChange?: (rating: number) => void;
  selected?: boolean;
}