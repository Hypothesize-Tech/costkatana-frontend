import React, { useState, useEffect } from 'react';
import { 
    Loader, 
    RefreshCw, 
    ExternalLink, 
    RotateCcw, 
    ArrowUpCircle,
    Clock,
    GitBranch,
    CheckCircle,
    XCircle,
    AlertCircle,
    Play
} from 'lucide-react';
import vercelService, { VercelDeployment, VercelProject } from '../../services/vercel.service';

interface VercelDeploymentPanelProps {
    connectionId: string;
    project: VercelProject;
    onClose?: () => void;
}

const VercelDeploymentPanel: React.FC<VercelDeploymentPanelProps> = ({
    connectionId,
    project,
    onClose
}) => {
    const [loading, setLoading] = useState(false);
    const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'deployments' | 'logs'>('deployments');
    const [logs, setLogs] = useState<string[]>([]);
    const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);

    useEffect(() => {
        loadDeployments();
    }, [connectionId, project.id]);

    const loadDeployments = async () => {
        try {
            setLoading(true);
            setError(null);
            const deps = await vercelService.getDeployments(connectionId, project.id, 10);
            setDeployments(deps);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load deployments');
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async (target: 'production' | 'preview' = 'preview') => {
        try {
            setActionLoading('deploy');
            await vercelService.triggerDeployment(connectionId, project.id, { target });
            await loadDeployments();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to trigger deployment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRollback = async (deploymentId: string) => {
        try {
            setActionLoading(deploymentId);
            await vercelService.rollbackDeployment(connectionId, deploymentId, project.id);
            await loadDeployments();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to rollback deployment');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromote = async (deploymentId: string) => {
        try {
            setActionLoading(deploymentId);
            await vercelService.promoteDeployment(connectionId, deploymentId);
            await loadDeployments();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to promote deployment');
        } finally {
            setActionLoading(null);
        }
    };

    const loadLogs = async (deploymentId: string) => {
        try {
            setSelectedDeployment(deploymentId);
            setActiveTab('logs');
            setLoading(true);
            const deploymentLogs = await vercelService.getDeploymentLogs(connectionId, deploymentId);
            setLogs(deploymentLogs);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (state: string) => {
        switch (state) {
            case 'READY':
                return <CheckCircle className="w-4 h-4 text-success-500" />;
            case 'BUILDING':
            case 'INITIALIZING':
            case 'QUEUED':
                return <Loader className="w-4 h-4 text-warning-500 animate-spin" />;
            case 'ERROR':
                return <XCircle className="w-4 h-4 text-danger-500" />;
            case 'CANCELED':
                return <AlertCircle className="w-4 h-4 text-secondary-500" />;
            default:
                return <Clock className="w-4 h-4 text-secondary-500" />;
        }
    };

    const getStatusBadge = (state: string) => {
        switch (state) {
            case 'READY':
                return 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400';
            case 'BUILDING':
            case 'INITIALIZING':
            case 'QUEUED':
                return 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400';
            case 'ERROR':
            case 'CANCELED':
                return 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400';
            default:
                return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400';
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black dark:bg-white rounded-lg">
                            <svg className="w-5 h-5 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 19.5h20L12 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                {project.name}
                            </h3>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                                {project.framework || 'Unknown framework'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleDeploy('preview')}
                            disabled={actionLoading !== null}
                            className="px-3 py-1.5 text-sm bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {actionLoading === 'deploy' ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            Deploy
                        </button>
                        <button
                            onClick={loadDeployments}
                            disabled={loading}
                            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-light-text-muted dark:text-dark-text-muted ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-secondary-200 dark:border-secondary-700">
                <button
                    onClick={() => setActiveTab('deployments')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'deployments'
                            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                            : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary'
                    }`}
                >
                    Deployments
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'logs'
                            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                            : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary'
                    }`}
                >
                    Logs
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-300">
                        {error}
                    </div>
                )}

                {activeTab === 'deployments' && (
                    <div className="space-y-2">
                        {loading && deployments.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="w-6 h-6 animate-spin text-primary-500" />
                            </div>
                        ) : deployments.length === 0 ? (
                            <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                                No deployments yet
                            </div>
                        ) : (
                            deployments.map((deployment) => (
                                <div
                                    key={deployment.uid}
                                    className="p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            {getStatusIcon(deployment.state)}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                                        {deployment.uid.substring(0, 8)}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(deployment.state)}`}>
                                                        {deployment.state}
                                                    </span>
                                                    {deployment.target && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            deployment.target === 'production'
                                                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                                                : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
                                                        }`}>
                                                            {deployment.target}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-light-text-muted dark:text-dark-text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(deployment.createdAt)}
                                                    </span>
                                                    {deployment.meta?.githubCommitRef && (
                                                        <span className="flex items-center gap-1">
                                                            <GitBranch className="w-3 h-3" />
                                                            {deployment.meta.githubCommitRef}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {deployment.state === 'READY' && deployment.target !== 'production' && (
                                                <button
                                                    onClick={() => handlePromote(deployment.uid)}
                                                    disabled={actionLoading !== null}
                                                    className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors text-primary-600 dark:text-primary-400"
                                                    title="Promote to production"
                                                >
                                                    {actionLoading === deployment.uid ? (
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <ArrowUpCircle className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            {deployment.state === 'READY' && (
                                                <button
                                                    onClick={() => handleRollback(deployment.uid)}
                                                    disabled={actionLoading !== null}
                                                    className="p-1.5 hover:bg-warning-100 dark:hover:bg-warning-900/30 rounded-lg transition-colors text-warning-600 dark:text-warning-400"
                                                    title="Rollback to this deployment"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => loadLogs(deployment.uid)}
                                                className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors text-light-text-muted dark:text-dark-text-muted"
                                                title="View logs"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14,2 14,8 20,8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10,9 9,9 8,9" />
                                                </svg>
                                            </button>
                                            {deployment.url && (
                                                <a
                                                    href={`https://${deployment.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors text-light-text-muted dark:text-dark-text-muted"
                                                    title="Open deployment"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div>
                        {!selectedDeployment ? (
                            <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                                Select a deployment to view logs
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="w-6 h-6 animate-spin text-primary-500" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                                No logs available
                            </div>
                        ) : (
                            <div className="bg-secondary-900 dark:bg-black rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs">
                                {logs.map((log, index) => (
                                    <div key={index} className="text-secondary-300 leading-relaxed">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VercelDeploymentPanel;
