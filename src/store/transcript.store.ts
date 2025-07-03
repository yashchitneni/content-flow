import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TranscriptData {
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

interface TranscriptState {
  transcripts: TranscriptData[];
  selectedTranscriptIds: string[];
  
  // Actions
  addTranscripts: (transcripts: TranscriptData[]) => void;
  removeTranscript: (id: string) => void;
  updateTranscript: (id: string, data: Partial<TranscriptData>) => void;
  clearTranscripts: () => void;
  getTranscriptById: (id: string) => TranscriptData | undefined;
  
  // Selection actions
  setSelectedTranscripts: (ids: string[]) => void;
  toggleTranscriptSelection: (id: string) => void;
}

export const useTranscriptStore = create<TranscriptState>()(
  persist(
    (set, get) => ({
      // Initial state
      transcripts: [],
      selectedTranscriptIds: [],
      
      // Actions
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
      }
    }),
    {
      name: 'contentflow-transcripts',
      partialize: (state) => ({
        transcripts: state.transcripts
      })
    }
  )
); 