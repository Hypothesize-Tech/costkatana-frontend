import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsService, SessionGraph, SessionDetails, TraceNode } from '../services/sessions.service';
import { SessionTimeline } from '../components/sessions/SessionTimeline';
import { TraceTree } from '../components/sessions/TraceTree';
import { SpanDetails } from '../components/sessions/SpanDetails';
import { SessionDetailsExpanded } from '../components/SessionDetails/SessionDetailsExpanded';
import { ArrowLeft, AlertCircle, Activity, CheckCircle, DollarSign, Hash, Cpu } from 'lucide-react';
import { SessionReplay } from '../types/sessionReplay.types';
import { SessionDetailShimmer } from '../components/shimmer/SessionsShimmer';

export const SessionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [graph, setGraph] = useState<SessionGraph | null>(null);
    const [details, setDetails] = useState<SessionDetails | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
    const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);

    const fetchSessionData = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const [graphData, detailsData] = await Promise.all([
                sessionsService.getSessionGraph(id),
                sessionsService.getSessionDetails(id)
            ]);

            setGraph(graphData);
            setDetails(detailsData);
        } catch (err) {
            setError('Failed to load session data');
            console.error('Error fetching session data:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchSessionData();
        }
    }, [id, fetchSessionData]);

    useEffect(() => {
        if (selectedNodeId && graph) {
            const node = graph.nodes.find(n => n.id === selectedNodeId);
            setSelectedNode(node || null);
        } else {
            setSelectedNode(null);
        }
    }, [selectedNodeId, graph]);

    const handleEndSession = async () => {
        if (!id || !details?.session || details.session.status !== 'active') return;

        try {
            await sessionsService.endSession(id);
            await fetchSessionData();
        } catch (err) {
            console.error('Error ending session:', err);
        }
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}m`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString();
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'active':
                return <Activity className="w-5 h-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    if (loading) {
        return <SessionDetailShimmer />;
    }

    if (error || !details?.session) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
                <AlertCircle className="mb-4 w-12 h-12 text-danger-500" />
                <p className="mb-4 text-danger-600 dark:text-danger-400">{error || 'Session not found'}</p>
                <button
                    onClick={() => navigate('/sessions')}
                    className="btn-primary"
                >
                    Back to Sessions
                </button>
            </div>
        );
    }

    const session = details.session;

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            {/* Header */}
            <div className="mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-4 md:mt-6 mb-4 sm:mb-6 md:mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 mx-auto max-w-7xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex gap-2 sm:gap-4 items-center">
                            <button
                                onClick={() => navigate('/sessions')}
                                className="p-2 rounded-lg transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/20 flex-shrink-0"
                                aria-label="Back to sessions"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-700 dark:text-secondary-300" />
                            </button>
                            <div className="min-w-0 flex-1">
                                <h1 className="flex flex-wrap gap-2 items-center text-xl sm:text-2xl font-bold font-display gradient-text-primary">
                                    <span className="truncate">Session Details</span>
                                    {getStatusIcon(session.status)}
                                </h1>
                                <p className="font-mono text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 truncate">{session.sessionId}</p>
                            </div>
                        </div>
                        {session.status === 'active' && (
                            <button
                                onClick={handleEndSession}
                                className="btn btn-danger w-full sm:w-auto text-sm sm:text-base"
                            >
                                End Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">Started</p>
                                <p className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white break-words">{formatDate(session.startedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">Duration</p>
                                <p className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">
                                    {formatDuration(session.summary?.totalDuration)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">Spans</p>
                                <p className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">{session.summary?.totalSpans || 0}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20 flex-shrink-0">
                                <Hash className="w-4 h-4 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">Tokens</p>
                                <p className="text-base sm:text-lg font-bold font-display text-secondary-900 dark:text-white">
                                    {((session.summary?.totalTokens?.input || 0) +
                                        (session.summary?.totalTokens?.output || 0)).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-2 sm:p-3 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20 flex-shrink-0">
                                <Cpu className="w-4 h-4 sm:w-6 sm:h-6 text-highlight-600 dark:text-highlight-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">Total Cost</p>
                                <p className="text-base sm:text-lg font-bold font-display text-success-600 dark:text-success-400">
                                    ${session.summary?.totalCost?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            <div className="p-2 sm:p-3 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20 flex-shrink-0">
                                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-success-600 dark:text-success-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {session.error && (
                    <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                        <div className="flex gap-2 sm:gap-3 items-start">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-danger-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm sm:text-base font-medium text-danger-900 dark:text-danger-300">Session Error</h3>
                                <p className="mt-1 text-xs sm:text-sm text-danger-700 dark:text-danger-400 break-words">{session.error.message}</p>
                                {session.error.stack && (
                                    <pre className="overflow-x-auto p-2 mt-2 text-xs rounded text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20">
                                        {session.error.stack}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Interactions (for in-app sessions) */}
                {session.source === 'in-app' && session.replayData && session.replayData.aiInteractions && session.replayData.aiInteractions.length > 0 && (
                    <div className="p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold font-display gradient-text-primary">AI Interactions</h2>
                        <SessionDetailsExpanded session={session as unknown as SessionReplay} />
                    </div>
                )}

                {/* Trace Tree and Timeline (spans/traces) */}
                {graph && graph.nodes.length > 0 && (
                    <div className="mb-4 sm:mb-5 md:mb-6">
                        <div className="p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <h2 className="mb-2 sm:mb-3 md:mb-4 text-lg sm:text-xl font-bold font-display gradient-text-primary">Trace Spans</h2>
                            <p className="mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                                Click on any span to view detailed information
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
                            {/* Trace Tree */}
                            <div>
                                <TraceTree
                                    nodes={graph.nodes}
                                    edges={graph.edges}
                                    selectedNodeId={selectedNodeId}
                                    onNodeSelect={setSelectedNodeId}
                                />
                            </div>

                            {/* Timeline */}
                            <div>
                                <SessionTimeline
                                    nodes={graph.nodes}
                                    selectedNodeId={selectedNodeId}
                                    onNodeClick={setSelectedNodeId}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Span Details Drawer */}
            {selectedNode && details && (
                <SpanDetails
                    node={selectedNode}
                    messages={details.messages}
                    onClose={() => setSelectedNodeId(undefined)}
                />
            )}
        </div>
    );
};
