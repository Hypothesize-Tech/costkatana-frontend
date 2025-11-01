import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { integrationService } from '../services/integration.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SlackIntegrationSetup } from '../components/integrations/SlackIntegrationSetup';
import { DiscordIntegrationSetup } from '../components/integrations/DiscordIntegrationSetup';
import { WebhookIntegrationSetup } from '../components/integrations/WebhookIntegrationSetup';
import { IntegrationLogs } from '../components/integrations/IntegrationLogs';
import {
    PlusIcon,
    XMarkIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import GitHubConnector from '../components/chat/GitHubConnector';
import FeatureSelector from '../components/chat/FeatureSelector';
import githubService, { GitHubRepository, GitHubConnection } from '../services/github.service';

type SetupModal = 'slack' | 'discord' | 'webhook' | 'github' | null;

export const IntegrationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [setupModal, setSetupModal] = useState<SetupModal>(null);
    const [showLogs, setShowLogs] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepository; connectionId: string } | null>(null);
    const [showFeatureSelector, setShowFeatureSelector] = useState(false);
    const [githubConnections, setGithubConnections] = useState<GitHubConnection[]>([]);
    const [githubIntegrations, setGithubIntegrations] = useState<Array<{ _id: string; repositoryName: string; status: string }>>([]);

    const { data: integrationsData, isLoading, error, refetch } = useQuery(
        ['integrations'],
        () => integrationService.getIntegrations(),
        {
            refetchInterval: 30000, // Refetch every 30 seconds
            retry: 1,
            onError: (err) => {
                console.error('Failed to fetch integrations:', err);
            }
        }
    );

    const integrations = integrationsData?.data || [];

    // Load GitHub connections and integrations
    useEffect(() => {
        const loadGitHubData = async () => {
            try {
                const [connections, gitIntegrations] = await Promise.all([
                    githubService.listConnections(),
                    githubService.listIntegrations()
                ]);
                setGithubConnections(connections);
                setGithubIntegrations(gitIntegrations);
            } catch (error) {
                console.error('Failed to load GitHub data:', error);
            }
        };
        loadGitHubData();
    }, []);

    const handleSetupComplete = () => {
        setSetupModal(null);
        refetch();
    };

    const handleSelectRepository = (repo: GitHubRepository, connectionId: string) => {
        setSelectedRepo({ repo, connectionId });
        setSetupModal(null);
        setShowFeatureSelector(true);
    };

    const handleStartIntegration = async (
        features: { name: string; enabled: boolean }[],
        integrationType: 'npm' | 'cli' | 'python' | 'http-headers'
    ) => {
        if (!selectedRepo) return;

        try {
            await githubService.startIntegration({
                connectionId: selectedRepo.connectionId,
                repositoryId: selectedRepo.repo.id,
                repositoryName: selectedRepo.repo.name,
                repositoryFullName: selectedRepo.repo.fullName,
                integrationType,
                selectedFeatures: features
            });

            setShowFeatureSelector(false);
            setSelectedRepo(null);
            refetch();
            // Reload GitHub data
            const [connections, gitIntegrations] = await Promise.all([
                githubService.listConnections(),
                githubService.listIntegrations()
            ]);
            setGithubConnections(connections);
            setGithubIntegrations(gitIntegrations);
        } catch (error) {
            console.error('Failed to start integration:', error);
        }
    };

    const handleDisconnectGitHub = async (connectionId: string) => {
        if (window.confirm('Are you sure you want to disconnect GitHub? This will remove all your GitHub connections and integrations.')) {
            try {
                await githubService.disconnectConnection(connectionId);
                const [connections, gitIntegrations] = await Promise.all([
                    githubService.listConnections(),
                    githubService.listIntegrations()
                ]);
                setGithubConnections(connections);
                setGithubIntegrations(gitIntegrations);
            } catch (error) {
                console.error('Failed to disconnect GitHub:', error);
            }
        }
    };

    // Check if an integration type is connected
    const isIntegrationConnected = (type: string): boolean => {
        if (type === 'github') {
            return githubConnections.some(conn => conn.isActive);
        }

        // For other integrations, check if there's an active integration
        return integrations.some(integ => {
            if (type === 'slack') {
                return integ.type === 'slack_webhook' || integ.type === 'slack_oauth';
            }
            if (type === 'discord') {
                return integ.type === 'discord_webhook' || integ.type === 'discord_oauth';
            }
            if (type === 'webhook') {
                return integ.type === 'custom_webhook';
            }
            return false;
        });
    };


    const availableIntegrations = [
        {
            type: 'github' as const,
            name: 'GitHub',
            description: 'Auto-integrate CostKatana into your repositories via pull requests',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            ),
            color: '#06ec9e',
        },
        {
            type: 'slack' as const,
            name: 'Slack',
            description: 'Send alerts to Slack channels with rich formatting',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
            ),
            color: '#4A154B',
        },
        {
            type: 'discord' as const,
            name: 'Discord',
            description: 'Send alerts to Discord channels with rich embeds',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            ),
            color: '#5865F2',
        },
        {
            type: 'webhook' as const,
            name: 'Custom Webhook',
            description: 'Send alerts to any custom webhook endpoint',
            icon: (
                <svg className="integration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            color: '#6B7280',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient px-4 py-8">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4">Integrations</h1>
                            <p className="text-secondary-600 dark:text-secondary-300">
                                Connect Cost Katana with GitHub, Slack, Discord, and custom webhooks
                            </p>
                        </div>
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className="px-6 py-3 bg-gradient-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-secondary"
                        >
                            {showLogs ? 'Hide Logs' : 'View Logs'}
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>

                        {showLogs ? (
                            <IntegrationLogs onClose={() => setShowLogs(false)} />
                        ) : (
                            <>
                                {/* Error Message */}
                                {error && (
                                    <div className="glass rounded-lg border border-red-200/30 bg-red-50/80 dark:bg-red-900/20 p-4 mb-6 backdrop-blur-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700 dark:text-red-200">
                                                    Failed to load integrations. You can still add new integrations below.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Unified Integrations List */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-display font-bold gradient-text-primary">Integrations</h2>
                                        <span className="px-3 py-1 bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-300 dark:border-success-700 rounded-full text-sm font-display font-semibold">
                                            {integrations.length + (githubConnections.filter(c => c.isActive).length)} Connected
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {availableIntegrations.map((integration) => {
                                            const isConnected = isIntegrationConnected(integration.type);

                                            // Get GitHub connection details if connected
                                            const githubConnection = isConnected && integration.type === 'github'
                                                ? githubConnections.find(c => c.isActive)
                                                : null;

                                            // Get regular integrations for this type
                                            const regularIntegrations = integrations.filter(integ => {
                                                if (integration.type === 'slack') return integ.type === 'slack_webhook' || integ.type === 'slack_oauth';
                                                if (integration.type === 'discord') return integ.type === 'discord_webhook' || integ.type === 'discord_oauth';
                                                if (integration.type === 'webhook') return integ.type === 'custom_webhook';
                                                return false;
                                            });

                                            return (
                                                <div
                                                    key={integration.type}
                                                    className={`glass rounded-xl border ${isConnected
                                                        ? 'border-success-200/50 dark:border-success-500/30'
                                                        : 'border-primary-200/30 dark:border-primary-500/20'
                                                        } shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:shadow-xl transition-all duration-300 flex flex-col h-full`}
                                                >
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div
                                                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                                                style={{ backgroundColor: `${integration.color}20` }}
                                                            >
                                                                <div style={{ color: integration.color, width: '24px', height: '24px' }}>
                                                                    {integration.icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-white mb-1 truncate">
                                                                    {integration.name}
                                                                </h3>
                                                                {githubConnection && (
                                                                    <p className="text-sm text-secondary-600 dark:text-secondary-300 truncate">
                                                                        @{githubConnection.githubUsername}
                                                                    </p>
                                                                )}
                                                                {regularIntegrations.length > 0 && !githubConnection && (
                                                                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                                                        {regularIntegrations.length} {regularIntegrations.length === 1 ? 'integration' : 'integrations'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isConnected && (
                                                                <span className="px-2.5 py-1 bg-gradient-success/20 text-success-700 dark:text-success-300 border border-success-300 dark:border-success-700 rounded-full text-xs font-display font-semibold flex items-center gap-1 flex-shrink-0">
                                                                    <CheckCircleSolidIcon className="w-3.5 h-3.5" />
                                                                    Connected
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4 font-body flex-grow">
                                                        {integration.description}
                                                    </p>

                                                    {/* GitHub Specific Info */}
                                                    {isConnected && githubConnection && (
                                                        <div className="mb-4 p-3 glass rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                                                            <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
                                                                {githubConnection.repositories?.length || 0} {githubConnection.repositories?.length === 1 ? 'Repository' : 'Repositories'}
                                                                {githubIntegrations.length > 0 && (
                                                                    <> • {githubIntegrations.length} {githubIntegrations.length === 1 ? 'Integration' : 'Integrations'}</>
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Spacer to push buttons to bottom */}
                                                    {!isConnected || !githubConnection ? <div className="flex-grow"></div> : null}

                                                    {/* Actions - Always at bottom */}
                                                    <div className="mt-auto">
                                                        {isConnected ? (
                                                            <div className="flex gap-2">
                                                                {integration.type === 'github' ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => navigate('/github')}
                                                                            className="flex-1 px-3 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-2 text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-4 h-4" />
                                                                            Manage
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (githubConnection && window.confirm('Are you sure you want to disconnect GitHub?')) {
                                                                                    await handleDisconnectGitHub(githubConnection._id);
                                                                                }
                                                                            }}
                                                                            className="px-3 py-2.5 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md"
                                                                            title="Disconnect GitHub"
                                                                        >
                                                                            <XMarkIcon className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                // For regular integrations, show management or add more
                                                                                setSetupModal(integration.type);
                                                                            }}
                                                                            className="flex-1 px-3 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-2 text-sm"
                                                                        >
                                                                            <Cog6ToothIcon className="w-4 h-4" />
                                                                            {regularIntegrations.length > 1 ? 'Manage' : 'View'}
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (window.confirm(`Are you sure you want to disconnect all ${integration.name} integrations?`)) {
                                                                                    try {
                                                                                        for (const integ of regularIntegrations) {
                                                                                            await integrationService.deleteIntegration(integ.id);
                                                                                        }
                                                                                        refetch();
                                                                                    } catch (error) {
                                                                                        console.error('Failed to delete integrations:', error);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="px-3 py-2.5 glass border border-danger-200/30 dark:border-danger-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-danger-600 dark:text-danger-400 rounded-xl hover:bg-danger-500/10 dark:hover:bg-danger-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm font-display font-semibold flex items-center justify-center shadow-sm hover:shadow-md"
                                                                            title={`Disconnect ${integration.name}`}
                                                                        >
                                                                            <XMarkIcon className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSetupModal(integration.type);
                                                                }}
                                                                className="w-full px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-2"
                                                            >
                                                                <PlusIcon className="w-5 h-5" />
                                                                Connect
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Setup Modals */}
                {setupModal === 'github' && (
                    <GitHubConnector
                        onSelectRepository={handleSelectRepository}
                        onClose={() => setSetupModal(null)}
                    />
                )}
                {setupModal === 'slack' && (
                    <SlackIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'discord' && (
                    <DiscordIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}
                {setupModal === 'webhook' && (
                    <WebhookIntegrationSetup
                        onClose={() => setSetupModal(null)}
                        onComplete={handleSetupComplete}
                    />
                )}

                {/* GitHub Feature Selector */}
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
            </div>
        </div>
    );
};

