// Browser polyfills for Node.js APIs used by LangChain

// Polyfill for AsyncLocalStorage
class AsyncLocalStorageMock<T> {
  private store: T | undefined;

  run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R {
    const previousStore = this.store;
    this.store = store;
    try {
      return callback(...args);
    } finally {
      this.store = previousStore;
    }
  }

  getStore(): T | undefined {
    return this.store;
  }
}

// Override the module imports before LangChain loads
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.AsyncLocalStorage = AsyncLocalStorageMock;
  
  // Create a global polyfill
  // @ts-ignore
  globalThis.AsyncLocalStorage = AsyncLocalStorageMock;
  
  // Mock the entire async_hooks module
  const asyncHooksMock = {
    AsyncLocalStorage: AsyncLocalStorageMock,
  };
  
  // @ts-ignore
  globalThis.async_hooks = asyncHooksMock;
  // @ts-ignore
  globalThis['node:async_hooks'] = asyncHooksMock;
}

// Ensure process exists
if (typeof globalThis.process === 'undefined') {
  // @ts-ignore
  globalThis.process = {
    env: {},
    version: 'v16.0.0',
    versions: { node: '16.0.0' },
    platform: 'browser',
    browser: true,
  };
}

export { AsyncLocalStorageMock };