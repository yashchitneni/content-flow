import React, { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean;
}

export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}