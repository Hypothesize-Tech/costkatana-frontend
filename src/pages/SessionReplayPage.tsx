import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionReplayPlayer } from '../components/SessionReplay/SessionReplayPlayer';
import { TimelineView } from '../components/SessionReplay/TimelineView';
import { SessionPlayerData, SessionListResponse, getSessionDisplayInfo, SessionFilters } from '../types/sessionReplay.types';
import { API_BASE_URL } from '../config/api';
import { Filter, X, Search, Calendar, DollarSign, Clock, Activity, ChevronDown, ChevronUp } from 'lucide-react';

export const SessionReplayPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId?: string }>();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<SessionListResponse['data']>([]);
    const [selectedSession, setSelectedSession] = useState<SessionPlayerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTimeline, setShowTimeline] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSessions, setTotalSessions] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState<SessionFilters>({
        searchQuery: '',
        source: undefined,
        status: undefined,
        appFeature: undefined,
        from: undefined,
        to: undefined,
        minCost: undefined,
        maxCost: undefined,
        minDuration: undefined,
        maxDuration: undefined,
        sortBy: 'startedAt',
        sortOrder: 'desc'
    });

    // Build query parameters from filters
    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '20');

        if (filters.searchQuery) params.append('search', filters.searchQuery);
        if (filters.source) params.append('source', filters.source);
        if (filters.status) params.append('status', filters.status);
        if (filters.appFeature) params.append('appFeature', filters.appFeature);
        if (filters.from) params.append('from', filters.from.toISOString());
        if (filters.to) params.append('to', filters.to.toISOString());
        if (filters.minCost !== undefined) params.append('minCost', filters.minCost.toString());
        if (filters.maxCost !== undefined) params.append('maxCost', filters.maxCost.toString());
        if (filters.minDuration !== undefined) params.append('minDuration', filters.minDuration.toString());
        if (filters.maxDuration !== undefined) params.append('maxDuration', filters.maxDuration.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

        return params.toString();
    }, [page, filters]);

    // Fetch sessions list
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('access_token');
                const queryParams = buildQueryParams();
                const response = await fetch(
                    `${API_BASE_URL}/api/session-replay/list?${queryParams}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch sessions');
                }

                const data: SessionListResponse = await response.json();
                setSessions(data.data);
                setTotalPages(data.meta.totalPages);
                setTotalSessions(data.meta.total);
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError(err instanceof Error ? err.message : 'Failed to load sessions');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [page, buildQueryParams]);

    // Fetch selected session data
    useEffect(() => {
        if (!sessionId) {
            setSelectedSession(null);
            return;
        }

        const fetchSessionData = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('access_token');
                const response = await fetch(
                    `${API_BASE_URL}/api/session-replay/${sessionId}/player`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch session data');
                }

                const data = await response.json();
                setSelectedSession(data.data);
            } catch (err) {
                console.error('Error fetching session data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load session');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionData();
    }, [sessionId]);

    const handleSelectSession = (session: SessionListResponse['data'][0]) => {
        navigate(`/sessions/replay/${session.sessionId}`);
    };

    const handleFilterChange = (key: keyof SessionFilters, value: string | number | Date | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page when filters change
    };

    const handleSearch = () => {
        // Trigger search - already handled by useEffect watching buildQueryParams
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            searchQuery: '',
            source: undefined,
            status: undefined,
            appFeature: undefined,
            from: undefined,
            to: undefined,
            minCost: undefined,
            maxCost: undefined,
            minDuration: undefined,
            maxDuration: undefined,
            sortBy: 'startedAt',
            sortOrder: 'desc'
        });
        setPage(1);
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.searchQuery) count++;
        if (filters.source) count++;
        if (filters.status) count++;
        if (filters.appFeature) count++;
        if (filters.from || filters.to) count++;
        if (filters.minCost !== undefined || filters.maxCost !== undefined) count++;
        if (filters.minDuration !== undefined || filters.maxDuration !== undefined) count++;
        return count;
    };

    if (loading && !selectedSession && sessions.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <div className="glass rounded-xl p-8 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30">
                    <div className="text-secondary-900 dark:text-secondary-100 text-xl">Loading sessions...</div>
                </div>
            </div>
        );
    }

    if (error && !selectedSession) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <div className="glass rounded-xl p-8 bg-gradient-light-panel dark:bg-gradient-dark-panel border border-red-200/30">
                    <div className="text-red-600 dark:text-red-400 text-xl">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-[1920px] mx-auto">
                {/* Header with Filters */}
                <div className="mb-6 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold gradient-text-primary flex items-center gap-3">
                                <Activity className="w-8 h-8" />
                                Session Replay
                            </h1>
                            <p className="text-secondary-600 dark:text-secondary-400 mt-2">
                                {totalSessions} total sessions • {sessions.length} shown
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-medium glow-primary"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {getActiveFilterCount() > 0 && (
                                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                    {getActiveFilterCount()}
                                </span>
                            )}
                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="pt-4 border-t border-primary-200/30">
                            <div className="space-y-4">
                                {/* Row 1: Search and Basic Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                        <input
                                            type="text"
                                            placeholder="Search by label or ID..."
                                            className="input pl-10"
                                            value={filters.searchQuery}
                                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>

                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                        <input
                                            type="date"
                                            className="input pl-10"
                                            value={filters.from?.toISOString().split('T')[0] || ''}
                                            onChange={(e) => handleFilterChange('from', e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    </div>

                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                        <input
                                            type="date"
                                            className="input pl-10"
                                            value={filters.to?.toISOString().split('T')[0] || ''}
                                            onChange={(e) => handleFilterChange('to', e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                    </div>

                                    <select
                                        className="input"
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>

                                {/* Row 2: Advanced Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <select
                                        className="input"
                                        value={filters.source || ''}
                                        onChange={(e) => handleFilterChange('source', e.target.value || undefined)}
                                    >
                                        <option value="">All Sources</option>
                                        <option value="in-app">In-App</option>
                                        <option value="integration">Integration</option>
                                        <option value="telemetry">Telemetry</option>
                                        <option value="manual">Manual</option>
                                        <option value="unified">Unified</option>
                                    </select>

                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Min Cost"
                                            className="input pl-10"
                                            value={filters.minCost || ''}
                                            onChange={(e) => handleFilterChange('minCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </div>

                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Max Cost"
                                            className="input pl-10"
                                            value={filters.maxCost || ''}
                                            onChange={(e) => handleFilterChange('maxCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </div>

                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                                        <input
                                            type="number"
                                            placeholder="Min Duration (min)"
                                            className="input pl-10"
                                            value={filters.minDuration ? filters.minDuration / 60000 : ''}
                                            onChange={(e) => handleFilterChange('minDuration', e.target.value ? parseInt(e.target.value) * 60000 : undefined)}
                                        />
                                    </div>

                                    <select
                                        className="input"
                                        value={filters.sortBy || 'startedAt'}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    >
                                        <option value="startedAt">Sort: Date</option>
                                        <option value="totalCost">Sort: Cost</option>
                                        <option value="duration">Sort: Duration</option>
                                        <option value="totalTokens">Sort: Tokens</option>
                                    </select>
                                </div>

                                {/* Row 3: Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSearch}
                                        className="btn btn-primary flex-1 md:flex-none"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Search
                                    </button>
                                    <button
                                        onClick={clearFilters}
                                        className="btn btn-secondary flex-1 md:flex-none"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="btn btn-secondary px-4"
                                        title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                    >
                                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Session List Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
                            <div className="p-4 border-b border-primary-200/30">
                                <h2 className="text-lg font-display font-semibold gradient-text-primary">Sessions</h2>
                                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{sessions.length} shown</p>
                            </div>

                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                {sessions.map((session) => {
                                    const displayInfo = getSessionDisplayInfo(session);
                                    return (
                                        <button
                                            key={session.sessionId}
                                            onClick={() => handleSelectSession(session)}
                                            className={`w-full text-left p-4 border-b border-primary-200/20 hover:bg-primary-500/10 transition-all ${sessionId === session.sessionId
                                                ? 'bg-gradient-primary/20 border-l-4 border-l-primary-500'
                                                : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-secondary-900 dark:text-secondary-100 truncate text-sm">
                                                            {session.label || displayInfo.label}
                                                        </span>
                                                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                                            {displayInfo.type} • {new Date(session.startedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ml-2 font-medium flex-shrink-0 ${session.status === 'completed' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                                                    session.status === 'active' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' :
                                                        session.status === 'error' ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400' :
                                                            'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 text-xs mt-2">
                                                {session.source && (
                                                    <span className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-full">
                                                        {session.source}
                                                    </span>
                                                )}
                                                {session.sessionReplayEnabled && (
                                                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                                                        ●  Replay
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-primary-200/30 flex justify-between items-center">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn btn-primary px-3 py-1.5 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-secondary-600 dark:text-secondary-400 text-sm font-medium">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="btn btn-primary px-3 py-1.5 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-9">
                        {selectedSession ? (
                            <div className="grid grid-cols-12 gap-6">
                                {/* Player */}
                                <div className={`${showTimeline ? 'col-span-12 xl:col-span-8' : 'col-span-12'} transition-all`}>
                                    <SessionReplayPlayer sessionData={selectedSession} />
                                </div>

                                {/* Timeline Sidebar */}
                                {showTimeline && (
                                    <div className="col-span-12 xl:col-span-4">
                                        <TimelineView
                                            sessionData={selectedSession}
                                            onSelectEvent={setCurrentIndex}
                                            currentIndex={currentIndex}
                                        />
                                    </div>
                                )}

                                {/* Timeline Toggle Button */}
                                <button
                                    onClick={() => setShowTimeline(!showTimeline)}
                                    className="fixed bottom-8 right-8 z-10 px-4 py-2 bg-gradient-primary text-white rounded-lg shadow-xl hover:shadow-2xl transition-all font-medium glow-primary"
                                >
                                    {showTimeline ? '← Hide Timeline' : 'Show Timeline →'}
                                </button>
                            </div>
                        ) : (
                            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-16 flex items-center justify-center min-h-[600px]">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎬</div>
                                    <h3 className="text-2xl font-display font-bold gradient-text-primary mb-2">
                                        Select a Session to Replay
                                    </h3>
                                    <p className="text-lg text-secondary-600 dark:text-secondary-400">
                                        Choose a session from the list to start playback
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionReplayPage;
