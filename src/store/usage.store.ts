import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UsageData {
  openai: {
    tokensUsed: number;
    apiCalls: number;
    lastReset: string;
  };
  claude: {
    tokensUsed: number;
    apiCalls: number;
    lastReset: string;
  };
  storage: {
    videosCount: number;
    transcriptsCount: number;
    totalSizeMB: number;
  };
  lastUpdated: string;
}

interface UsageStore {
  usage: UsageData;
  trackOpenAIUsage: (tokens: number) => void;
  trackClaudeUsage: (tokens: number) => void;
  updateStorageUsage: (videos: number, transcripts: number, sizeMB: number) => void;
  resetMonthlyUsage: () => void;
  getUsageStats: () => UsageData;
}

const initialUsage: UsageData = {
  openai: {
    tokensUsed: 0,
    apiCalls: 0,
    lastReset: new Date().toISOString(),
  },
  claude: {
    tokensUsed: 0,
    apiCalls: 0,
    lastReset: new Date().toISOString(),
  },
  storage: {
    videosCount: 0,
    transcriptsCount: 0,
    totalSizeMB: 0,
  },
  lastUpdated: new Date().toISOString(),
};

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      usage: initialUsage,

      trackOpenAIUsage: (tokens: number) => {
        set((state) => ({
          usage: {
            ...state.usage,
            openai: {
              ...state.usage.openai,
              tokensUsed: state.usage.openai.tokensUsed + tokens,
              apiCalls: state.usage.openai.apiCalls + 1,
            },
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      trackClaudeUsage: (tokens: number) => {
        set((state) => ({
          usage: {
            ...state.usage,
            claude: {
              ...state.usage.claude,
              tokensUsed: state.usage.claude.tokensUsed + tokens,
              apiCalls: state.usage.claude.apiCalls + 1,
            },
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      updateStorageUsage: (videos: number, transcripts: number, sizeMB: number) => {
        set((state) => ({
          usage: {
            ...state.usage,
            storage: {
              videosCount: videos,
              transcriptsCount: transcripts,
              totalSizeMB: sizeMB,
            },
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      resetMonthlyUsage: () => {
        const now = new Date().toISOString();
        set((state) => ({
          usage: {
            ...state.usage,
            openai: {
              tokensUsed: 0,
              apiCalls: 0,
              lastReset: now,
            },
            claude: {
              tokensUsed: 0,
              apiCalls: 0,
              lastReset: now,
            },
            lastUpdated: now,
          },
        }));
      },

      getUsageStats: () => get().usage,
    }),
    {
      name: 'contentflow-usage',
    }
  )
);