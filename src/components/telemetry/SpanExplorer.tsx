import React, { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    ClockIcon,
    BanknotesIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    SparklesIcon,
    BoltIcon,
    AdjustmentsHorizontalIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/config/api';

interface Span {
    trace_id: string;
    span_id: string;
    operation_name: string;
    duration_ms: number;
    cost_usd?: number;
    status: 'success' | 'error' | 'unset';
    timestamp: string;
    insights?: string;
    routing_decision?: string;
    cache_hit?: boolean;
    processing_type?: string;
    request_priority?: string;
    service_name?: string;
    http_method?: string;
    http_route?: string;
}

interface SpanExplorerProps {
    tenantId?: string;
    workspaceId?: string;
}

const SpanExplorer: React.FC<SpanExplorerProps> = ({ tenantId, workspaceId }) => {
    const [spans, setSpans] = useState<Span[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [timeframe, setTimeframe] = useState('1h');
    const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set());
    const [enrichmentStats, setEnrichmentStats] = useState<any>(null);

    useEffect(() => {
        fetchSpans();
        fetchEnrichmentStats();
    }, [timeframe, statusFilter, tenantId, workspaceId]);

    const fetchSpans = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                timeframe,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(tenantId && { tenant_id: tenantId }),
                ...(workspaceId && { workspace_id: workspaceId }),
                limit: '100'
            });

            const response = await apiClient.get(`/telemetry/enrichment/spans?${params}`);
            const data = response.data;

            if (data.success) {
                setSpans(data.enriched_spans || []);
            }
        } catch (error) {
            console.error('Failed to fetch spans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrichmentStats = async () => {
        try {
            const params = new URLSearchParams({ timeframe });
            const response = await apiClient.get(`/telemetry/enrichment/stats?${params}`);
            const data = response.data;

            if (data.success) {
                setEnrichmentStats(data.enrichment_stats);
            }
        } catch (error) {
            console.error('Failed to fetch enrichment stats:', error);
        }
    };

    const filteredSpans = spans.filter(span => {
        const matchesSearch = searchTerm === '' ||
            span.operation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            span.trace_id.includes(searchTerm) ||
            (span.insights && span.insights.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
    });

    const toggleSpanExpansion = (spanId: string) => {
        const newExpanded = new Set(expandedSpans);
        if (newExpanded.has(spanId)) {
            newExpanded.delete(spanId);
        } else {
            newExpanded.add(spanId);
        }
        setExpandedSpans(newExpanded);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="w-4 h-4 text-green-500 dark:text-green-400" />;
            case 'error':
                return <ExclamationCircleIcon className="w-4 h-4 text-red-500 dark:text-red-400" />;
            default:
                return <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(1)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatCost = (cost?: number) => {
        if (!cost) return '-';
        return `$${cost.toFixed(4)}`;
    };

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
            {/* Header with Stats */}
            {enrichmentStats && (
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 sm:grid-cols-2 md:grid-cols-4">
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-primary">Total Spans</p>
                                <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-primary truncate">{enrichmentStats.total_spans}</p>
                            </div>
                            <div className="flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl shadow-lg bg-gradient-primary glow-primary shrink-0 ml-2">
                                <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-success">Enriched</p>
                                <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-success truncate">{enrichmentStats.enriched_spans}</p>
                            </div>
                            <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r rounded-full border shadow-lg backdrop-blur-xl glass border-success-200/30 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 shrink-0 ml-2">
                                <span className="text-xs sm:text-sm font-semibold font-display text-success-700 dark:text-success-300">
                                    {enrichmentStats.enrichment_rate.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-secondary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-secondary">Cache Hits</p>
                                <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-secondary truncate">{enrichmentStats.cache_hit_spans}</p>
                            </div>
                            <div className="flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl shadow-lg bg-gradient-secondary glow-secondary shrink-0 ml-2">
                                <BoltIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-accent-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-accent">Routing Decisions</p>
                                <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-accent truncate">{enrichmentStats.routing_decisions}</p>
                            </div>
                            <div className="flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl shadow-lg bg-gradient-accent glow-accent shrink-0 ml-2">
                                <AdjustmentsHorizontalIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex gap-2 sm:gap-3 items-center mb-3 sm:mb-4">
                    <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-highlight glow-highlight shrink-0">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold font-display gradient-text-highlight">Search & Filter</h3>
                </div>
                <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 md:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 transform -translate-y-1/2 text-secondary-600 dark:text-secondary-300" />
                            <input
                                type="text"
                                placeholder="Search spans, traces, or insights..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 sm:pl-12 text-xs sm:text-sm input"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input text-xs sm:text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="error">Error</option>
                            <option value="unset">Unset</option>
                        </select>

                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="input text-xs sm:text-sm"
                        >
                            <option value="5m">Last 5 minutes</option>
                            <option value="15m">Last 15 minutes</option>
                            <option value="1h">Last hour</option>
                            <option value="3h">Last 3 hours</option>
                            <option value="24h">Last 24 hours</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Spans List */}
            <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-primary-200/30">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-info glow-info shrink-0">
                            <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-display gradient-text">
                            Enriched Spans ({filteredSpans.length})
                        </h3>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6 sm:p-8 text-center">
                        <div className="mx-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full border-b-2 animate-spin border-primary-500"></div>
                        <p className="mt-2 text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">Loading spans...</p>
                    </div>
                ) : filteredSpans.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                        <div className="flex justify-center items-center mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-accent/20">
                            <MagnifyingGlassIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent-500 dark:text-accent-400" />
                        </div>
                        <p className="text-xs sm:text-sm md:text-base font-body text-secondary-600 dark:text-secondary-300">
                            No enriched spans found for the selected criteria.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-primary-200/20">
                        {filteredSpans.map((span) => (
                            <div key={span.span_id} className="p-3 sm:p-4 md:p-5 lg:p-6 transition-all duration-200 hover:bg-gradient-primary/5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                                        <button
                                            onClick={() => toggleSpanExpansion(span.span_id)}
                                            className="btn btn-icon-secondary shrink-0"
                                        >
                                            {expandedSpans.has(span.span_id) ? (
                                                <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            ) : (
                                                <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            )}
                                        </button>

                                        <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0">
                                            {getStatusIcon(span.status)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm sm:text-base font-semibold font-display text-secondary-900 dark:text-white truncate">{span.operation_name}</h4>
                                            <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300 truncate">
                                                {span.service_name} • {new Date(span.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                                        <div className="flex gap-1.5 sm:gap-2 items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border shadow-lg backdrop-blur-xl glass border-accent-200/30">
                                            <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 dark:text-accent-400" />
                                            <span className="text-xs sm:text-sm font-semibold font-display gradient-text-accent">{formatDuration(span.duration_ms)}</span>
                                        </div>

                                        {span.cost_usd && (
                                            <div className="flex gap-1.5 sm:gap-2 items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border shadow-lg backdrop-blur-xl glass border-success-200/30">
                                                <BanknotesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success-500 dark:text-success-400" />
                                                <span className="text-xs sm:text-sm font-semibold font-display gradient-text-success">{formatCost(span.cost_usd)}</span>
                                            </div>
                                        )}

                                        {span.request_priority && (
                                            <span className={`glass px-2 sm:px-3 py-1 rounded-full font-display font-semibold border text-xs sm:text-sm ${getPriorityColor(span.request_priority)}`}>
                                                {span.request_priority}
                                            </span>
                                        )}

                                        {span.cache_hit && (
                                            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold bg-gradient-to-r rounded-full border shadow-lg backdrop-blur-xl glass border-success-200/30 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 text-success-700 dark:text-success-300 font-display">
                                                Cache Hit
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {expandedSpans.has(span.span_id) && (
                                    <div className="pl-0 sm:pl-8 md:pl-12 mt-3 sm:mt-4 md:mt-5 lg:mt-6 space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3">
                                            <div className="p-2.5 sm:p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                                <span className="text-xs sm:text-sm font-medium font-display gradient-text">Trace ID:</span>
                                                <p className="mt-1 font-mono text-[10px] sm:text-xs break-all text-secondary-900 dark:text-white">{span.trace_id}</p>
                                            </div>

                                            <div className="p-2.5 sm:p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                                                <span className="text-xs sm:text-sm font-medium font-display gradient-text">Span ID:</span>
                                                <p className="mt-1 font-mono text-[10px] sm:text-xs text-secondary-900 dark:text-white break-all">{span.span_id}</p>
                                            </div>

                                            {span.processing_type && (
                                                <div className="p-2.5 sm:p-3 rounded-lg border glass border-accent-200/30 dark:border-accent-500/20">
                                                    <span className="text-xs sm:text-sm font-medium font-display gradient-text-accent">Processing Type:</span>
                                                    <p className="mt-1 text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate">{span.processing_type}</p>
                                                </div>
                                            )}

                                            {span.http_method && span.http_route && (
                                                <div className="p-2.5 sm:p-3 rounded-lg border glass border-info-200/30 dark:border-info-500/20">
                                                    <span className="text-xs sm:text-sm font-medium font-display gradient-text-info">HTTP:</span>
                                                    <p className="mt-1 text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate">{span.http_method} {span.http_route}</p>
                                                </div>
                                            )}

                                            {span.routing_decision && (
                                                <div className="p-2.5 sm:p-3 rounded-lg border glass border-warning-200/30 dark:border-warning-500/20">
                                                    <span className="text-xs sm:text-sm font-medium font-display gradient-text-warning">Routing:</span>
                                                    <p className="mt-1 text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate">{span.routing_decision}</p>
                                                </div>
                                            )}
                                        </div>

                                        {span.insights && (
                                            <div className="p-3 sm:p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-info-200/30 dark:border-info-500/20 bg-gradient-info/10">
                                                <div className="flex gap-2 sm:gap-3 items-center mb-2 sm:mb-3">
                                                    <div className="flex justify-center items-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-info glow-info shrink-0">
                                                        <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                    </div>
                                                    <h5 className="text-sm sm:text-base font-semibold font-display gradient-text-info">AI Insights</h5>
                                                </div>
                                                <p className="text-xs sm:text-sm md:text-base font-body text-secondary-900 dark:text-white">{span.insights}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpanExplorer;
