// Task #5: Video Import Screen
import React, { useState, useEffect } from 'react';
import { VideoDropZone, VideoFile } from '../components/molecules/VideoDropZone';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';
import { invoke } from '@tauri-apps/api/core';

export const VideoImport: React.FC = () => {
  const [importedVideos, setImportedVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const loadImportedVideos = async () => {
    try {
      setLoading(true);
      const videos = await invoke<VideoFile[]>('get_imported_files');
      setImportedVideos(videos);
      
      const count = await invoke<number>('get_file_count');
      setTotalCount(count);
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
                Import video files to begin creating content
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon name="video" className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{video.filename}</h3>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(video.file_size)} • {video.format.toUpperCase()}
                        </p>
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
            How Video Import Works
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>1. Drag video files (.mp4, .mov, .avi, .mkv) into the drop zone</li>
            <li>2. Files are validated and saved to the database</li>
            <li>3. Videos appear in the list below with their metadata</li>
            <li>4. Next step: FFmpeg will analyze videos for duration and thumbnails (Task #7)</li>
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