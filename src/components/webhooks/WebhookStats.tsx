import React, { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
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
                return <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />;
            case 'failed':
                return <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />;
            case 'pending':
                return <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />;
            case 'timeout':
                return <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700';
            case 'failed':
                return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
            case 'pending':
                return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';
            case 'timeout':
                return 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
            default:
                return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700';
        }
    };

    const formatResponseTime = (time?: number) => {
        if (!time) return '-';
        if (time < 1000) return `${time}ms`;
        return `${(time / 1000).toFixed(2)}s`;
    };

    return (
        <div className="glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
            <div className="p-3 sm:p-4 md:p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                <h3 className="text-sm sm:text-base md:text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">Recent Deliveries</h3>
                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Showing the last {deliveries.length} webhook deliveries
                </p>
            </div>

            <div className="divide-y divide-primary-200/30 dark:divide-primary-500/20">
                {deliveries.length === 0 ? (
                    <div className="p-4 sm:p-6 md:p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
                        <p className="text-xs sm:text-sm md:text-base">No deliveries yet. Send a test webhook to get started.</p>
                    </div>
                ) : (
                    deliveries.map((delivery) => (
                        <div
                            key={delivery.id}
                            className={`p-2.5 sm:p-3 md:p-4 hover:bg-white/50 dark:hover:bg-dark-card/50 cursor-pointer transition-all duration-300 min-h-[44px] [touch-action:manipulation] ${selectedDelivery?.id === delivery.id ? 'bg-gradient-to-r from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 border-l-4 border-[#06ec9e] dark:border-emerald-400' : ''
                                }`}
                            onClick={() => setSelectedDelivery(delivery)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                                    {getStatusIcon(delivery.status)}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary truncate">
                                            {delivery.eventType.split('.').join(' ')}
                                        </p>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            {new Date(delivery.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap">
                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full border ${getStatusColor(delivery.status)}`}>
                                        {delivery.status}
                                    </span>
                                    {delivery.response?.responseTime && (
                                        <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                            {formatResponseTime(delivery.response.responseTime)}
                                        </span>
                                    )}
                                    {delivery.attempt > 1 && (
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            Attempt {delivery.attempt}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReplay(delivery.id);
                                        }}
                                        className="p-1.5 sm:p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:bg-[#06ec9e]/10 dark:hover:bg-emerald-400/20 transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center [touch-action:manipulation]"
                                        title="Replay delivery"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delivery Details Modal */}
            {selectedDelivery && detailedDelivery && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 sm:p-2 md:p-4 z-50">
                    <div className="glass rounded-none sm:rounded-xl md:rounded-2xl border-0 sm:border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/95 to-white/90 dark:from-dark-card/95 dark:to-dark-card/90 max-w-4xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
                        <div className="p-3 sm:p-4 md:p-6 border-b border-primary-200/30 dark:border-primary-500/20">
                            <div className="flex justify-between items-start gap-3 sm:gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">Delivery Details</h3>
                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 truncate">
                                        Event ID: {detailedDelivery.eventId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedDelivery(null);
                                        setDetailedDelivery(null);
                                    }}
                                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 p-1.5 sm:p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[36px] min-w-[36px] flex items-center justify-center flex-shrink-0 [touch-action:manipulation]"
                                >
                                    <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto h-[calc(100vh-5rem)] sm:h-auto sm:max-h-[calc(90vh-8rem)]">
                            {loading ? (
                                <div className="p-4 sm:p-6 md:p-8 text-center">
                                    <ArrowPathIcon className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#06ec9e] dark:text-emerald-400 mx-auto" />
                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">Loading details...</p>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                                    {/* Status Section */}
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-2">Status</h4>
                                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 sm:p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">Status</p>
                                                    <p className={`font-medium text-sm sm:text-base mt-1 px-2 py-1 rounded-full inline-block border ${getStatusColor(detailedDelivery.status)}`}>
                                                        {detailedDelivery.status}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">Attempt</p>
                                                    <p className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mt-1">{detailedDelivery.attempt}</p>
                                                </div>
                                                {detailedDelivery.retriesLeft !== undefined && (
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">Retries Left</p>
                                                        <p className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mt-1">{detailedDelivery.retriesLeft}</p>
                                                    </div>
                                                )}
                                                {detailedDelivery.nextRetryAt && (
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">Next Retry</p>
                                                        <p className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mt-1">
                                                            {new Date(detailedDelivery.nextRetryAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Request Section */}
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-2">Request</h4>
                                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 sm:p-4 space-y-3">
                                            <div>
                                                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">URL</p>
                                                <p className="font-mono text-xs sm:text-sm break-all text-light-text-primary dark:text-dark-text-primary">{detailedDelivery.request.url}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Method</p>
                                                <p className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary">{detailedDelivery.request.method}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Headers</p>
                                                <pre className="text-xs bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg mt-1 overflow-x-auto border border-primary-200/30 dark:border-primary-500/20">
                                                    {JSON.stringify(detailedDelivery.request.headers, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Body</p>
                                                <pre className="text-xs bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg mt-1 overflow-x-auto border border-primary-200/30 dark:border-primary-500/20">
                                                    {JSON.stringify(JSON.parse(detailedDelivery.request.body), null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Response Section */}
                                    {detailedDelivery.response && (
                                        <div>
                                            <h4 className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-2">Response</h4>
                                            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 sm:p-4 space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Status Code</p>
                                                        <p className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary">{detailedDelivery.response.statusCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Response Time</p>
                                                        <p className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary">
                                                            {formatResponseTime(detailedDelivery.response.responseTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Headers</p>
                                                    <pre className="text-xs bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg mt-1 overflow-x-auto border border-primary-200/30 dark:border-primary-500/20">
                                                        {JSON.stringify(detailedDelivery.response.headers, null, 2)}
                                                    </pre>
                                                </div>
                                                {detailedDelivery.response.body && (
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Body</p>
                                                        <pre className="text-xs bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg mt-1 overflow-x-auto border border-primary-200/30 dark:border-primary-500/20">
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
                                            <h4 className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-2">Error</h4>
                                            <div className="glass rounded-xl border border-red-200/50 dark:border-red-500/30 bg-red-50/50 dark:bg-red-900/20 p-3 sm:p-4">
                                                <p className="font-medium text-sm sm:text-base text-red-900 dark:text-red-200">{detailedDelivery.error.type}</p>
                                                <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 mt-1">{detailedDelivery.error.message}</p>
                                                {detailedDelivery.error.code && (
                                                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mt-1">Code: {detailedDelivery.error.code}</p>
                                                )}
                                                {detailedDelivery.error.details && (
                                                    <pre className="text-xs bg-white dark:bg-dark-card p-2 sm:p-3 rounded-lg mt-2 overflow-x-auto border border-red-200/30 dark:border-red-500/20">
                                                        {JSON.stringify(detailedDelivery.error.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Event Data Section */}
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-2">Event Data</h4>
                                        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-card/50 p-3 sm:p-4">
                                            <pre className="text-xs overflow-x-auto text-light-text-primary dark:text-dark-text-primary">
                                                {JSON.stringify(detailedDelivery.eventData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-primary-200/30 dark:border-primary-500/20">
                                        <button
                                            onClick={() => onReplay(detailedDelivery.id)}
                                            className="btn-primary flex items-center gap-1.5 sm:gap-2 min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 text-white hover:shadow-lg hover:shadow-[#06ec9e]/30 dark:hover:shadow-emerald-500/50 transition-all duration-300 [touch-action:manipulation] active:scale-95"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            <span>Replay Delivery</span>
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
