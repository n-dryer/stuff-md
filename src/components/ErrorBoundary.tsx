import { Component, type ErrorInfo, type ReactNode } from 'react';

import ErrorDisplay from './ErrorDisplay';
import { logError } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary component to catch errors in child components
 * and display a user-friendly error message instead of crashing the app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(
    error: Error
  ): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service (e.g., Sentry) in production
    logError('ErrorBoundary caught an error:', { error, errorInfo });
    // Error reporting service integration can be added here for production
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage =
        this.state.error?.message || 'An unexpected error occurred.';

      return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-off-white dark:bg-off-black'>
          <div className='max-w-md w-full'>
            <ErrorDisplay message={errorMessage} onDismiss={this.handleReset} />
            {(import.meta.env.DEV || process.env.NODE_ENV === 'development') &&
              this.state.errorInfo && (
                <details className='mt-4 p-4 border-2 border-accent-black dark:border-off-white/50 bg-off-white dark:bg-off-black'>
                  <summary className='font-mono text-xs uppercase cursor-pointer mb-2'>
                    Error Details (Development Only)
                  </summary>
                  <pre className='text-xs overflow-auto font-mono text-off-black/60 dark:text-off-white/60'>
                    {this.state.error?.stack}
                    {'\n\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            <button
              onClick={this.handleReset}
              className='mt-4 uppercase text-sm font-bold text-light-gray hover:text-accent-black dark:text-gray-500 dark:hover:text-off-white transition-colors'
            >
              [RETRY]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
