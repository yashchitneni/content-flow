// Task #8: Build Smart Video Organization System
import React, { useState } from 'react';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';

interface VideoFile {
  id: string;
  name: string;
  path: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical' | 'square' | 'other';
  suggestedPath?: string;
}

// Mock video files for demo
const mockVideoFiles: VideoFile[] = [
  {
    id: '1',
    name: 'product-demo.mp4',
    path: '/Users/demo/Videos/product-demo.mp4',
    size: 52428800, // 50MB
    duration: 180,
    width: 1920,
    height: 1080,
  },
  {
    id: '2',
    name: 'instagram-reel-1.mp4',
    path: '/Users/demo/Videos/instagram-reel-1.mp4',
    size: 10485760, // 10MB
    duration: 30,
    width: 1080,
    height: 1920,
  },
  {
    id: '3',
    name: 'youtube-tutorial.mp4',
    path: '/Users/demo/Videos/youtube-tutorial.mp4',
    size: 104857600, // 100MB
    duration: 600,
    width: 1920,
    height: 1080,
  },
  {
    id: '4',
    name: 'tiktok-clip.mp4',
    path: '/Users/demo/Videos/tiktok-clip.mp4',
    size: 15728640, // 15MB
    duration: 15,
    width: 1080,
    height: 1920,
  },
  {
    id: '5',
    name: 'instagram-post.mp4',
    path: '/Users/demo/Videos/instagram-post.mp4',
    size: 8388608, // 8MB
    duration: 60,
    width: 1080,
    height: 1080,
  },
];

export const FileOrganizer: React.FC = () => {
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const analyzeVideos = () => {
    setIsAnalyzing(true);
    
    // Simulate FFmpeg analysis
    setTimeout(() => {
      const analyzedFiles = mockVideoFiles.map(file => {
        const ratio = file.width! / file.height!;
        let orientation: 'horizontal' | 'vertical' | 'square' | 'other';
        
        if (ratio > 1.5) {
          orientation = 'horizontal';
        } else if (ratio < 0.7) {
          orientation = 'vertical';
        } else if (ratio >= 0.9 && ratio <= 1.1) {
          orientation = 'square';
        } else {
          orientation = 'other';
        }
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const orientationFolder = orientation.charAt(0).toUpperCase() + orientation.slice(1);
        
        return {
          ...file,
          orientation,
          suggestedPath: `~/ContentFlow/${year}/${month}/${orientationFolder}/${file.name}`
        };
      });
      
      setFiles(analyzedFiles);
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const organizeFiles = () => {
    setIsOrganizing(true);
    
    // Simulate file organization
    setTimeout(() => {
      setIsOrganizing(false);
      
      const summary = files.reduce((acc, file) => {
        acc[file.orientation!] = (acc[file.orientation!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      alert(`✅ File Organization Complete!

Organized ${files.length} video files:
• Horizontal (16:9): ${summary.horizontal || 0} files
• Vertical (9:16): ${summary.vertical || 0} files  
• Square (1:1): ${summary.square || 0} files
• Other: ${summary.other || 0} files

Files have been organized into:
~/ContentFlow/2025/01/[Orientation]/`);
    }, 2000);
  };

  const getOrientationIcon = (orientation?: string) => {
    switch (orientation) {
      case 'horizontal':
        return '🖼️';
      case 'vertical':
        return '📱';
      case 'square':
        return '⬜';
      default:
        return '📹';
    }
  };

  const getOrientationBadge = (orientation?: string) => {
    switch (orientation) {
      case 'horizontal':
        return <Badge variant="info">16:9 Horizontal</Badge>;
      case 'vertical':
        return <Badge variant="success">9:16 Vertical</Badge>;
      case 'square':
        return <Badge variant="warning">1:1 Square</Badge>;
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart File Organization
          </h1>
          <p className="text-lg text-gray-600">
            Automatically organize your video files by orientation and date
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="info-circle" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Demo Mode</div>
              <div>This demonstrates how videos will be organized by orientation (horizontal/vertical) and date.</div>
            </div>
          </div>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <Icon name="folder" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Analyze Video Files
              </h2>
              <p className="text-gray-600 mb-6">
                Click analyze to detect video orientations and suggest organization structure
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={analyzeVideos}
                disabled={isAnalyzing}
                icon={<Icon name="chart" className="w-5 h-5" />}
              >
                {isAnalyzing ? 'Analyzing Videos...' : 'Analyze Videos'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Organization Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Organization Preview
                </h2>
                <Button
                  variant="primary"
                  onClick={organizeFiles}
                  disabled={isOrganizing}
                  icon={<Icon name="folder-open" className="w-4 h-4" />}
                >
                  {isOrganizing ? 'Organizing...' : 'Organize Files'}
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getOrientationIcon(file.orientation)}</span>
                          <h3 className="font-medium text-gray-900">{file.name}</h3>
                          {getOrientationBadge(file.orientation)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Size:</span> {formatFileSize(file.size)}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {formatDuration(file.duration)}
                          </div>
                          <div>
                            <span className="font-medium">Resolution:</span> {file.width}x{file.height}
                          </div>
                          <div>
                            <span className="font-medium">Ratio:</span> {(file.width! / file.height!).toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-500 mb-1">Current Location:</div>
                          <div className="text-sm font-mono text-gray-700">{file.path}</div>
                        </div>
                        
                        <div className="bg-green-50 rounded p-2 mt-2">
                          <div className="text-xs text-green-600 mb-1">Will be organized to:</div>
                          <div className="text-sm font-mono text-green-700">{file.suggestedPath}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Organization Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['horizontal', 'vertical', 'square', 'other'].map((orientation) => {
                    const count = files.filter(f => f.orientation === orientation).length;
                    if (count === 0) return null;
                    
                    return (
                      <div key={orientation} className="text-center">
                        <div className="text-2xl mb-1">{getOrientationIcon(orientation)}</div>
                        <div className="text-2xl font-bold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">{orientation}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};