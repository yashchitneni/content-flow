import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedContent {
  id: string;
  templateId: string;
  templateName: string;
  templateType: string;
  title: string;
  contentData: {
    title: string;
    content: string | string[];
    metadata?: Record<string, any>;
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  sourceTranscriptIds?: string[];
}

interface ContentStore {
  // State
  savedContent: SavedContent[];
  
  // Actions
  addContent: (content: Omit<SavedContent, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateContent: (id: string, updates: Partial<SavedContent>) => void;
  deleteContent: (id: string) => void;
  getContent: (id: string) => SavedContent | undefined;
  getAllContent: () => SavedContent[];
  searchContent: (query: string) => SavedContent[];
  clearAllContent: () => void;
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      savedContent: [],
      
      addContent: (content) => {
        const id = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newContent: SavedContent = {
          ...content,
          id,
          status: content.status || 'draft',
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          savedContent: [...state.savedContent, newContent],
        }));
        
        return id;
      },
      
      updateContent: (id, updates) => {
        set((state) => ({
          savedContent: state.savedContent.map((content) =>
            content.id === id
              ? { ...content, ...updates, updatedAt: new Date().toISOString() }
              : content
          ),
        }));
      },
      
      deleteContent: (id) => {
        set((state) => ({
          savedContent: state.savedContent.filter((content) => content.id !== id),
        }));
      },
      
      getContent: (id) => {
        return get().savedContent.find((content) => content.id === id);
      },
      
      getAllContent: () => {
        return get().savedContent.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      
      searchContent: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().savedContent.filter((content) => {
          const title = content.title?.toLowerCase() || '';
          const templateName = content.templateName.toLowerCase();
          const templateType = content.templateType.toLowerCase();
          
          // Search in content text
          let contentText = '';
          if (Array.isArray(content.contentData.content)) {
            contentText = content.contentData.content.join(' ').toLowerCase();
          } else {
            contentText = content.contentData.content.toLowerCase();
          }
          
          return (
            title.includes(lowerQuery) ||
            templateName.includes(lowerQuery) ||
            templateType.includes(lowerQuery) ||
            contentText.includes(lowerQuery)
          );
        });
      },
      
      clearAllContent: () => {
        set({ savedContent: [] });
      },
    }),
    {
      name: 'contentflow-content-storage',
      version: 1,
    }
  )
); 