import React, { useState, useEffect } from 'react';
import { GitBranch, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import githubService, { GitHubConnection, GitHubRepository } from '../../services/github.service';

interface GitHubConnectorProps {
    onConnect?: (connectionId: string) => void;
    onSelectRepository?: (repo: GitHubRepository, connectionId: string) => void;
    onClose?: () => void;
}

const GitHubConnector: React.FC<GitHubConnectorProps> = ({
    onConnect,
    onSelectRepository,
    onClose
}) => {
    const [loading, setLoading] = useState(false);
    const [connections, setConnections] = useState<GitHubConnection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<GitHubConnection | null>(null);
    const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'connect' | 'select-repo'>('connect');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            setLoading(true);
            const conns = await githubService.listConnections();
            setConnections(conns);

            if (conns.length > 0) {
                setSelectedConnection(conns[0]);
                setRepositories(conns[0].repositories);
                setStep('select-repo');
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

            const result = await githubService.openOAuthWindow();

            if (result) {
                if (onConnect) {
                    onConnect(result.connectionId);
                }
                await loadConnections();
            } else {
                setError('GitHub connection was cancelled or blocked');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to connect GitHub');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConnection = async (connection: GitHubConnection) => {
        try {
            setLoading(true);
            setSelectedConnection(connection);

            const { repositories: repos } = await githubService.getRepositories(connection._id, true);
            setRepositories(repos);
            setStep('select-repo');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load repositories');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRepository = (repo: GitHubRepository) => {
        if (selectedConnection && onSelectRepository) {
            onSelectRepository(repo, selectedConnection._id);
        }
    };

    const filteredRepos = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden border border-secondary-200 dark:border-secondary-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-lg">
                            <GitBranch className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                Connect GitHub Repository
                            </h2>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {step === 'connect' ? 'Link your GitHub account' : 'Choose a repository to integrate'}
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
                                        <GitBranch className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                        No GitHub Connection
                                    </h3>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
                                        Connect your GitHub account to automatically integrate CostKatana into your repositories
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
                                                <GitBranch className="w-5 h-5" />
                                                Connect GitHub
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                                        Select a GitHub account to continue:
                                    </p>
                                    <div className="space-y-3">
                                        {connections.map((conn) => (
                                            <button
                                                key={conn._id}
                                                onClick={() => handleSelectConnection(conn)}
                                                disabled={loading}
                                                className="w-full p-4 border-2 border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center gap-4 text-left disabled:opacity-50 focus-ring"
                                            >
                                                {conn.avatarUrl && (
                                                    <img
                                                        src={conn.avatarUrl}
                                                        alt={conn.githubUsername}
                                                        className="w-12 h-12 rounded-full ring-2 ring-secondary-200 dark:ring-secondary-700"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                        {conn.githubUsername}
                                                    </p>
                                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                                        {conn.repositories.length} repositories
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

                    {step === 'select-repo' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search repositories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            {/* Repository List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader className="w-6 h-6 animate-spin text-primary-500" />
                                    </div>
                                ) : filteredRepos.length === 0 ? (
                                    <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
                                        No repositories found
                                    </div>
                                ) : (
                                    filteredRepos.map((repo) => (
                                        <button
                                            key={repo.id}
                                            onClick={() => handleSelectRepository(repo)}
                                            className="w-full p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left focus-ring"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                        {repo.name}
                                                    </p>
                                                    {repo.description && (
                                                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
                                                            {repo.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        {repo.language && (
                                                            <span className="text-xs px-2 py-1 bg-highlight-100 dark:bg-highlight-900/30 text-highlight-700 dark:text-highlight-300 rounded">
                                                                {repo.language}
                                                            </span>
                                                        )}
                                                        {repo.private && (
                                                            <span className="text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded">
                                                                Private
                                                            </span>
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

export default GitHubConnector;

