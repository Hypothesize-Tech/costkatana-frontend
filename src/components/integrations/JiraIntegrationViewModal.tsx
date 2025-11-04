import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { XMarkIcon, PencilIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { Integration } from '../../types/integration.types';

interface JiraIntegrationViewModalProps {
    integrationId: string;
    onClose: () => void;
    onEdit: () => void;
}

export const JiraIntegrationViewModal: React.FC<JiraIntegrationViewModalProps> = ({
    integrationId,
    onClose,
    onEdit
}) => {
    const { data: integrationData, isLoading, error } = useQuery(
        ['integration', integrationId],
        () => integrationService.getIntegration(integrationId),
        {
            retry: false,
        }
    );

    const integration = integrationData?.data as Integration | undefined;
    const credentials = integration?.credentials || {};
    const alertRouting: Record<string, { enabled?: boolean; severities?: string[] }> = integration?.alertRouting || {};

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error || !integration) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="glass rounded-xl border border-red-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                            Error
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300">
                        Failed to load integration details.
                    </p>
                </div>
            </div>
        );
    }

    const enabledAlertTypes = Object.entries(alertRouting)
        .filter(([_, config]) => config && typeof config === 'object' && 'enabled' in config && config.enabled)
        .map(([type]) => type);

    const autoCreateIssues = integration?.metadata?.autoCreateIssues === true;
    const issueMode = credentials.issueKey ? 'comment' : 'issue';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600"
                        >
                            <span className="text-white font-bold text-lg">J</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                                {integration.name}
                            </h3>
                            {integration.description && (
                                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                    {integration.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Integration Details */}
                <div className="space-y-4">
                    {/* Status */}
                    <div className="glass rounded-lg border border-primary-200/20 dark:border-primary-500/10 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Status
                            </span>
                            <div className="flex items-center gap-2">
                                {(integration.isActive ?? integration.status === 'active') ? (
                                    <>
                                        <CheckCircleIcon className="w-5 h-5 text-success-500" />
                                        <span className="text-sm text-success-700 dark:text-success-300 font-semibold">
                                            Active
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
                                        <span className="text-sm text-warning-700 dark:text-warning-300 font-semibold">
                                            Inactive
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* JIRA Configuration */}
                    <div className="glass rounded-lg border border-primary-200/20 dark:border-primary-500/10 p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                            JIRA Configuration
                        </h4>

                        {credentials.siteUrl && (
                            <div>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400 block mb-1">
                                    Site URL
                                </span>
                                <span className="text-sm text-secondary-900 dark:text-white font-medium">
                                    {credentials.siteUrl}
                                </span>
                            </div>
                        )}

                        {credentials.projectKey && (
                            <div>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400 block mb-1">
                                    Project
                                </span>
                                <span className="text-sm text-secondary-900 dark:text-white font-medium">
                                    {credentials.projectKey}
                                </span>
                            </div>
                        )}

                        {credentials.issueTypeId && (
                            <div>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400 block mb-1">
                                    Issue Type ID
                                </span>
                                <span className="text-sm text-secondary-900 dark:text-white font-medium">
                                    {credentials.issueTypeId}
                                </span>
                            </div>
                        )}

                        {credentials.priorityId && (
                            <div>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400 block mb-1">
                                    Priority ID
                                </span>
                                <span className="text-sm text-secondary-900 dark:text-white font-medium">
                                    {credentials.priorityId}
                                </span>
                            </div>
                        )}

                        <div>
                            <span className="text-xs text-secondary-500 dark:text-secondary-400 block mb-1">
                                Mode
                            </span>
                            <span className="text-sm text-secondary-900 dark:text-white font-medium">
                                {issueMode === 'comment' ? (
                                    <>Post comments to existing issue</>
                                ) : (
                                    <>
                                        {autoCreateIssues ? 'Create new issues' : 'Manual issue creation'}
                                    </>
                                )}
                            </span>
                        </div>

                        {credentials.issueKey && (
                            <div>
                                <span className="text-xs text-secondary-500 dark:text-secondary-400 block mb-1">
                                    Issue Key
                                </span>
                                <span className="text-sm text-secondary-900 dark:text-white font-mono">
                                    {credentials.issueKey}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Alert Routing */}
                    <div className="glass rounded-lg border border-primary-200/20 dark:border-primary-500/10 p-4">
                        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                            Alert Routing
                        </h4>
                        {enabledAlertTypes.length > 0 ? (
                            <div className="space-y-2">
                                {enabledAlertTypes.map((type) => {
                                    const config = alertRouting[type];
                                    const severities = (config && typeof config === 'object' && 'severities' in config ? config.severities : []) || [];
                                    return (
                                        <div key={type} className="flex items-center justify-between text-sm">
                                            <span className="text-secondary-700 dark:text-secondary-300 capitalize">
                                                {type.replace('_', ' ')}
                                            </span>
                                            {severities.length > 0 && Array.isArray(severities) && (
                                                <div className="flex gap-1 flex-wrap">
                                                    {severities.map((sev: string) => (
                                                        <span
                                                            key={sev}
                                                            className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                                                        >
                                                            {sev}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                No alert types configured
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    {integration.stats && (
                        <div className="glass rounded-lg border border-primary-200/20 dark:border-primary-500/10 p-4">
                            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                                Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-secondary-500 dark:text-secondary-400 block">
                                        Total Deliveries
                                    </span>
                                    <span className="text-lg font-bold text-secondary-900 dark:text-white">
                                        {integration.stats.totalDeliveries || 0}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-secondary-500 dark:text-secondary-400 block">
                                        Success Rate
                                    </span>
                                    <span className="text-lg font-bold text-secondary-900 dark:text-white">
                                        {integration.stats.successRate || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-primary-200/20 dark:border-primary-500/10">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-4 py-2.5 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-display font-semibold rounded-xl hover:shadow-lg transition-all duration-300 glow-primary flex items-center justify-center gap-2"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Edit Integration
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 glass border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

