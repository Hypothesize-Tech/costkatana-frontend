import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { TraceResponse } from '../../types/telemetry';
import { MagnifyingGlassIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

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
        const statusColor = span.status === 'error' ? 'border-rose-500 bg-rose-50' : 'border-emerald-500 bg-emerald-50';
        return (
            <div className={`border-l-4 ${statusColor} mb-2 p-2 rounded-r-lg`} style={{ marginLeft: `${depth * 20}px` }}>
                <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => { onSpanSelect(span); setIsExpanded(!isExpanded); }}
                >
                    <div className="flex items-center">
                        {span.children.length > 0 && (
                            <ChevronRightIcon className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        )}
                        <span className="font-medium">{span.operation_name}</span>
                        {span.status === 'error' && (<ExclamationTriangleIcon className="w-4 h-4 text-rose-500 ml-2" />)}
                    </div>
                    <span className="text-sm text-gray-600">{Number(span.duration_ms || 0).toFixed(2)} ms</span>
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
        return (<div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">Error loading trace details: {errorMessage}</div>);
    };

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="mb-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={traceId}
                        onChange={(e) => setTraceId(e.target.value)}
                        placeholder="Enter Trace ID"
                        className="flex-grow border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg inline-flex items-center"
                        disabled={!traceId || isFetching}
                    >
                        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                        {isFetching ? 'Loading...' : 'View Trace'}
                    </button>
                </form>
            </div>

            {isLoading && (
                <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (<div key={i} className="h-10 bg-gray-100 rounded-lg" />))}
                </div>
            )}

            {!isLoading && error ? renderErrorMessage() : null}

            {traceData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="text-base font-semibold mb-3">Trace Spans (Total: {traceData.summary?.total_spans || 0})</h3>
                        <div className="max-h-[500px] overflow-y-auto">
                            {spanTree.length === 0 ? (
                                <p className="text-gray-500 text-center">No spans found for this trace</p>
                            ) : (
                                spanTree.map((span) => (<SpanNode key={span.span_id} span={span} onSpanSelect={setSelectedSpan} />))
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl ring-1 ring-gray-200">
                        <h3 className="text-base font-semibold mb-3">Span Details</h3>
                        {selectedSpan ? (
                            <div className="space-y-2">
                                <div><strong>Operation:</strong> {selectedSpan.operation_name}</div>
                                <div><strong>Duration:</strong> {Number(selectedSpan.duration_ms || 0).toFixed(2)} ms</div>
                                <div>
                                    <strong>Status:</strong>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedSpan.status === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{selectedSpan.status}</span>
                                </div>
                                <div>
                                    <strong>Attributes:</strong>
                                    <pre className="bg-white p-2 rounded text-xs overflow-x-auto">{JSON.stringify(selectedSpan.attributes || {}, null, 2)}</pre>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center">Select a span to view details</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
