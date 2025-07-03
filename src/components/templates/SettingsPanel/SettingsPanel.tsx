import React, { useState, useEffect } from 'react';
import { invoke } from '../../../lib/tauri-wrapper';
import { ApiKeyInput } from '../../molecules/ApiKeyInput';
import { UsageStats, UsageStatsItem } from '../../molecules/UsageStats';
import { PreferenceGroup, PreferenceItem } from '../../organisms/PreferenceGroup';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { useToast } from '../../../lib/hooks/useToast';
import { useAppStore } from '../../../store/app.store';
import { useUsageStore } from '../../../store/usage.store';

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
  const [availableTemplates, setAvailableTemplates] = useState<Array<{ template_id: string; template_name: string }>>([]);
  const { showToast } = useToast();
  
  // Use global store for API key management
  const { 
    apiKeys, setApiKey, removeApiKey, hasApiKey, addNotification,
    isAutoGenerateEnabled, defaultAutomationTemplateId,
    setIsAutoGenerateEnabled, setDefaultAutomationTemplateId
  } = useAppStore();
  const { usage, resetMonthlyUsage } = useUsageStore();

  const apiKeyServices = [
    { id: 'openai', label: 'OpenAI API', placeholder: 'sk-...' },
    { id: 'claude', label: 'Claude API', placeholder: 'sk_ant-...' },
  ];

  useEffect(() => {
    loadSettings();
    loadTemplates();
  }, []);
  
  // Debug logging to check API key persistence
  useEffect(() => {
    console.log('[SettingsPanel] Current API keys from store:', apiKeys);
    console.log('[SettingsPanel] localStorage contentflow-storage:', localStorage.getItem('contentflow-storage'));
  }, [apiKeys]);

  const loadTemplates = async () => {
    try {
      const templates = await invoke<Array<{ template_id: string; template_name: string; is_default: boolean }>>('get_all_templates');
      // Only show custom templates (not default ones) for automation
      const customTemplates = templates.filter(t => !t.is_default);
      setAvailableTemplates(customTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load API keys from global store
      const response: SettingsResponse = {
        api_keys: [
          { service: 'openai', is_set: hasApiKey('openai'), created_at: new Date().toISOString() },
          { service: 'claude', is_set: hasApiKey('claude'), created_at: new Date().toISOString() },
          { service: 'descript', is_set: hasApiKey('descript'), created_at: new Date().toISOString() },
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
      // Don't set masked values in state - keep state empty for configured keys
      setApiKeyValues({});
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
    const keyValue = apiKeyValues[service];
    
    console.log('Saving API key for service:', service);
    console.log('Key value length:', keyValue?.length);
    
    if (!keyValue || keyValue.trim() === '') {
      console.error('Invalid API key - empty or missing');
      throw new Error('Invalid API key');
    }
    
    // Save to global store
    setApiKey(service as 'openai' | 'claude' | 'descript', keyValue);
    
    console.log('Saved API key for:', service);
    console.log('Store state after save:', { apiKeys, hasApiKey: hasApiKey(service) });
    
    // Update local state to show key is configured
    setSettings((prev) => {
      if (!prev) return prev;
      
      const updatedApiKeys = prev.api_keys.map(key => 
        key.service === service 
          ? { ...key, is_set: true, created_at: new Date().toISOString() }
          : key
      );
      
      return { ...prev, api_keys: updatedApiKeys };
    });
    
    // Clear the input value after successful save
    setApiKeyValues((prev) => ({ 
      ...prev, 
      [service]: ''
    }));
    
    // Show success notification using global store
    addNotification('success', `${service} API key saved successfully`);
  };

  const handleApiKeyRemove = async (service: string) => {
    try {
      // Remove from global store
      removeApiKey(service as 'openai' | 'claude' | 'descript');
      
      addNotification('success', `${service} API key removed successfully`);
      
      await loadSettings();
    } catch (error) {
      addNotification('error', `Failed to remove ${service} API key`);
    }
  };

  const handleApiKeyVerify = async (service: string): Promise<boolean> => {
    try {
      // For now, just verify the key exists in the store
      // In production, this would make an actual API call to verify
      const hasKey = hasApiKey(service as 'openai' | 'claude' | 'descript');
      
      if (!hasKey) {
        addNotification('error', 'No API key configured for ' + service);
        return false;
      }
      
      addNotification('info', `${service} API key verification not implemented yet`);
      return true;
    } catch (error) {
      addNotification('error', 'Failed to verify API key');
      return false;
    }
  };

  const handleAutomationChange = async (id: string, value: any) => {
    try {
      if (id === 'auto_generate_enabled') {
        setIsAutoGenerateEnabled(value);
        addNotification('success', `Automation mode ${value ? 'enabled' : 'disabled'}`);
      } else if (id === 'default_automation_template') {
        setDefaultAutomationTemplateId(value || null);
        if (value) {
          const template = availableTemplates.find(t => t.template_id === value);
          addNotification('success', `Default template set to "${template?.template_name || 'Unknown'}"`);
        }
      }
    } catch (error) {
      addNotification('error', 'Failed to update automation settings');
    }
  };

  const handlePreferenceChange = async (id: string, value: any) => {
    if (!settings) return;

    const updatedPreferences = {
      ...settings.preferences,
      [id]: value,
    };

    try {
      // In production, this would call Tauri
      // For now, just update local state
      setSettings({
        ...settings,
        preferences: updatedPreferences,
      });
      addNotification('success', 'Preferences updated successfully');
    } catch (error) {
      addNotification('error', 'Failed to update preferences');
    }
  };

  const handleFileOrgChange = async (id: string, value: any) => {
    if (!settings) return;

    const updatedFileOrg = {
      ...settings.file_organization,
      [id]: value,
    };

    try {
      // In production, this would call Tauri
      // For now, just update local state
      setSettings({
        ...settings,
        file_organization: updatedFileOrg,
      });
      addNotification('success', 'File organization settings updated successfully');
    } catch (error) {
      addNotification('error', 'Failed to update file organization');
    }
  };

  const handleBrandChange = async (id: string, value: any) => {
    if (!settings) return;

    const updatedBrand = {
      ...settings.brand_settings,
      [id]: value,
    };

    try {
      // In production, this would call Tauri
      // For now, just update local state
      setSettings({
        ...settings,
        brand_settings: updatedBrand,
      });
      addNotification('success', 'Brand settings updated successfully');
    } catch (error) {
      addNotification('error', 'Failed to update brand settings');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-theme-secondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  const usageStatsItems: UsageStatsItem[] = [
    {
      label: 'OpenAI Tokens',
      current: usage.openai.tokensUsed,
      limit: 100000,
      unit: 'tokens',
      icon: 'brain',
      color: 'primary',
    },
    {
      label: 'OpenAI API Calls',
      current: usage.openai.apiCalls,
      unit: 'calls',
      icon: 'api',
      color: 'primary',
    },
    {
      label: 'Claude Tokens',
      current: usage.claude.tokensUsed,
      limit: 100000,
      unit: 'tokens',
      icon: 'robot',
      color: 'secondary',
    },
    {
      label: 'Claude API Calls',
      current: usage.claude.apiCalls,
      unit: 'calls',
      icon: 'api',
      color: 'secondary',
    },
    {
      label: 'Videos Stored',
      current: usage.storage.videosCount,
      unit: 'files',
      icon: 'video',
      color: 'success',
    },
    {
      label: 'Transcripts',
      current: usage.storage.transcriptsCount,
      unit: 'files',
      icon: 'file-text',
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

  const automationItems: PreferenceItem[] = [
    {
      id: 'auto_generate_enabled',
      label: 'Enable Automation Mode',
      description: 'Automatically generate content using your default template whenever new transcripts are imported',
      type: 'toggle',
      value: isAutoGenerateEnabled,
    },
    {
      id: 'default_automation_template',
      label: 'Default Automation Template',
      description: 'Template to use for automatic content generation',
      type: 'select',
      value: defaultAutomationTemplateId || '',
      options: [
        { value: '', label: 'Select a template...' },
        ...availableTemplates.map(t => ({ value: t.template_id, label: t.template_name }))
      ],
      disabled: !isAutoGenerateEnabled,
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
      <div className="w-64 bg-theme-secondary border-r border-theme">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-theme-primary">Settings</h2>
        </div>
        <nav className="px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 mb-1 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'glass text-primary-500 shadow-glow-subtle scale-[1.02]'
                  : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
              }`}
            >
              <Icon name={tab.icon} size="sm" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto bg-theme-primary">
        <div className="max-w-4xl mx-auto p-8">
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-theme-primary mb-2">API Keys</h3>
                <p className="text-sm text-theme-secondary mb-6">
                  Configure your API keys for external services. All keys are encrypted and stored securely.
                </p>
              </div>

              {apiKeyServices.map((service) => {
                const apiKeyInfo = settings.api_keys.find((k) => k.service === service.id);
                console.log(`Service: ${service.id}, API Key Info:`, apiKeyInfo);
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
                    onSave={async () => await handleApiKeySave(service.id)}
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
                <h3 className="text-lg font-medium text-theme-primary mb-2">Preferences</h3>
                <p className="text-sm text-theme-secondary mb-6">
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

              <PreferenceGroup
                title="Automation Settings"
                description="Configure automatic content generation for new transcripts"
                icon="robot"
                items={automationItems}
                onChange={handleAutomationChange}
              />
            </div>
          )}

          {activeTab === 'file-organization' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-theme-primary mb-2">File Organization</h3>
                <p className="text-sm text-theme-secondary mb-6">
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
                <h3 className="text-lg font-medium text-theme-primary mb-2">Brand Settings</h3>
                <p className="text-sm text-theme-secondary mb-6">
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
                <h3 className="text-lg font-medium text-theme-primary mb-2">Usage Statistics</h3>
                <p className="text-sm text-theme-secondary mb-6">
                  Monitor your usage of external services and storage.
                </p>
              </div>

              <UsageStats
                stats={usageStatsItems}
                lastUpdated={usage.lastUpdated}
              />
              
              <div className="mt-6 flex items-center justify-between glass rounded-lg p-4">
                <div>
                  <h4 className="text-sm font-medium text-theme-primary">Monthly Usage Reset</h4>
                  <p className="text-xs text-theme-secondary mt-1">
                    Last reset: {new Date(usage.openai.lastReset).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset your monthly usage statistics?')) {
                      resetMonthlyUsage();
                      addNotification('success', 'Monthly usage statistics have been reset');
                    }
                  }}
                >
                  Reset Usage
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};