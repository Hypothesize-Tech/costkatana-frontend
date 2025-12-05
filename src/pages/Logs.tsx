import React, { useState, useEffect, useCallback } from 'react';
import {
    LogFilters,
    LogTable,
    LogStream,
    LogStats,
    LogDetails,
    LogDashboard,
    LogChatWidget
} from '../components/logs';
import { FiFilter, FiRefreshCw, FiDownload, FiActivity, FiTable, FiClock, FiCode, FiGrid, FiZap } from 'react-icons/fi';
import { logsService } from '../services/logs.service';
import { LogsShimmer } from '../components/shimmer/LogsShimmer';

type ViewMode = 'table' | 'timeline' | 'json' | 'dashboard';

export const Logs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [isRealtime, setIsRealtime] = useState<boolean>(false);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState<boolean>(true);
    const [statsCollapsed, setStatsCollapsed] = useState<boolean>(false);
    const [autoRefresh, setAutoRefresh] = useState<number>(0);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const handleApplyToDashboard = useCallback((visualization: any, data: any[]) => {
        // Call the dashboard's apply handler if it exists
        if ((window as any).__dashboardApplyHandler) {
            (window as any).__dashboardApplyHandler(visualization, data);
        }
        // Close the chat after applying
        setIsChatOpen(false);
    }, []);

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

    // Show shimmer on initial load (after all hooks)
    if (loading && logs.length === 0 && !stats && !isRealtime) {
        return <LogsShimmer viewMode={viewMode} />;
    }

    return (
        <div className="min-h-screen">
            {/* Enhanced Header */}
            <div className="mb-4 md:mb-6 shadow-xl card">
                <div className="px-4 py-4 md:px-6 md:py-5">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 justify-between items-start sm:items-center">
                        <div className="w-full sm:w-auto">
                            <h1 className="mb-1 text-2xl sm:text-3xl font-bold gradient-text-primary">
                                AI Operation Logs
                            </h1>
                            <p className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">
                                Monitor and analyze your AI operations in real-time
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:gap-3 items-center w-full sm:w-auto">
                            {/* AI Assistant Toggle - Only show in dashboard view */}
                            {viewMode === 'dashboard' && (
                                <button
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 flex items-center gap-2 ${isChatOpen
                                        ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                        : 'btn-ghost'
                                        }`}
                                >
                                    <FiZap className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="hidden sm:inline">{isChatOpen ? 'Close AI Assistant' : 'AI Assistant'}</span>
                                    <span className="sm:hidden">AI</span>
                                </button>
                            )}

                            {/* Auto Refresh */}
                            {!isRealtime && (
                                <select
                                    value={autoRefresh}
                                    onChange={(e) => setAutoRefresh(Number(e.target.value))}
                                    className="px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl transition-all bg-light-panel dark:bg-dark-panel text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                                className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-semibold flex items-center gap-2 transition-all duration-300 ${isRealtime
                                    ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                    : 'btn-ghost'
                                    }`}
                            >
                                <FiActivity className={`w-4 h-4 md:w-5 md:h-5 ${isRealtime ? 'animate-pulse' : ''}`} />
                                <span className="hidden sm:inline">{isRealtime ? 'Live Mode' : 'Historical'}</span>
                                <span className="sm:hidden">{isRealtime ? 'Live' : 'Hist'}</span>
                            </button>

                            {/* Refresh */}
                            {!isRealtime && (
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="btn-ghost px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiRefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            )}

                            {/* Export */}
                            <div className="relative group">
                                <button
                                    onClick={() => handleExport('json')}
                                    className="btn-ghost px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-semibold flex items-center gap-2"
                                >
                                    <FiDownload className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                                <div className="absolute right-0 invisible z-50 mt-2 w-40 rounded-lg shadow-2xl opacity-0 transition-all card group-hover:opacity-100 group-hover:visible">
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="px-4 py-2 w-full text-sm font-medium text-left rounded-t-lg transition-colors text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10"
                                    >
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="px-4 py-2 w-full text-sm font-medium text-left transition-colors text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10"
                                    >
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('jsonl')}
                                        className="px-4 py-2 w-full text-sm font-medium text-left rounded-b-lg transition-colors text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10"
                                    >
                                        JSONL
                                    </button>
                                </div>
                            </div>

                            {/* Toggle Filters - Mobile */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden btn-ghost px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm md:text-base font-semibold flex items-center gap-2"
                            >
                                <FiFilter className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <aside className="flex-shrink-0 w-full lg:w-80">
                            <div className="sticky top-4 md:top-6">
                                <LogFilters onFilterChange={handleFilterChange} />
                            </div>
                        </aside>
                    )}

                    {/* Logs Content */}
                    <div className="flex-1 min-w-0">
                        {/* AI Chat Widget - Shows between header and stats when dashboard view is active */}
                        {viewMode === 'dashboard' && isChatOpen && (
                            <div className="mb-6">
                                <LogChatWidget
                                    isOpen={isChatOpen}
                                    onClose={() => setIsChatOpen(false)}
                                    onApplyToDashboard={handleApplyToDashboard}
                                    currentFilters={filters}
                                />
                            </div>
                        )}

                        {/* Stats Section */}
                        {!isRealtime && stats && (
                            <div className="mb-4 md:mb-6">
                                <div className="overflow-hidden shadow-xl card">
                                    <button
                                        onClick={() => setStatsCollapsed(!statsCollapsed)}
                                        className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 w-full text-left transition-colors hover:bg-primary-500/5"
                                    >
                                        <h3 className="text-base md:text-lg font-bold gradient-text-primary">
                                            Statistics Overview
                                        </h3>
                                        <span className={`transform transition-transform text-light-text-secondary dark:text-dark-text-secondary ${statsCollapsed ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                    {!statsCollapsed && (
                                        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-primary-200/30 dark:border-primary-500/20">
                                            <LogStats stats={stats} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* View Mode Selector & Log Count */}
                        <div className="px-4 md:px-6 py-3 md:py-4 mb-4 shadow-xl card">
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 justify-between items-start sm:items-center">
                                <div className="flex flex-wrap gap-1.5 md:gap-2 items-center p-1 rounded-lg bg-primary-500/10 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleViewModeChange('dashboard')}
                                        className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 md:gap-2 ${viewMode === 'dashboard'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="hidden sm:inline">Dashboard</span>
                                        <span className="sm:hidden">Dash</span>
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('table')}
                                        className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 md:gap-2 ${viewMode === 'table'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiTable className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        Table
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('timeline')}
                                        className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 md:gap-2 ${viewMode === 'timeline'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiClock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        <span className="hidden sm:inline">Timeline</span>
                                        <span className="sm:hidden">Time</span>
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('json')}
                                        className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 md:gap-2 ${viewMode === 'json'
                                            ? 'bg-gradient-primary text-white shadow-lg glow-primary'
                                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        <FiCode className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        JSON
                                    </button>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <span className="text-sm md:text-base font-bold gradient-text-primary">
                                        {logs.length}
                                    </span>
                                    <span className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">
                                        {logs.length === 1 ? 'log' : 'logs'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logs Display */}
                        {viewMode === 'dashboard' ? (
                            <LogDashboard
                                onApplyQueryToDashboard={handleApplyToDashboard}
                            />
                        ) : (
                            <div className="overflow-hidden shadow-xl card">
                                {error && (
                                    <div className="px-6 py-4 bg-red-50 border-b border-red-200 dark:bg-red-900/20 dark:border-red-800">
                                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {loading && !isRealtime && logs.length === 0 && (
                                    <LogsShimmer viewMode={viewMode} />
                                )}

                                {!loading && (
                                    <>
                                        {isRealtime ? (
                                            <LogStream
                                                filters={filters}
                                                onNewLog={(newLog: any) => setLogs((prev) => [newLog, ...prev].slice(0, 500))}
                                            />
                                        ) : (
                                            <LogTable
                                                logs={logs}
                                                viewMode={viewMode as 'table' | 'timeline' | 'json'}
                                                onSelectLog={handleLogSelect}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
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
