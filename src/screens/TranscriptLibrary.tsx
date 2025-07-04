// Task #15: Build Transcript Library UI
import React, { useState, useMemo, useEffect } from 'react';
import { TranscriptCard } from '../components/molecules/TranscriptCard';
import { TranscriptSearch } from '../components/molecules/TranscriptSearch';
import { FilterBar } from '../components/molecules/FilterBar';
import { TagCloud } from '../components/molecules/TagCloud';
import { EmptyState } from '../components/molecules/EmptyState';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { Modal } from '../components/atoms/Modal';
import { useTranscriptStore } from '../store/transcript.store';
import { useUIStore } from '../store/ui.store';
import { useUsageStore } from '../store/usage.store';

interface FilterOptions {
  searchQuery: string;
  dateRange?: { start: Date; end: Date };
  tags: string[];
  sortBy: 'date' | 'name' | 'duration' | 'relevance' | 'rating';
  sortOrder: 'asc' | 'desc';
  minRating?: number;
}

export const TranscriptLibrary: React.FC = () => {
  const { 
    transcripts, 
    selectedTranscriptIds, 
    setSelectedTranscripts, 
    toggleTranscriptSelection,
    removeTranscript,
    addTranscripts,
    updateTranscript
  } = useTranscriptStore();
  
  const { addNotification } = useUIStore();

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showTagCloud, setShowTagCloud] = useState(false);

  // Logic to load mock data has been removed.
  // The library will now correctly start empty.
  useEffect(() => {
    // The library will now correctly start empty.
  }, []);

  // Filter and sort transcripts
  const filteredTranscripts = useMemo(() => {
    let filtered = [...transcripts];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.filename.toLowerCase().includes(query) ||
        t.content_preview.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(t => 
        filters.tags.some(filterTag => 
          t.tags?.some(tag => tag.tag === filterTag)
        )
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(t => {
        const importDate = new Date(t.imported_at);
        return importDate >= filters.dateRange!.start && importDate <= filters.dateRange!.end;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.imported_at).getTime() - new Date(b.imported_at).getTime();
          break;
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'duration':
          comparison = a.word_count - b.word_count;
          break;
        case 'relevance':
          comparison = (b.content_score || 0) - (a.content_score || 0);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transcripts, filters]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    transcripts.forEach(t => {
      t.tags?.forEach(tag => tagSet.add(tag.tag));
    });
    return Array.from(tagSet).sort();
  }, [transcripts]);

  const handleBatchDelete = () => {
    if (selectedTranscriptIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedTranscriptIds.length} transcript(s)?`)) {
      selectedTranscriptIds.forEach(id => removeTranscript(id));
      setSelectedTranscripts([]);
      addNotification('success', `Deleted ${selectedTranscriptIds.length} transcript(s)`);
    }
  };

  const handleBatchExport = () => {
    addNotification('info', 'Batch export functionality coming soon!');
  };

  const handleGenerateContent = () => {
    if (selectedTranscriptIds.length === 0) {
      addNotification('error', 'Please select at least one transcript');
      return;
    }
    // In a real app, this would navigate to content studio
    // For now, we'll show a notification
    addNotification('info', 'Switch to Content Studio to generate content with selected transcripts');
  };

  const handleTagCloudClick = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
    setShowTagCloud(false);
  };

  return (
    <div className="min-h-screen bg-theme-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-theme-primary dark:bg-gradient-text dark:bg-clip-text dark:text-transparent mb-2">
              Transcript Library
            </h1>
            <p className="text-lg text-theme-secondary">
              Manage and search all your transcribed content
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowTagCloud(!showTagCloud)}
              icon={<Icon name="tag" className="w-4 h-4" />}
              className={showTagCloud ? 'shadow-glow' : ''}
            >
              Tag Cloud
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                // In a real app, this would be handled by parent component
                // For now, just show a notification
                addNotification('info', 'Switch to File Manager screen to import transcripts');
              }}
              icon={<Icon name="plus" className="w-4 h-4" />}
            >
              Import Transcripts
            </Button>
            
            {selectedTranscriptIds.length > 0 && (
              <Button
                variant="primary"
                onClick={handleGenerateContent}
                icon={<Icon name="brain" className="w-4 h-4" />}
              >
                Generate Content ({selectedTranscriptIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Tag Cloud Modal */}
        {showTagCloud && (
          <div className="mb-6 glass-ultra rounded-xl shadow-theme-glass border border-theme p-6 hover-lift animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-theme-primary">Popular Topics</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTagCloud(false)}
                icon={<Icon name="x" className="w-4 h-4" />}
              />
            </div>
            <TagCloud onTagClick={handleTagCloudClick} maxTags={50} />
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <TranscriptSearch
            value={filters.searchQuery}
            onChange={(query) => setFilters({ ...filters, searchQuery: query })}
            placeholder="Search transcripts by content, filename, or tags..."
          />
          
          <FilterBar
            tags={allTags}
            selectedTags={filters.tags}
            onTagToggle={(tag) => {
              const newTags = filters.tags.includes(tag)
                ? filters.tags.filter(t => t !== tag)
                : [...filters.tags, tag];
              setFilters({ ...filters, tags: newTags });
            }}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(sortBy, sortOrder) => {
              setFilters({ ...filters, sortBy, sortOrder });
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onDateRangeChange={(range) => {
              setFilters({ ...filters, dateRange: range });
            }}
          />
        </div>

        {/* Batch Actions Bar */}
        {selectedTranscriptIds.length > 0 && (
          <div className="mb-4 p-4 glass rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-theme flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {selectedTranscriptIds.length} Selected
              </Badge>
              <button
                onClick={() => setSelectedTranscripts([])}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear Selection
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="small" variant="ghost" onClick={handleBatchExport}>
                <Icon name="download" className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="small" variant="ghost" onClick={handleBatchDelete}>
                <Icon name="trash" className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Results Count & Stats */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-theme-secondary">
            Showing {filteredTranscripts.length} of {transcripts.length} transcripts
          </div>
          <div className="flex items-center gap-4 text-sm text-theme-tertiary">
            <span>Total Words: {transcripts.reduce((sum, t) => sum + t.word_count, 0).toLocaleString()}</span>
            <span>Avg Rating: {(transcripts.reduce((sum, t) => sum + (t.rating || 0), 0) / transcripts.length || 0).toFixed(1)}⭐</span>
          </div>
        </div>

        {/* Transcript Grid/List */}
        {filteredTranscripts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-2"
          }>
            {filteredTranscripts.map((transcript) => (
              <TranscriptCard
                key={transcript.id}
                id={transcript.id}
                title={transcript.filename}
                duration={Math.floor(transcript.word_count / 150) * 60} // Estimate duration from word count
                wordCount={transcript.word_count}
                contentScore={transcript.content_score}
                summary={transcript.content_preview}
                tags={transcript.tags?.map(t => t.tag) || []}
                createdAt={transcript.imported_at}
                analyzedAt={transcript.status === 'imported' ? transcript.imported_at : undefined}
                platformScores={transcript.platform_scores}
                rating={transcript.rating}
                viewMode={viewMode}
                selected={selectedTranscriptIds.includes(transcript.id)}
                onClick={() => toggleTranscriptSelection(transcript.id)}
                onTagClick={(tag) => {
                  setFilters(prev => ({
                    ...prev,
                    tags: prev.tags.includes(tag) 
                      ? prev.tags.filter(t => t !== tag)
                      : [...prev.tags, tag]
                  }));
                }}
                onRatingChange={(rating) => {
                  updateTranscript(transcript.id, { rating });
                  addNotification('success', `Updated rating to ${rating} stars`);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="file-text"
            title={filters.searchQuery || filters.tags.length > 0 
              ? "No transcripts found" 
              : "No transcripts yet"
            }
            description={filters.searchQuery || filters.tags.length > 0
              ? "Try adjusting your search or filters"
              : "Import your first transcript to get started"
            }
            action={
              filters.searchQuery || filters.tags.length > 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => setFilters({
                    searchQuery: '',
                    tags: [],
                    sortBy: 'date',
                    sortOrder: 'desc',
                  })}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => addNotification('info', 'Switch to File Manager screen to import transcripts')}
                  icon={<Icon name="plus" className="w-4 h-4" />}
                >
                  Import Transcript
                </Button>
              )
            }
          />
        )}
      </div>
    </div>
  );
};