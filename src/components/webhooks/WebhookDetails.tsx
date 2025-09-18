import React from 'react';
import { Edit, Trash2, Play, Copy, Globe, Lock, Clock, RefreshCw } from 'lucide-react';
import { IWebhook } from '../../types';

interface WebhookDetailsProps {
    webhook: IWebhook;
    onEdit: () => void;
    onDelete: () => void;
    onTest: () => void;
    onCopySecret: (secret: string) => void;
}

export const WebhookDetails: React.FC<WebhookDetailsProps> = ({
    webhook,
    onEdit,
    onDelete,
    onTest,
    onCopySecret
}) => {
    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-display font-bold gradient-text-primary">{webhook.name}</h2>
                    {webhook.description && (
                        <p className="text-secondary-600 dark:text-secondary-300 mt-1">{webhook.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full glass border border-accent-200/30 ${webhook.active
                            ? 'bg-gradient-to-r from-success-100/50 to-success-200/50 dark:from-success-800/50 dark:to-success-700/50 text-success-800 dark:text-success-200'
                            : 'bg-gradient-to-r from-error-100/50 to-error-200/50 dark:from-error-800/50 dark:to-error-700/50 text-error-800 dark:text-error-200'
                            }`}>
                            {webhook.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-secondary-500 dark:text-secondary-400">v{webhook.version}</span>
                        <span className="text-sm text-secondary-500 dark:text-secondary-400">
                            Created {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onTest}
                        className="flex items-center gap-2 px-3 py-2 text-sm glass rounded-xl border border-accent-200/30 bg-gradient-to-r from-success-500 to-success-600 text-white hover:shadow-md transition-all duration-300"
                    >
                        <Play className="w-4 h-4" />
                        Test
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-3 py-2 text-sm glass rounded-xl border border-accent-200/30 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-md transition-all duration-300"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-3 py-2 text-sm glass rounded-xl border border-accent-200/30 bg-gradient-to-r from-error-500 to-error-600 text-white hover:shadow-md transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* URL Section */}
                <div>
                    <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        Endpoint URL
                    </h3>
                    <div className="glass rounded-xl border border-primary-200/30 bg-secondary-50/50 dark:bg-secondary-800/50 p-3 font-mono text-sm break-all text-secondary-900 dark:text-white">
                        {webhook.url}
                    </div>
                </div>

                {/* Secret Section */}
                <div>
                    <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        Webhook Secret
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="glass rounded-xl border border-primary-200/30 bg-secondary-50/50 dark:bg-secondary-800/50 p-3 font-mono text-sm flex-1 text-secondary-900 dark:text-white">
                            {webhook.secret}
                        </div>
                        <button
                            onClick={() => onCopySecret(webhook.secret || '')}
                            className="p-2 glass rounded-xl border border-primary-200/30 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-300"
                            title="Copy secret"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                        Use this secret to verify webhook signatures
                    </p>
                </div>

                {/* Events Section */}
                <div>
                    <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-2">
                        Subscribed Events ({webhook.events.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event: string) => (
                            <span
                                key={event}
                                className="px-3 py-1 text-xs glass rounded-full border border-primary-200/30 bg-gradient-to-r from-primary-100/50 to-primary-200/50 dark:from-primary-800/50 dark:to-primary-700/50 text-primary-800 dark:text-primary-200"
                            >
                                {event.split('.').join(' ')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Authentication Section */}
                {webhook.auth && webhook.auth.type !== 'none' && (
                    <div>
                        <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            Authentication
                        </h3>
                        <div className="glass rounded-xl border border-primary-200/30 bg-secondary-50/50 dark:bg-secondary-800/50 p-3">
                            <p className="text-sm text-secondary-900 dark:text-white">
                                <span className="font-medium">Type:</span> {webhook.auth.type}
                            </p>
                            {webhook.auth.hasCredentials && (
                                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                    Credentials configured
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                {webhook.filters && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Filters</h3>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            {webhook.filters.severity && webhook.filters.severity.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium">Severity:</span>
                                    <span className="ml-2 text-sm text-gray-600">
                                        {webhook.filters.severity.join(', ')}
                                    </span>
                                </div>
                            )}
                            {webhook.filters.tags && webhook.filters.tags.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium">Tags:</span>
                                    <span className="ml-2 text-sm text-gray-600">
                                        {webhook.filters.tags.join(', ')}
                                    </span>
                                </div>
                            )}
                            {webhook.filters?.minCost && webhook.filters.minCost > 0 && (
                                <div>
                                    <span className="text-sm font-medium">Min Cost:</span>
                                    <span className="ml-2 text-sm text-gray-600">
                                        ${webhook.filters.minCost}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Headers Section */}
                {webhook.headers && Object.keys(webhook.headers).length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Headers</h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            {Object.entries(webhook.headers).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <span className="font-medium">{key}:</span>
                                    <span className="ml-2 text-gray-600">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Settings
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm font-medium">Timeout:</span>
                            <span className="ml-2 text-sm text-gray-600">
                                {webhook.timeout / 1000}s
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium">Max Retries:</span>
                            <span className="ml-2 text-sm text-gray-600">
                                {webhook.retryConfig?.maxRetries ?? 3}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium">Backoff:</span>
                            <span className="ml-2 text-sm text-gray-600">
                                {webhook.retryConfig?.backoffMultiplier ?? 2}x
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium">Initial Delay:</span>
                            <span className="ml-2 text-sm text-gray-600">
                                {(webhook.retryConfig?.initialDelay ?? 5000) / 1000}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div>
                    <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20 p-3 text-center">
                            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                                {webhook.stats.totalDeliveries}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Total</p>
                        </div>
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 p-3 text-center">
                            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                                {webhook.stats.successfulDeliveries}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Success</p>
                        </div>
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20 p-3 text-center">
                            <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                                {webhook.stats.failedDeliveries}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Failed</p>
                        </div>
                        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 p-3 text-center">
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {webhook.stats.averageResponseTime || '-'}
                                {webhook.stats.averageResponseTime && <span className="text-sm">ms</span>}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">Avg Time</p>
                        </div>
                    </div>
                    {webhook.stats.lastDeliveryAt && (
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                            Last delivery: {new Date(webhook.stats.lastDeliveryAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
