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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{webhook.name}</h2>
                    {webhook.description && (
                        <p className="text-gray-600 mt-1">{webhook.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${webhook.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {webhook.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-500">v{webhook.version}</span>
                        <span className="text-sm text-gray-500">
                            Created {new Date(webhook.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onTest}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Play className="w-4 h-4" />
                        Test
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* URL Section */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Endpoint URL
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm break-all">
                        {webhook.url}
                    </div>
                </div>

                {/* Secret Section */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Webhook Secret
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm flex-1">
                            {webhook.secret}
                        </div>
                        <button
                            onClick={() => onCopySecret(webhook.secret || '')}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Copy secret"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Use this secret to verify webhook signatures
                    </p>
                </div>

                {/* Events Section */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Subscribed Events ({webhook.events.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event: string) => (
                            <span
                                key={event}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                                {event.split('.').join(' ')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Authentication Section */}
                {webhook.auth && webhook.auth.type !== 'none' && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Authentication
                        </h3>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium">Type:</span> {webhook.auth.type}
                            </p>
                            {webhook.auth.hasCredentials && (
                                <p className="text-xs text-gray-500 mt-1">
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
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-gray-900">
                                {webhook.stats.totalDeliveries}
                            </p>
                            <p className="text-sm text-gray-600">Total</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {webhook.stats.successfulDeliveries}
                            </p>
                            <p className="text-sm text-gray-600">Success</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {webhook.stats.failedDeliveries}
                            </p>
                            <p className="text-sm text-gray-600">Failed</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {webhook.stats.averageResponseTime || '-'}
                                {webhook.stats.averageResponseTime && <span className="text-sm">ms</span>}
                            </p>
                            <p className="text-sm text-gray-600">Avg Time</p>
                        </div>
                    </div>
                    {webhook.stats.lastDeliveryAt && (
                        <p className="text-sm text-gray-500 mt-2">
                            Last delivery: {new Date(webhook.stats.lastDeliveryAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
