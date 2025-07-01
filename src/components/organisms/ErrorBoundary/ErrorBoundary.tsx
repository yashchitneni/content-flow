import React, { Component, ErrorInfo, ReactNode } from 'react';
import { colors, spacing, borderRadius } from '../../../tokens';
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
  private resetTimeoutId: NodeJS.Timeout | null = null;
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
    
    this.resetTimeoutId = setTimeout(() => {
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

      const containerStyles: React.CSSProperties = {
        padding: spacing[8],
        textAlign: 'center',
        minHeight: isolate ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray[50]
      };

      const errorBoxStyles: React.CSSProperties = {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${colors.gray[200]}`
      };

      const iconContainerStyles: React.CSSProperties = {
        marginBottom: spacing[4],
        color: colors.error[500]
      };

      const titleStyles: React.CSSProperties = {
        fontSize: '24px',
        fontWeight: 600,
        color: colors.gray[900],
        marginBottom: spacing[2]
      };

      const messageStyles: React.CSSProperties = {
        fontSize: '16px',
        color: colors.gray[600],
        marginBottom: spacing[6],
        lineHeight: '24px'
      };

      const buttonStyles: React.CSSProperties = {
        backgroundColor: colors.primary[500],
        color: colors.white,
        border: 'none',
        borderRadius: borderRadius.md,
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: '16px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      };

      const detailsStyles: React.CSSProperties = {
        marginTop: spacing[4],
        padding: spacing[3],
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        fontSize: '14px',
        color: colors.gray[700],
        textAlign: 'left',
        maxHeight: '200px',
        overflow: 'auto'
      };

      return (
        <div style={containerStyles}>
          <div style={errorBoxStyles}>
            <div style={iconContainerStyles}>
              <Icon name="alert-circle" size="lg" />
            </div>
            
            <h1 style={titleStyles}>Oops! Something went wrong</h1>
            <p style={messageStyles}>{errorMessage}</p>
            
            <button
              onClick={this.resetErrorBoundary}
              style={buttonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[500];
              }}
            >
              Try Again
            </button>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details style={detailsStyles}>
                <summary style={{ cursor: 'pointer', marginBottom: spacing[2] }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
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