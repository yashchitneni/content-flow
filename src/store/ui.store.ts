import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface UIState {
  notifications: Notification[];
  
  // Actions
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  notifications: [],
  
  // Actions
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
})); 