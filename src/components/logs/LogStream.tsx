import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiPlay, FiPause, FiTrash2, FiActivity, FiAlertCircle, FiSquare, FiCheckCircle, FiXCircle, FiClock, FiZap, FiDollarSign } from 'react-icons/fi';
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
        <div className="flex flex-col h-[500px] md:h-[600px] card shadow-2xl overflow-hidden">
            {/* Stream Header */}
            <div className="relative px-4 py-4 md:px-6 md:py-5 border-b-2 border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-500/10 via-primary-400/5 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-50"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
                                <FiActivity className={`w-5 h-5 md:w-6 md:h-6 text-white ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
                            </div>
                            {connectionStatus === 'connected' && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 rounded-full border-2 border-light-surface dark:border-dark-surface animate-pulse"></div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-base md:text-lg font-bold gradient-text-primary">
                                Real-time Log Stream
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative w-2 h-2">
                                    <div
                                        className="absolute inset-0 rounded-full animate-pulse"
                                        style={{ backgroundColor: statusIndicator.color }}
                                    />
                                    {connectionStatus === 'connected' && (
                                        <div
                                            className="absolute inset-0 rounded-full animate-ping"
                                            style={{ backgroundColor: statusIndicator.color }}
                                        />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                    {statusIndicator.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <label className="group flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary cursor-pointer rounded-lg hover:bg-primary-500/10 transition-all">
                            <input
                                type="checkbox"
                                checked={autoScroll}
                                onChange={(e) => setAutoScroll(e.target.checked)}
                                className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-2 border-primary-300 dark:border-primary-600 text-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                            <span className="hidden sm:inline">Auto-scroll</span>
                            <span className="sm:hidden">Auto</span>
                        </label>

                        <button
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm bg-light-panel dark:bg-dark-panel border-2 border-primary-200/30 dark:border-primary-500/20 text-light-text-primary dark:text-dark-text-primary hover:bg-gradient-primary hover:text-white hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg"
                            onClick={togglePause}
                        >
                            {isPaused ? <FiPlay className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <FiPause className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>

                        <button
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                            onClick={stopStream}
                        >
                            <FiSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Stop</span>
                        </button>

                        <button
                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-1.5 md:gap-2 text-xs md:text-sm bg-light-panel dark:bg-dark-panel border-2 border-primary-200/30 dark:border-primary-500/20 text-light-text-primary dark:text-dark-text-primary hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all duration-300 shadow-md"
                            onClick={clearLogs}
                        >
                            <FiTrash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>

                        <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm gradient-text-primary bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-2 border-primary-500/30 shadow-lg">
                            {logs.length} logs
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Stream Content */}
            <div
                ref={logsContainerRef}
                className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 bg-gradient-to-b from-light-surface/50 to-light-bg dark:from-dark-surface/50 dark:to-dark-bg"
            >
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-3 md:px-4">
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-primary/10 flex items-center justify-center mb-4 md:mb-6 animate-pulse">
                            <FiActivity className="w-8 h-8 md:w-12 md:h-12 text-primary-500" />
                        </div>
                        <h4 className="text-lg md:text-2xl font-bold gradient-text-primary mb-2 md:mb-3">
                            {connectionStatus === 'connected' ? 'Waiting for logs...' : 'Not connected'}
                        </h4>
                        <p className="text-sm md:text-base font-medium text-light-text-secondary dark:text-dark-text-secondary max-w-md px-2">
                            {connectionStatus === 'connected'
                                ? 'New logs will appear here in real-time as they are generated'
                                : 'Click the Resume button to start streaming logs'
                            }
                        </p>
                    </div>
                )}

                <div className="space-y-2 md:space-y-3">
                    {logs.map((log, index) => (
                        <div
                            key={log._id || log.requestId || index}
                            className="group relative card shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in"
                        >
                            {/* Gradient Border Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            <div className="relative p-3 md:p-5">
                                <div className="flex items-start gap-2 md:gap-4">
                                    {/* Status Indicator */}
                                    <div className="flex-shrink-0 mt-1">
                                        {log.success ? (
                                            <div className="relative">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-green-500/10 flex items-center justify-center border-2 border-green-500/30">
                                                    <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                                                </div>
                                                <div className="absolute inset-0 rounded-xl bg-green-500/20 blur animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-500/10 flex items-center justify-center border-2 border-red-500/30">
                                                    <FiXCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                                                </div>
                                                <div className="absolute inset-0 rounded-xl bg-red-500/20 blur animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Log Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header Row */}
                                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 flex-wrap">
                                            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-light-surface dark:bg-dark-surface rounded-lg border border-primary-200/30 dark:border-primary-500/20">
                                                <FiClock className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-500 flex-shrink-0" />
                                                <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary font-mono">
                                                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg ${getLogLevelColor(log.logLevel)} bg-current/10 border-2 border-current/30`}>
                                                {log.logLevel || 'INFO'}
                                            </span>
                                            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg border border-primary-500/30">
                                                <span className="text-xs font-bold truncate max-w-[80px] md:max-w-none">
                                                    {log.service}
                                                </span>
                                                <span className="text-xs opacity-50">/</span>
                                                <span className="text-xs font-semibold opacity-80 truncate max-w-[80px] md:max-w-none">
                                                    {log.operation}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary px-2 py-1 md:px-3 md:py-1.5 bg-gradient-primary/10 rounded-lg border border-primary-500/20 truncate max-w-[100px] md:max-w-none">
                                                {log.aiModel || log.model}
                                            </span>
                                        </div>

                                        {/* Message Content */}
                                        <div className="mb-2 md:mb-3 px-3 py-2 md:px-4 md:py-3 rounded-lg bg-light-surface/50 dark:bg-dark-surface/50 border border-primary-200/20 dark:border-primary-500/10">
                                            {log.errorMessage ? (
                                                <div className="flex items-start gap-2">
                                                    <FiAlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400 break-words">
                                                        {log.errorMessage}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-xs md:text-sm text-light-text-primary dark:text-dark-text-primary font-medium leading-relaxed font-mono break-words">
                                                    {log.result?.substring(0, 150) || log.prompt?.substring(0, 150) || 'No content'}
                                                    {(log.result?.length > 150 || log.prompt?.length > 150) && '...'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Metrics Row */}
                                        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                                            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/30">
                                                <FiClock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                                                <span className="text-xs font-bold">{log.responseTime}ms</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-500/30">
                                                <FiZap className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                                                <span className="text-xs font-bold">
                                                    {log.totalTokens || (log.inputTokens + log.outputTokens)} tokens
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 rounded-lg border border-green-500/30 shadow-sm">
                                                <FiDollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                                                <span className="text-xs font-bold">
                                                    ${log.cost?.toFixed(4) || '0.0000'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
