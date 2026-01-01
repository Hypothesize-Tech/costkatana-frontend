import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle, X, Triangle, ExternalLink } from 'lucide-react';
import vercelService, { VercelConnection, VercelProject } from '../../services/vercel.service';

interface VercelConnectorProps {
    onConnect?: (connectionId: string) => void;
    onSelectProject?: (project: VercelProject, connectionId: string) => void;
    onClose?: () => void;
}

const VercelConnector: React.FC<VercelConnectorProps> = ({
    onConnect,
    onSelectProject,
    onClose
}) => {
    const [loading, setLoading] = useState(false);
    const [connections, setConnections] = useState<VercelConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<VercelConnection | null>(null);
    const [projects, setProjects] = useState<VercelProject[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'connect' | 'select-project'>('connect');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            setLoading(true);
            const conns = await vercelService.listConnections();
            setConnections(conns);

            if (conns.length > 0) {
                setSelectedConnection(conns[0]);
                setProjects(conns[0].projects);
                setStep('select-project');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await vercelService.openOAuthWindow();

            if (result) {
                if (onConnect) {
                    onConnect(result.connectionId);
                }
                await loadConnections();
            } else {
                setError('Vercel connection was cancelled or blocked');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to connect Vercel');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConnection = async (connection: VercelConnection) => {
        try {
            setLoading(true);
            setSelectedConnection(connection);

            const projectList = await vercelService.getProjects(connection._id, true);
            setProjects(projectList);
            setStep('select-project');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProject = (project: VercelProject) => {
        if (selectedConnection && onSelectProject) {
            onSelectProject(project, selectedConnection._id);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDeploymentStatusBadge = (state?: string) => {
        if (!state) return null;
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-secondary-200 dark:border-secondary-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black dark:bg-white rounded-lg">
                            <Triangle className="w-6 h-6 text-white dark:text-black fill-current" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                Connect Vercel
                            </h2>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {step === 'connect' ? 'Link your Vercel account' : 'Choose a project to manage'}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {step === 'connect' && (
                        <div className="space-y-6">
                            {connections.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-highlight-100 dark:from-primary-900/30 dark:to-highlight-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Triangle className="w-8 h-8 text-primary-600 dark:text-primary-400 fill-current" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                        No Vercel Connection
                                    </h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
                                        Connect your Vercel account to deploy and manage your projects directly from Cost Katana
                                    </p>
                                    <button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Triangle className="w-5 h-5 fill-current" />
                                                Connect Vercel
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                        Select a Vercel account to continue:
                                    </p>
                                    <div className="space-y-3">
                                        {connections.map((conn) => (
                                            <button
                                                key={conn._id}
                                                onClick={() => handleSelectConnection(conn)}
                                                disabled={loading}
                                                className="w-full p-4 border-2 border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center gap-4 text-left disabled:opacity-50 focus-ring"
                                            >
                                                {conn.avatarUrl ? (
                                                    <img
                                                        src={conn.avatarUrl}
                                                        alt={conn.vercelUsername}
                                                        className="w-12 h-12 rounded-full ring-2 ring-secondary-200 dark:ring-secondary-700"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center ring-2 ring-secondary-200 dark:ring-secondary-700">
                                                        <Triangle className="w-6 h-6 text-white dark:text-black fill-current" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                        {conn.vercelUsername}
                                                    </p>
                                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                                        {conn.teamSlug ? `Team: ${conn.teamSlug} • ` : ''}{conn.projects.length} projects
                                                    </p>
                                                </div>
                                                <CheckCircle className="w-5 h-5 text-success-500" />
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="mt-4 w-full p-3 border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-light-text-muted dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 focus-ring"
                                    >
                                        + Connect Another Account
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'select-project' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            {/* Project List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader className="w-6 h-6 animate-spin text-primary-500" />
                                    </div>
                                ) : filteredProjects.length === 0 ? (
                                    <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                                        No projects found
                                    </div>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleSelectProject(project)}
                                            className="w-full p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left focus-ring"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                            {project.name}
                                                        </p>
                                                        {project.latestDeployment && (
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getDeploymentStatusBadge(project.latestDeployment.state)}`}>
                                                                {project.latestDeployment.state}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        {project.framework && (
                                                            <span className="text-xs px-2 py-1 bg-highlight-100 dark:bg-highlight-900/30 text-highlight-700 dark:text-highlight-300 rounded">
                                                                {project.framework}
                                                            </span>
                                                        )}
                                                        {project.targets?.production?.url && (
                                                            <a
                                                                href={`https://${project.targets.production.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                {project.targets.production.url}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => setStep('connect')}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus-ring"
                            >
                                ← Back to connections
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VercelConnector;
