import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceOverview } from '../../components/telemetry/PerformanceOverview';
import { CostAnalytics } from '../../components/telemetry/CostAnalytics';
import { ErrorMonitor } from '../../components/telemetry/ErrorMonitor';
import { TraceViewer } from '../../components/telemetry/TraceViewer';
import { ServiceDependencyGraph } from '../../components/telemetry/ServiceDependencyGraph';
import { TopOperations } from '../../components/telemetry/TopOperations';
import { TopErrors } from '../../components/telemetry/TopErrors';
import { TelemetryExplorer } from '../../components/telemetry/TelemetryExplorer';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// Create a query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 30000,
        },
    },
});

// Custom Error Boundary Component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can log the error to an error reporting service
        console.error('Uncaught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="bg-red-100 text-red-800 p-6 rounded-lg flex items-center">
                    <ExclamationTriangleIcon className="w-10 h-10 mr-4 text-red-500" />
                    <div>
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <button
                            onClick={this.handleReset}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export const TelemetryDashboard: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <div className="min-h-screen bg-gray-100 p-6">
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">OpenTelemetry Dashboard</h1>
                        <p className="text-gray-600">Real-time insights into your AI system's performance and costs</p>
                    </header>

                    {/* KPIs */}
                    <div className="mb-6">
                        <PerformanceOverview />
                    </div>

                    {/* Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <CostAnalytics />
                        <ErrorMonitor />
                    </div>

                    {/* Top lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <TopOperations />
                        <TopErrors />
                    </div>

                    {/* Explorer */}
                    <div className="mb-6">
                        <TelemetryExplorer />
                    </div>

                    {/* Trace + Dependencies */}
                    <div className="grid grid-cols-1 gap-6">
                        <TraceViewer />
                        <ServiceDependencyGraph />
                    </div>
                </div>
            </ErrorBoundary>
        </QueryClientProvider>
    );
};
