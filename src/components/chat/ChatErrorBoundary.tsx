import React, { Component, ReactNode } from 'react';
import { captureError } from '@/config/sentry';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface ChatErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for the chat component.
 * Shows an inline fallback in the chat area so the dashboard remains usable.
 * Supports reset/retry to remount the chat without full page reload.
 */
export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      '[ChatErrorBoundary] Error:',
      error.message,
      '\nStack:',
      error.stack,
      '\nComponent stack:',
      errorInfo.componentStack,
    );

    try {
      captureError(error, {
      component: { name: 'ChatErrorBoundary' },
      tags: {
        'error.type': 'react_error_boundary',
        'error.component': 'ConversationalAgent',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
    } catch (reportError) {
      console.error('[ChatErrorBoundary] Failed to report to Sentry:', reportError);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/20">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
              Chat failed to load
            </h3>
            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Something went wrong while loading the chat. Try again or refresh the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn btn-primary font-display font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn font-display font-semibold glass border border-primary-200/30 dark:border-primary-500/30"
              >
                Refresh Page
              </button>
            </div>
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 p-4 text-xs overflow-auto rounded-lg bg-dark-bg-primary text-danger-500 font-mono max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
