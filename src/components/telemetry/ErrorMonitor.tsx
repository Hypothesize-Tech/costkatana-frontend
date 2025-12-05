import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { ErrorSpan } from '../../types/telemetry';
import {
    ExclamationTriangleIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

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
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-lg backdrop-blur-xl animate-pulse glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-2 sm:mb-3 h-10 sm:h-12 rounded-xl bg-gradient-primary/20" />
            ))}
        </div>
    );

    if (error) return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-danger shrink-0">
                        <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-body text-secondary-900 dark:text-white">
                        Error loading error monitor
                    </span>
                </div>
                <button onClick={() => refetch()} className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm btn btn-secondary w-full sm:w-auto">
                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Retry</span>
                </button>
            </div>
        </div>
    );

    const errorList = errors || [];

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-danger glow-danger shrink-0">
                        <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-danger">
                        Error Monitor
                    </h2>
                </div>
                <button onClick={() => refetch()} className="inline-flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm btn btn-secondary w-full sm:w-auto">
                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {errorList.length === 0 ? (
                <div className="p-6 sm:p-8 text-center bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                    <div className="flex justify-center items-center mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg bg-gradient-success glow-success">
                        <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <p className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold font-display gradient-text-success">No errors detected</p>
                    <p className="text-xs sm:text-sm md:text-base font-body text-secondary-600 dark:text-secondary-300">Your system is running smoothly</p>
                </div>
            ) : (
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    {errorList.slice(0, 10).map((errorSpan) => (
                        <div key={errorSpan.trace_id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-danger-200/30 from-danger-50/20 to-danger-100/20 dark:from-danger-900/10 dark:to-danger-800/10 hover:bg-gradient-danger/20">
                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="flex gap-2 sm:gap-3 items-center mb-1.5 sm:mb-2">
                                    <div className="flex justify-center items-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg shadow-lg bg-gradient-danger shrink-0">
                                        <ExclamationTriangleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <p className="text-sm sm:text-base font-display font-semibold text-secondary-900 dark:text-white truncate flex-1">
                                        {errorSpan.error_message}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:gap-3 ml-7 sm:ml-9 text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">
                                    <span className="glass px-2 py-0.5 sm:py-1 rounded-full border border-accent-200/30 shadow-lg backdrop-blur-xl truncate max-w-[140px] sm:max-w-[180px]">
                                        Route: {errorSpan.route}
                                    </span>
                                    <span className="px-2 py-0.5 sm:py-1 rounded-full border shadow-lg backdrop-blur-xl glass border-highlight-200/30">
                                        {formatTimeAgo(errorSpan.timestamp)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopyTraceId(errorSpan.trace_id)}
                                className={`btn ml-0 sm:ml-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto ${copiedTraceId === errorSpan.trace_id ? 'btn-success' : 'btn-secondary'}`}
                            >
                                {copiedTraceId === errorSpan.trace_id ? 'Copied!' : (<><ClipboardDocumentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Copy Trace ID</span><span className="sm:hidden">Copy</span></>)}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
