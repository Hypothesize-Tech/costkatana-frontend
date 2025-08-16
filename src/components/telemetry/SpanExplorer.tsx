import React, { useState, useEffect } from 'react';
import { Search, Clock, DollarSign, AlertCircle, CheckCircle, Eye, ChevronDown, ChevronRight } from 'lucide-react';
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
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
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
        <div className="space-y-6">
            {/* Header with Stats */}
            {enrichmentStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Spans</p>
                                <p className="text-2xl font-bold text-gray-900">{enrichmentStats.total_spans}</p>
                            </div>
                            <Eye className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Enriched</p>
                                <p className="text-2xl font-bold text-green-600">{enrichmentStats.enriched_spans}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {enrichmentStats.enrichment_rate.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cache Hits</p>
                                <p className="text-2xl font-bold text-purple-600">{enrichmentStats.cache_hit_spans}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Routing Decisions</p>
                                <p className="text-2xl font-bold text-orange-600">{enrichmentStats.routing_decisions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search spans, traces, or insights..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="error">Error</option>
                            <option value="unset">Unset</option>
                        </select>

                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Enriched Spans ({filteredSpans.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading spans...</p>
                    </div>
                ) : filteredSpans.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No enriched spans found for the selected criteria.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredSpans.map((span) => (
                            <div key={span.span_id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleSpanExpansion(span.span_id)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            {expandedSpans.has(span.span_id) ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>

                                        {getStatusIcon(span.status)}

                                        <div>
                                            <h4 className="font-medium text-gray-900">{span.operation_name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {span.service_name} • {new Date(span.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span>{formatDuration(span.duration_ms)}</span>
                                        </div>

                                        {span.cost_usd && (
                                            <div className="flex items-center space-x-1">
                                                <DollarSign className="w-4 h-4 text-green-500" />
                                                <span>{formatCost(span.cost_usd)}</span>
                                            </div>
                                        )}

                                        {span.request_priority && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(span.request_priority)}`}>
                                                {span.request_priority}
                                            </span>
                                        )}

                                        {span.cache_hit && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                Cache Hit
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {expandedSpans.has(span.span_id) && (
                                    <div className="mt-4 pl-7 space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Trace ID:</span>
                                                <p className="font-mono text-xs text-gray-900 break-all">{span.trace_id}</p>
                                            </div>

                                            <div>
                                                <span className="font-medium text-gray-600">Span ID:</span>
                                                <p className="font-mono text-xs text-gray-900">{span.span_id}</p>
                                            </div>

                                            {span.processing_type && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Processing Type:</span>
                                                    <p className="text-gray-900">{span.processing_type}</p>
                                                </div>
                                            )}

                                            {span.http_method && span.http_route && (
                                                <div>
                                                    <span className="font-medium text-gray-600">HTTP:</span>
                                                    <p className="text-gray-900">{span.http_method} {span.http_route}</p>
                                                </div>
                                            )}

                                            {span.routing_decision && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Routing:</span>
                                                    <p className="text-gray-900">{span.routing_decision}</p>
                                                </div>
                                            )}
                                        </div>

                                        {span.insights && (
                                            <div className="bg-blue-50 p-3 rounded-md">
                                                <h5 className="font-medium text-blue-900 mb-1">AI Insights</h5>
                                                <p className="text-blue-800 text-sm">{span.insights}</p>
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
