import React from 'react';
import { format } from 'date-fns';
import { FiCheck, FiX, FiClock, FiDollarSign, FiCpu, FiAlertCircle } from 'react-icons/fi';

interface LogTableProps {
    logs: any[];
    viewMode: 'table' | 'timeline' | 'json';
    onSelectLog: (log: any) => void;
}

export const LogTable: React.FC<LogTableProps> = ({ logs, viewMode, onSelectLog }) => {
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4 glow-primary">
                    <FiAlertCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold gradient-text-primary mb-2">
                    No logs found
                </h3>
                <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary max-w-md">
                    Try adjusting your filters or time range to see more results.
                </p>
            </div>
        );
    }

    const TableRow = ({ log, style, onSelectLog }: any) => (
        <div
            style={style}
            onClick={() => onSelectLog(log)}
            className="flex items-center px-3 md:px-6 py-3 md:py-4 border-b border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 cursor-pointer transition-all duration-300 group min-w-[600px]"
        >
            <div className="flex-shrink-0 w-8 md:w-12">
                {log.success ? (
                    <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-success-500 dark:text-success-400 glow-success" />
                ) : (
                    <FiX className="w-4 h-4 md:w-5 md:h-5 text-red-500 dark:text-red-400 glow-danger" />
                )}
            </div>
            <div className="flex-1 grid grid-cols-6 gap-2 md:gap-4 items-center">
                <div className="col-span-2 min-w-0">
                    <p className="text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary truncate group-hover:gradient-text-primary transition-colors">
                        {log.aiModel || log.model || 'Unknown Model'}
                    </p>
                    <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary truncate">
                        {log.service} • {log.operation}
                    </p>
                </div>
                <div className="hidden md:block">
                    <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                        {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </p>
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 text-xs">
                    <FiClock className="w-3 h-3 md:w-3.5 md:h-3.5 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
                        {log.responseTime}ms
                    </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 md:gap-1.5 text-xs">
                    <FiCpu className="w-3 h-3 md:w-3.5 md:h-3.5 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
                        {log.totalTokens || (log.inputTokens + log.outputTokens)}
                    </span>
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 text-xs">
                    <FiDollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                    <span className="font-bold gradient-text-primary">
                        ${log.cost?.toFixed(4) || '0.0000'}
                    </span>
                </div>
            </div>
        </div>
    );

    const TimelineRow = ({ log, style, onSelectLog }: any) => (
        <div
            style={style}
            onClick={() => onSelectLog(log)}
            className="px-3 md:px-6 py-4 md:py-5 border-b border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 cursor-pointer transition-all duration-300 group"
        >
            <div className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0">
                    <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg ${log.success
                        ? 'bg-gradient-to-br from-success-500 to-success-600 glow-success'
                        : 'bg-gradient-to-br from-red-500 to-red-600 glow-danger'
                        }`}>
                        {log.success ? (
                            <FiCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        ) : (
                            <FiX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-2">
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs md:text-sm font-bold text-light-text-primary dark:text-dark-text-primary group-hover:gradient-text-primary transition-colors truncate">
                                {log.aiModel || log.model || 'Unknown Model'}
                            </h4>
                            <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary truncate">
                                {log.service} • {log.operation}
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">
                            {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 text-xs text-light-text-primary dark:text-dark-text-primary flex-wrap">
                        <span className="flex items-center gap-1 md:gap-1.5 font-bold">
                            <FiClock className="w-3 h-3 md:w-3.5 md:h-3.5 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                            {log.responseTime}ms
                        </span>
                        <span className="flex items-center gap-1 md:gap-1.5 font-bold">
                            <FiCpu className="w-3 h-3 md:w-3.5 md:h-3.5 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                            {log.totalTokens || (log.inputTokens + log.outputTokens)} tokens
                        </span>
                        <span className="flex items-center gap-1 md:gap-1.5 font-bold gradient-text-primary">
                            <FiDollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                            ${log.cost?.toFixed(4) || '0.0000'}
                        </span>
                    </div>
                    {log.errorMessage && (
                        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-xs font-semibold text-red-700 dark:text-red-300 font-mono leading-relaxed break-words">
                                {log.errorMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const JsonRow = ({ log, style, onSelectLog }: any) => (
        <div
            style={style}
            onClick={() => onSelectLog(log)}
            className="px-3 md:px-6 py-3 md:py-4 border-b border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 cursor-pointer transition-all duration-300"
        >
            <pre className="text-xs font-mono font-medium text-light-text-primary dark:text-dark-text-primary overflow-x-auto leading-relaxed">
                {JSON.stringify(log, null, 2)}
            </pre>
        </div>
    );

    return (
        <div className="h-[500px] md:h-[600px] flex flex-col">
            {viewMode === 'table' && (
                <div className="px-3 md:px-6 py-3 md:py-4 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-900/10 dark:to-transparent">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 md:w-12"></div>
                        <div className="flex-1 grid grid-cols-6 gap-2 md:gap-4 overflow-x-auto">
                            <div className="col-span-2 text-xs font-bold gradient-text-primary uppercase tracking-wide">
                                <span className="hidden sm:inline">Model / Service</span>
                                <span className="sm:hidden">Model</span>
                            </div>
                            <div className="text-xs font-bold gradient-text-primary uppercase tracking-wide hidden md:block">
                                Timestamp
                            </div>
                            <div className="text-xs font-bold gradient-text-primary uppercase tracking-wide">
                                Latency
                            </div>
                            <div className="text-xs font-bold gradient-text-primary uppercase tracking-wide hidden sm:block">
                                Tokens
                            </div>
                            <div className="text-xs font-bold gradient-text-primary uppercase tracking-wide">
                                Cost
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-auto">
                {logs.map((log, index) => {
                    const key = log._id || log.requestId || index;
                    if (viewMode === 'table') {
                        return <TableRow key={key} log={log} style={{}} onSelectLog={onSelectLog} />;
                    } else if (viewMode === 'timeline') {
                        return <TimelineRow key={key} log={log} style={{}} onSelectLog={onSelectLog} />;
                    } else {
                        return <JsonRow key={key} log={log} style={{}} onSelectLog={onSelectLog} />;
                    }
                })}
            </div>
        </div>
    );
};
