import React, { useState, useEffect } from 'react';
import { invoke } from '../lib/tauri-wrapper';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Spinner } from '../components/atoms/Spinner';
import { EmptyState } from '../components/molecules/EmptyState';
import { Modal } from '../components/atoms/Modal';
import { Library, Search, Download, Share2, Trash2, Edit, Eye } from 'lucide-react';
import { useAppStore } from '../store/app.store';

interface ContentWithTemplate {
  content_id: string;
  template_id: string;
  template_name: string;
  template_type: string;
  title: string | null;
  content_data: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ParsedContent {
  title: string;
  content: string | string[];
  metadata?: Record<string, any>;
}

export const ContentLibrary: React.FC = () => {
  const [content, setContent] = useState<ContentWithTemplate[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentWithTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentWithTemplate | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { addNotification } = useAppStore();

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [searchQuery, content]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const allContent = await invoke<ContentWithTemplate[]>('get_all_content');
      setContent(allContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
      addNotification(
        'error',
        `Failed to load content: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    if (!searchQuery.trim()) {
      setFilteredContent(content);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = content.filter(item => {
      const title = item.title?.toLowerCase() || '';
      const templateName = item.template_name.toLowerCase();
      const templateType = item.template_type.toLowerCase();
      
      // Also search within content data
      try {
        const parsed: ParsedContent = JSON.parse(item.content_data);
        const contentText = Array.isArray(parsed.content) 
          ? parsed.content.join(' ').toLowerCase()
          : parsed.content.toLowerCase();
        
        return title.includes(query) || 
               templateName.includes(query) || 
               templateType.includes(query) ||
               contentText.includes(query);
      } catch {
        return title.includes(query) || 
               templateName.includes(query) || 
               templateType.includes(query);
      }
    });

    setFilteredContent(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredContent(content);
      return;
    }

    try {
      const results = await invoke<ContentWithTemplate[]>('search_content', {
        query: searchQuery,
      });
      setFilteredContent(results);
    } catch (err) {
      addNotification(
        'error',
        `Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedContent) return;

    try {
      await invoke('delete_content', {
        contentId: selectedContent.content_id,
      });
      
      addNotification(
        'success',
        'Content has been removed from your library'
      );

      setDeleteModalOpen(false);
      setSelectedContent(null);
      loadContent();
    } catch (err) {
      addNotification(
        'error',
        `Failed to delete content: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  const handleExport = (item: ContentWithTemplate) => {
    try {
      const parsed: ParsedContent = JSON.parse(item.content_data);
      const exportData = {
        title: item.title || parsed.title,
        content: parsed.content,
        template: item.template_name,
        created: item.created_at,
        metadata: parsed.metadata,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title || 'content'}-${item.content_id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addNotification(
        'success',
        'Content has been downloaded as JSON'
      );
    } catch (err) {
      addNotification(
        'error',
        'Failed to export content'
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'text-green-400';
      case 'draft':
        return 'text-yellow-400';
      case 'archived':
        return 'text-gray-400';
      default:
        return 'text-theme-secondary';
    }
  };

  const renderContentPreview = (contentData: string) => {
    try {
      const parsed: ParsedContent = JSON.parse(contentData);
      if (Array.isArray(parsed.content)) {
        return (
          <div className="space-y-2">
            {parsed.content.slice(0, 3).map((item, index) => (
              <p key={index} className="text-sm text-theme-secondary line-clamp-2">
                {item}
              </p>
            ))}
            {parsed.content.length > 3 && (
              <p className="text-sm text-theme-tertiary">
                ... and {parsed.content.length - 3} more items
              </p>
            )}
          </div>
        );
      } else {
        return (
          <p className="text-sm text-theme-secondary line-clamp-4">
            {parsed.content}
          </p>
        );
      }
    } catch {
      return <p className="text-sm text-theme-error">Invalid content format</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Library className="w-8 h-8 text-theme-accent" />
          <h1 className="text-3xl font-bold">Content Library</h1>
        </div>
        <p className="text-theme-secondary">
          Browse and manage all your generated content
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title, content, or template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 glass rounded-lg border border-theme-error">
          <p className="text-theme-error">{error}</p>
        </div>
      )}

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No content found"
          description={
            searchQuery
              ? "Try adjusting your search terms"
              : "Generate content from the Content Studio to see it here"
          }
          action={
            searchQuery ? (
              <Button onClick={() => setSearchQuery('')} variant="secondary">
                Clear Search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div
              key={item.content_id}
              className="glass-panel p-6 hover:shadow-glow-subtle transition-all duration-300"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold line-clamp-1 mb-1">
                    {item.title || 'Untitled Content'}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-theme-accent">{item.template_name}</span>
                    <span className="text-theme-tertiary">•</span>
                    <span className={getStatusColor(item.status)}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                {renderContentPreview(item.content_data)}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-theme">
                <span className="text-xs text-theme-tertiary">
                  {formatDate(item.created_at)}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedContent(item);
                      setViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExport(item)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedContent(item);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-theme-error" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedContent(null);
        }}
        title={selectedContent?.title || 'Content Details'}
      >
        {selectedContent && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-theme-secondary mb-1">Template</p>
              <p className="font-medium">{selectedContent.template_name}</p>
            </div>
            <div>
              <p className="text-sm text-theme-secondary mb-1">Status</p>
              <p className={`font-medium ${getStatusColor(selectedContent.status)}`}>
                {selectedContent.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-theme-secondary mb-1">Created</p>
              <p className="font-medium">{formatDate(selectedContent.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-theme-secondary mb-2">Content</p>
              <div className="glass-panel p-4 max-h-96 overflow-y-auto">
                {(() => {
                  try {
                    const parsed: ParsedContent = JSON.parse(selectedContent.content_data);
                    if (Array.isArray(parsed.content)) {
                      return (
                        <div className="space-y-3">
                          {parsed.content.map((item, index) => (
                            <div key={index} className="p-3 bg-theme-hover rounded">
                              <p className="text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="whitespace-pre-wrap">
                          {parsed.content}
                        </div>
                      );
                    }
                  } catch {
                    return <p className="text-theme-error">Failed to parse content</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedContent(null);
        }}
        title="Delete Content"
      >
        <div className="space-y-4">
          <p className="text-theme-secondary">
            Are you sure you want to delete "{selectedContent?.title || 'this content'}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedContent(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};