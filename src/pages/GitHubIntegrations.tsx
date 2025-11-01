import React, { useState, useEffect } from 'react';
import {
    GitBranch,
    Plus,
    RefreshCw,
    Search,
    Filter,
    Calendar,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle
} from 'lucide-react';
import githubService, { Integration, GitHubConnection, GitHubRepository } from '../services/github.service';
import GitHubConnector from '../components/chat/GitHubConnector';
import FeatureSelector from '../components/chat/FeatureSelector';
import PRStatusPanel from '../components/chat/PRStatusPanel';

const GitHubIntegrations: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [connections, setConnections] = useState<GitHubConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showConnector, setShowConnector] = useState(false);
    const [showFeatureSelector, setShowFeatureSelector] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepository; connectionId: string } | null>(null);
    const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Auto-refresh for in-progress integrations
    useEffect(() => {
        const hasInProgress = integrations.some(
            int => int.status === 'initializing' ||
                int.status === 'analyzing' ||
                int.status === 'generating'
        );

        if (hasInProgress) {
            const interval = setInterval(() => {
                loadData();
            }, 3000); // Refresh every 3 seconds

            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integrations]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [integrationsData, connectionsData] = await Promise.all([
                githubService.listIntegrations(),
                githubService.listConnections()
            ]);
            setIntegrations(integrationsData);
            setConnections(connectionsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRepository = (repo: GitHubRepository, connectionId: string) => {
        setSelectedRepo({ repo, connectionId });
        setShowConnector(false);
        setShowFeatureSelector(true);
    };

    const handleStartIntegration = async (
        features: { name: string; enabled: boolean }[],
        integrationType: 'npm' | 'cli' | 'python' | 'http-headers'
    ) => {
        if (!selectedRepo) return;

        try {
            const result = await githubService.startIntegration({
                connectionId: selectedRepo.connectionId,
                repositoryId: selectedRepo.repo.id,
                repositoryName: selectedRepo.repo.name,
                repositoryFullName: selectedRepo.repo.fullName,
                integrationType,
                selectedFeatures: features
            });

            setShowFeatureSelector(false);
            setSelectedRepo(null);

            // Immediately show progress panel
            setSelectedIntegration(result.integrationId);

            // Reload integrations immediately and then after delay
            await loadData();
            setTimeout(() => loadData(), 2000);
            setTimeout(() => loadData(), 5000);
        } catch (error) {
            console.error('Failed to start integration:', error);
            alert('Failed to start integration. Please try again.');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
            'initializing': {
                color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
                icon: <Clock className="w-3 h-3" />,
                label: 'Initializing'
            },
            'analyzing': {
                color: 'bg-highlight-100 dark:bg-highlight-900/30 text-highlight-700 dark:text-highlight-300 border-highlight-200 dark:border-highlight-800',
                icon: <Clock className="w-3 h-3" />,
                label: 'Analyzing'
            },
            'generating': {
                color: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 border-accent-200 dark:border-accent-800',
                icon: <Clock className="w-3 h-3" />,
                label: 'Generating'
            },
            'draft': {
                color: 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-600',
                icon: <Clock className="w-3 h-3" />,
                label: 'Draft'
            },
            'open': {
                color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
                icon: <CheckCircle className="w-3 h-3" />,
                label: 'Open'
            },
            'merged': {
                color: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 border-success-200 dark:border-success-800',
                icon: <CheckCircle className="w-3 h-3" />,
                label: 'Merged'
            },
            'closed': {
                color: 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-600',
                icon: <XCircle className="w-3 h-3" />,
                label: 'Closed'
            },
            'failed': {
                color: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 border-danger-200 dark:border-danger-800',
                icon: <AlertCircle className="w-3 h-3" />,
                label: 'Failed'
            }
        };

        const badge = badges[status] || badges['draft'];

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}>
                {badge.icon}
                {badge.label}
            </span>
        );
    };

    const filteredIntegrations = integrations
        .filter(int => {
            if (statusFilter !== 'all' && int.status !== statusFilter) return false;
            if (searchQuery && !int.repositoryName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                                GitHub Integrations
                            </h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                                Manage your CostKatana repository integrations
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadData}
                                disabled={loading}
                                className="px-4 py-2 bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors flex items-center gap-2 focus-ring"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowConnector(true)}
                                className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 font-semibold focus-ring"
                            >
                                <Plus className="w-5 h-5" />
                                New Integration
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Total</p>
                                <GitBranch className="w-5 h-5 text-secondary-400" />
                            </div>
                            <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {integrations.length}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Open</p>
                                <Clock className="w-5 h-5 text-primary-500" />
                            </div>
                            <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {integrations.filter(i => i.status === 'open').length}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Merged</p>
                                <CheckCircle className="w-5 h-5 text-success-500" />
                            </div>
                            <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {integrations.filter(i => i.status === 'merged').length}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Connections</p>
                                <GitBranch className="w-5 h-5 text-highlight-500" />
                            </div>
                            <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {connections.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Search repositories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-secondary-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-lg text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="merged">Merged</option>
                            <option value="closed">Closed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Integrations List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : filteredIntegrations.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-2xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-highlight-100 dark:from-primary-900/30 dark:to-highlight-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <GitBranch className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                            No integrations yet
                        </h3>
                        <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
                            Start by connecting your GitHub repository
                        </p>
                        <button
                            onClick={() => setShowConnector(true)}
                            className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg inline-flex items-center gap-2 font-semibold focus-ring"
                        >
                            <Plus className="w-5 h-5" />
                            Create First Integration
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredIntegrations.map((integration) => (
                            <div
                                key={integration._id}
                                className="bg-white dark:bg-dark-card border border-secondary-200 dark:border-secondary-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                {integration.repositoryName}
                                            </h3>
                                            {getStatusBadge(integration.status)}
                                        </div>
                                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                                            {integration.repositoryFullName}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {integration.prUrl && (
                                            <a
                                                href={integration.prUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors flex items-center gap-2 text-sm font-medium focus-ring"
                                            >
                                                View PR
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setSelectedIntegration(integration._id)}
                                            className="px-4 py-2 bg-secondary-100 dark:bg-secondary-800 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors flex items-center gap-2 text-sm font-medium focus-ring"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-light-text-muted dark:text-dark-text-muted">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="w-4 h-4" />
                                        <span>{integration.branchName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(integration.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-highlight-100 dark:bg-highlight-900/30 text-highlight-700 dark:text-highlight-300 rounded text-xs">
                                            {integration.integrationType.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {integration.selectedFeatures && integration.selectedFeatures.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted mb-2">Features</p>
                                        <div className="flex flex-wrap gap-2">
                                            {integration.selectedFeatures.map((feature, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded"
                                                >
                                                    {feature.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(integration.status === 'initializing' || integration.status === 'analyzing' || integration.status === 'generating') && (
                                    <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                                        <div className="flex items-center gap-2 text-sm text-light-text-muted dark:text-dark-text-muted mb-2">
                                            <Clock className="w-4 h-4 animate-pulse" />
                                            <span>Integration in progress...</span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedIntegration(integration._id)}
                                            className="w-full py-2 bg-secondary-100 dark:bg-secondary-800 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors text-sm font-medium focus-ring"
                                        >
                                            View Progress
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showConnector && (
                <GitHubConnector
                    onSelectRepository={handleSelectRepository}
                    onClose={() => setShowConnector(false)}
                />
            )}

            {showFeatureSelector && selectedRepo && (
                <FeatureSelector
                    onConfirm={handleStartIntegration}
                    onClose={() => {
                        setShowFeatureSelector(false);
                        setSelectedRepo(null);
                    }}
                    repositoryName={selectedRepo.repo.name}
                    detectedLanguage={selectedRepo.repo.language}
                />
            )}

            {selectedIntegration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="max-w-2xl w-full">
                        <PRStatusPanel
                            integrationId={selectedIntegration}
                            onClose={() => setSelectedIntegration(null)}
                        />
                        <button
                            onClick={() => setSelectedIntegration(null)}
                            className="mt-4 w-full py-2 bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus-ring"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GitHubIntegrations;

