import React from 'react';
import {
    WifiIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
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
            <div className="glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30">
                        <WifiIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                    </div>
                    <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-secondary-900 dark:text-white">Your Webhooks</h2>
                </div>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 sm:h-22 md:h-24 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30">
                    <WifiIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-secondary-900 dark:text-white">Your Webhooks</h2>
            </div>

            {webhooks.length === 0 ? (
                <div className="text-center py-6 sm:py-8 md:py-12">
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#06ec9e]/10 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:to-[#009454]/20 w-fit mx-auto mb-3 sm:mb-4">
                        <WifiIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#06ec9e] dark:text-emerald-400" />
                    </div>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-1">No webhooks configured</p>
                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">Create your first webhook to get started</p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {webhooks.map((webhook) => (
                        <div
                            key={webhook.id}
                            onClick={() => onSelect(webhook)}
                            className={`p-2.5 sm:p-3 md:p-4 glass rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[44px] [touch-action:manipulation] ${selectedWebhook?.id === webhook.id
                                ? 'border-[#06ec9e] dark:border-emerald-400 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 shadow-lg shadow-[#06ec9e]/20 dark:shadow-[#06ec9e]/30'
                                : 'border-primary-200/30 dark:border-primary-500/20 hover:border-[#06ec9e]/50 dark:hover:border-emerald-400/50 bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30 hover:shadow-md active:scale-[0.98]'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        <h3 className="font-display font-semibold text-xs sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary truncate">{webhook.name}</h3>
                                        {webhook.active ? (
                                            <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                            <XCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1 truncate">{webhook.url}</p>
                                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 mt-1.5 sm:mt-2 flex-wrap">
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            {webhook.events.length} events
                                        </span>
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            v{webhook.version}
                                        </span>
                                        {webhook.stats.lastDeliveryAt && (
                                            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" />
                                                {new Date(webhook.stats.lastDeliveryAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTest(webhook.id);
                                        }}
                                        className="p-1.5 sm:p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:bg-[#06ec9e]/10 dark:hover:bg-emerald-400/20 transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center [touch-action:manipulation]"
                                        title="Test webhook"
                                    >
                                        <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(webhook);
                                        }}
                                        className="p-1.5 sm:p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:bg-[#06ec9e]/10 dark:hover:bg-emerald-400/20 transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center [touch-action:manipulation]"
                                        title="Edit webhook"
                                    >
                                        <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(webhook.id);
                                        }}
                                        className="p-1.5 sm:p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center [touch-action:manipulation]"
                                        title="Delete webhook"
                                    >
                                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-primary-200/30 dark:border-primary-500/20 flex-wrap">
                                <div className="text-xs">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Total:</span>
                                    <span className="font-medium ml-1 text-light-text-primary dark:text-dark-text-primary">{webhook.stats.totalDeliveries || 0}</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Success:</span>
                                    <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                                        {webhook.stats.successfulDeliveries || 0}
                                    </span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Failed:</span>
                                    <span className="font-medium text-red-600 dark:text-red-400 ml-1">
                                        {webhook.stats.failedDeliveries || 0}
                                    </span>
                                </div>
                                {webhook.stats.averageResponseTime && (
                                    <div className="text-xs">
                                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
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
