import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Re-export the new stores for backward compatibility during migration
export { useApiKeyStore } from './apiKey.store';
export { useTranscriptStore } from './transcript.store';
export { useSettingsStore } from './settings.store';
export { useUIStore } from './ui.store';

// Migration helper to transfer data from old store to new stores
export const migrateAppStore = () => {
  const oldData = localStorage.getItem('contentflow-storage');
  
  if (oldData) {
    try {
      const parsed = JSON.parse(oldData);
      const state = parsed.state;
      
      // Migrate API keys
      if (state.apiKeys) {
        const apiKeyData = {
          state: { apiKeys: state.apiKeys },
          version: 0
        };
        localStorage.setItem('contentflow-apikeys', JSON.stringify(apiKeyData));
      }
      
      // Migrate transcripts
      if (state.transcripts) {
        const transcriptData = {
          state: { transcripts: state.transcripts },
          version: 0
        };
        localStorage.setItem('contentflow-transcripts', JSON.stringify(transcriptData));
      }
      
      // Migrate settings
      if (state.isAutoGenerateEnabled !== undefined || state.defaultAutomationTemplateId !== undefined) {
        const settingsData = {
          state: {
            isAutoGenerateEnabled: state.isAutoGenerateEnabled || false,
            defaultAutomationTemplateId: state.defaultAutomationTemplateId || null
          },
          version: 0
        };
        localStorage.setItem('contentflow-settings', JSON.stringify(settingsData));
      }
      
      // Remove old storage after successful migration
      localStorage.removeItem('contentflow-storage');
      console.log('[Migration] Successfully migrated app store to domain-specific stores');
    } catch (error) {
      console.error('[Migration] Failed to migrate app store:', error);
    }
  }
};

// Run migration on import
if (typeof window !== 'undefined') {
  migrateAppStore();
}

/**
 * @deprecated The useAppStore is deprecated and will be removed in a future version.
 * Please use the domain-specific stores instead:
 * - useApiKeyStore for API key management
 * - useTranscriptStore for transcript data
 * - useSettingsStore for automation settings  
 * - useUIStore for notifications
 */
interface DeprecatedAppState {
  _deprecated: true;
}

export const useAppStore = create<DeprecatedAppState>(() => ({
  _deprecated: true
}));