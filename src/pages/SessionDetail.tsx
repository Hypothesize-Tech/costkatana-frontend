import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (id) {
            fetchSessionData();
        }
    }, [id]);

    useEffect(() => {
        if (selectedNodeId && graph) {
            const node = graph.nodes.find(n => n.id === selectedNodeId);
            setSelectedNode(node || null);
        } else {
            setSelectedNode(null);
        }
    }, [selectedNodeId, graph]);

    const fetchSessionData = async () => {
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
    };

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
            <div className="mx-6 mt-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="px-6 py-6 mx-auto max-w-7xl">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={() => navigate('/sessions')}
                                className="p-2 rounded-lg transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/20"
                                aria-label="Back to sessions"
                            >
                                <ArrowLeft className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
                            </button>
                            <div>
                                <h1 className="flex gap-2 items-center text-2xl font-bold font-display gradient-text-primary">
                                    Session Details
                                    {getStatusIcon(session.status)}
                                </h1>
                                <p className="font-mono text-sm text-secondary-600 dark:text-secondary-300">{session.sessionId}</p>
                            </div>
                        </div>
                        {session.status === 'active' && (
                            <button
                                onClick={handleEndSession}
                                className="btn btn-danger"
                            >
                                End Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="px-6 py-6 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-5">
                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Started</p>
                                <p className="text-lg font-bold font-display text-secondary-900 dark:text-white">{formatDate(session.startedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Duration</p>
                                <p className="text-lg font-bold font-display text-secondary-900 dark:text-white">
                                    {formatDuration(session.summary?.totalDuration)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Spans</p>
                                <p className="text-lg font-bold font-display text-secondary-900 dark:text-white">{session.summary?.totalSpans || 0}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20">
                                <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Tokens</p>
                                <p className="text-lg font-bold font-display text-secondary-900 dark:text-white">
                                    {((session.summary?.totalTokens?.input || 0) +
                                        (session.summary?.totalTokens?.output || 0)).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20">
                                <Cpu className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Total Cost</p>
                                <p className="text-lg font-bold font-display text-success-600 dark:text-success-400">
                                    ${session.summary?.totalCost?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
                                <DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {session.error && (
                    <div className="p-6 mb-6 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                        <div className="flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-danger-900 dark:text-danger-300">Session Error</h3>
                                <p className="mt-1 text-danger-700 dark:text-danger-400">{session.error.message}</p>
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
                    <div className="p-6 mb-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <h2 className="mb-4 text-xl font-bold font-display gradient-text-primary">AI Interactions</h2>
                        <SessionDetailsExpanded session={session as any as SessionReplay} />
                    </div>
                )}

                {/* Trace Tree and Timeline (spans/traces) */}
                {graph && graph.nodes.length > 0 && (
                    <div className="mb-6">
                        <div className="p-6 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                            <h2 className="mb-4 text-xl font-bold font-display gradient-text-primary">Trace Spans</h2>
                            <p className="mb-4 text-sm text-secondary-600 dark:text-secondary-300">
                                Click on any span to view detailed information
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
