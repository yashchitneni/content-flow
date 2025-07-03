import React, { useState, useEffect } from 'react';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';

interface DebugLog {
  timestamp: string;
  level: 'log' | 'warn' | 'error';
  message: string;
  data?: any;
}

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'log',
        message,
        data: args.length > 1 ? args.slice(1) : undefined
      }].slice(-100)); // Keep last 100 logs
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        data: args.length > 1 ? args.slice(1) : undefined
      }].slice(-100));
    };

    console.error = (...args) => {
      originalError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        data: args.length > 1 ? args.slice(1) : undefined
      }].slice(-100));
    };

    // Restore on cleanup
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 glass rounded-full shadow-lg hover:shadow-glow-subtle transition-all z-50"
        title="Open Debug Panel"
      >
        <Icon name="bug" className="w-5 h-5 text-theme-primary" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 glass-ultra rounded-xl shadow-2xl border border-theme z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-theme">
        <h3 className="text-lg font-semibold text-theme-primary">Debug Console</h3>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="ghost"
            onClick={() => setLogs([])}
            title="Clear logs"
          >
            <Icon name="trash" className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-theme-hover rounded"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-theme-tertiary text-center mt-8">No logs yet...</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded border ${
                log.level === 'error' 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : log.level === 'warn'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-theme-secondary/20 border-theme text-theme-secondary'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-theme-tertiary">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};