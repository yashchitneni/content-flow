import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from '../../atoms/Icon';
import { AppError, ErrorType } from '../../../lib/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Auto-reset after multiple errors (prevent infinite loops)
    if (this.state.errorCount >= 3) {
      this.scheduleReset(10000); // Reset after 10 seconds
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    // Reset error boundary when resetKeys change
    if (
      hasError &&
      prevProps.resetKeys !== resetKeys &&
      this.hasResetKeysChanged(resetKeys)
    ) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  hasResetKeysChanged(resetKeys?: Array<string | number>): boolean {
    if (!resetKeys || !this.previousResetKeys) {
      return false;
    }
    
    if (resetKeys.length !== this.previousResetKeys.length) {
      return true;
    }
    
    return resetKeys.some((key, index) => key !== this.previousResetKeys[index]);
  }

  scheduleReset(delay: number) {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  }

  resetErrorBoundary = () => {
    const { resetKeys } = this.props;
    
    if (resetKeys) {
      this.previousResetKeys = [...resetKeys];
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
    
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, isolate } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo!);
      }

      // Default error UI
      const isAppError = error && 'type' in error && 'userMessage' in error;
      const errorMessage = isAppError
        ? (error as AppError).userMessage
        : 'Something went wrong. Please try refreshing the page.';

      const containerClasses = [
        'p-8 text-center flex flex-col items-center justify-center bg-gray-50',
        isolate ? 'min-h-0' : 'min-h-screen'
      ].join(' ');

      return (
        <div className={containerClasses}>
          <div className="bg-white rounded-lg p-6 max-w-[500px] w-full shadow border border-gray-200">
            <div className="mb-4 text-error-500">
              <Icon name="alert-circle" size="lg" />
            </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-base text-gray-600 mb-6 leading-6">
              {errorMessage}
            </p>
            
            <button
              onClick={this.resetErrorBoundary}
              className="bg-primary-500 text-white border-none rounded-md px-6 py-3 text-base font-medium cursor-pointer transition-colors hover:bg-primary-600"
            >
              Try Again
            </button>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-700 text-left max-h-[200px] overflow-auto">
                <summary className="cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="m-0 whitespace-pre-wrap">
                  {error.toString()}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}