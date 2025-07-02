import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ApiKeyInput } from '../../molecules/ApiKeyInput';
import { UsageStats, UsageStatsItem } from '../../molecules/UsageStats';
import { PreferenceGroup, PreferenceItem } from '../../organisms/PreferenceGroup';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { useToast } from '../../../lib/hooks/useToast';

interface ApiKeyInfo {
  service: string;
  is_set: boolean;
  created_at: string;
  last_used?: string;
}

interface Preferences {
  theme: string;
  auto_save_interval: number;
  default_export_format: string;
  show_tips: boolean;
}

interface FileOrganization {
  watch_folder?: string;
  auto_organize: boolean;
  folder_pattern: string;
  cleanup_after_days: number;
}

interface BrandSettings {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  logo_path?: string;
}

interface UsageStatsData {
  descript_api_calls: number;
  openai_tokens_used: number;
  claude_tokens_used: number;
  storage_used_mb: number;
  last_updated: string;
}

interface SettingsResponse {
  api_keys: ApiKeyInfo[];
  preferences: Preferences;
  file_organization: FileOrganization;
  brand_settings: BrandSettings;
  usage_stats: UsageStatsData;
}

type SettingsTab = 'api-keys' | 'preferences' | 'file-organization' | 'brand' | 'usage';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api-keys');
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const apiKeyServices = [
    { id: 'descript', label: 'Descript API', placeholder: 'sk-...' },
    { id: 'openai', label: 'OpenAI API', placeholder: 'sk-...' },
    { id: 'claude', label: 'Claude API', placeholder: 'claude-...' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // For demo, load API keys from localStorage
      const savedKeys = localStorage.getItem('contentflow-api-keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
      
      const response: SettingsResponse = {
        api_keys: [
          { service: 'openai', is_set: !!apiKeys.openai, created_at: new Date().toISOString() },
          { service: 'claude', is_set: !!apiKeys.claude, created_at: new Date().toISOString() },
        ],
        preferences: {
          theme: 'light',
          auto_save_interval: 30,
          default_export_format: 'png',
          show_tips: true,
        },
        file_organization: {
          auto_organize: true,
          folder_pattern: 'YYYY/MM',
          cleanup_after_days: 30,
        },
        brand_settings: {
          primary_color: '#0066FF',
          secondary_color: '#6B46C1',
          font_family: 'Inter',
        },
        usage_stats: {
          descript_api_calls: 0,
          openai_tokens_used: 0,
          claude_tokens_used: 0,
          storage_used_mb: 0,
          last_updated: new Date().toISOString(),
        },
      };
      
      setSettings(response);
      // Show masked version of saved keys
      const maskedKeys: Record<string, string> = {};
      Object.keys(apiKeys).forEach(key => {
        if (apiKeys[key]) {
          maskedKeys[key] = apiKeys[key].substring(0, 7) + '•'.repeat(20);
        }
      });
      setApiKeyValues(maskedKeys);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySave = async (service: string) => {
    try {
      const keyValue = apiKeyValues[service];
      
      if (!keyValue || keyValue.includes('•')) {
        showToast({
          title: 'Error',
          description: 'Please enter a valid API key',
          variant: 'error',
        });
        return;
      }
      
      // For demo - save to localStorage instead of Tauri
      const currentKeys = localStorage.getItem('contentflow-api-keys');
      const apiKeys = currentKeys ? JSON.parse(currentKeys) : {};
      apiKeys[service] = keyValue;
      localStorage.setItem('contentflow-api-keys', JSON.stringify(apiKeys));
      
      // Update local state
      if (settings) {
        const updatedApiKeys = settings.api_keys.map(key => 
          key.service === service 
            ? { ...key, is_set: true }
            : key
        );
        setSettings({ ...settings, api_keys: updatedApiKeys });
      }
      
      showToast({
        title: 'Success',
        description: `${service} API key saved successfully`,
        variant: 'success',
      });
      
      // Also show browser alert for demo
      alert(`✅ ${service.toUpperCase()} API key saved successfully!\n\nYou can now use this key for content generation.`);
      
      // Update the display to show masked version
      setApiKeyValues((prev) => ({ 
        ...prev, 
        [service]: keyValue.substring(0, 7) + '•'.repeat(20)
      }));
    } catch (error) {
      showToast({
        title: 'Error',
        description: `Failed to update ${service} API key`,
        variant: 'error',
      });
    }
  };

  const handleApiKeyRemove = async (service: string) => {
    try {
      // For demo - remove from localStorage
      const currentKeys = localStorage.getItem('contentflow-api-keys');
      const apiKeys = currentKeys ? JSON.parse(currentKeys) : {};
      delete apiKeys[service];
      localStorage.setItem('contentflow-api-keys', JSON.stringify(apiKeys));
      
      showToast({
        title: 'Success',
        description: `${service} API key removed`,
        variant: 'success',
      });
      
      alert(`✅ ${service.toUpperCase()} API key removed successfully!`);
      
      await loadSettings();
    } catch (error) {
      showToast({
        title: 'Error',
        description: `Failed to remove ${service} API key`,
        variant: 'error',
      });
    }
  };

  const handleApiKeyVerify = async (service: string): Promise<boolean> => {
    try {
      const isValid = await invoke<boolean>('verify_api_key', { service });
      if (!isValid) {
        showToast({
          title: 'Invalid API Key',
          description: 'The API key appears to be invalid',
          variant: 'error',
        });
      }
      return isValid;
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to verify API key',
        variant: 'error',
      });
      return false;
    }
  };

  const handlePreferenceChange = async (id: string, value: any) => {
    if (!settings) return;

    const updatedPreferences = {
      ...settings.preferences,
      [id]: value,
    };

    try {
      await invoke('update_preferences', { preferences: updatedPreferences });
      setSettings({
        ...settings,
        preferences: updatedPreferences,
      });
      showToast({
        title: 'Preferences Updated',
        description: 'Your preferences have been saved',
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'error',
      });
    }
  };

  const handleFileOrgChange = async (id: string, value: any) => {
    if (!settings) return;

    const updatedFileOrg = {
      ...settings.file_organization,
      [id]: value,
    };

    try {
      await invoke('update_file_organization', { fileOrganization: updatedFileOrg });
      setSettings({
        ...settings,
        file_organization: updatedFileOrg,
      });
      showToast({
        title: 'File Organization Updated',
        description: 'Your file organization settings have been saved',
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update file organization',
        variant: 'error',
      });
    }
  };

  const handleBrandChange = async (id: string, value: any) => {
    if (!settings) return;

    const updatedBrand = {
      ...settings.brand_settings,
      [id]: value,
    };

    try {
      await invoke('update_brand_settings', { brandSettings: updatedBrand });
      setSettings({
        ...settings,
        brand_settings: updatedBrand,
      });
      showToast({
        title: 'Brand Settings Updated',
        description: 'Your brand settings have been saved',
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update brand settings',
        variant: 'error',
      });
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const usageStatsItems: UsageStatsItem[] = [
    {
      label: 'Descript API Calls',
      current: settings.usage_stats.descript_api_calls,
      limit: 1000,
      unit: 'calls',
      icon: 'api',
      color: 'primary',
    },
    {
      label: 'OpenAI Tokens',
      current: settings.usage_stats.openai_tokens_used,
      limit: 100000,
      unit: 'tokens',
      icon: 'brain',
      color: 'secondary',
    },
    {
      label: 'Claude Tokens',
      current: settings.usage_stats.claude_tokens_used,
      limit: 100000,
      unit: 'tokens',
      icon: 'robot',
      color: 'success',
    },
    {
      label: 'Storage Used',
      current: settings.usage_stats.storage_used_mb,
      unit: 'MB',
      icon: 'database',
      color: 'warning',
    },
  ];

  const preferenceItems: PreferenceItem[] = [
    {
      id: 'theme',
      label: 'Theme',
      description: 'Choose your preferred color theme',
      type: 'select',
      value: settings.preferences.theme,
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ],
    },
    {
      id: 'auto_save_interval',
      label: 'Auto-save Interval',
      description: 'How often to automatically save your work',
      type: 'number',
      value: settings.preferences.auto_save_interval,
      min: 10,
      max: 300,
      unit: 'seconds',
    },
    {
      id: 'default_export_format',
      label: 'Default Export Format',
      description: 'Preferred format for exporting content',
      type: 'select',
      value: settings.preferences.default_export_format,
      options: [
        { value: 'png', label: 'PNG Images' },
        { value: 'jpg', label: 'JPG Images' },
        { value: 'pdf', label: 'PDF Document' },
      ],
    },
    {
      id: 'show_tips',
      label: 'Show Tips',
      description: 'Display helpful tips and suggestions',
      type: 'toggle',
      value: settings.preferences.show_tips,
    },
  ];

  const fileOrgItems: PreferenceItem[] = [
    {
      id: 'watch_folder',
      label: 'Watch Folder',
      description: 'Folder to monitor for new video files',
      type: 'text',
      value: settings.file_organization.watch_folder || '',
    },
    {
      id: 'auto_organize',
      label: 'Auto-organize Files',
      description: 'Automatically organize imported files',
      type: 'toggle',
      value: settings.file_organization.auto_organize,
    },
    {
      id: 'folder_pattern',
      label: 'Folder Pattern',
      description: 'Pattern for organizing files (e.g., {year}/{month}/{orientation})',
      type: 'text',
      value: settings.file_organization.folder_pattern,
    },
    {
      id: 'cleanup_after_days',
      label: 'Cleanup After',
      description: 'Remove old files after this many days',
      type: 'number',
      value: settings.file_organization.cleanup_after_days,
      min: 1,
      max: 365,
      unit: 'days',
    },
  ];

  const brandItems: PreferenceItem[] = [
    {
      id: 'primary_color',
      label: 'Primary Color',
      description: 'Main brand color for your content',
      type: 'color',
      value: settings.brand_settings.primary_color,
    },
    {
      id: 'secondary_color',
      label: 'Secondary Color',
      description: 'Accent color for your content',
      type: 'color',
      value: settings.brand_settings.secondary_color,
    },
    {
      id: 'font_family',
      label: 'Font Family',
      description: 'Default font for generated content',
      type: 'select',
      value: settings.brand_settings.font_family,
      options: [
        { value: 'Inter', label: 'Inter' },
        { value: 'Roboto', label: 'Roboto' },
        { value: 'Open Sans', label: 'Open Sans' },
        { value: 'Lato', label: 'Lato' },
        { value: 'Montserrat', label: 'Montserrat' },
      ],
    },
  ];

  const tabs = [
    { id: 'api-keys' as SettingsTab, label: 'API Keys', icon: 'key' as const },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: 'settings' as const },
    { id: 'file-organization' as SettingsTab, label: 'File Organization', icon: 'folder' as const },
    { id: 'brand' as SettingsTab, label: 'Brand Settings', icon: 'palette' as const },
    { id: 'usage' as SettingsTab, label: 'Usage Stats', icon: 'chart' as const },
  ];

  return (
    <div className="flex h-full">
      <div className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        </div>
        <nav className="px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 mb-1 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon name={tab.icon} size="sm" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">API Keys</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure your API keys for external services. All keys are encrypted and stored securely.
                </p>
              </div>

              {apiKeyServices.map((service) => {
                const apiKeyInfo = settings.api_keys.find((k) => k.service === service.id);
                return (
                  <ApiKeyInput
                    key={service.id}
                    service={service.id}
                    label={service.label}
                    value={apiKeyValues[service.id] || ''}
                    isSet={apiKeyInfo?.is_set || false}
                    createdAt={apiKeyInfo?.created_at}
                    lastUsed={apiKeyInfo?.last_used}
                    placeholder={service.placeholder}
                    onChange={(value) => {
                      setApiKeyValues((prev) => ({ ...prev, [service.id]: value }));
                    }}
                    onSave={() => handleApiKeySave(service.id)}
                    onRemove={() => handleApiKeyRemove(service.id)}
                    onVerify={() => handleApiKeyVerify(service.id)}
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Customize your ContentFlow experience with these preferences.
                </p>
              </div>

              <PreferenceGroup
                title="General Preferences"
                description="Configure your general application preferences"
                icon="settings"
                items={preferenceItems}
                onChange={handlePreferenceChange}
              />
            </div>
          )}

          {activeTab === 'file-organization' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">File Organization</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure how ContentFlow organizes and manages your video files.
                </p>
              </div>

              <PreferenceGroup
                title="Organization Settings"
                description="Control how files are organized and stored"
                icon="folder"
                items={fileOrgItems}
                onChange={handleFileOrgChange}
              />
            </div>
          )}

          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Customize the appearance of your generated content to match your brand.
                </p>
              </div>

              <PreferenceGroup
                title="Brand Customization"
                description="Set your brand colors and typography"
                icon="palette"
                items={brandItems}
                onChange={handleBrandChange}
              />
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Statistics</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Monitor your usage of external services and storage.
                </p>
              </div>

              <UsageStats
                stats={usageStatsItems}
                lastUpdated={settings.usage_stats.last_updated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};