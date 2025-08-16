import React, { useState, useEffect } from 'react';
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
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Brain, Activity, Eye, Sparkles } from 'lucide-react';
import { apiClient } from '@/config/api';

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

// Enhanced Telemetry Dashboard Component
const EnhancedTelemetryContent: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'ai-insights' | 'explorer' | 'traces'>('overview');
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
        // Refresh every 30 seconds
        const interval = setInterval(fetchEnhancedData, 30000);
        return () => clearInterval(interval);
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
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Enhanced Telemetry Dashboard</h1>
                </div>
                <p className="text-gray-600">AI-powered observability with intelligent insights and cost optimization</p>
            </header>

            {/* Navigation Tabs */}
            <div className="mb-6">
                <nav className="flex space-x-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'overview'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-insights')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'ai-insights'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Brain className="w-4 h-4" />
                        AI Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('explorer')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'explorer'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        Span Explorer
                    </button>
                    <button
                        onClick={() => setActiveTab('traces')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'traces'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Traces & Dependencies
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPIs */}
                    <PerformanceOverview />

                    {/* Enhanced Metrics Row */}
                    {enhancedData && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Spans</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatNumber(enhancedData.enrichment.stats.total_spans)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Last {enhancedData.enrichment.stats.timeframe || '1h'}
                                        </p>
                                    </div>
                                    <Eye className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">AI Enriched</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatNumber(enhancedData.enrichment.stats.enriched_spans)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {enhancedData.enrichment.stats.enrichment_rate.toFixed(1)}% enriched
                                        </p>
                                    </div>
                                    <Brain className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${enhancedData.current.avg_latency_ms ? (enhancedData.current.requests_per_minute * 0.0001).toFixed(4) : '0.0000'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Estimated hourly
                                        </p>
                                    </div>
                                    <Sparkles className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">AI Recommendations</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {enhancedData.enrichment.ai_recommendations.length}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {enhancedData.enrichment.stats.enriched_spans === 0 ? 'Processing...' : 'Available'}
                                        </p>
                                    </div>
                                    <Activity className="w-8 h-8 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CostAnalytics />
                        <ErrorMonitor />
                    </div>

                    {/* Top lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TopOperations />
                        <TopErrors />
                    </div>

                    {/* Traditional Explorer */}
                    <TelemetryExplorer />
                </div>
            )}

            {activeTab === 'ai-insights' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-600">Loading AI insights...</span>
                        </div>
                    ) : enhancedData ? (
                        <>
                            {/* AI Enrichment Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
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

                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.max(enhancedData.enrichment.stats.enrichment_rate, 2)}%` }}
                                            ></div>
                                        </div>

                                        {enhancedData.enrichment.stats.enriched_spans === 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                                <p className="text-sm text-yellow-800">
                                                    <strong>AI Enrichment Starting:</strong> Spans are being processed and enriched with AI insights.
                                                    Check back in a few minutes to see enriched data.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Types</h3>

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
                                            <div className="text-center py-8">
                                                <div className="text-gray-400 mb-2">
                                                    <Brain className="w-12 h-12 mx-auto" />
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    Processing types will appear here once AI enrichment begins analyzing your spans.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-500" />
                                        AI Recommendations
                                    </h3>
                                </div>

                                <div className="p-6">
                                    {enhancedData.enrichment.ai_recommendations.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 mb-4">
                                                <Brain className="w-16 h-16 mx-auto" />
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-700 mb-2">AI Recommendations Coming Soon</h4>
                                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                                Once your spans are enriched with AI insights, you'll see personalized recommendations for cost optimization,
                                                performance improvements, and routing decisions here.
                                            </p>
                                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3 max-w-md mx-auto">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Current Status:</strong> {formatNumber(enhancedData.enrichment.stats.total_spans)} spans detected,
                                                    AI enrichment in progress...
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {enhancedData.enrichment.ai_recommendations.map((rec, index) => (
                                                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium text-gray-900">{rec.operation}</h4>
                                                        {rec.cost_impact && (
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                                ${rec.cost_impact.toFixed(4)} impact
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-700 mb-3">{rec.insight}</p>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Trace: {rec.trace_id.substring(0, 16)}...</span>
                                                        {rec.routing_decision && (
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
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
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Recent AI Insights</h3>
                                </div>

                                <div className="p-6">
                                    {enhancedData.enrichment.recent_insights.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 mb-3">
                                                <Eye className="w-12 h-12 mx-auto" />
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-700 mb-2">Recent Insights</h4>
                                            <p className="text-gray-500 text-sm">
                                                AI-generated insights from your recent operations will appear here once enrichment begins.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {enhancedData.enrichment.recent_insights.slice(0, 5).map((insight, index) => (
                                                <div key={index} className="border-l-4 border-blue-500 pl-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{insight.operation_name}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{insight.insights}</p>
                                                        </div>
                                                        {insight.cost_usd && (
                                                            <span className="text-sm font-medium text-green-600 ml-4">
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
                        <div className="text-center py-12">
                            <p className="text-gray-500">No enhanced data available</p>
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
