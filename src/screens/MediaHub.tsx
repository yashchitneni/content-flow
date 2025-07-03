// Task #5: Media Hub - Video Import and Organization
import React, { useState, useEffect } from 'react';
import { VideoDropZone, VideoFile } from '../components/molecules/VideoDropZone';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';
import { Tag } from '../components/atoms/Tag';
import { invoke } from '../lib/tauri-wrapper';
import { useUsageStore } from '../store/usage.store';
import { useAppStore } from '../store/app.store';

export const MediaHub: React.FC = () => {
  const [importedVideos, setImportedVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const updateStorageUsage = useUsageStore((state) => state.updateStorageUsage);
  const transcripts = useAppStore((state) => state.transcripts);

  const loadImportedVideos = async () => {
    try {
      setLoading(true);
      const videos = await invoke<VideoFile[]>('get_imported_files');
      setImportedVideos(videos);
      
      const count = await invoke<number>('get_file_count');
      setTotalCount(count);
      
      // Update storage usage tracking
      const totalSizeMB = videos.reduce((sum, video) => {
        const sizeMB = video.metadata?.size ? video.metadata.size / (1024 * 1024) : 0;
        return sum + sizeMB;
      }, 0);
      
      // Update with current transcript count
      updateStorageUsage(count, transcripts.length, totalSizeMB);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImportedVideos();
  }, []);

  const handleVideosImported = (newVideos: VideoFile[]) => {
    // Reload the list to show the new videos
    loadImportedVideos();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Icon name="video" className="w-8 h-8 text-primary-600" />
                Video Import
              </h1>
              <p className="text-gray-600 mt-2">
                Import and organize video files automatically
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {totalCount}
              </div>
              <div className="text-sm text-gray-600">Videos in Database</div>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="mb-8">
          <VideoDropZone 
            onVideosImported={handleVideosImported}
            maxFiles={20}
          />
        </div>

        {/* Imported Videos */}
        {importedVideos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Imported Videos ({importedVideos.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {importedVideos.map((video) => (
                <div key={video.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Icon name="video" className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{video.filename}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{formatFileSize(video.file_size)}</span>
                          <span>•</span>
                          <span>{video.format.toUpperCase()}</span>
                          {video.metadata?.duration && (
                            <>
                              <span>•</span>
                              <span>{formatDuration(video.metadata.duration)}</span>
                            </>
                          )}
                          {video.metadata?.resolution && (
                            <>
                              <span>•</span>
                              <span>{video.metadata.resolution}</span>
                            </>
                          )}
                        </div>

                        {/* Folder Organization */}
                        {video.folder && (
                          <div className="flex items-center gap-2 mt-2">
                            <Icon name="folder" className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-primary-600">
                              {video.folder}
                            </span>
                          </div>
                        )}

                        {/* Tags */}
                        {video.tags && video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {video.tags.map((tag, index) => (
                              <Tag key={index}>
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      variant={video.status === 'Imported' ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {video.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {importedVideos.length === 0 && !loading && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Icon name="video" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos imported yet</h3>
            <p className="text-gray-600">
              Drag and drop video files above to get started
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            How Video Organization Works
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Drop or select video files (.mp4, .mov, .avi, .mkv, .webm, .flv, .wmv)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Files are automatically analyzed for metadata (duration, resolution, codec)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Videos are organized into folders by format and date (e.g., MP4/2024/01)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>Smart tags are added based on quality (4K, HD), duration, and format</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">5.</span>
              <span>All organization happens automatically - just drop your files!</span>
            </li>
          </ol>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={loadImportedVideos}
            icon={<Icon name="refresh" className="w-4 h-4" />}
          >
            Refresh List
          </Button>
        </div>
      </div>
    </div>
  );
}; 