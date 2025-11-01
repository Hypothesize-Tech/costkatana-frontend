import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { TraceResponse } from '../../types/telemetry';
import { MagnifyingGlassIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, ClipboardDocumentIcon, HandRaisedIcon } from '@heroicons/react/24/outline';

const buildSpanTree = (spans: any[]) => {
    const spanMap = new Map(spans.map(span => [span.span_id, { ...span, children: [] }]));
    for (const span of spanMap.values()) {
        if (span.parent_span_id) {
            const parentSpan = spanMap.get(span.parent_span_id);
            if (parentSpan) parentSpan.children.push(span);
        }
    }
    return Array.from(spanMap.values()).filter(span => !span.parent_span_id);
};

const SpanNode: React.FC<{ span: any; depth?: number; onSpanSelect: (span: any) => void }>
    = ({ span, depth = 0, onSpanSelect }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const statusColor = span.status === 'error' ? 'border-danger-500 bg-gradient-to-r from-danger-50/20 to-danger-100/20 dark:from-danger-900/10 dark:to-danger-800/10' : 'border-success-500 bg-gradient-to-r from-success-50/20 to-success-100/20 dark:from-success-900/10 dark:to-success-800/10';
        return (
            <div className={`glass border-l-4 ${statusColor} mb-3 p-3 rounded-r-xl shadow-lg backdrop-blur-xl`} style={{ marginLeft: `${depth * 20}px` }}>
                <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gradient-primary/5 p-2 rounded-lg transition-all duration-200"
                    onClick={() => { onSpanSelect(span); setIsExpanded(!isExpanded); }}
                >
                    <div className="flex items-center gap-2">
                        {span.children.length > 0 && (
                            <div className="w-6 h-6 rounded-lg bg-gradient-primary/20 flex items-center justify-center">
                                <ChevronRightIcon className={`w-3 h-3 text-primary-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                        )}
                        <span className="font-display font-medium text-secondary-900 dark:text-white">{span.operation_name}</span>
                        {span.status === 'error' && (
                            <div className="w-5 h-5 rounded-full bg-gradient-danger flex items-center justify-center shadow-lg">
                                <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <span className="font-display font-semibold gradient-text-accent">{Number(span.duration_ms || 0).toFixed(2)} ms</span>
                </div>
                {isExpanded && span.children.map((child: any) => (
                    <SpanNode key={child.span_id} span={child} depth={depth + 1} onSpanSelect={onSpanSelect} />
                ))}
            </div>
        );
    };

export const TraceViewer: React.FC = () => {
    const [traceId, setTraceId] = useState('');
    const [selectedSpan, setSelectedSpan] = useState<any>(null);

    const { data: traceData, isLoading, error, refetch, isFetching } = useQuery<TraceResponse>({
        queryKey: ['telemetry-trace', traceId],
        queryFn: () => (traceId ? TelemetryAPI.getTraceDetails(traceId) : Promise.reject(new Error('No trace ID'))),
        enabled: !!traceId,
        staleTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const spanTree = useMemo(() => (traceData ? buildSpanTree(traceData.spans || []) : []), [traceData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (traceId) refetch();
    };

    const renderErrorMessage = (): React.ReactNode => {
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unknown error occurred';
        return (
                <div className="glass rounded-xl p-6 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-body text-secondary-900 dark:text-white">
                            Error loading trace details: {errorMessage}
                        </span>
                    </div>
                </div>
        );
    };

    return (
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-highlight flex items-center justify-center shadow-lg">
                        <MagnifyingGlassIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">Trace Viewer</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={traceId}
                        onChange={(e) => setTraceId(e.target.value)}
                        placeholder="Enter Trace ID"
                        className="input flex-grow"
                    />
                    <button
                        type="submit"
                        className="glass px-6 py-3 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2 font-display font-semibold text-white"
                        disabled={!traceId || isFetching}
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        {isFetching ? 'Loading...' : 'View Trace'}
                    </button>
                </form>
            </div>

            {isLoading && (
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (<div key={i} className="h-12 bg-gradient-primary/20 rounded-xl" />))}
                </div>
            )}

            {!isLoading && error ? renderErrorMessage() : null}

            {traceData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                                <EyeIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-display font-semibold gradient-text-secondary">Trace Spans (Total: {traceData.summary?.total_spans || 0})</h3>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto glass rounded-xl p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
                            {spanTree.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-accent/20 flex items-center justify-center mx-auto mb-3">
                                        <MagnifyingGlassIcon className="w-6 h-6 text-accent-500" />
                                    </div>
                                    <p className="font-body text-secondary-600 dark:text-secondary-300">No spans found for this trace</p>
                                </div>
                            ) : (
                                spanTree.map((span) => (<SpanNode key={span.span_id} span={span} onSpanSelect={setSelectedSpan} />))
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-xl p-6 border border-highlight-200/30 dark:border-highlight-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-highlight flex items-center justify-center shadow-lg">
                                <ClipboardDocumentIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-display font-semibold gradient-text-highlight">Span Details</h3>
                        </div>
                        {selectedSpan ? (
                            <div className="space-y-4">
                                <div className="glass rounded-lg p-3 border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl">
                                    <span className="font-display font-medium gradient-text-primary">Operation:</span>
                                    <div className="font-body text-secondary-900 dark:text-white mt-1">{selectedSpan.operation_name}</div>
                                </div>
                                <div className="glass rounded-lg p-3 border border-accent-200/30 shadow-lg backdrop-blur-xl">
                                    <span className="font-display font-medium gradient-text-accent">Duration:</span>
                                    <div className="font-display font-semibold gradient-text-accent mt-1">{Number(selectedSpan.duration_ms || 0).toFixed(2)} ms</div>
                                </div>
                                <div className="glass rounded-lg p-3 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                                    <span className="font-display font-medium gradient-text-secondary">Status:</span>
                                    <span className={`ml-2 glass px-3 py-1 rounded-full font-display font-semibold border shadow-lg backdrop-blur-xl ${selectedSpan.status === 'error' ? 'border-danger-200/30 bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 text-danger-700 dark:text-danger-300' : 'border-success-200/30 bg-gradient-to-r from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 text-success-700 dark:text-success-300'}`}>{selectedSpan.status}</span>
                                </div>
                                <div className="glass rounded-lg p-3 border border-highlight-200/30 dark:border-highlight-500/20 shadow-lg backdrop-blur-xl">
                                    <span className="font-display font-medium gradient-text-highlight mb-2 block">Attributes:</span>
                                    <pre className="glass p-3 rounded border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl font-mono text-xs overflow-x-auto text-secondary-900 dark:text-white">{JSON.stringify(selectedSpan.attributes || {}, null, 2)}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-gradient-info/20 flex items-center justify-center mx-auto mb-3">
                                    <HandRaisedIcon className="w-6 h-6 text-info-500" />
                                </div>
                                <p className="font-body text-secondary-600 dark:text-secondary-300">Select a span to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
