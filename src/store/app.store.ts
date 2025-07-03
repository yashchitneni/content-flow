import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeys {
  openai?: string;
  claude?: string;
  descript?: string;
}

interface TranscriptData {
  id: string;
  filename: string;
  word_count: number;
  language: string;
  content_preview: string;
  full_content?: string;
  imported_at: string;
  status: 'imported' | 'processing' | 'error';
  tags?: Array<{ tag: string; relevance: number }>;
  content_score?: number;
  rating?: number; // 1-5 star rating
  platform_scores?: {
    thread: number;
    carousel: number;
    blog: number;
  };
}

interface AppState {
  // API Keys
  apiKeys: ApiKeys;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  removeApiKey: (provider: keyof ApiKeys) => void;
  hasApiKey: (provider: keyof ApiKeys) => boolean;
  
  // Transcripts
  transcripts: TranscriptData[];
  addTranscripts: (transcripts: TranscriptData[]) => void;
  removeTranscript: (id: string) => void;
  updateTranscript: (id: string, data: Partial<TranscriptData>) => void;
  clearTranscripts: () => void;
  getTranscriptById: (id: string) => TranscriptData | undefined;
  
  // Selected transcripts for content generation
  selectedTranscriptIds: string[];
  setSelectedTranscripts: (ids: string[]) => void;
  toggleTranscriptSelection: (id: string) => void;
  
  // UI State
  notifications: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string; timestamp: number }>;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      apiKeys: {},
      transcripts: [],
      selectedTranscriptIds: [],
      notifications: [],
      
      // API Key methods
      setApiKey: (provider, key) => {
        console.log(`[Store] Setting API key for ${provider}`);
        set((state) => {
          const newApiKeys = { ...state.apiKeys, [provider]: key };
          console.log('[Store] New API keys state:', newApiKeys);
          return { apiKeys: newApiKeys };
        });
      },
      
      removeApiKey: (provider) => {
        set((state) => {
          const newKeys = { ...state.apiKeys };
          delete newKeys[provider];
          return { apiKeys: newKeys };
        });
      },
      
      hasApiKey: (provider) => {
        const state = get();
        return !!state.apiKeys[provider];
      },
      
      // Transcript methods
      addTranscripts: (newTranscripts) => {
        set((state) => ({
          transcripts: [...newTranscripts, ...state.transcripts.filter(t => 
            !newTranscripts.some(nt => nt.id === t.id)
          )]
        }));
      },
      
      removeTranscript: (id) => {
        set((state) => ({
          transcripts: state.transcripts.filter(t => t.id !== id),
          selectedTranscriptIds: state.selectedTranscriptIds.filter(tid => tid !== id)
        }));
      },
      
      updateTranscript: (id, data) => {
        set((state) => ({
          transcripts: state.transcripts.map(t => 
            t.id === id ? { ...t, ...data } : t
          )
        }));
      },
      
      clearTranscripts: () => {
        set({ transcripts: [], selectedTranscriptIds: [] });
      },
      
      getTranscriptById: (id) => {
        const state = get();
        return state.transcripts.find(t => t.id === id);
      },
      
      // Selection methods
      setSelectedTranscripts: (ids) => {
        set({ selectedTranscriptIds: ids });
      },
      
      toggleTranscriptSelection: (id) => {
        set((state) => ({
          selectedTranscriptIds: state.selectedTranscriptIds.includes(id)
            ? state.selectedTranscriptIds.filter(tid => tid !== id)
            : [...state.selectedTranscriptIds, id]
        }));
      },
      
      // Notification methods
      addNotification: (type, message) => {
        const id = `notification-${Date.now()}`;
        set((state) => ({
          notifications: [...state.notifications, { id, type, message, timestamp: Date.now() }]
        }));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }
    }),
    {
      name: 'contentflow-storage',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        transcripts: state.transcripts
      })
    }
  )
);