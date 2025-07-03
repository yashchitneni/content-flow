import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Automation settings
  isAutoGenerateEnabled: boolean;
  defaultAutomationTemplateId: string | null;
  
  // Actions
  setIsAutoGenerateEnabled: (isEnabled: boolean) => void;
  setDefaultAutomationTemplateId: (templateId: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      isAutoGenerateEnabled: false,
      defaultAutomationTemplateId: null,
      
      // Actions
      setIsAutoGenerateEnabled: (isEnabled) => {
        set({ isAutoGenerateEnabled: isEnabled });
      },
      
      setDefaultAutomationTemplateId: (templateId) => {
        set({ defaultAutomationTemplateId: templateId });
      }
    }),
    {
      name: 'contentflow-settings',
      partialize: (state) => ({
        isAutoGenerateEnabled: state.isAutoGenerateEnabled,
        defaultAutomationTemplateId: state.defaultAutomationTemplateId
      })
    }
  )
); 