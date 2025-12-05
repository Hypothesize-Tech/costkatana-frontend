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
import {
    ExclamationTriangleIcon,
    ArrowPathIcon,
    CircleStackIcon,
    SparklesIcon,
    ChartBarIcon,
    EyeIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/config/api';
import TelemetryConfiguration from '@/components/telemetry/TelemetryConfiguration';
import { RotateCw } from 'lucide-react';
import { TelemetryShimmer } from '@/components/shimmer/TelemetryShimmer';

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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-danger shrink-0">
                        <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="mb-1.5 sm:mb-2 text-lg sm:text-xl font-bold font-display text-danger-900 dark:text-danger-100">Something went wrong</h2>
                        <p className="mb-3 sm:mb-4 text-sm sm:text-base font-body text-danger-700 dark:text-danger-300">{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 btn btn-primary glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-danger hover:bg-gradient-danger/90 font-display"
                        >
                            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
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
    const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({
        overview: false,
        'ai-insights': false,
        explorer: false,
        traces: false,
        configuration: false,
    });

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

    useEffect(() => {
        // Simulate loading when switching tabs
        setTabLoading(prev => ({ ...prev, [activeTab]: true }));

        const timer = setTimeout(() => {
            setTabLoading(prev => ({ ...prev, [activeTab]: false }));
        }, 500); // Short delay to show shimmer

        return () => clearTimeout(timer);
    }, [activeTab]);

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
        <div className="p-2 sm:p-3 md:p-4 lg:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <header className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex gap-2 sm:gap-3 items-center mb-1.5 sm:mb-2">
                        <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-primary glow-primary shrink-0">
                            <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-primary">Enhanced Telemetry Dashboard</h1>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-body text-secondary-600 dark:text-secondary-300">AI-powered observability with intelligent insights and cost optimization</p>
                    <div className="mt-3 sm:mt-4">
                        <Link
                            to="/cost-lake"
                            className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 from-primary-50/50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30 hover:shadow-md font-display text-primary-700 dark:text-primary-300"
                        >
                            <CircleStackIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Cost Lake
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                <nav className="flex flex-wrap gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`btn py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-lg font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${activeTab === 'overview'
                            ? 'glass bg-gradient-primary text-white shadow-lg border border-primary-200/30'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                            }`}
                    >
                        <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">Overview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-insights')}
                        className={`btn py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-lg font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${activeTab === 'ai-insights'
                            ? 'glass bg-gradient-primary text-white shadow-lg border border-primary-200/30'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                            }`}
                    >
                        <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">AI Insights</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('explorer')}
                        className={`btn py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-lg font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${activeTab === 'explorer'
                            ? 'glass bg-gradient-primary text-white shadow-lg border border-primary-200/30'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                            }`}
                    >
                        <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">Span Explorer</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('traces')}
                        className={`btn py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-lg font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${activeTab === 'traces'
                            ? 'glass bg-gradient-primary text-white shadow-lg border border-primary-200/30'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                            }`}
                    >
                        <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Traces & Dependencies</span>
                        <span className="sm:hidden">Traces</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('configuration')}
                        className={`btn py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-lg font-display font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${activeTab === 'configuration'
                            ? 'glass bg-gradient-primary text-white shadow-lg border border-primary-200/30'
                            : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/20'
                            }`}
                    >
                        <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">Config</span>
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {tabLoading[activeTab] || (activeTab === 'ai-insights' && loading) ? (
                <TelemetryShimmer activeTab={activeTab} />
            ) : (
                <>
                    {activeTab === 'overview' && (
                        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                            {/* Header with actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white">System Overview</h2>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={fetchEnhancedData}
                                        disabled={loading}
                                        className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 btn btn-primary glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-display w-full sm:w-auto"
                                    >
                                        <ArrowPathIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                            </div>

                            {/* KPIs */}
                            <PerformanceOverview />

                            {/* Enhanced Metrics Row */}
                            {enhancedData && (
                                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium font-display text-secondary-600 dark:text-secondary-300">Total Spans</p>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                                                    {formatNumber(enhancedData.enrichment.stats.total_spans)}
                                                </p>
                                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-body text-secondary-500 dark:text-secondary-400">
                                                    Last {enhancedData.enrichment.stats.timeframe || '1h'}
                                                </p>
                                            </div>
                                            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-primary/20 shrink-0 ml-2">
                                                <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 dark:text-primary-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium font-display text-success-700 dark:text-success-300">AI Enriched</p>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-success-600 dark:text-success-400 truncate">
                                                    {formatNumber(enhancedData.enrichment.stats.enriched_spans)}
                                                </p>
                                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-body text-secondary-500 dark:text-secondary-400">
                                                    {enhancedData.enrichment.stats.enrichment_rate.toFixed(1)}% enriched
                                                </p>
                                            </div>
                                            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-success/20 shrink-0 ml-2">
                                                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-500 dark:text-success-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium font-display text-accent-700 dark:text-accent-300">AI Recommendations</p>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-accent-600 dark:text-accent-400">
                                                    {enhancedData.enrichment.ai_recommendations.length}
                                                </p>
                                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-body text-secondary-500 dark:text-secondary-400">
                                                    {enhancedData.enrichment.ai_recommendations.length > 0 ? 'Available' : 'Processing...'}
                                                </p>
                                            </div>
                                            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-accent/20 shrink-0 ml-2">
                                                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 dark:text-accent-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium font-display text-secondary-700 dark:text-secondary-300">Processing Types</p>
                                                <p className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-600 dark:text-secondary-400">
                                                    {enhancedData.enrichment.stats.processing_types.length}
                                                </p>
                                                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-body text-secondary-500 dark:text-secondary-400">
                                                    {enhancedData.enrichment.stats.processing_types.length > 0 ? 'Identified' : 'Analyzing...'}
                                                </p>
                                            </div>
                                            <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-secondary/20 shrink-0 ml-2">
                                                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-500 dark:text-secondary-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Analytics */}
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 md:grid-cols-2">
                                <CostAnalytics />
                                <ErrorMonitor />
                            </div>

                            {/* Top lists */}
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 md:grid-cols-2">
                                <TopOperations />
                                <TopErrors />
                            </div>

                            {/* Traditional Explorer */}
                            <TelemetryExplorer />
                        </div>
                    )}

                    {activeTab === 'ai-insights' && (
                        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                            {/* Header with refresh button */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white">AI Insights & Recommendations</h2>
                                <button
                                    onClick={fetchEnhancedData}
                                    disabled={loading}
                                    className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 btn btn-primary glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-display w-full sm:w-auto"
                                >
                                    <ArrowPathIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh Insights</span>
                                    <span className="sm:hidden">Refresh</span>
                                </button>
                            </div>

                            {enhancedData ? (
                                <>
                                    {/* AI Enrichment Stats */}
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 lg:grid-cols-2">
                                        <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                            <h3 className="flex gap-2 items-center mb-3 sm:mb-4 text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">
                                                <div className="flex justify-center items-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-primary/20 shrink-0">
                                                    <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                AI Enrichment Status
                                            </h3>

                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400">Total Spans</span>
                                                    <span className="text-sm sm:text-base font-semibold font-display text-secondary-900 dark:text-white">{formatNumber(enhancedData.enrichment.stats.total_spans)}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400">Enriched Spans</span>
                                                    <span className="text-sm sm:text-base font-semibold font-display text-success-600 dark:text-success-400">
                                                        {formatNumber(enhancedData.enrichment.stats.enriched_spans)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400">Enrichment Rate</span>
                                                    <span className="text-sm sm:text-base font-semibold font-display text-primary-600 dark:text-primary-400">
                                                        {enhancedData.enrichment.stats.enrichment_rate.toFixed(1)}%
                                                    </span>
                                                </div>

                                                <div className="overflow-hidden w-full h-2 rounded-full bg-secondary-200/50 dark:bg-secondary-700/50">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-300 bg-gradient-primary"
                                                        style={{ width: `${Math.max(enhancedData.enrichment.stats.enrichment_rate, 2)}%` }}
                                                    ></div>
                                                </div>

                                                {enhancedData.enrichment.stats.enriched_spans === 0 && (
                                                    <div className="p-3 sm:p-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30 dark:border-warning-500/20 from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20">
                                                        <p className="text-xs sm:text-sm font-body text-warning-800 dark:text-warning-200">
                                                            <strong>AI Enrichment Starting:</strong> Spans are being processed and enriched with AI insights.
                                                            <button
                                                                onClick={fetchEnhancedData}
                                                                className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium underline transition-colors duration-200 btn btn-ghost font-display text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                                            >
                                                                Click here to trigger enrichment
                                                            </button>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">Processing Types</h3>

                                            <div className="space-y-2.5 sm:space-y-3">
                                                {enhancedData.enrichment.stats.processing_types.length > 0 ? (
                                                    enhancedData.enrichment.stats.processing_types.slice(0, 5).map((type, index) => (
                                                        <div key={index} className="p-2.5 sm:p-3 bg-gradient-to-r rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="block text-sm sm:text-base font-medium font-display text-secondary-900 dark:text-white truncate">{type._id}</span>
                                                                    <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400">
                                                                        {formatNumber(type.count)} spans • Avg: {formatLatency(type.avg_duration)}
                                                                    </p>
                                                                </div>
                                                                {type.avg_cost > 0 && (
                                                                    <span className="text-xs sm:text-sm font-semibold font-display text-success-600 dark:text-success-400 shrink-0">
                                                                        ${type.avg_cost.toFixed(4)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-6 sm:py-8 text-center">
                                                        <div className="flex justify-center mb-2 text-secondary-400 dark:text-secondary-600">
                                                            <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary/20">
                                                                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 dark:text-primary-400" />
                                                            </div>
                                                        </div>
                                                        <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400 px-2">
                                                            Processing types will appear here once AI enrichment begins analyzing your spans.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Recommendations */}
                                    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-primary-200/20 dark:border-primary-500/10">
                                            <h3 className="flex gap-1.5 sm:gap-2 items-center text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">
                                                <div className="flex justify-center items-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-primary/20 shrink-0">
                                                    <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                AI Recommendations
                                            </h3>
                                        </div>

                                        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                                            {enhancedData.enrichment.ai_recommendations.length === 0 ? (
                                                <div className="py-6 sm:py-8 text-center">
                                                    <div className="flex justify-center mb-3 sm:mb-4 text-secondary-400 dark:text-secondary-600">
                                                        <div className="flex justify-center items-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-primary/20">
                                                            <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500 dark:text-primary-400" />
                                                        </div>
                                                    </div>
                                                    <h4 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">No AI Recommendations Available</h4>
                                                    <p className="mx-auto mb-3 sm:mb-4 max-w-md text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400 px-2">
                                                        AI recommendations will appear here once the system analyzes your telemetry data.
                                                    </p>
                                                    <button
                                                        onClick={fetchEnhancedData}
                                                        className="inline-flex gap-1.5 sm:gap-2 items-center px-4 sm:px-6 py-2 sm:py-3 mx-auto text-xs sm:text-sm font-semibold text-white rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 btn btn-primary glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-primary hover:bg-gradient-primary/90 font-display"
                                                    >
                                                        <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        Refresh Data
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {enhancedData.enrichment.ai_recommendations.map((rec, index) => {
                                                        const priorityStyles = {
                                                            high: {
                                                                border: 'border-danger-500 dark:border-danger-400',
                                                                bg: 'bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20',
                                                                badge: 'glass bg-gradient-danger/20 text-danger-700 dark:text-danger-300 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl'
                                                            },
                                                            medium: {
                                                                border: 'border-warning-500 dark:border-warning-400',
                                                                bg: 'bg-gradient-to-br from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20',
                                                                badge: 'glass bg-gradient-warning/20 text-warning-700 dark:text-warning-300 border border-warning-200/30 dark:border-warning-500/20 shadow-lg backdrop-blur-xl'
                                                            },
                                                            low: {
                                                                border: 'border-success-500 dark:border-success-400',
                                                                bg: 'bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20',
                                                                badge: 'glass bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-200/30 dark:border-success-500/20 shadow-lg backdrop-blur-xl'
                                                            }
                                                        };
                                                        const styles = priorityStyles[rec.priority || 'low'];

                                                        return (
                                                            <div key={index} className={`glass border-l-4 p-3 sm:p-4 rounded-lg shadow-lg backdrop-blur-xl ${styles.border} ${styles.bg} hover:shadow-xl transition-all duration-300`}>
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 mb-2">
                                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center flex-1 min-w-0">
                                                                        <h4 className="text-sm sm:text-base font-semibold font-display text-secondary-900 dark:text-white truncate">{rec.operation}</h4>
                                                                        <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-display font-medium ${styles.badge} shrink-0`}>
                                                                            {rec.priority} priority
                                                                        </span>
                                                                    </div>
                                                                    {rec.cost_impact && rec.cost_impact > 0 && (
                                                                        <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full border shadow-lg backdrop-blur-xl glass font-display text-success-700 dark:text-success-300 bg-gradient-success/20 border-success-200/30 dark:border-success-500/20 shrink-0">
                                                                            ${rec.cost_impact.toFixed(4)} impact
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-body text-secondary-700 dark:text-secondary-300">{rec.insight}</p>

                                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-between items-center text-xs sm:text-sm">
                                                                    <span className="font-body text-secondary-500 dark:text-secondary-400 truncate">Trace: {rec.trace_id.substring(0, 12)}...</span>
                                                                    {rec.routing_decision && (
                                                                        <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border shadow-lg backdrop-blur-xl glass font-display text-primary-700 dark:text-primary-300 bg-gradient-primary/20 border-primary-200/30 dark:border-primary-500/20 shrink-0">
                                                                            {rec.routing_decision}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Insights */}
                                    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-primary-200/20 dark:border-primary-500/10">
                                            <h3 className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">Recent AI Insights</h3>
                                        </div>

                                        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                                            {enhancedData.enrichment.recent_insights.length === 0 ? (
                                                <div className="py-6 sm:py-8 text-center">
                                                    <div className="flex justify-center mb-2 sm:mb-3 text-secondary-400 dark:text-secondary-600">
                                                        <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-accent/20">
                                                            <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-500 dark:text-accent-400" />
                                                        </div>
                                                    </div>
                                                    <h4 className="mb-1.5 sm:mb-2 text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">No Recent Insights</h4>
                                                    <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400 px-2">
                                                        AI-generated insights will appear here once spans are enriched.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                                                    {enhancedData.enrichment.recent_insights.slice(0, 5).map((insight, index) => (
                                                        <div key={index} className="p-2.5 sm:p-3 bg-gradient-to-r rounded-lg border-l-4 shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-500 dark:border-primary-400 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 hover:shadow-xl">
                                                            <div className="flex flex-col sm:flex-row flex-wrap gap-1.5 sm:gap-2 justify-between items-start">
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm sm:text-base font-semibold font-display text-secondary-900 dark:text-white truncate">{insight.operation_name}</h4>
                                                                    <p className="mt-1 text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-400">{insight.insights}</p>
                                                                </div>
                                                                {insight.cost_usd && (
                                                                    <span className="text-xs sm:text-sm font-semibold font-display text-success-600 dark:text-success-400 shrink-0">
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
                                <div className="p-6 sm:p-8 md:p-10 lg:p-12 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <p className="text-sm sm:text-base md:text-lg font-body text-secondary-600 dark:text-secondary-400">No enhanced data available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'explorer' && (
                        <SpanExplorer />
                    )}

                    {activeTab === 'traces' && (
                        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                            <TraceViewer />
                            <ServiceDependencyGraph />
                        </div>
                    )}

                    {activeTab === 'configuration' && (
                        <TelemetryConfiguration />
                    )}
                </>
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
