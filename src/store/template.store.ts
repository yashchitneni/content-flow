import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomTemplate {
  template_id: string;
  template_name: string;
  template_type: string;
  description?: string;
  prompt: string;
  constraints?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateStore {
  // State
  customTemplates: CustomTemplate[];
  
  // Actions
  addTemplate: (template: Omit<CustomTemplate, 'template_id' | 'created_at' | 'updated_at' | 'is_default'>) => void;
  updateTemplate: (id: string, updates: Partial<CustomTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => CustomTemplate | undefined;
  getAllTemplates: () => CustomTemplate[];
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      customTemplates: [],
      
      addTemplate: (template) => {
        const now = new Date().toISOString();
        const newTemplate: CustomTemplate = {
          ...template,
          template_id: `template_${Date.now()}`,
          is_default: false,
          created_at: now,
          updated_at: now,
        };
        
        set((state) => ({
          customTemplates: [...state.customTemplates, newTemplate]
        }));
      },
      
      updateTemplate: (id, updates) => {
        set((state) => ({
          customTemplates: state.customTemplates.map(template =>
            template.template_id === id
              ? { ...template, ...updates, updated_at: new Date().toISOString() }
              : template
          )
        }));
      },
      
      deleteTemplate: (id) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter(template => template.template_id !== id)
        }));
      },
      
      getTemplate: (id) => {
        return get().customTemplates.find(template => template.template_id === id);
      },
      
      getAllTemplates: () => {
        return get().customTemplates;
      },
    }),
    {
      name: 'contentflow-templates',
      version: 1,
    }
  )
); 