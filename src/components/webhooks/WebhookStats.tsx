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
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Recent Deliveries</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Showing the last {deliveries.length} webhook deliveries
                </p>
            </div>

            <div className="divide-y">
                {deliveries.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        No deliveries yet. Send a test webhook to get started.
                    </div>
                ) : (
                    deliveries.map((delivery) => (
                        <div
                            key={delivery.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedDelivery?.id === delivery.id ? 'bg-blue-50' : ''
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
                                        <p className="text-xs text-gray-500">
                                            {new Date(delivery.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                                        {delivery.status}
                                    </span>
                                    {delivery.response?.responseTime && (
                                        <span className="text-sm text-gray-600">
                                            {formatResponseTime(delivery.response.responseTime)}
                                        </span>
                                    )}
                                    {delivery.attempt > 1 && (
                                        <span className="text-xs text-gray-500">
                                            Attempt {delivery.attempt}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReplay(delivery.id);
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">Delivery Details</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Event ID: {detailedDelivery.eventId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedDelivery(null);
                                        setDetailedDelivery(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                                    <p className="text-gray-600 mt-2">Loading details...</p>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {/* Status Section */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Status</p>
                                                    <p className={`font-medium ${getStatusColor(detailedDelivery.status)}`}>
                                                        {detailedDelivery.status}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Attempt</p>
                                                    <p className="font-medium">{detailedDelivery.attempt}</p>
                                                </div>
                                                {detailedDelivery.retriesLeft !== undefined && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Retries Left</p>
                                                        <p className="font-medium">{detailedDelivery.retriesLeft}</p>
                                                    </div>
                                                )}
                                                {detailedDelivery.nextRetryAt && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Next Retry</p>
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
                                        <h4 className="font-medium text-gray-900 mb-2">Request</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600">URL</p>
                                                <p className="font-mono text-sm break-all">{detailedDelivery.request.url}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Method</p>
                                                <p className="font-medium">{detailedDelivery.request.method}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Headers</p>
                                                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(detailedDelivery.request.headers, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Body</p>
                                                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(JSON.parse(detailedDelivery.request.body), null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Response Section */}
                                    {detailedDelivery.response && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Response</h4>
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Status Code</p>
                                                        <p className="font-medium">{detailedDelivery.response.statusCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Response Time</p>
                                                        <p className="font-medium">
                                                            {formatResponseTime(detailedDelivery.response.responseTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Headers</p>
                                                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                                        {JSON.stringify(detailedDelivery.response.headers, null, 2)}
                                                    </pre>
                                                </div>
                                                {detailedDelivery.response.body && (
                                                    <div>
                                                        <p className="text-sm text-gray-600">Body</p>
                                                        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
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
                                            <h4 className="font-medium text-gray-900 mb-2">Error</h4>
                                            <div className="bg-red-50 p-4 rounded-lg">
                                                <p className="font-medium text-red-900">{detailedDelivery.error.type}</p>
                                                <p className="text-sm text-red-800 mt-1">{detailedDelivery.error.message}</p>
                                                {detailedDelivery.error.code && (
                                                    <p className="text-sm text-red-700 mt-1">Code: {detailedDelivery.error.code}</p>
                                                )}
                                                {detailedDelivery.error.details && (
                                                    <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto">
                                                        {JSON.stringify(detailedDelivery.error.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Event Data Section */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Event Data</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <pre className="text-xs overflow-x-auto">
                                                {JSON.stringify(detailedDelivery.eventData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => onReplay(detailedDelivery.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
