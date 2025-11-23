import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    ArrowTopRightOnSquareIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    CogIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
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
                color: 'bg-primary-500/20 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700',
                icon: <ClockIcon className="w-3.5 h-3.5" />,
                label: 'Initializing'
            },
            'analyzing': {
                color: 'bg-highlight-500/20 text-highlight-700 dark:text-highlight-300 border-highlight-300 dark:border-highlight-700',
                icon: <ClockIcon className="w-3.5 h-3.5" />,
                label: 'Analyzing'
            },
            'generating': {
                color: 'bg-accent-500/20 text-accent-700 dark:text-accent-300 border-accent-300 dark:border-accent-700',
                icon: <ClockIcon className="w-3.5 h-3.5" />,
                label: 'Generating'
            },
            'draft': {
                color: 'bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 border-secondary-300 dark:border-secondary-700',
                icon: <ClockIcon className="w-3.5 h-3.5" />,
                label: 'Draft'
            },
            'open': {
                color: 'bg-primary-500/20 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700',
                icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
                label: 'Open'
            },
            'merged': {
                color: 'bg-success-500/20 text-success-700 dark:text-success-300 border-success-300 dark:border-success-700',
                icon: <CheckCircleSolidIcon className="w-3.5 h-3.5" />,
                label: 'Merged'
            },
            'closed': {
                color: 'bg-secondary-500/20 text-secondary-600 dark:text-secondary-400 border-secondary-300 dark:border-secondary-700',
                icon: <XCircleIcon className="w-3.5 h-3.5" />,
                label: 'Closed'
            },
            'failed': {
                color: 'bg-danger-500/20 text-danger-700 dark:text-danger-300 border-danger-300 dark:border-danger-700',
                icon: <ExclamationTriangleIcon className="w-3.5 h-3.5" />,
                label: 'Failed'
            }
        };

        const badge = badges[status] || badges['draft'];

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold rounded-full border ${badge.color}`}>
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
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
                                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">
                                        GitHub Integrations
                                    </h1>
                                    <p className="text-secondary-600 dark:text-secondary-300 font-body">
                                        Manage your CostKatana repository integrations
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={loadData}
                                    disabled={loading}
                                    className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 font-display font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button
                                    onClick={() => setShowConnector(true)}
                                    className="px-6 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 font-display font-semibold text-sm"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    New Integration
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Total</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-secondary/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-display font-bold gradient-text-primary">
                                {integrations.length}
                            </p>
                        </div>

                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Open</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-primary/20 flex items-center justify-center">
                                    <ClockIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-display font-bold text-primary-700 dark:text-primary-300">
                                {integrations.filter(i => i.status === 'open').length}
                            </p>
                        </div>

                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Merged</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-success/20 flex items-center justify-center">
                                    <CheckCircleSolidIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-display font-bold text-success-700 dark:text-success-300">
                                {integrations.filter(i => i.status === 'merged').length}
                            </p>
                        </div>

                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-5 hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Connections</p>
                                <div className="w-10 h-10 rounded-xl bg-gradient-accent/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-accent-600 dark:text-accent-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-display font-bold text-accent-700 dark:text-accent-300">
                                {connections.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 dark:text-secondary-600" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 rounded-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 dark:focus:border-primary-500 outline-none transition-all duration-300 font-body text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary/10 flex items-center justify-center">
                                <FunnelIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 rounded-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 dark:focus:border-primary-500 outline-none transition-all duration-300 font-display font-semibold text-sm appearance-none pr-8"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="merged">Merged</option>
                                <option value="closed">Closed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Integrations List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                            <p className="text-secondary-600 dark:text-secondary-300 font-display font-medium">Loading integrations...</p>
                        </div>
                    </div>
                ) : filteredIntegrations.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="w-20 h-20 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white mb-2">
                            No integrations yet
                        </h3>
                        <p className="text-secondary-600 dark:text-secondary-300 font-body mb-8">
                            Start by connecting your GitHub repository
                        </p>
                        <button
                            onClick={() => setShowConnector(true)}
                            className="px-6 py-3.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl glow-primary transition-all duration-300 transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 font-display font-semibold text-base"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Create First Integration
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredIntegrations.map((integration) => (
                            <div
                                key={integration._id}
                                className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-primary/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-white truncate">
                                                {integration.repositoryName}
                                            </h3>
                                            {getStatusBadge(integration.status)}
                                        </div>
                                        <p className="text-sm text-secondary-600 dark:text-secondary-300 font-body ml-13">
                                            {integration.repositoryFullName}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {integration.prUrl && (
                                            <a
                                                href={integration.prUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-gradient-primary/20 hover:bg-gradient-primary/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-display font-semibold shadow-sm hover:shadow-md"
                                            >
                                                View PR
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setSelectedIntegration(integration._id)}
                                            className="px-4 py-2 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-display font-semibold shadow-sm hover:shadow-md"
                                        >
                                            <CogIcon className="w-4 h-4" />
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-secondary-600 dark:text-secondary-300 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        <span className="font-medium">{integration.branchName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span className="font-medium">{new Date(integration.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-gradient-accent/20 text-accent-700 dark:text-accent-300 border border-accent-300 dark:border-accent-700 rounded-full text-xs font-display font-semibold">
                                            {integration.integrationType.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {integration.selectedFeatures && integration.selectedFeatures.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-primary-200/30 dark:border-primary-500/20">
                                        <p className="text-xs font-display font-semibold text-secondary-600 dark:text-secondary-400 mb-3 uppercase tracking-wider">Features</p>
                                        <div className="flex flex-wrap gap-2">
                                            {integration.selectedFeatures.map((feature, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-3 py-1.5 bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-300 dark:border-success-700 rounded-full font-display font-semibold"
                                                >
                                                    {feature.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(integration.status === 'initializing' || integration.status === 'analyzing' || integration.status === 'generating') && (
                                    <div className="mt-5 pt-5 border-t border-primary-200/30 dark:border-primary-500/20">
                                        <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300 mb-3">
                                            <ClockIcon className="w-5 h-5 animate-pulse text-primary-600 dark:text-primary-400" />
                                            <span className="font-display font-semibold">Integration in progress...</span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedIntegration(integration._id)}
                                            className="w-full py-3 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm font-display font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                        >
                                            <ClockIcon className="w-4 h-4" />
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
                            className="mt-4 w-full py-3.5 px-6 rounded-xl font-display font-semibold text-base glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-900 dark:text-white hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
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

