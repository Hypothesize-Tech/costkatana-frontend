import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiPlay, FiPause, FiTrash2, FiActivity, FiAlertCircle, FiSquare } from 'react-icons/fi';
import { useLogStream } from '../../hooks/useLogStream';

interface LogStreamProps {
    filters: any;
    onNewLog: (log: any) => void;
}

export const LogStream: React.FC<LogStreamProps> = ({ filters, onNewLog }) => {
    const [autoScroll, setAutoScroll] = useState(true);
    const logsContainerRef = useRef<HTMLDivElement>(null);

    const {
        logs,
        isConnected,
        isPaused,
        isLoading,
        error,
        startStream,
        stopStream,
        pauseStream,
        resumeStream,
        clearLogs
    } = useLogStream({ filters, maxLogs: 500 });

    // Start stream on mount
    useEffect(() => {
        startStream();
        return () => stopStream();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (autoScroll && logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    // Notify parent of new logs
    useEffect(() => {
        if (logs.length > 0) {
            onNewLog(logs[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logs.length]);

    const togglePause = () => {
        if (isPaused) {
            resumeStream();
        } else {
            pauseStream();
        }
    };

    const connectionStatus = isLoading ? 'connecting' : isConnected ? 'connected' : error ? 'error' : 'disconnected';

    const getLogLevelColor = (level?: string) => {
        switch (level) {
            case 'CRITICAL':
            case 'ERROR':
                return 'text-red-600 dark:text-red-400';
            case 'WARN':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'INFO':
                return 'text-primary-600 dark:text-primary-400';
            case 'DEBUG':
                return 'text-slate-600 dark:text-slate-400';
            default:
                return 'text-slate-700 dark:text-slate-300';
        }
    };

    const statusIndicator = {
        connecting: { color: '#eab308', label: 'Connecting...' },
        connected: { color: '#22c55e', label: 'Connected' },
        disconnected: { color: '#94a3b8', label: 'Disconnected' },
        error: { color: '#ef4444', label: 'Error' }
    }[connectionStatus];

    return (
        <div className="flex flex-col h-[600px]">
            {/* Stream Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent">
                <div className="flex items-center gap-3">
                    <FiActivity className={`w-5 h-5 text-primary-500 dark:text-primary-400 ${connectionStatus === 'connected' ? 'animate-pulse glow-primary' : ''}`} />
                    <div>
                        <h4 className="text-sm font-bold gradient-text-primary">
                            Real-time Log Stream
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: statusIndicator.color }}
                            />
                            <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                {statusIndicator.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 text-sm font-semibold text-light-text-primary dark:text-dark-text-primary cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="rounded border-primary-300 dark:border-primary-600 text-primary-500 focus:ring-primary-500"
                        />
                        Auto-scroll
                    </label>

                    <button
                        className="px-3 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm btn-ghost hover:bg-gradient-primary hover:text-white transition-all duration-300"
                        onClick={togglePause}
                    >
                        {isPaused ? <FiPlay /> : <FiPause />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>

                    <button
                        className="px-3 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg glow-danger transition-all duration-300"
                        onClick={stopStream}
                    >
                        <FiSquare />
                        Stop
                    </button>

                    <button
                        className="px-3 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm btn-ghost hover:bg-gradient-primary hover:text-white transition-all duration-300"
                        onClick={clearLogs}
                    >
                        <FiTrash2 />
                        Clear
                    </button>

                    <span className="text-sm font-bold gradient-text-primary px-3 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        {logs.length} logs
                    </span>
                </div>
            </div>

            {/* Log Stream Content */}
            <div
                ref={logsContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4 bg-light-bg dark:bg-dark-bg font-mono text-sm"
            >
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <FiAlertCircle className="w-16 h-16 text-light-text-muted dark:text-dark-text-muted opacity-30 mb-4" />
                        <p className="text-base font-bold gradient-text-primary mb-2">
                            {connectionStatus === 'connected' ? 'Waiting for logs...' : 'Not connected'}
                        </p>
                        <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary max-w-sm">
                            {connectionStatus === 'connected'
                                ? 'New logs will appear here in real-time'
                                : 'Click the play button to start streaming'
                            }
                        </p>
                    </div>
                )}

                {logs.map((log, index) => (
                    <div
                        key={log._id || log.requestId || index}
                        className="mb-3 p-4 rounded-lg card shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                    >
                        <div className="flex items-start gap-3">
                            {/* Status Indicator */}
                            <div className="flex-shrink-0 mt-1">
                                {log.success ? (
                                    <div className="w-2 h-2 rounded-full bg-success-500 shadow-lg shadow-success-500/50 glow-success"></div>
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50 glow-danger"></div>
                                )}
                            </div>

                            {/* Log Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                        {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getLogLevelColor(log.logLevel)}`}>
                                        {log.logLevel || 'INFO'}
                                    </span>
                                    <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                        [{log.service}/{log.operation}]
                                    </span>
                                    <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">
                                        {log.aiModel || log.model}
                                    </span>
                                </div>

                                <div className="text-xs text-light-text-primary dark:text-dark-text-primary mb-2 font-medium">
                                    {log.errorMessage && (
                                        <span className="font-bold text-red-600 dark:text-red-400">
                                            ERROR: {log.errorMessage}
                                        </span>
                                    )}
                                    {!log.errorMessage && log.result && (
                                        <span className="block truncate">{log.result.substring(0, 150)}...</span>
                                    )}
                                    {!log.errorMessage && !log.result && log.prompt && (
                                        <span className="block truncate">{log.prompt.substring(0, 150)}...</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    <span className="font-bold">{log.responseTime}ms</span>
                                    <span>•</span>
                                    <span className="font-bold">{log.totalTokens || (log.inputTokens + log.outputTokens)} tokens</span>
                                    <span>•</span>
                                    <span className="font-bold gradient-text-primary">${log.cost?.toFixed(4) || '0.0000'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
