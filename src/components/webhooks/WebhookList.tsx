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
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Your Webhooks</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Your Webhooks</h2>

            {webhooks.length === 0 ? (
                <div className="text-center py-8">
                    <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No webhooks configured</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first webhook to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {webhooks.map((webhook) => (
                        <div
                            key={webhook.id}
                            onClick={() => onSelect(webhook)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedWebhook?.id === webhook.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900">{webhook.name}</h3>
                                        {webhook.active ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{webhook.url}</p>
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
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                                <div className="text-xs">
                                    <span className="text-gray-500">Total:</span>
                                    <span className="font-medium ml-1">{webhook.stats.totalDeliveries}</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-gray-500">Success:</span>
                                    <span className="font-medium text-green-600 ml-1">
                                        {webhook.stats.successfulDeliveries}
                                    </span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-gray-500">Failed:</span>
                                    <span className="font-medium text-red-600 ml-1">
                                        {webhook.stats.failedDeliveries}
                                    </span>
                                </div>
                                {webhook.stats.averageResponseTime && (
                                    <div className="text-xs">
                                        <span className="text-gray-500">Avg:</span>
                                        <span className="font-medium ml-1">
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
