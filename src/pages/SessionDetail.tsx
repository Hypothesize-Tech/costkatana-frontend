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
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !details?.session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
                <button
                    onClick={() => navigate('/sessions')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    Back to Sessions
                </button>
            </div>
        );
    }

    const session = details.session;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/sessions')}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                aria-label="Back to sessions"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Session Details
                                    {getStatusIcon(session.status)}
                                </h1>
                                <p className="text-sm text-gray-500 font-mono">{session.sessionId}</p>
                            </div>
                        </div>
                        {session.status === 'active' && (
                            <button
                                onClick={handleEndSession}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                End Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Started</p>
                                <p className="text-sm font-medium">{formatDate(session.startedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Duration</p>
                                <p className="text-lg font-bold">
                                    {formatDuration(session.summary?.totalDuration)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Spans</p>
                                <p className="text-lg font-bold">{session.summary?.totalSpans || 0}</p>
                            </div>
                            <Hash className="w-6 h-6 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Tokens</p>
                                <p className="text-lg font-bold">
                                    {((session.summary?.totalTokens?.input || 0) +
                                        (session.summary?.totalTokens?.output || 0)).toLocaleString()}
                                </p>
                            </div>
                            <Cpu className="w-6 h-6 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Cost</p>
                                <p className="text-lg font-bold text-green-600">
                                    ${session.summary?.totalCost?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {session.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-red-900">Session Error</h3>
                                <p className="text-red-700 mt-1">{session.error.message}</p>
                                {session.error.stack && (
                                    <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
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
