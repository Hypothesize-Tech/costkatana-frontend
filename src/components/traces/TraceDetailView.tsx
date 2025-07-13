import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    CpuChipIcon as Activity,
    ClockIcon as Clock,
    CurrencyDollarIcon as DollarSign,
    CircleStackIcon as Layers,
    ExclamationTriangleIcon as AlertTriangle,
    CheckCircleIcon as CheckCircle,
    XCircleIcon as XCircle,
    PlayIcon as PlayCircle,
    ChartBarIcon as BarChart3,
    BoltIcon as Zap,
    LinkIcon as ExternalLink,
    ChevronRightIcon,
    ChevronDownIcon,
    ClipboardIcon as Copy,
    ArrowDownTrayIcon as Download
} from '@heroicons/react/24/outline';
import { TraceService } from '../../services/trace.service';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TraceSpan {
    spanId: string;
    parentSpanId?: string;
    name: string;
    operation: 'ai_call' | 'processing' | 'database' | 'http_request' | 'custom';
    startTime: string;
    endTime?: string;
    duration?: number;
    status: 'running' | 'completed' | 'failed';
    aiCall?: {
        provider: string;
        model: string;
        prompt: string;
        completion?: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: number;
        parameters: Record<string, any>;
    };
    performance: {
        latency: number;
        queueTime?: number;
        processingTime?: number;
    };
    error?: {
        message: string;
        code?: string;
        recoverable: boolean;
    };
    tags: Record<string, string>;
}

interface TraceDetail {
    traceId: string;
    name: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: string;
    endTime?: string;
    duration?: number;
    totalCost: number;
    totalTokens: number;
    callCount: number;
    spans: TraceSpan[];
    metadata: {
        environment?: string;
        version?: string;
        tags?: string[];
    };
    performance: {
        criticalPath: string[];
        bottlenecks: Array<{
            spanId: string;
            reason: string;
            impact: number;
        }>;
    };
}

export const TraceDetailView: React.FC = () => {
    const { traceId } = useParams<{ traceId: string }>();
    const [trace, setTrace] = useState<TraceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set());
    const [selectedSpan, setSelectedSpan] = useState<string | null>(null);

    useEffect(() => {
        if (traceId) {
            loadTraceDetail();
        }
    }, [traceId]);

    const loadTraceDetail = async () => {
        try {
            setLoading(true);
            const response = await TraceService.getTrace(traceId!);
            setTrace(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load trace');
        } finally {
            setLoading(false);
        }
    };

    const toggleSpanExpansion = (spanId: string) => {
        const newExpanded = new Set(expandedSpans);
        if (newExpanded.has(spanId)) {
            newExpanded.delete(spanId);
        } else {
            newExpanded.add(spanId);
        }
        setExpandedSpans(newExpanded);
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    const formatCost = (cost: number) => {
        return `$${cost.toFixed(6)}`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'running': return <PlayCircle className="w-5 h-5 text-blue-500" />;
            default: return <XCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getOperationIcon = (operation: string) => {
        switch (operation) {
            case 'ai_call': return <Zap className="w-4 h-4 text-purple-500" />;
            case 'processing': return <Activity className="w-4 h-4 text-blue-500" />;
            case 'database': return <Layers className="w-4 h-4 text-green-500" />;
            case 'http_request': return <ExternalLink className="w-4 h-4 text-orange-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const exportTrace = async () => {
        try {
            const response = await TraceService.exportTrace(traceId!, 'json');
            const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trace-${traceId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export trace:', err);
        }
    };

    const buildSpanHierarchy = (spans: TraceSpan[]) => {
        const spanMap = new Map<string, TraceSpan & { children: TraceSpan[] }>();
        const rootSpans: (TraceSpan & { children: TraceSpan[] })[] = [];

        // Initialize all spans with empty children arrays
        spans.forEach(span => {
            spanMap.set(span.spanId, { ...span, children: [] });
        });

        // Build hierarchy
        spans.forEach(span => {
            const spanWithChildren = spanMap.get(span.spanId)!;
            if (span.parentSpanId) {
                const parent = spanMap.get(span.parentSpanId);
                if (parent) {
                    parent.children.push(spanWithChildren);
                } else {
                    rootSpans.push(spanWithChildren);
                }
            } else {
                rootSpans.push(spanWithChildren);
            }
        });

        return rootSpans;
    };

    const renderSpan = (span: TraceSpan & { children: TraceSpan[] }, depth = 0) => {
        const isExpanded = expandedSpans.has(span.spanId);
        const isSelected = selectedSpan === span.spanId;
        const hasChildren = span.children.length > 0;

        return (
            <div key={span.spanId} className="border-l-2 border-gray-200">
                <div
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                    style={{ paddingLeft: `${depth * 20 + 12}px` }}
                    onClick={() => setSelectedSpan(span.spanId)}
                >
                    <div className="flex flex-1 items-center min-w-0">
                        {hasChildren && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSpanExpansion(span.spanId);
                                }}
                                className="p-1 mr-2 rounded hover:bg-gray-200"
                            >
                                {isExpanded ?
                                    <ChevronDownIcon className="w-4 h-4" /> :
                                    <ChevronRightIcon className="w-4 h-4" />
                                }
                            </button>
                        )}

                        <div className="flex items-center mr-3">
                            {getStatusIcon(span.status)}
                            <div className="ml-2">
                                {getOperationIcon(span.operation)}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                                {span.name}
                            </div>
                            <div className="text-xs text-gray-500">
                                {span.operation} • {span.spanId.substring(0, 8)}...
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="text-right">
                                <div>{formatDuration(span.duration)}</div>
                                {span.aiCall && (
                                    <div className="text-xs">{formatCost(span.aiCall.cost)}</div>
                                )}
                            </div>
                            {span.aiCall && (
                                <div className="text-right">
                                    <div>{span.aiCall.totalTokens.toLocaleString()}</div>
                                    <div className="text-xs text-gray-400">tokens</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {span.children.map(child => renderSpan(child as TraceSpan & { children: TraceSpan[] }, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const selectedSpanData = trace?.spans.find(s => s.spanId === selectedSpan);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center text-red-700">
                    <AlertTriangle className="mr-2 w-5 h-5" />
                    <span>Error: {error}</span>
                </div>
            </div>
        );
    }

    if (!trace) {
        return (
            <div className="py-12 text-center">
                <h2 className="text-xl font-semibold text-gray-900">Trace not found</h2>
                <p className="mt-2 text-gray-600">The requested trace could not be found.</p>
            </div>
        );
    }

    const spanHierarchy = buildSpanHierarchy(trace.spans);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{trace.name}</h1>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                        <span>ID: {trace.traceId}</span>
                        <span>•</span>
                        <span>{new Date(trace.startTime).toLocaleString()}</span>
                        {trace.metadata.environment && (
                            <>
                                <span>•</span>
                                <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                                    {trace.metadata.environment}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => copyToClipboard(trace.traceId)}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
                        title="Copy Trace ID"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={exportTrace}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
                        title="Export Trace"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <Link
                        to={`/traces/${trace.traceId}/analysis`}
                        className="flex items-center px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                        <BarChart3 className="mr-2 w-4 h-4" />
                        Analyze Performance
                    </Link>
                    {trace.status === 'completed' && (
                        <Link
                            to={`/traces/${trace.traceId}/replay`}
                            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            <Zap className="mr-2 w-4 h-4" />
                            Replay Trace
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="flex items-center">
                        {getStatusIcon(trace.status)}
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{trace.status}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Duration</p>
                            <p className="text-lg font-semibold text-gray-900">{formatDuration(trace.duration)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Cost</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCost(trace.totalCost)}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="flex items-center">
                        <Layers className="w-5 h-5 text-orange-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                            <p className="text-lg font-semibold text-gray-900">{trace.totalTokens.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Span Tree */}
                <div className="bg-white rounded-lg shadow lg:col-span-2">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Trace Timeline</h2>
                        <p className="text-sm text-gray-600">{trace.spans.length} spans • {trace.callCount} AI calls</p>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                        {spanHierarchy.map(span => renderSpan(span))}
                    </div>
                </div>

                {/* Span Details */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Span Details</h2>
                    </div>
                    <div className="p-6">
                        {selectedSpanData ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                                    <p className="text-sm text-gray-900">{selectedSpanData.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Operation</h3>
                                    <p className="text-sm text-gray-900 capitalize">{selectedSpanData.operation}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                                    <p className="text-sm text-gray-900">{formatDuration(selectedSpanData.duration)}</p>
                                </div>

                                {selectedSpanData.aiCall && (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">AI Model</h3>
                                            <p className="text-sm text-gray-900">
                                                {selectedSpanData.aiCall.provider} / {selectedSpanData.aiCall.model}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Tokens</h3>
                                            <p className="text-sm text-gray-900">
                                                {selectedSpanData.aiCall.totalTokens.toLocaleString()} total
                                                <br />
                                                <span className="text-xs text-gray-600">
                                                    {selectedSpanData.aiCall.promptTokens} prompt + {selectedSpanData.aiCall.completionTokens} completion
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Cost</h3>
                                            <p className="text-sm text-gray-900">{formatCost(selectedSpanData.aiCall.cost)}</p>
                                        </div>
                                        {selectedSpanData.aiCall.prompt && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Prompt</h3>
                                                <div className="overflow-y-auto p-2 mt-1 max-h-32 text-xs text-gray-700 bg-gray-50 rounded">
                                                    {selectedSpanData.aiCall.prompt}
                                                </div>
                                            </div>
                                        )}
                                        {selectedSpanData.aiCall.completion && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Completion</h3>
                                                <div className="overflow-y-auto p-2 mt-1 max-h-32 text-xs text-gray-700 bg-gray-50 rounded">
                                                    {selectedSpanData.aiCall.completion}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {selectedSpanData.error && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Error</h3>
                                        <div className="p-2 mt-1 bg-red-50 rounded border border-red-200">
                                            <p className="text-sm text-red-800">{selectedSpanData.error.message}</p>
                                            {selectedSpanData.error.code && (
                                                <p className="mt-1 text-xs text-red-600">Code: {selectedSpanData.error.code}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Select a span to view details</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}; 