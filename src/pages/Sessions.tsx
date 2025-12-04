import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsService, Session, SessionsSummary } from '../services/sessions.service';
import { Loader, Search, Calendar, Tag, AlertCircle, Activity, CheckCircle, DollarSign, Hash, ChevronRight, ChevronDown } from 'lucide-react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { getSessionDisplayInfo } from '../types/sessionReplay.types';
import { SessionDetailsExpanded } from '../components/SessionDetails/SessionDetailsExpanded';
import { SessionAnalyticsCharts } from '../components/sessions/SessionAnalyticsCharts';
import { exportData } from '../utils/exportSessions';
import { SessionsDebugShimmer } from '../components/shimmer/SessionsShimmer';

export const Sessions: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [summary, setSummary] = useState<SessionsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        label: '',
        from: '',
        to: '',
        status: '', // 'active' | 'completed' | 'error' | ''
        source: '', // 'telemetry' | 'manual' | 'in-app' | 'integration' | ''
        minCost: '',
        maxCost: '',
        minSpans: '',
        maxSpans: '',
        page: 1,
        limit: 20
    });
    const [totalPages, setTotalPages] = useState(1);
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

    const toggleSessionExpansion = (sessionId: string) => {
        setExpandedSessions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        fetchSessions();
        fetchSummary();
    }, [filters.page]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Format datetime strings to ensure they have seconds
            const formatDateTime = (dateStr: string) => {
                if (!dateStr) return undefined;
                // If datetime doesn't have seconds, add :00
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
                    return dateStr + ':00';
                }
                return dateStr;
            };

            const response = await sessionsService.listSessions({
                label: filters.label || undefined,
                from: formatDateTime(filters.from),
                to: formatDateTime(filters.to),
                status: filters.status || undefined,
                source: filters.source || undefined,
                minCost: filters.minCost ? parseFloat(filters.minCost) : undefined,
                maxCost: filters.maxCost ? parseFloat(filters.maxCost) : undefined,
                minSpans: filters.minSpans ? parseInt(filters.minSpans) : undefined,
                maxSpans: filters.maxSpans ? parseInt(filters.maxSpans) : undefined,
                page: filters.page,
                limit: filters.limit
            });
            setSessions(response.sessions);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError('Failed to load sessions');
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const summaryData = await sessionsService.getSessionsSummary();
            setSummary(summaryData);
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchSessions();
    };

    const handleClearFilters = () => {
        setFilters({
            label: '',
            from: '',
            to: '',
            status: '',
            source: '',
            minCost: '',
            maxCost: '',
            minSpans: '',
            maxSpans: '',
            page: 1,
            limit: 20
        });
    };

    const handleExportSessions = (format: 'json' | 'excel') => {
        exportData(sessions, format, 'sessions', 'sessions-export');
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Activity className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    if (loading && sessions.length === 0 && !summary) {
        return <SessionsDebugShimmer />;
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">

                {/* Export Button */}
                {sessions.length > 0 && (
                    <div className="flex justify-end mb-6">
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300">
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                Export Sessions
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel origin-top-right focus:outline-none">
                                    <div className="py-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleExportSessions('json')}
                                                    className={`btn ${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
                                                        } group flex items-center px-4 py-2 text-sm w-full text-left rounded-lg mx-2 transition-colors`}
                                                >
                                                    Export as JSON
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleExportSessions('excel')}
                                                    className={`btn ${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
                                                        } group flex items-center px-4 py-2 text-sm w-full text-left rounded-lg mx-2 transition-colors`}
                                                >
                                                    Export as Excel
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                )}

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Total Sessions</p>
                                    <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white">{summary.totalSessions}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                    <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Active</p>
                                    <p className="text-2xl font-display font-bold text-highlight-600 dark:text-highlight-400">{summary.activeSessions}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-highlight-500/20 to-highlight-600/20">
                                    <Activity className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Total Cost</p>
                                    <p className="text-2xl font-display font-bold text-success-600 dark:text-success-400">
                                        ${summary.totalCost.toFixed(4)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20">
                                    <DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
                                </div>
                            </div>
                        </div>

                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Avg Duration</p>
                                    <p className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                                        {formatDuration(
                                            sessions.length > 0
                                                ? sessions.reduce((sum, s) => {
                                                    const duration = s.duration ||
                                                        (s.endedAt ? new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime() :
                                                            Date.now() - new Date(s.startedAt).getTime());
                                                    return sum + duration;
                                                }, 0) / sessions.length
                                                : 0
                                        )}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20">
                                    <Activity className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-6">
                    <div className="space-y-4">
                        {/* Row 1: Basic Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="text"
                                    placeholder="Search by label..."
                                    className="input pl-10"
                                    value={filters.label}
                                    onChange={(e) => setFilters(prev => ({ ...prev, label: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="datetime-local"
                                    className="input pl-10"
                                    value={filters.from}
                                    onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                                />
                            </div>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="datetime-local"
                                    className="input pl-10"
                                    value={filters.to}
                                    onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                                />
                            </div>

                            <select
                                className="input"
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="error">Error</option>
                            </select>
                        </div>

                        {/* Row 2: Advanced Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <select
                                className="input"
                                value={filters.source}
                                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                            >
                                <option value="">All Sources</option>
                                <option value="telemetry">Telemetry</option>
                                <option value="manual">Manual</option>
                                <option value="in-app">In-App</option>
                                <option value="integration">Integration</option>
                            </select>

                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="number"
                                    step="0.0001"
                                    placeholder="Min Cost"
                                    className="input pl-10"
                                    value={filters.minCost}
                                    onChange={(e) => setFilters(prev => ({ ...prev, minCost: e.target.value }))}
                                />
                            </div>

                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="number"
                                    step="0.0001"
                                    placeholder="Max Cost"
                                    className="input pl-10"
                                    value={filters.maxCost}
                                    onChange={(e) => setFilters(prev => ({ ...prev, maxCost: e.target.value }))}
                                />
                            </div>

                            <div className="relative">
                                <Hash className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="number"
                                    placeholder="Min Spans"
                                    className="input pl-10"
                                    value={filters.minSpans}
                                    onChange={(e) => setFilters(prev => ({ ...prev, minSpans: e.target.value }))}
                                />
                            </div>

                            <div className="relative">
                                <Hash className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                <input
                                    type="number"
                                    placeholder="Max Spans"
                                    className="input pl-10"
                                    value={filters.maxSpans}
                                    onChange={(e) => setFilters(prev => ({ ...prev, maxSpans: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Row 3: Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSearch}
                                className="btn btn-primary flex-1 md:flex-none"
                            >
                                Search
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="btn btn-secondary flex-1 md:flex-none"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analytics Charts */}
                {(sessions.length > 0 || (filters.from && filters.to)) && (
                    <div className="mb-6">
                        <SessionAnalyticsCharts
                            sessions={sessions}
                            dateFrom={filters.from || undefined}
                            dateTo={filters.to || undefined}
                        />
                    </div>
                )}

                {/* Sessions List */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                    {loading && sessions.length > 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
                            <p className="text-danger-600 dark:text-danger-400">{error}</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-secondary-500 dark:text-secondary-400">No sessions found</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead className="glass rounded-lg border border-primary-200/20 bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">

                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Session ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Label
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Started
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Spans
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="glass bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-y divide-primary-200/20">
                                    {sessions.map(session => {
                                        const isExpanded = expandedSessions.has(session.sessionId);
                                        const displayInfo = getSessionDisplayInfo(session as any);

                                        return (
                                            <React.Fragment key={session._id}>
                                                <tr className="hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-success-500/5 transition-all duration-300">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => toggleSessionExpansion(session.sessionId)}
                                                            className="btn text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusIcon(session.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{displayInfo.icon}</span>
                                                            <div className="flex flex-col">
                                                                <span className="font-mono text-sm text-secondary-600 dark:text-secondary-300">
                                                                    {session.sessionId.substring(0, 8)}...
                                                                </span>
                                                                <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                                                    {displayInfo.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {(session.label || (session.metadata as any)?.label || displayInfo.label) && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent-500/20 to-warning-500/20 text-accent-600 dark:text-accent-400 border border-primary-200/30">
                                                                <Tag className="w-3 h-3" />
                                                                {session.label || (session.metadata as any)?.label || displayInfo.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">
                                                        {formatDate(session.startedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-secondary-500/20 to-accent-500/20 text-secondary-600 dark:text-secondary-400">
                                                            {session.duration ? formatDuration(session.duration) :
                                                                (session.endedAt ? formatDuration(new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) :
                                                                    formatDuration(Date.now() - new Date(session.startedAt).getTime()))}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500/20 to-success-500/20 text-primary-600 dark:text-primary-400">
                                                            {session.summary?.totalSpans || 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {(session.summary?.totalCost !== undefined && session.summary?.totalCost !== null) ? (
                                                            <span className="text-success-600 dark:text-success-400 font-bold">
                                                                ${session.summary.totalCost.toFixed(4)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-secondary-600 dark:text-secondary-300">$0.0000</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => navigate(`/sessions/${session.sessionId}`)}
                                                            className="btn inline-flex items-center px-3 py-1.5 text-xs font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Details Row */}
                                                {isExpanded && (
                                                    <tr className="bg-secondary-50 dark:bg-secondary-900/30">
                                                        <td colSpan={9} className="px-6 py-4">
                                                            <SessionDetailsExpanded session={session as any} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={filters.page === 1}
                                        className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                        Page {filters.page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={filters.page === totalPages}
                                        className="btn btn-primary inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
