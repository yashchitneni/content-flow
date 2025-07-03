// Polyfill for async_hooks module used by LangChain
export class AsyncLocalStorage<T> {
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

  disable(): void {
    this.store = undefined;
  }

  enterWith(store: T): void {
    this.store = store;
  }
}

// Export as both named and default
export default {
  AsyncLocalStorage,
};

// Also export individual components
export const async_hooks = {
  AsyncLocalStorage,
};