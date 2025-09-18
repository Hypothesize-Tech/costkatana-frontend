import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsService, SessionGraph, SessionDetails, TraceNode } from '../services/sessions.service';
import { SessionTimeline } from '../components/sessions/SessionTimeline';
import { TraceTree } from '../components/sessions/TraceTree';
import { SpanDetails } from '../components/sessions/SpanDetails';
import { ArrowLeft, Loader, AlertCircle, Activity, CheckCircle, DollarSign, Hash, Cpu } from 'lucide-react';

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
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error || !details?.session) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-danger-500 mb-4" />
                <p className="text-danger-600 dark:text-danger-400 mb-4">{error || 'Session not found'}</p>
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
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mx-6 mt-6 mb-8">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/sessions')}
                                className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                aria-label="Back to sessions"
                            >
                                <ArrowLeft className="w-5 h-5 text-secondary-700 dark:text-secondary-300" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-display font-bold gradient-text-primary flex items-center gap-2">
                                    Session Details
                                    {getStatusIcon(session.status)}
                                </h1>
                                <p className="text-sm text-secondary-600 dark:text-secondary-300 font-mono">{session.sessionId}</p>
                            </div>
                        </div>
                        {session.status === 'active' && (
                            <button
                                onClick={handleEndSession}
                                className="btn-danger"
                            >
                                End Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Started</p>
                                <p className="text-lg font-display font-bold text-secondary-900 dark:text-white">{formatDate(session.startedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Duration</p>
                                <p className="text-lg font-display font-bold text-secondary-900 dark:text-white">
                                    {formatDuration(session.summary?.totalDuration)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Spans</p>
                                <p className="text-lg font-display font-bold text-secondary-900 dark:text-white">{session.summary?.totalSpans || 0}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Tokens</p>
                                <p className="text-lg font-display font-bold text-secondary-900 dark:text-white">
                                    {((session.summary?.totalTokens?.input || 0) +
                                        (session.summary?.totalTokens?.output || 0)).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-highlight-500/20 to-highlight-600/20">
                                <Cpu className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-600 dark:text-secondary-300 text-sm font-medium">Total Cost</p>
                                <p className="text-lg font-display font-bold text-success-600 dark:text-success-400">
                                    ${session.summary?.totalCost?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20">
                                <DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {session.error && (
                    <div className="glass rounded-xl border border-danger-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-danger-900 dark:text-danger-300">Session Error</h3>
                                <p className="text-danger-700 dark:text-danger-400 mt-1">{session.error.message}</p>
                                {session.error.stack && (
                                    <pre className="text-xs text-danger-600 dark:text-danger-400 mt-2 overflow-x-auto bg-danger-50 dark:bg-danger-900/20 p-2 rounded">
                                        {session.error.stack}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trace Tree */}
                    <div>
                        {graph && (
                            <TraceTree
                                nodes={graph.nodes}
                                edges={graph.edges}
                                selectedNodeId={selectedNodeId}
                                onNodeSelect={setSelectedNodeId}
                            />
                        )}
                    </div>

                    {/* Timeline */}
                    <div>
                        {graph && (
                            <SessionTimeline
                                nodes={graph.nodes}
                                selectedNodeId={selectedNodeId}
                                onNodeClick={setSelectedNodeId}
                            />
                        )}
                    </div>
                </div>
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
