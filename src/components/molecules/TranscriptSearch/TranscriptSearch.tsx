// Task #12: Transcript Search Component
import React, { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Icon } from '../../atoms/Icon';

interface TranscriptSearchResult {
  transcript_id: string;
  file_id: string;
  filename: string;
  content_snippet: string;
  word_count: number;
  language: string;
  imported_at: string;
  rank: number;
  highlight_positions: [number, number][];
}

interface TranscriptSearchResponse {
  results: TranscriptSearchResult[];
  total_count: number;
  search_time_ms: number;
}

interface TranscriptSearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export const TranscriptSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TranscriptSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchTime(null);
      setTotalCount(0);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const request: TranscriptSearchRequest = {
        query: searchQuery,
        limit: 20,
        offset: 0,
      };

      const response = await invoke<TranscriptSearchResponse>('search_transcripts', { request });
      
      setResults(response.results);
      setTotalCount(response.total_count);
      setSearchTime(response.search_time_ms);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const highlightText = (text: string, positions: [number, number][]) => {
    if (!positions || positions.length === 0) {
      return text;
    }

    const parts: React.ReactElement[] = [];
    let lastEnd = 0;

    positions.forEach(([start, end], index) => {
      // Add text before highlight
      if (start > lastEnd) {
        parts.push(<span key={`text-${index}`}>{text.slice(lastEnd, start)}</span>);
      }
      // Add highlighted text
      parts.push(
        <mark key={`highlight-${index}`} className="bg-yellow-300 text-gray-900">
          {text.slice(start, end)}
        </mark>
      );
      lastEnd = end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      parts.push(<span key="text-end">{text.slice(lastEnd)}</span>);
    }

    return <>{parts}</>;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transcripts..."
          className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isSearching && (
          <Icon name="loader" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-blue-500" />
        )}
      </div>

      {/* Search Info */}
      {searchTime !== null && !isSearching && (
        <div className="text-sm text-gray-600 mb-4">
          Found {totalCount} result{totalCount !== 1 ? 's' : ''} in {searchTime.toFixed(1)}ms
          {searchTime < 200 && (
            <span className="ml-2 text-green-600">✓ Performance target met</span>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.transcript_id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg text-gray-900">{result.filename}</h3>
              <span className="text-sm text-gray-500">
                Rank: {result.rank.toFixed(2)}
              </span>
            </div>
            
            <div className="text-gray-600 text-sm mb-2">
              {highlightText(result.content_snippet, result.highlight_positions)}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{result.word_count} words</span>
              <span>Imported: {new Date(result.imported_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {query && !isSearching && results.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">
          No transcripts found matching "{query}"
        </div>
      )}
    </div>
  );
};