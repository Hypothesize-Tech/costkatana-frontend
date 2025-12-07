import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    BoltIcon,
    CloudIcon,
    Cog6ToothIcon,
    PlayIcon,
    StopIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    TrashIcon,
    WrenchIcon,
} from '@heroicons/react/24/outline';
import { CostIntelligenceService } from '../services/costIntelligence.service';
import {
    CostIntelligence,
    CostIntelligenceStats,
    CostTelemetryEvent,
    StreamingStats
} from '../types/costIntelligence.types';
import {
    CostStatsCardsShimmer,
    CostIntelligenceInsightsShimmer,
    CostStreamShimmer
} from '../components/shimmer';

const CostIntelligencePage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<CostIntelligence[]>([]);
    const [stats, setStats] = useState<CostIntelligenceStats | null>(null);
    const [streamingStats, setStreamingStats] = useState<StreamingStats | null>(null);
    const [realtimeEvents, setRealtimeEvents] = useState<CostTelemetryEvent[]>([]);
    const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
    const [isStreamConnected, setIsStreamConnected] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        loadData();
        connectToStream();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [insightsData, statsData, streamStats] = await Promise.all([
                CostIntelligenceService.getInsights({ limit: 20 }),
                CostIntelligenceService.getStats(),
                CostIntelligenceService.getStreamingStats()
            ]);

            setInsights(insightsData);
            setStats(statsData);
            setStreamingStats(streamStats);
        } catch (error) {
            console.error('Failed to load cost intelligence data:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectToStream = () => {
        try {
            const eventSource = CostIntelligenceService.connectToStream(
                (event: CostTelemetryEvent) => {
                    setRealtimeEvents(prev => [event, ...prev].slice(0, 50));
                },
                (error) => {
                    console.error('Stream error:', error);
                    setIsStreamConnected(false);
                }
            );

            eventSourceRef.current = eventSource;
            setIsStreamConnected(true);
        } catch (error) {
            console.error('Failed to connect to stream:', error);
            setIsStreamConnected(false);
        }
    };

    const toggleAnalysis = async () => {
        try {
            if (isAnalysisRunning) {
                await CostIntelligenceService.stopAnalysis();
                setIsAnalysisRunning(false);
            } else {
                await CostIntelligenceService.startAnalysis();
                setIsAnalysisRunning(true);
            }
        } catch (error) {
            console.error('Failed to toggle analysis:', error);
        }
    };

    const getSeverityIcon = (severity: string, classNameOverride?: string) => {
        const base = "h-5 w-5";
        switch (severity) {
            case 'critical':
                return <ExclamationTriangleIcon className={`${base} text-red-500 ${classNameOverride || ''}`} />;
            case 'high':
                return <ExclamationTriangleIcon className={`${base} text-orange-500 ${classNameOverride || ''}`} />;
            case 'medium':
                return <InformationCircleIcon className={`${base} text-yellow-500 ${classNameOverride || ''}`} />;
            case 'low':
                return <CheckCircleIcon className={`${base} text-green-500 ${classNameOverride || ''}`} />;
            default:
                return <InformationCircleIcon className={`${base} text-gray-500 ${classNameOverride || ''}`} />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
        }
    };

    const getEventTypeIcon = (eventType: string) => {
        // All monochrome Heroicons for relevant types
        // You can adjust colors/icons as desired
        switch (eventType) {
            case 'cost_spike':
                return <ArrowTrendingUpIcon className="h-6 w-6 text-primary-500" title="Cost Spike" />;
            case 'budget_warning':
                return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" title="Budget Warning" />;
            case 'optimization_opportunity':
                return <SparklesIcon className="h-6 w-6 text-green-500" title="Optimization" />;
            case 'cache_hit':
                return <CheckCircleIcon className="h-6 w-6 text-green-500" title="Cache Hit" />;
            case 'cache_miss':
                return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" title="Cache Miss" />;
            default:
                return <ChartBarIcon className="h-6 w-6 text-blue-500" title="Event" />;
        }
    };

    const getIntelligenceTypeIcon = (type: string) => {
        switch (type) {
            case 'anomaly':
                return <BoltIcon className="h-4 w-4 text-purple-500" title="Anomaly" />;
            case 'trend':
                return <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500" title="Trend" />;
            case 'waste_pattern':
                return <TrashIcon className="h-4 w-4 text-red-600" title="Waste Pattern" />;
            case 'optimization':
                return <WrenchIcon className="h-4 w-4 text-green-700" title="Optimization" />;
            case 'recommendation':
                return <SparklesIcon className="h-4 w-4 text-green-500" title="Recommendation" />;
            default:
                return <InformationCircleIcon className="h-4 w-4 text-gray-400" title="Other" />;
        }
    };

    const filteredInsights = insights.filter(insight => {
        if (selectedFilter !== 'all' && insight.intelligenceType !== selectedFilter) return false;
        if (selectedSeverity !== 'all' && insight.severity !== selectedSeverity) return false;
        return true;
    });

    // SHIMMERS at all expected points for loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <CostStatsCardsShimmer />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <CostIntelligenceInsightsShimmer />
                        </div>
                        <div>
                            <CostStreamShimmer />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            {/* No emoji, use SparklesIcon */}
                            <SparklesIcon className="h-8 w-8 text-primary-500" />
                            Cost Intelligence Stack
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Real-time cost optimization insights and recommendations
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={toggleAnalysis}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isAnalysisRunning
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50'
                                }`}
                        >
                            {isAnalysisRunning ? (
                                <>
                                    <StopIcon className="h-5 w-5" />
                                    Stop Analysis
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="h-5 w-5" />
                                    Start Analysis
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/cost-intelligence/config')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 shadow-lg"
                        >
                            <Cog6ToothIcon className="h-5 w-5" />
                            Configure
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Total Insights
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            {stats.cachedIntelligence}
                                        </h3>
                                    </div>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-2.5 sm:p-3.5 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                        <ChartBarIcon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 glass border-purple-200/30 dark:border-purple-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Anomalies
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            {stats.byType.anomaly || 0}
                                        </h3>
                                    </div>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-2.5 sm:p-3.5 rounded-xl shadow-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                                        <BoltIcon className="w-5 h-5 sm:w-7 sm:h-7 text-purple-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 glass border-green-200/30 dark:border-green-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Recommendations
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            {stats.byType.recommendation || 0}
                                        </h3>
                                    </div>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-2.5 sm:p-3.5 rounded-xl shadow-lg bg-gradient-to-br from-green-500/20 to-green-600/20">
                                        <SparklesIcon className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 sm:p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 glass border-blue-200/30 dark:border-blue-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Active Streams
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            {streamingStats?.activeClients || 0}
                                        </h3>
                                        {isStreamConnected && (
                                            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                Live
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <div className="p-2.5 sm:p-3.5 rounded-xl shadow-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                                        <CloudIcon className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <CostStatsCardsShimmer />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Insights Panel */}
                    <div className="lg:col-span-2 p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                    <BoltIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                    Intelligence Insights
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="anomaly">Anomalies</option>
                                    <option value="trend">Trends</option>
                                    <option value="waste_pattern">Waste Patterns</option>
                                    <option value="optimization">Optimizations</option>
                                    <option value="recommendation">Recommendations</option>
                                </select>
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => setSelectedSeverity(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="all">All Severity</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {filteredInsights.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <SparklesIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No insights found matching your filters</p>
                                </div>
                            ) : (
                                filteredInsights.map((insight) => (
                                    <div
                                        key={insight.id}
                                        className="p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:shadow-lg transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">{getSeverityIcon(insight.severity)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {insight.title}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(insight.severity)}`}>
                                                        {insight.severity}
                                                    </span>
                                                    <span className="px-2 py-0.5 flex items-center gap-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                        {getIntelligenceTypeIcon(insight.intelligenceType)}
                                                        {insight.intelligenceType}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {insight.description}
                                                </p>
                                                {insight.metrics.currentCost !== undefined && (
                                                    <div className="flex gap-4 mb-3 text-xs">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Current:</span>
                                                            <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                                                ${insight.metrics.currentCost.toFixed(4)}
                                                            </span>
                                                        </div>
                                                        {insight.metrics.expectedCost !== undefined && (
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Expected:</span>
                                                                <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                                                    ${insight.metrics.expectedCost.toFixed(4)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {insight.metrics.deviation !== undefined && (
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Deviation:</span>
                                                                <span className={`ml-1 font-semibold ${insight.metrics.deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {insight.metrics.deviation > 0 ? '+' : ''}{insight.metrics.deviation.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {insight.recommendations.length > 0 && (
                                                    <div className="space-y-2">
                                                        {insight.recommendations.slice(0, 2).map((rec, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-start gap-2 p-2 rounded bg-primary-50/50 dark:bg-primary-900/20 text-xs"
                                                            >
                                                                {/* No emoji, use SparklesIcon */}
                                                                <span className="text-primary-600 dark:text-primary-400 flex items-center">
                                                                    <SparklesIcon className="h-4 w-4" />
                                                                </span>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-700 dark:text-gray-300">{rec.action}</p>
                                                                    {rec.estimatedSavings !== undefined && (
                                                                        <p className="text-green-600 dark:text-green-400 font-medium mt-1">
                                                                            Potential savings: ${rec.estimatedSavings.toFixed(4)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Real-time Events Stream */}
                    <div className="p-4 sm:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 rounded-xl shadow-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                                    <CloudIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                    Live Events
                                </h2>
                            </div>
                            {isStreamConnected && (
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {realtimeEvents.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <CloudIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Waiting for events...</p>
                                </div>
                            ) : (
                                realtimeEvents.map((event, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg border border-gray-200/30 dark:border-gray-700/30 bg-white/30 dark:bg-gray-800/30 animate-fade-in"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Icons for event types, no emojis */}
                                            <span className="flex items-center justify-center h-7 w-7">
                                                {getEventTypeIcon(event.eventType)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {event.eventType.replace(/_/g, ' ').toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(event.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            {event.data.cost !== undefined && (
                                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                    ${event.data.cost.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostIntelligencePage;