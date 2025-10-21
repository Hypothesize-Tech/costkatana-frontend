import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceOverview } from '../../components/telemetry/PerformanceOverview';
import { CostAnalytics } from '../../components/telemetry/CostAnalytics';
import { ErrorMonitor } from '../../components/telemetry/ErrorMonitor';
import { TraceViewer } from '../../components/telemetry/TraceViewer';
import { ServiceDependencyGraph } from '../../components/telemetry/ServiceDependencyGraph';
import { TopOperations } from '../../components/telemetry/TopOperations';
import { TopErrors } from '../../components/telemetry/TopErrors';
import { TelemetryExplorer } from '../../components/telemetry/TelemetryExplorer';
import SpanExplorer from '../../components/telemetry/SpanExplorer';
import { ExclamationTriangleIcon, ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/solid';
import { Brain, Activity, Eye, Sparkles, Settings } from 'lucide-react';
import { apiClient } from '@/config/api';
import TelemetryConfiguration from '@/components/telemetry/TelemetryConfiguration';

interface EnhancedDashboardData {
    current: {
        requests_per_minute: number;
        error_rate: number;
        avg_latency_ms: number;
        p95_latency_ms: number;
    };
    enrichment: {
        stats: {
            total_spans: number;
            enriched_spans: number;
            enrichment_rate: number;
            cache_hit_spans: number;
            routing_decisions: number;
            timeframe?: string;
            processing_types: Array<{
                _id: string;
                count: number;
                avg_duration: number;
                avg_cost: number;
            }>;
        };
        recent_insights: Array<{
            trace_id: string;
            operation_name: string;
            insights: string;
            cost_usd?: number;
        }>;
        ai_recommendations: Array<{
            trace_id: string;
            operation: string;
            insight: string;
            cost_impact?: number;
            routing_decision?: string;
            priority?: 'high' | 'medium' | 'low';
        }>;
    };
}

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
                <div className="flex items-center p-6 text-red-800 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="mr-4 w-10 h-10 text-red-500" />
                    <div>
                        <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
                        <p className="mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <button
                            onClick={this.handleReset}
                            className="flex items-center px-4 py-2 text-white bg-red-500 rounded-lg"
                        >
                            <ArrowPathIcon className="mr-2 w-5 h-5" />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Enhanced Telemetry Dashboard Component
const EnhancedTelemetryContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'ai-insights' | 'explorer' | 'traces' | 'configuration'>('overview');
    const [enhancedData, setEnhancedData] = useState<EnhancedDashboardData | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch enhanced dashboard data
    const fetchEnhancedData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/telemetry/dashboard/enhanced');
            const data = response.data;

            if (data.success) {
                setEnhancedData(data.enhanced_dashboard);
            }
        } catch (error) {
            console.error('Failed to fetch enhanced dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnhancedData();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    };

    const formatLatency = (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <header className="mb-6">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                    <div className="flex gap-3 items-center mb-2">
                        <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        <h1 className="text-3xl font-display font-bold gradient-text-primary">Enhanced Telemetry Dashboard</h1>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-300">AI-powered observability with intelligent insights and cost optimization</p>
                    <div className="mt-4">
                        <Link
                            to="/cost-lake"
                            className="inline-flex gap-2 items-center px-4 py-2 text-sm font-medium glass rounded-xl border border-primary-200/30 bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30 text-primary-700 dark:text-primary-300 hover:shadow-md transition-all duration-300"
                        >
                            <CircleStackIcon className="w-4 h-4" />
                            Cost Lake
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="mb-6">
                <nav className="flex space-x-8 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === 'overview'
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-insights')}
                        className={`py-2 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === 'ai-insights'
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                            }`}
                    >
                        <Brain className="w-4 h-4" />
                        AI Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('explorer')}
                        className={`py-2 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === 'explorer'
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        Span Explorer
                    </button>
                    <button
                        onClick={() => setActiveTab('traces')}
                        className={`py-2 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === 'traces'
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Traces & Dependencies
                    </button>
                    <button
                        onClick={() => setActiveTab('configuration')}
                        className={`py-2 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300 ${activeTab === 'configuration'
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Configuration
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Header with actions */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">System Overview</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={fetchEnhancedData}
                                disabled={loading}
                                className="btn-primary flex gap-2 items-center disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* KPIs */}
                    <PerformanceOverview />

                    {/* Enhanced Metrics Row */}
                    {enhancedData && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Total Spans</p>
                                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                                            {formatNumber(enhancedData.enrichment.stats.total_spans)}
                                        </p>
                                        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                                            Last {enhancedData.enrichment.stats.timeframe || '1h'}
                                        </p>
                                    </div>
                                    <Eye className="w-8 h-8 text-primary-500" />
                                </div>
                            </div>

                            <div className="p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-success-700 dark:text-success-300">AI Enriched</p>
                                        <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                                            {formatNumber(enhancedData.enrichment.stats.enriched_spans)}
                                        </p>
                                        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                                            {enhancedData.enrichment.stats.enrichment_rate.toFixed(1)}% enriched
                                        </p>
                                    </div>
                                    <Brain className="w-8 h-8 text-success-500" />
                                </div>
                            </div>

                            <div className="p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-accent-700 dark:text-accent-300">AI Recommendations</p>
                                        <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                                            {enhancedData.enrichment.ai_recommendations.length}
                                        </p>
                                        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                                            {enhancedData.enrichment.ai_recommendations.length > 0 ? 'Available' : 'Processing...'}
                                        </p>
                                    </div>
                                    <Activity className="w-8 h-8 text-accent-500" />
                                </div>
                            </div>

                            <div className="p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Processing Types</p>
                                        <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                                            {enhancedData.enrichment.stats.processing_types.length}
                                        </p>
                                        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                                            {enhancedData.enrichment.stats.processing_types.length > 0 ? 'Identified' : 'Analyzing...'}
                                        </p>
                                    </div>
                                    <Sparkles className="w-8 h-8 text-secondary-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <CostAnalytics />
                        <ErrorMonitor />
                    </div>

                    {/* Top lists */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <TopOperations />
                        <TopErrors />
                    </div>

                    {/* Traditional Explorer */}
                    <TelemetryExplorer />
                </div>
            )}

            {activeTab === 'ai-insights' && (
                <div className="space-y-6">
                    {/* Header with refresh button */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">AI Insights & Recommendations</h2>
                        <button
                            onClick={fetchEnhancedData}
                            disabled={loading}
                            className="btn-primary flex gap-2 items-center disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Insights
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 rounded-full border-b-2 border-primary-500 animate-spin"></div>
                            <span className="ml-2 text-secondary-600 dark:text-secondary-300">Loading AI insights...</span>
                        </div>
                    ) : enhancedData ? (
                        <>
                            {/* AI Enrichment Stats */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="p-6 bg-white rounded-lg border shadow-sm">
                                    <h3 className="flex gap-2 items-center mb-4 text-lg font-medium text-gray-900">
                                        <Brain className="w-5 h-5 text-purple-500" />
                                        AI Enrichment Status
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Spans</span>
                                            <span className="font-semibold">{formatNumber(enhancedData.enrichment.stats.total_spans)}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Enriched Spans</span>
                                            <span className="font-semibold text-green-600">
                                                {formatNumber(enhancedData.enrichment.stats.enriched_spans)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Enrichment Rate</span>
                                            <span className="font-semibold text-blue-600">
                                                {enhancedData.enrichment.stats.enrichment_rate.toFixed(1)}%
                                            </span>
                                        </div>

                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-blue-600 rounded-full"
                                                style={{ width: `${Math.max(enhancedData.enrichment.stats.enrichment_rate, 2)}%` }}
                                            ></div>
                                        </div>

                                        {enhancedData.enrichment.stats.enriched_spans === 0 && (
                                            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                                <p className="text-sm text-yellow-800">
                                                    <strong>AI Enrichment Starting:</strong> Spans are being processed and enriched with AI insights.
                                                    <button
                                                        onClick={fetchEnhancedData}
                                                        className="ml-2 text-blue-600 underline hover:text-blue-800"
                                                    >
                                                        Click here to trigger enrichment
                                                    </button>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-white rounded-lg border shadow-sm">
                                    <h3 className="mb-4 text-lg font-medium text-gray-900">Processing Types</h3>

                                    <div className="space-y-3">
                                        {enhancedData.enrichment.stats.processing_types.length > 0 ? (
                                            enhancedData.enrichment.stats.processing_types.slice(0, 5).map((type, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{type._id}</span>
                                                        <p className="text-sm text-gray-500">
                                                            {formatNumber(type.count)} spans • Avg: {formatLatency(type.avg_duration)}
                                                        </p>
                                                    </div>
                                                    {type.avg_cost > 0 && (
                                                        <span className="text-sm font-medium text-green-600">
                                                            ${type.avg_cost.toFixed(4)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center">
                                                <div className="mb-2 text-gray-400">
                                                    <Brain className="mx-auto w-12 h-12" />
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Processing types will appear here once AI enrichment begins analyzing your spans.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            <div className="bg-white rounded-lg border shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="flex gap-2 items-center text-lg font-medium text-gray-900">
                                        <Brain className="w-5 h-5 text-purple-500" />
                                        AI Recommendations
                                    </h3>
                                </div>

                                <div className="p-6">
                                    {enhancedData.enrichment.ai_recommendations.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <div className="mb-4 text-gray-400">
                                                <Brain className="mx-auto w-16 h-16" />
                                            </div>
                                            <h4 className="mb-2 text-lg font-medium text-gray-700">No AI Recommendations Available</h4>
                                            <p className="mx-auto mb-4 max-w-md text-sm text-gray-500">
                                                AI recommendations will appear here once the system analyzes your telemetry data.
                                            </p>
                                            <button
                                                onClick={fetchEnhancedData}
                                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                            >
                                                Refresh Data
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {enhancedData.enrichment.ai_recommendations.map((rec, index) => (
                                                <div key={index} className={`border-l-4 p-4 rounded-lg ${rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                                                    rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                        'border-green-500 bg-green-50'
                                                    }`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex gap-2 items-center">
                                                            <h4 className="font-medium text-gray-900">{rec.operation}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                {rec.priority} priority
                                                            </span>
                                                        </div>
                                                        {rec.cost_impact && rec.cost_impact > 0 && (
                                                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                                ${rec.cost_impact.toFixed(4)} impact
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mb-3 text-gray-700">{rec.insight}</p>

                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500">Trace: {rec.trace_id.substring(0, 16)}...</span>
                                                        {rec.routing_decision && (
                                                            <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                                                                {rec.routing_decision}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Insights */}
                            <div className="bg-white rounded-lg border shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Recent AI Insights</h3>
                                </div>

                                <div className="p-6">
                                    {enhancedData.enrichment.recent_insights.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <div className="mb-3 text-gray-400">
                                                <Eye className="mx-auto w-12 h-12" />
                                            </div>
                                            <h4 className="mb-2 text-lg font-medium text-gray-700">No Recent Insights</h4>
                                            <p className="text-sm text-gray-500">
                                                AI-generated insights will appear here once spans are enriched.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {enhancedData.enrichment.recent_insights.slice(0, 5).map((insight, index) => (
                                                <div key={index} className="pl-4 border-l-4 border-blue-500">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{insight.operation_name}</h4>
                                                            <p className="mt-1 text-sm text-gray-600">{insight.insights}</p>
                                                        </div>
                                                        {insight.cost_usd && (
                                                            <span className="ml-4 text-sm font-medium text-green-600">
                                                                ${insight.cost_usd.toFixed(4)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-secondary-500 dark:text-secondary-400">No enhanced data available</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'explorer' && (
                <SpanExplorer />
            )}

            {activeTab === 'traces' && (
                <div className="space-y-6">
                    <TraceViewer />
                    <ServiceDependencyGraph />
                </div>
            )}

            {activeTab === 'configuration' && (
                <TelemetryConfiguration />
            )}
        </div>
    );
};

export const TelemetryDashboard: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <EnhancedTelemetryContent />
            </ErrorBoundary>
        </QueryClientProvider>
    );
};
