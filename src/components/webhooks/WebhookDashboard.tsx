import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    WifiIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    QueueListIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../../hooks/useToast';
import { webhookApi } from '../../services/webhook.api';
import { WebhookList } from './WebhookList';
import { WebhookForm } from './WebhookForm';
import { WebhookDetails } from './WebhookDetails';
import { WebhookStats } from './WebhookStats';
import { WebhookShimmer } from '../shimmer/WebhookShimmer';
import { IWebhook, IWebhookDelivery } from '../../types/webhook.types';

export const WebhookDashboard: React.FC = () => {
    const [webhooks, setWebhooks] = useState<IWebhook[]>([]);
    const [selectedWebhook, setSelectedWebhook] = useState<IWebhook | null>(null);
    const [deliveries, setDeliveries] = useState<IWebhookDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<IWebhook | null>(null);
    const [queueStats, setQueueStats] = useState<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    } | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadWebhooks();
        loadQueueStats();
        const interval = setInterval(loadQueueStats, 5000); // Refresh queue stats every 5 seconds
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedWebhook) {
            loadDeliveries(selectedWebhook.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWebhook]);

    const loadWebhooks = async () => {
        try {
            setLoading(true);
            const data = await webhookApi.getWebhooks();
            setWebhooks(data.webhooks);
        } catch (error) {
            showToast('Failed to load webhooks', 'error');
            console.error('Error loading webhooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDeliveries = async (webhookId: string) => {
        try {
            const data = await webhookApi.getDeliveries(webhookId);
            setDeliveries(data.deliveries);
        } catch (error) {
            showToast('Failed to load deliveries', 'error');
            console.error('Error loading deliveries:', error);
        }
    };

    const loadQueueStats = async () => {
        try {
            const data = await webhookApi.getQueueStats();
            setQueueStats(data.queue);
        } catch (error) {
            console.error('Error loading queue stats:', error);
        }
    };

    const handleCreateWebhook = async (webhookData: any) => {
        try {
            const data = await webhookApi.createWebhook(webhookData);
            showToast('Webhook created successfully', 'success');
            setShowForm(false);
            await loadWebhooks();
            setSelectedWebhook(data.webhook);
        } catch (error) {
            showToast('Failed to create webhook', 'error');
            console.error('Error creating webhook:', error);
        }
    };

    const handleUpdateWebhook = async (webhookId: string, updates: any) => {
        try {
            await webhookApi.updateWebhook(webhookId, updates);
            showToast('Webhook updated successfully', 'success');
            setEditingWebhook(null);
            await loadWebhooks();
        } catch (error) {
            showToast('Failed to update webhook', 'error');
            console.error('Error updating webhook:', error);
        }
    };

    const handleDeleteWebhook = async (webhookId: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) {
            return;
        }

        try {
            await webhookApi.deleteWebhook(webhookId);
            showToast('Webhook deleted successfully', 'success');
            await loadWebhooks();
            if (selectedWebhook?.id === webhookId) {
                setSelectedWebhook(null);
            }
        } catch (error) {
            showToast('Failed to delete webhook', 'error');
            console.error('Error deleting webhook:', error);
        }
    };

    const handleTestWebhook = async (webhookId: string) => {
        try {
            await webhookApi.testWebhook(webhookId);
            showToast('Test webhook sent', 'success');
            // Reload deliveries after a short delay
            setTimeout(() => loadDeliveries(webhookId), 2000);
        } catch (error) {
            showToast('Failed to test webhook', 'error');
            console.error('Error testing webhook:', error);
        }
    };

    const handleReplayDelivery = async (deliveryId: string) => {
        try {
            await webhookApi.replayDelivery(deliveryId);
            showToast('Delivery replayed successfully', 'success');
            if (selectedWebhook) {
                await loadDeliveries(selectedWebhook.id);
            }
        } catch (error) {
            showToast('Failed to replay delivery', 'error');
            console.error('Error replaying delivery:', error);
        }
    };

    const copyWebhookSecret = (secret: string) => {
        navigator.clipboard.writeText(secret);
        showToast('Secret copied to clipboard', 'success');
    };

    if (loading) {
        return <WebhookShimmer />;
    }

    return (
        <div className="p-4 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="p-6 mb-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-8 sm:mb-8">
                    <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                        <div className="flex gap-4 items-center">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30">
                                <WifiIcon className="w-6 h-6 text-white sm:w-8 sm:h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold sm:text-3xl font-display gradient-text-primary">
                                    Webhooks
                                </h1>
                                <p className="mt-1 text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary sm:mt-2 font-body">
                                    Send real-time notifications to external services
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] hover:from-[#22c55e] hover:via-emerald-600 hover:to-[#16a34a] shadow-lg shadow-[#06ec9e]/30 hover:shadow-[#06ec9e]/50 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Create Webhook</span>
                        </button>
                    </div>
                </div>

                {/* Queue Stats */}
                {queueStats && (
                    <div className="p-4 mb-6 bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-6">
                        <div className="flex gap-3 items-center mb-4 sm:mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e]/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:to-[#009454]/30">
                                <QueueListIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-bold sm:text-xl font-display text-secondary-900 dark:text-white">
                                Delivery Queue
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                            <div className="overflow-hidden relative p-4 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 from-amber-50/50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 sm:p-5 group hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 from-amber-500/5 group-hover:opacity-100" />
                                <div className="relative">
                                    <ClockIcon className="mx-auto mb-2 w-6 h-6 text-amber-600 sm:w-8 sm:h-8 dark:text-amber-400" />
                                    <p className="text-2xl font-bold text-amber-600 sm:text-3xl font-display dark:text-amber-400">{queueStats.waiting || 0}</p>
                                    <p className="mt-1 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">Waiting</p>
                                </div>
                            </div>
                            <div className="relative overflow-hidden glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-br from-[#06ec9e]/10 to-emerald-100/50 dark:from-[#06ec9e]/20 dark:to-emerald-900/20 p-4 sm:p-5 text-center group hover:scale-105 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#06ec9e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative">
                                    <ArrowPathIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#06ec9e] dark:text-emerald-400 mx-auto mb-2 animate-pulse" />
                                    <p className="text-2xl sm:text-3xl font-display font-bold text-[#06ec9e] dark:text-emerald-400">{queueStats.active || 0}</p>
                                    <p className="mt-1 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">Active</p>
                                </div>
                            </div>
                            <div className="overflow-hidden relative p-4 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 sm:p-5 group hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 from-green-500/5 group-hover:opacity-100" />
                                <div className="relative">
                                    <CheckCircleIcon className="mx-auto mb-2 w-6 h-6 text-green-600 sm:w-8 sm:h-8 dark:text-green-400" />
                                    <p className="text-2xl font-bold text-green-600 sm:text-3xl font-display dark:text-green-400">{queueStats.completed || 0}</p>
                                    <p className="mt-1 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">Completed</p>
                                </div>
                            </div>
                            <div className="overflow-hidden relative p-4 text-center bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 from-red-50/50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 sm:p-5 group hover:scale-105">
                                <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 from-red-500/5 group-hover:opacity-100" />
                                <div className="relative">
                                    <XCircleIcon className="mx-auto mb-2 w-6 h-6 text-red-600 sm:w-8 sm:h-8 dark:text-red-400" />
                                    <p className="text-2xl font-bold text-red-600 sm:text-3xl font-display dark:text-red-400">{queueStats.failed || 0}</p>
                                    <p className="mt-1 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">Failed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
                    {/* Webhook List */}
                    <div className="lg:col-span-1">
                        <WebhookList
                            webhooks={webhooks}
                            selectedWebhook={selectedWebhook}
                            onSelect={setSelectedWebhook}
                            onEdit={setEditingWebhook}
                            onDelete={handleDeleteWebhook}
                            onTest={handleTestWebhook}
                            loading={loading}
                        />
                    </div>

                    {/* Webhook Details */}
                    <div className="lg:col-span-2">
                        {selectedWebhook ? (
                            <div className="space-y-4 sm:space-y-6">
                                <WebhookDetails
                                    webhook={selectedWebhook}
                                    onEdit={() => setEditingWebhook(selectedWebhook)}
                                    onDelete={() => handleDeleteWebhook(selectedWebhook.id)}
                                    onTest={() => handleTestWebhook(selectedWebhook.id)}
                                    onCopySecret={copyWebhookSecret}
                                />

                                <WebhookStats
                                    webhookId={selectedWebhook.id}
                                    deliveries={deliveries}
                                    onReplay={handleReplayDelivery}
                                />
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gradient-to-br rounded-2xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 sm:p-12">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#06ec9e]/10 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:to-[#009454]/20 w-fit mx-auto mb-4">
                                    <WifiIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#06ec9e] dark:text-emerald-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold sm:text-xl font-display text-secondary-900 dark:text-white">
                                    No Webhook Selected
                                </h3>
                                <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Select a webhook from the list to view details and delivery statistics
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Form Modal */}
                {(showForm || editingWebhook) && (
                    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-md bg-black/60 dark:bg-black/80">
                        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <WebhookForm
                                webhook={editingWebhook}
                                onSubmit={editingWebhook
                                    ? (data) => handleUpdateWebhook(editingWebhook.id, data)
                                    : handleCreateWebhook
                                }
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingWebhook(null);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
