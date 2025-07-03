// Wrapper for Tauri API that provides fallbacks for browser environment

declare global {
  interface Window {
    __TAURI__?: any;
  }
}

export const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
};

// Mock invoke function for browser
const mockInvoke = async (cmd: string, args?: any): Promise<any> => {
  console.warn(`Tauri invoke called in browser: ${cmd}`, args);
  
  // Return mock data for development
  switch (cmd) {
    case 'get_imported_files':
      return [];
    case 'get_file_count':
      return 0;
    case 'get_all_transcripts':
      return [];
    case 'get_transcript_count':
      return 0;
    case 'get_all_content':
      return [];
    case 'get_settings':
      return {
        api_keys: [],
        preferences: {
          theme: 'dark',
          language: 'en',
          autoSave: true,
          notifications: true,
        },
        file_organization: {
          defaultFolder: 'ContentFlow',
          createSubfolders: true,
          namingPattern: 'date_title',
        },
        brand_settings: {
          primaryColor: '#6B46C1',
          secondaryColor: '#0066FF',
          fontFamily: 'Inter',
          logoUrl: '',
        },
        usage_stats: {
          transcriptsProcessed: 0,
          contentGenerated: 0,
          storageUsedMB: 0,
          monthlyResets: true,
        },
      };
    case 'search_content':
      return [];
    case 'delete_content':
      return { success: true };
    case 'get_all_templates':
      return [];
    case 'get_template_count':
      return 0;
    default:
      console.log(`Unhandled Tauri command: ${cmd}`);
      return null;
  }
};

// Export a safe invoke function
let tauriInvoke: any = null;

export async function invoke<T = any>(cmd: string, args?: any): Promise<T> {
  if (isTauri()) {
    if (!tauriInvoke) {
      const tauriModule = await import('@tauri-apps/api/core');
      tauriInvoke = tauriModule.invoke;
    }
    return tauriInvoke<T>(cmd, args);
  }
  return mockInvoke(cmd, args) as T;
}

// Export safe dialog functions
export const open = async (options?: any) => {
  if (isTauri()) {
    const { open: tauriOpen } = await import('@tauri-apps/plugin-dialog');
    return tauriOpen(options);
  }
  // Browser fallback - use file input
  return new Promise<string[] | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options?.multiple || false;
    input.accept = options?.filters?.[0]?.extensions?.map((ext: string) => `.${ext}`).join(',') || '*';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      resolve(files.map(f => f.name));
    };
    input.click();
  });
};

export const save = async (options?: any) => {
  if (isTauri()) {
    const { save: tauriSave } = await import('@tauri-apps/plugin-dialog');
    return tauriSave(options);
  }
  // Browser fallback
  console.warn('Save dialog not available in browser');
  return null;
};

// Export safe event listening
export const listen = async (event: string, handler: (event: any) => void) => {
  if (isTauri()) {
    const { listen: tauriListen } = await import('@tauri-apps/api/event');
    return tauriListen(event, handler);
  }
  // Browser fallback - return a dummy unlisten function
  console.warn(`Event listener for "${event}" not available in browser`);
  return () => {};
}; 