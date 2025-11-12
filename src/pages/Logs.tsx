import React, { useState, useEffect, useCallback } from 'react';
import { LogFilters } from '../components/logs/LogFilters';
import { LogTable } from '../components/logs/LogTable';
import { LogStream } from '../components/logs/LogStream';
import { LogStats } from '../components/logs/LogStats';
import { LogDetails } from '../components/logs/LogDetails';
import { FiFilter, FiRefreshCw, FiDownload, FiActivity, FiTable, FiClock, FiCode } from 'react-icons/fi';
import { logsService } from '../services/logs.service';

type ViewMode = 'table' | 'timeline' | 'json';

export const Logs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isRealtime, setIsRealtime] = useState<boolean>(false);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState<boolean>(true);
    const [statsCollapsed, setStatsCollapsed] = useState<boolean>(false);
    const [autoRefresh, setAutoRefresh] = useState<number>(0);

    const fetchLogs = useCallback(async () => {
        if (isRealtime) return;

        try {
            setLoading(true);
            setError(null);
            const response = await logsService.fetchAILogs(filters);
            setLogs(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch logs');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [filters, isRealtime]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await logsService.fetchAILogStats(filters);
            if (response.success) {
                // Transform stats data to match LogStats component expectations
                const transformedStats = {
                    totalCalls: response.summary.totalCalls,
                    errorRate: response.summary.errorRate,
                    avgLatency: response.breakdown.length > 0
                        ? response.breakdown.reduce((sum: number, b: any) => sum + (b.avgLatency || 0), 0) / response.breakdown.length
                        : 0,
                    totalCost: response.summary.totalCost,
                    callsByService: response.breakdown.map((b: any) => ({
                        name: b._id || 'Unknown',
                        count: b.totalCalls
                    })),
                    errorsByType: response.breakdown
                        .filter((b: any) => b.errors > 0)
                        .map((b: any) => ({
                            name: b._id || 'Unknown',
                            count: b.errors
                        })),
                    latencyTrend: response.breakdown.map((b: any) => ({
                        timestamp: b._id || 'Unknown',
                        avgLatency: b.avgLatency || 0
                    })),
                    costTrend: response.breakdown.map((b: any) => ({
                        timestamp: b._id || 'Unknown',
                        totalCost: b.totalCost || 0
                    }))
                };
                setStats(transformedStats);
            }
        } catch (err: any) {
            console.error('Failed to fetch stats:', err);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [fetchLogs, fetchStats]);

    useEffect(() => {
        if (autoRefresh > 0 && !isRealtime) {
            const interval = setInterval(() => {
                fetchLogs();
                fetchStats();
            }, autoRefresh * 1000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, isRealtime, fetchLogs, fetchStats]);

    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(newFilters);
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    const handleRealtimeToggle = () => {
        setIsRealtime(!isRealtime);
        if (!isRealtime) {
            setLogs([]);
        }
    };

    const handleLogSelect = (log: any) => {
        setSelectedLog(log);
    };

    const handleCloseDetails = () => {
        setSelectedLog(null);
    };

    const handleRefresh = () => {
        fetchLogs();
        fetchStats();
    };

    const handleExport = async (format: 'json' | 'csv' | 'jsonl' = 'json') => {
        try {
            setLoading(true);
            const blob = await logsService.exportAILogs(filters, format);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-logs-${Date.now()}.${format === 'jsonl' ? 'jsonl' : format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setError(err.message || 'Failed to export logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Enhanced Header */}
            <div className="card mb-6 shadow-xl">
                <div className="px-6 py-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text-primary mb-1">
                                AI Operation Logs
                            </h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Monitor and analyze your AI operations in real-time
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Auto Refresh */}
                            {!isRealtime && (
                                <select
                                    value={autoRefresh}
                                    onChange={(e) => setAutoRefresh(Number(e.target.value))}
                                    className="px-4 py-2.5 text-sm rounded-lg border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl transition-all bg-light-panel dark:bg-dark-panel text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value={0}>No auto-refresh</option>
                                    <option value={10}>Every 10s</option>
                                    <option value={30}>Every 30s</option>
                                    <option value={60}>Every 1m</option>
                                </select>
                            )}

                            {/* Realtime Toggle */}
                            <button
                                onClick={handleRealtimeToggle}
                                className={`px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${isRealtime
                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                    : 'btn-ghost'
                                    }`}
                            >
                                <FiActivity className={isRealtime ? 'animate-pulse' : ''} />
                                {isRealtime ? 'Live Mode' : 'Historical'}
                            </button>

                            {/* Refresh */}
                            {!isRealtime && (
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="btn-ghost px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            )}

                            {/* Export */}
                            <div className="relative group">
                                <button
                                    onClick={() => handleExport('json')}
                                    className="btn-ghost px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2"
                                >
                                    <FiDownload />
                                    Export
                                </button>
                                <div className="absolute right-0 mt-2 w-40 card rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full px-4 py-2 text-left text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 rounded-t-lg transition-colors font-medium"
                                    >
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full px-4 py-2 text-left text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 transition-colors font-medium"
                                    >
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('jsonl')}
                                        className="w-full px-4 py-2 text-left text-sm text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 rounded-b-lg transition-colors font-medium"
                                    >
                                        JSONL
                                    </button>
                                </div>
                            </div>

                            {/* Toggle Filters - Mobile */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden btn-ghost px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <FiFilter />
                                Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6">
                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="w-80 flex-shrink-0">
                            <div className="sticky top-6">
                                <LogFilters onFilterChange={handleFilterChange} />
                            </div>
                        </aside>
                    )}

                    {/* Logs Content */}
                    <div className="flex-1 min-w-0">
                        {/* Stats Section */}
                        {!isRealtime && stats && (
                            <div className="mb-6">
                                <div className="card shadow-xl overflow-hidden">
                                    <button
                                        onClick={() => setStatsCollapsed(!statsCollapsed)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-primary-500/5 transition-colors"
                                    >
                                        <h3 className="text-lg font-bold gradient-text-primary">
                                            Statistics Overview
                                        </h3>
                                        <span className={`transform transition-transform text-light-text-secondary dark:text-dark-text-secondary ${statsCollapsed ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                    {!statsCollapsed && (
                                        <div className="px-6 pb-6 border-t border-primary-200/30 dark:border-primary-500/20">
                                            <LogStats stats={stats} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* View Mode Selector & Log Count */}
                        <div className="card shadow-xl mb-4 px-6 py-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2 bg-primary-500/10 rounded-lg p-1">
                                    <button
                                        onClick={() => handleViewModeChange('table')}
                                        className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 text-sm ${viewMode === 'table'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiTable />
                                        Table
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('timeline')}
                                        className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 text-sm ${viewMode === 'timeline'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiClock />
                                        Timeline
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('json')}
                                        className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 text-sm ${viewMode === 'json'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiCode />
                                        JSON
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold gradient-text-primary">
                                        {logs.length}
                                    </span>
                                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {logs.length === 1 ? 'log' : 'logs'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logs Display */}
                        <div className="card shadow-xl overflow-hidden">
                            {error && (
                                <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {loading && !isRealtime && (
                                <div className="flex items-center justify-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin glow-primary"></div>
                                        <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">Loading logs...</p>
                                    </div>
                                </div>
                            )}

                            {!loading && (
                                <>
                                    {isRealtime ? (
                                        <LogStream
                                            filters={filters}
                                            onNewLog={(newLog) => setLogs((prev) => [newLog, ...prev].slice(0, 500))}
                                        />
                                    ) : (
                                        <LogTable
                                            logs={logs}
                                            viewMode={viewMode}
                                            onSelectLog={handleLogSelect}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <LogDetails log={selectedLog} onClose={handleCloseDetails} />
            )}
        </div>
    );
};

export default Logs;
