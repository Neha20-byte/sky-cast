// Error Boundary Component
'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center weather-shadow">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">
          Something went wrong
        </h2>

        <p className="text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred while loading the weather app.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus-ring"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-muted hover:bg-accent/10 text-foreground rounded-lg font-medium transition-colors focus-ring"
          >
            Reload Page
          </button>
        </div>

        <details className="mt-6 text-left">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Error Details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs text-foreground overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}

export { ErrorBoundary };