import React, { Component, ReactNode } from "react";
import { captureError, setComponentContext } from "@/config/sentry";

/// <reference types="vite/client" />

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Capture error with Sentry
    captureError(error, {
      component: {
        name: 'ErrorBoundary',
        props: this.props,
      },
      route: {
        path: window.location.pathname,
        component: 'ErrorBoundary',
      },
      tags: {
        'error.type': 'react_error_boundary',
        'error.component': 'ErrorBoundary',
        'error.boundary': 'global',
      },
      extra: {
        errorInfo,
        componentStack: errorInfo.componentStack,
        errorBoundary: 'global',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
    });

    // Set component context for better error tracking
    setComponentContext({
      name: 'ErrorBoundary',
      props: this.props,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient px-4 relative overflow-hidden">
          {/* Ambient glow effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danger-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="max-w-md w-full text-center relative z-10 animate-fade-in">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-danger p-4 rounded-2xl shadow-2xl glow-danger animate-pulse">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full text-white">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-display font-bold gradient-text mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 font-body leading-relaxed">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>

            {this.state.error && import.meta.env.MODE === "development" && (
              <details className="mb-8 text-left glass p-4 animate-scale-in shadow-2xl backdrop-blur-xl border border-primary-200/30">
                <summary className="cursor-pointer text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary hover:text-primary-500 transition-colors duration-300">
                  Error details (Development only)
                </summary>
                <pre className="mt-3 text-xs text-danger-600 dark:text-danger-400 overflow-auto font-mono bg-dark-bg-primary text-dark-text-primary p-3 rounded-lg">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary font-display font-semibold"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
