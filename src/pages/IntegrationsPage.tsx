import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../services/integration.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { IntegrationCard } from '../components/integrations/IntegrationCard';
import { SlackIntegrationSetup } from '../components/integrations/SlackIntegrationSetup';
import { DiscordIntegrationSetup } from '../components/integrations/DiscordIntegrationSetup';
import { WebhookIntegrationSetup } from '../components/integrations/WebhookIntegrationSetup';
import { IntegrationLogs } from '../components/integrations/IntegrationLogs';
import { PlusIcon } from '@heroicons/react/24/outline';
import GitHubConnector from '../components/chat/GitHubConnector';
import FeatureSelector from '../components/chat/FeatureSelector';
import githubService, { GitHubRepository } from '../services/github.service';

type SetupModal = 'slack' | 'discord' | 'webhook' | 'github' | null;

export const IntegrationsPage: React.FC = () => {
    const [setupModal, setSetupModal] = useState<SetupModal>(null);
    const [showLogs, setShowLogs] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepository; connectionId: string } | null>(null);
    const [showFeatureSelector, setShowFeatureSelector] = useState(false);

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
        } catch (error) {
            console.error('Failed to start integration:', error);
        }
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

                                {/* Existing Integrations */}
                                {integrations.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-display font-bold gradient-text-primary mb-6">Your Integrations</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {integrations.map((integration) => (
                                                <IntegrationCard
                                                    key={integration.id}
                                                    integration={integration}
                                                    onUpdate={refetch}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Available Integrations */}
                                <div>
                                    <h2 className="text-2xl font-display font-bold gradient-text-primary mb-6">Add New Integration</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {availableIntegrations.map((integration) => (
                                            <div
                                                key={integration.type}
                                                onClick={() => setSetupModal(integration.type)}
                                                className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-primary-300/50"
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <div
                                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                                                        style={{ backgroundColor: `${integration.color}20` }}
                                                    >
                                                        <div style={{ color: integration.color, width: '32px', height: '32px' }}>
                                                            {integration.icon}
                                                        </div>
                                                    </div>
                                                    <h3 className="text-xl font-display font-semibold text-gray-900 dark:text-white mb-2">
                                                        {integration.name}
                                                    </h3>
                                                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
                                                        {integration.description}
                                                    </p>
                                                    <button className="w-full px-4 py-2 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center">
                                                        <PlusIcon className="w-5 h-5 mr-2" />
                                                        Connect
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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

