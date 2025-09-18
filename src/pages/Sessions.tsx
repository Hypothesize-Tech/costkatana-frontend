import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsService, Session, SessionsSummary } from '../services/sessions.service';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Search, Calendar, Tag, AlertCircle, Activity, CheckCircle, DollarSign, Hash } from 'lucide-react';

export const Sessions: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [summary, setSummary] = useState<SessionsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        label: '',
        from: '',
        to: '',
        page: 1,
        limit: 20
    });
    const [totalPages, setTotalPages] = useState(1);

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
                userId: user?.id || undefined,
                label: filters.label || undefined,
                from: formatDateTime(filters.from),
                to: formatDateTime(filters.to),
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
            const summaryData = await sessionsService.getSessionsSummary(user?.id);
            setSummary(summaryData);
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchSessions();
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

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">Sessions</h1>
                    <p className="text-secondary-600 dark:text-secondary-300">Trace and visualize agent flows</p>
                </div>

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
                                        {formatDuration(summary.averageDuration)}
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

                        <button
                            onClick={handleSearch}
                            className="btn-primary"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                    {loading ? (
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
                                    {sessions.map(session => (
                                        <tr key={session._id} className="hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-success-500/5 transition-all duration-300">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusIcon(session.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm text-secondary-600 dark:text-secondary-300">
                                                    {session.sessionId.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {session.label && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent-500/20 to-warning-500/20 text-accent-600 dark:text-accent-400 border border-primary-200/30">
                                                        <Tag className="w-3 h-3" />
                                                        {session.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">
                                                {formatDate(session.startedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-secondary-500/20 to-accent-500/20 text-secondary-600 dark:text-secondary-400">
                                                    {formatDuration(session.summary?.totalDuration)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700 dark:text-secondary-300">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500/20 to-success-500/20 text-primary-600 dark:text-primary-400">
                                                    {session.summary?.totalSpans || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {session.summary?.totalCost ? (
                                                    <span className="text-success-600 dark:text-success-400 font-bold">
                                                        ${session.summary.totalCost.toFixed(4)}
                                                    </span>
                                                ) : (
                                                    <span className="text-secondary-600 dark:text-secondary-300">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/sessions/${session.sessionId}`)}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={filters.page === 1}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                        Page {filters.page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={filters.page === totalPages}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-lg shadow-sm backdrop-blur-sm hover:from-primary-500/10 hover:to-success-500/10 hover:border-primary-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
