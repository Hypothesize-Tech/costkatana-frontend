import React from 'react';
import { Webhook, CheckCircle, XCircle, Edit, Trash2, Play, Clock } from 'lucide-react';
import { IWebhook } from '../../types/webhook.types';

interface WebhookListProps {
    webhooks: IWebhook[];
    selectedWebhook: IWebhook | null;
    onSelect: (webhook: IWebhook) => void;
    onEdit: (webhook: IWebhook) => void;
    onDelete: (webhookId: string) => void;
    onTest: (webhookId: string) => void;
    loading: boolean;
}

export const WebhookList: React.FC<WebhookListProps> = ({
    webhooks,
    selectedWebhook,
    onSelect,
    onEdit,
    onDelete,
    onTest,
    loading
}) => {
    if (loading) {
        return (
            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                <h2 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Your Webhooks</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 glass rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
            <h2 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Your Webhooks</h2>

            {webhooks.length === 0 ? (
                <div className="text-center py-8">
                    <Webhook className="w-12 h-12 text-light-text-tertiary dark:text-dark-text-tertiary mx-auto mb-3" />
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No webhooks configured</p>
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">Create your first webhook to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {webhooks.map((webhook) => (
                        <div
                            key={webhook.id}
                            onClick={() => onSelect(webhook)}
                            className={`p-4 glass rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedWebhook?.id === webhook.id
                                ? 'border-primary-500 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg'
                                : 'border-accent-200/30 hover:border-accent-300/50 bg-gradient-to-br from-light-bg-100/30 to-light-bg-200/30 dark:from-dark-bg-100/30 dark:to-dark-bg-200/30 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">{webhook.name}</h3>
                                        {webhook.active ? (
                                            <CheckCircle className="w-4 h-4 text-success-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-error-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{webhook.url}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-gray-500">
                                            {webhook.events.length} events
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            v{webhook.version}
                                        </span>
                                        {webhook.stats.lastDeliveryAt && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(webhook.stats.lastDeliveryAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 ml-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTest(webhook.id);
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Test webhook"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(webhook);
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit webhook"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(webhook.id);
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete webhook"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-accent-200/30">
                                <div className="text-xs">
                                    <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Total:</span>
                                    <span className="font-medium ml-1 text-light-text-primary dark:text-dark-text-primary">{webhook.stats.totalDeliveries}</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Success:</span>
                                    <span className="font-medium text-success-600 dark:text-success-400 ml-1">
                                        {webhook.stats.successfulDeliveries}
                                    </span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Failed:</span>
                                    <span className="font-medium text-error-600 dark:text-error-400 ml-1">
                                        {webhook.stats.failedDeliveries}
                                    </span>
                                </div>
                                {webhook.stats.averageResponseTime && (
                                    <div className="text-xs">
                                        <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Avg:</span>
                                        <span className="font-medium ml-1 text-light-text-primary dark:text-dark-text-primary">
                                            {webhook.stats.averageResponseTime}ms
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
