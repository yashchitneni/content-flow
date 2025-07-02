import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { IconName } from '../components/atoms/Icon/Icon.types';
import { Badge } from '../components/atoms/Badge';
import { Spinner } from '../components/atoms/Spinner';

interface TableInfo {
  name: string;
  sql: string;
}

interface TableStatus {
  name: string;
  count: number;
  status: 'empty' | 'populated';
}

export const DatabaseStatus: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDatabaseInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all tables
      const tableInfo = await invoke<TableInfo[]>('test_database_schema');
      setTables(tableInfo);
      
      // Get row counts for each table
      const statuses: TableStatus[] = [];
      for (const table of tableInfo) {
        try {
          const count = await invoke<number>('get_table_count', { tableName: table.name });
          statuses.push({
            name: table.name,
            count,
            status: count > 0 ? 'populated' : 'empty'
          });
        } catch (e) {
          statuses.push({
            name: table.name,
            count: 0,
            status: 'empty'
          });
        }
      }
      
      setTableStatuses(statuses);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load database info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const getTableDescription = (tableName: string): string => {
    const descriptions: Record<string, string> = {
      'File': 'Video files imported into the system',
      'Folder': 'Organized folder structure for files',
      'DescriptProject': 'Projects created in Descript',
      'Transcript': 'Transcribed content from video files',
      'Tag': 'Topics and themes extracted from transcripts',
      'Template': 'Content generation templates',
      'GeneratedContent': 'AI-generated social media content',
      'ContentVersion': 'Version history for generated content',
      'ExportHistory': 'Record of content exports',
      'APIKey': 'Storage for external service credentials',
      'TranscriptTags': 'Links between transcripts and tags',
      'ContentSources': 'Links between transcripts and content',
      'ProjectFiles': 'Links between projects and files',
      'TranscriptFTS': 'Full-text search index for transcripts',
      'migrations': 'Database migration tracking'
    };
    return descriptions[tableName] || 'System table';
  };

  const getTableIcon = (tableName: string): IconName => {
    const icons: Record<string, IconName> = {
      'File': 'video',
      'Folder': 'folder',
      'DescriptProject': 'upload',
      'Transcript': 'file-text',
      'Tag': 'database',
      'Template': 'file',
      'GeneratedContent': 'brain',
      'ContentVersion': 'refresh',
      'ExportHistory': 'upload',
      'APIKey': 'key'
    };
    return icons[tableName] || 'database';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading database schema...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Icon name="alert-circle" className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Database Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={loadDatabaseInfo}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const coreTableCount = tableStatuses.filter(t => 
    !['TranscriptFTS', 'migrations'].includes(t.name)
  ).length;

  const populatedTableCount = tableStatuses.filter(t => 
    t.status === 'populated' && !['TranscriptFTS', 'migrations'].includes(t.name)
  ).length;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Icon name="database" className="w-8 h-8 text-primary-600" />
                Database Status
              </h1>
              <p className="text-gray-600 mt-2">
                SQLite database with all ContentFlow entities
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {coreTableCount}
              </div>
              <div className="text-sm text-gray-600">Core Tables</div>
              <div className="mt-2">
                <Badge 
                  variant={populatedTableCount > 0 ? "success" : "warning"} 
                >
                  {populatedTableCount} Populated
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="check-circle" className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Schema Ready</span>
            </div>
            <p className="text-sm text-green-700 mt-1">All tables created</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="database" className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">FTS5 Enabled</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Full-text search ready</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icon name="check-circle" className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Migrations Active</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">Auto-updated on startup</p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Database Tables</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {tableStatuses
              .filter(t => !['TranscriptFTS', 'migrations'].includes(t.name))
              .map((table) => (
                <div key={table.name} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon name={getTableIcon(table.name)} className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{table.name}</h3>
                        <p className="text-sm text-gray-600">{getTableDescription(table.name)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-gray-900">{table.count}</div>
                        <div className="text-xs text-gray-500">rows</div>
                      </div>
                      <Badge 
                        variant={table.status === 'populated' ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {table.status === 'populated' ? 'Has Data' : 'Empty'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Features Enabled:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Foreign key constraints</li>
                <li>✓ Performance indexes on all key fields</li>
                <li>✓ Full-text search with FTS5</li>
                <li>✓ Automatic UpdatedAt triggers</li>
                <li>✓ JSON storage for flexible data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Relationships:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• File → Folder (organization)</li>
                <li>• File → Transcript (1:1)</li>
                <li>• Transcript ↔ Tags (many:many)</li>
                <li>• Transcript ↔ GeneratedContent (many:many)</li>
                <li>• GeneratedContent → ContentVersion (1:many)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={loadDatabaseInfo}
            icon={<Icon name="refresh" className="w-4 h-4" />}
          >
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}; 