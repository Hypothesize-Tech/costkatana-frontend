import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { ErrorSpan } from '../../types/telemetry';
import { ExclamationTriangleIcon, DocumentDuplicateIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const ErrorMonitor: React.FC = () => {
    const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

    const { data: errors, isLoading, error, refetch } = useQuery<ErrorSpan[]>({
        queryKey: ['telemetry-errors', 'recent'],
        queryFn: async () => {
            const response = await TelemetryAPI.getDashboard();
            return response.dashboard.recent_errors;
        },
        refetchInterval: 10000,
        staleTime: 10000
    });

    const handleCopyTraceId = useCallback((traceId: string) => {
        // Clear any previously copied trace ID
        setCopiedTraceId(null);

        // Copy to clipboard
        navigator.clipboard.writeText(traceId).then(() => {
            setCopiedTraceId(traceId);
            // Clear the copied state after 2 seconds
            setTimeout(() => setCopiedTraceId(null), 2000);
        }).catch((err) => {
            console.error('Failed to copy trace ID:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = traceId;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopiedTraceId(traceId);
                setTimeout(() => setCopiedTraceId(null), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
            }
            document.body.removeChild(textArea);
        });
    }, []);

    if (isLoading) return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl mb-2" />
            ))}
        </div>
    );

    if (error) return (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">
            Error loading error monitor
            <button onClick={() => refetch()} className="ml-4 bg-rose-100 px-3 py-1 rounded inline-flex items-center">
                <ArrowPathIcon className="w-4 h-4 mr-1" /> Retry
            </button>
        </div>
    );

    const errorList = errors || [];

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 mr-2" />
                    Error Monitor
                </h2>
                <button onClick={() => refetch()} className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center">
                    <ArrowPathIcon className="w-4 h-4 mr-1" /> Refresh
                </button>
            </div>

            {errorList.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                    <p>No errors detected</p>
                    <p className="text-sm">Your system is running smoothly</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {errorList.slice(0, 10).map((errorSpan) => (
                        <div key={errorSpan.trace_id} className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="min-w-0">
                                <div className="flex items-center">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 mr-2" />
                                    <p className="font-medium text-rose-800 truncate max-w-[260px]">
                                        {errorSpan.error_message}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                                    <span className="truncate max-w-[180px]">Route: {errorSpan.route}</span>
                                    <span>• {formatTimeAgo(errorSpan.timestamp)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopyTraceId(errorSpan.trace_id)}
                                className={`ml-4 px-3 py-2 rounded-lg transition-colors inline-flex items-center ${copiedTraceId === errorSpan.trace_id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {copiedTraceId === errorSpan.trace_id ? 'Copied!' : (<><DocumentDuplicateIcon className="w-4 h-4 mr-1" /> Copy Trace ID</>)}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
