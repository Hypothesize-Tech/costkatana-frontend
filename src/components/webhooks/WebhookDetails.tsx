import React from 'react';
import {
    PencilIcon,
    TrashIcon,
    PlayIcon,
    ClipboardDocumentIcon,
    GlobeAltIcon,
    LockClosedIcon,
    ClockIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
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
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">{webhook.name}</h2>
                    {webhook.description && (
                        <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mt-1">{webhook.description}</p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-4 mt-3 flex-wrap">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full glass border ${webhook.active
                            ? 'border-green-200/50 dark:border-green-500/30 bg-gradient-to-r from-green-100/50 to-green-200/50 dark:from-green-800/50 dark:to-green-700/50 text-green-800 dark:text-green-200'
                            : 'border-red-200/50 dark:border-red-500/30 bg-gradient-to-r from-red-100/50 to-red-200/50 dark:from-red-800/50 dark:to-red-700/50 text-red-800 dark:text-red-200'
                            }`}>
                            {webhook.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">v{webhook.version}</span>
                        <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            Created {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={onTest}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-green-200/50 dark:border-green-500/30 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:shadow-lg hover:shadow-green-500/30 dark:hover:shadow-green-500/50 transition-all duration-300 min-h-[36px] [touch-action:manipulation] active:scale-95"
                    >
                        <PlayIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Test</span>
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-primary-200/50 dark:border-primary-500/30 bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 min-h-[36px] [touch-action:manipulation] active:scale-95"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-red-200/50 dark:border-red-500/30 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white hover:shadow-lg hover:shadow-red-500/30 dark:hover:shadow-red-500/50 transition-all duration-300 min-h-[36px] [touch-action:manipulation] active:scale-95"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
                {/* URL Section */}
                <div>
                    <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
                        <GlobeAltIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                        Endpoint URL
                    </h3>
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 font-mono text-xs sm:text-sm break-all text-light-text-primary dark:text-dark-text-primary">
                        {webhook.url}
                    </div>
                </div>

                {/* Secret Section */}
                <div>
                    <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
                        <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                        Webhook Secret
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 font-mono text-xs sm:text-sm flex-1 break-all text-light-text-primary dark:text-dark-text-primary">
                            {webhook.secret}
                        </div>
                        <button
                            onClick={() => onCopySecret(webhook.secret || '')}
                            className="p-2 sm:p-2.5 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 text-light-text-secondary dark:text-dark-text-secondary hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:bg-[#06ec9e]/10 dark:hover:bg-emerald-400/20 transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center [touch-action:manipulation]"
                            title="Copy secret"
                        >
                            <ClipboardDocumentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Use this secret to verify webhook signatures
                    </p>
                </div>

                {/* Events Section */}
                <div>
                    <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Subscribed Events ({webhook.events.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event: string) => (
                            <span
                                key={event}
                                className="px-2 sm:px-3 py-1 text-xs glass rounded-full border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-[#06ec9e]/10 via-emerald-100/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-800/50 dark:to-[#009454]/20 text-emerald-800 dark:text-emerald-200 font-medium"
                            >
                                {event.split('.').join(' ')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Authentication Section */}
                {webhook.auth && webhook.auth.type !== 'none' && (
                    <div>
                        <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
                            <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                            Authentication
                        </h3>
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3">
                            <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                                <span className="font-medium">Type:</span> <span className="capitalize">{webhook.auth.type}</span>
                            </p>
                            {webhook.auth.hasCredentials && (
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                    Credentials configured
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                {webhook.filters && (
                    <div>
                        <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Filters</h3>
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 space-y-2">
                            {webhook.filters.severity && webhook.filters.severity.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Severity:</span>
                                    <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {webhook.filters.severity.join(', ')}
                                    </span>
                                </div>
                            )}
                            {webhook.filters.tags && webhook.filters.tags.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Tags:</span>
                                    <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {webhook.filters.tags.join(', ')}
                                    </span>
                                </div>
                            )}
                            {webhook.filters?.minCost && webhook.filters.minCost > 0 && (
                                <div>
                                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Min Cost:</span>
                                    <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
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
                        <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">Custom Headers</h3>
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 space-y-2">
                            {Object.entries(webhook.headers).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{key}:</span>
                                    <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary break-all">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                <div>
                    <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                        Settings
                    </h3>
                    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Timeout:</span>
                            <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {webhook.timeout / 1000}s
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Max Retries:</span>
                            <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {webhook.retryConfig?.maxRetries ?? 3}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Backoff:</span>
                            <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {webhook.retryConfig?.backoffMultiplier ?? 2}x
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Initial Delay:</span>
                            <span className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                {(webhook.retryConfig?.initialDelay ?? 5000) / 1000}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div>
                    <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2 flex items-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                        Performance
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30 p-3 sm:p-4 text-center">
                            <p className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                {webhook.stats.totalDeliveries || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Total</p>
                        </div>
                        <div className="glass rounded-xl border border-green-200/30 dark:border-green-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-br from-green-50/30 to-green-100/30 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 text-center">
                            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                {webhook.stats.successfulDeliveries || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Success</p>
                        </div>
                        <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-br from-red-50/30 to-red-100/30 dark:from-red-900/20 dark:to-red-800/20 p-3 sm:p-4 text-center">
                            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                                {webhook.stats.failedDeliveries || 0}
                            </p>
                            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Failed</p>
                        </div>
                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/30 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/20 dark:to-[#009454]/20 p-3 sm:p-4 text-center">
                            <p className="text-xl sm:text-2xl font-bold text-[#06ec9e] dark:text-emerald-400">
                                {webhook.stats.averageResponseTime || '-'}
                                {webhook.stats.averageResponseTime && <span className="text-xs sm:text-sm">ms</span>}
                            </p>
                            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Avg Time</p>
                        </div>
                    </div>
                    {webhook.stats.lastDeliveryAt && (
                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                            Last delivery: {new Date(webhook.stats.lastDeliveryAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
