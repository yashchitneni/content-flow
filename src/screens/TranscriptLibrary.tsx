// Task #12: Transcript Library Screen with Search
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Icon } from '../components/atoms/Icon';
import { TranscriptSearch } from '../components/molecules/TranscriptSearch';

interface TranscriptSummary {
  id: string;
  filename: string;
  word_count: number;
  language: string;
  content_preview: string;
  imported_at: string;
  status: string;
}

export const TranscriptLibrary: React.FC = () => {
  const [transcripts, setTranscripts] = useState<TranscriptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    try {
      setLoading(true);
      const result = await invoke<TranscriptSummary[]>('get_imported_transcripts');
      setTranscripts(result);
    } catch (err) {
      console.error('Failed to load transcripts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading transcripts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transcript Library</h1>
        <p className="text-gray-600">
          Browse and search through your imported transcripts
        </p>
      </div>

      {/* Toggle between list and search view */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setShowSearch(false)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            !showSearch
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Icon name="file-text" className="h-4 w-4" />
          All Transcripts ({transcripts.length})
        </button>
        <button
          onClick={() => setShowSearch(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            showSearch
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Icon name="search" className="h-4 w-4" />
          Search Transcripts
        </button>
      </div>

      {showSearch ? (
        <TranscriptSearch />
      ) : (
        <div className="grid gap-4">
          {transcripts.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="file-text" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transcripts imported yet</p>
            </div>
          ) : (
            transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg text-gray-900">
                    {transcript.filename}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {transcript.word_count} words
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {transcript.content_preview}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Language: {transcript.language}</span>
                  <span>
                    Imported: {new Date(transcript.imported_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};