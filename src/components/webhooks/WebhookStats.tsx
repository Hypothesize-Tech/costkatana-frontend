import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { IWebhookDelivery } from '../../types/webhook.types';
import { webhookApi } from '../../services/webhook.api';

interface WebhookStatsProps {
    webhookId: string; // Used for API calls
    deliveries: IWebhookDelivery[];
    onReplay: (deliveryId: string) => void;
}

export const WebhookStats: React.FC<WebhookStatsProps> = ({
    // webhookId is used in loadDeliveryDetails
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webhookId,
    deliveries,
    onReplay
}) => {
    const [selectedDelivery, setSelectedDelivery] = useState<IWebhookDelivery | null>(null);
    const [detailedDelivery, setDetailedDelivery] = useState<IWebhookDelivery | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedDelivery) {
            loadDeliveryDetails(selectedDelivery.id);
        }
    }, [selectedDelivery]);

    const loadDeliveryDetails = async (deliveryId: string) => {
        try {
            setLoading(true);
            const data = await webhookApi.getDelivery(deliveryId);
            setDetailedDelivery(data.delivery);
        } catch (error) {
            console.error('Error loading delivery details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'timeout':
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50';
            case 'timeout':
                return 'text-orange-600 bg-orange-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatResponseTime = (time?: number) => {
        if (!time) return '-';
        if (time < 1000) return `${time}ms`;
        return `${(time / 1000).toFixed(2)}s`;
    };

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="p-6 border-b border-primary-200/30">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Deliveries</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                    Showing the last {deliveries.length} webhook deliveries
                </p>
            </div>

            <div className="divide-y divide-primary-200/30">
                {deliveries.length === 0 ? (
                    <div className="p-8 text-center text-secondary-600 dark:text-secondary-300">
                        No deliveries yet. Send a test webhook to get started.
                    </div>
                ) : (
                    deliveries.map((delivery) => (
                        <div
                            key={delivery.id}
                            className={`p-4 hover:bg-secondary-50/30 dark:hover:bg-secondary-800/30 cursor-pointer transition-all duration-300 ${selectedDelivery?.id === delivery.id ? 'bg-gradient-to-r from-primary-50/50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/30' : ''
                                }`}
                            onClick={() => setSelectedDelivery(delivery)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(delivery.status)}
                                    <div>
                                        <p className="font-medium text-sm">
                                            {delivery.eventType.split('.').join(' ')}
                                        </p>
                                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                            {new Date(delivery.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                                        {delivery.status}
                                    </span>
                                    {delivery.response?.responseTime && (
                                        <span className="text-sm text-secondary-600 dark:text-secondary-300">
                                            {formatResponseTime(delivery.response.responseTime)}
                                        </span>
                                    )}
                                    {delivery.attempt > 1 && (
                                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                            Attempt {delivery.attempt}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReplay(delivery.id);
                                        }}
                                        className="p-1.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                        title="Replay delivery"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delivery Details Modal */}
            {selectedDelivery && detailedDelivery && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-primary-200/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Delivery Details</h3>
                                    <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                                        Event ID: {detailedDelivery.eventId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedDelivery(null);
                                        setDetailedDelivery(null);
                                    }}
                                    className="text-secondary-600 dark:text-secondary-300 hover:text-danger-600 dark:hover:text-danger-400 transition-colors duration-300"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                                    <p className="text-secondary-600 dark:text-secondary-300 mt-2">Loading details...</p>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {/* Status Section */}
                                    <div>
                                        <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Status</h4>
                                        <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-secondary-600 dark:text-secondary-300">Status</p>
                                                    <p className={`font-medium ${getStatusColor(detailedDelivery.status)}`}>
                                                        {detailedDelivery.status}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-secondary-600 dark:text-secondary-300">Attempt</p>
                                                    <p className="font-medium">{detailedDelivery.attempt}</p>
                                                </div>
                                                {detailedDelivery.retriesLeft !== undefined && (
                                                    <div>
                                                        <p className="text-sm text-secondary-600 dark:text-secondary-300">Retries Left</p>
                                                        <p className="font-medium">{detailedDelivery.retriesLeft}</p>
                                                    </div>
                                                )}
                                                {detailedDelivery.nextRetryAt && (
                                                    <div>
                                                        <p className="text-sm text-secondary-600 dark:text-secondary-300">Next Retry</p>
                                                        <p className="font-medium">
                                                            {new Date(detailedDelivery.nextRetryAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Request Section */}
                                    <div>
                                        <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Request</h4>
                                        <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg space-y-3">
                                            <div>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300">URL</p>
                                                <p className="font-mono text-sm break-all">{detailedDelivery.request.url}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300">Method</p>
                                                <p className="font-medium">{detailedDelivery.request.method}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300">Headers</p>
                                                <pre className="text-xs bg-white dark:bg-secondary-900 p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(detailedDelivery.request.headers, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-sm text-secondary-600 dark:text-secondary-300">Body</p>
                                                <pre className="text-xs bg-white dark:bg-secondary-900 p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(JSON.parse(detailedDelivery.request.body), null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Response Section */}
                                    {detailedDelivery.response && (
                                        <div>
                                            <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Response</h4>
                                            <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-secondary-600 dark:text-secondary-300">Status Code</p>
                                                        <p className="font-medium">{detailedDelivery.response.statusCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-secondary-600 dark:text-secondary-300">Response Time</p>
                                                        <p className="font-medium">
                                                            {formatResponseTime(detailedDelivery.response.responseTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-secondary-600 dark:text-secondary-300">Headers</p>
                                                    <pre className="text-xs bg-white dark:bg-secondary-900 p-2 rounded mt-1 overflow-x-auto">
                                                        {JSON.stringify(detailedDelivery.response.headers, null, 2)}
                                                    </pre>
                                                </div>
                                                {detailedDelivery.response.body && (
                                                    <div>
                                                        <p className="text-sm text-secondary-600 dark:text-secondary-300">Body</p>
                                                        <pre className="text-xs bg-white dark:bg-secondary-900 p-2 rounded mt-1 overflow-x-auto">
                                                            {detailedDelivery.response.body}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Section */}
                                    {detailedDelivery.error && (
                                        <div>
                                            <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Error</h4>
                                            <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg">
                                                <p className="font-medium text-danger-900 dark:text-danger-200">{detailedDelivery.error.type}</p>
                                                <p className="text-sm text-danger-800 dark:text-danger-300 mt-1">{detailedDelivery.error.message}</p>
                                                {detailedDelivery.error.code && (
                                                    <p className="text-sm text-danger-700 dark:text-danger-400 mt-1">Code: {detailedDelivery.error.code}</p>
                                                )}
                                                {detailedDelivery.error.details && (
                                                    <pre className="text-xs bg-white dark:bg-secondary-900 p-2 rounded mt-2 overflow-x-auto">
                                                        {JSON.stringify(detailedDelivery.error.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Event Data Section */}
                                    <div>
                                        <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Event Data</h4>
                                        <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg">
                                            <pre className="text-xs overflow-x-auto">
                                                {JSON.stringify(detailedDelivery.eventData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => onReplay(detailedDelivery.id)}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Replay Delivery
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
