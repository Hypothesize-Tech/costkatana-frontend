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
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gradient-primary/20 rounded-xl mb-3" />
            ))}
        </div>
    );

    if (error) return (
        <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-danger/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center glow-danger">
                        <span className="text-white text-sm">⚠️</span>
                    </div>
                    <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                        Error loading error monitor
                    </span>
                </div>
                <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4" /> Retry
                </button>
            </div>
        </div>
    );

    const errorList = errors || [];

    return (
        <div className="glass rounded-xl p-8 border border-danger-200/30 shadow-lg backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center glow-danger">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-danger">
                        Error Monitor
                    </h2>
                </div>
                <button onClick={() => refetch()} className="btn-secondary inline-flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4" /> Refresh
                </button>
            </div>

            {errorList.length === 0 ? (
                <div className="glass rounded-xl p-8 border border-success-200/30 bg-gradient-success/10 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-success flex items-center justify-center mx-auto mb-4 glow-success">
                        <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-display font-semibold gradient-text-success mb-2">No errors detected</p>
                    <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Your system is running smoothly</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {errorList.slice(0, 10).map((errorSpan) => (
                        <div key={errorSpan.trace_id} className="glass rounded-xl p-4 border border-danger-200/30 bg-gradient-danger/10 flex items-center justify-between hover:bg-gradient-danger/20 transition-all duration-200">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-danger flex items-center justify-center glow-danger">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate max-w-[260px]">
                                        {errorSpan.error_message}
                                    </p>
                                </div>
                                <div className="font-body text-light-text-secondary dark:text-dark-text-secondary text-sm flex flex-wrap gap-3 ml-9">
                                    <span className="glass px-2 py-1 rounded-full border border-accent-200/30 truncate max-w-[180px]">
                                        Route: {errorSpan.route}
                                    </span>
                                    <span className="glass px-2 py-1 rounded-full border border-info-200/30">
                                        {formatTimeAgo(errorSpan.timestamp)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopyTraceId(errorSpan.trace_id)}
                                className={`ml-4 px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-2 ${copiedTraceId === errorSpan.trace_id ? 'btn-success' : 'btn-secondary'}`}
                            >
                                {copiedTraceId === errorSpan.trace_id ? 'Copied!' : (<><DocumentDuplicateIcon className="w-4 h-4" /> Copy Trace ID</>)}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
