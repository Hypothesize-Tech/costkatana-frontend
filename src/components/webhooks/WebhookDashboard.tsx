import React, { useState, useEffect } from 'react';
import { Plus, Webhook, Activity } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { webhookApi } from '../../services/webhook.api';
import { WebhookList } from './WebhookList';
import { WebhookForm } from './WebhookForm';
import { WebhookDetails } from './WebhookDetails';
import { WebhookStats } from './WebhookStats';
import { IWebhook, IWebhookDelivery } from '../../types/webhook.types';

export const WebhookDashboard: React.FC = () => {
    const [webhooks, setWebhooks] = useState<IWebhook[]>([]);
    const [selectedWebhook, setSelectedWebhook] = useState<IWebhook | null>(null);
    const [deliveries, setDeliveries] = useState<IWebhookDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<IWebhook | null>(null);
    const [queueStats, setQueueStats] = useState<any>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadWebhooks();
        loadQueueStats();
        const interval = setInterval(loadQueueStats, 5000); // Refresh queue stats every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedWebhook) {
            loadDeliveries(selectedWebhook.id);
        }
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

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-display font-bold gradient-text-primary flex items-center gap-3">
                                <Webhook className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                Webhooks
                            </h1>
                            <p className="text-secondary-600 dark:text-secondary-300 mt-2">
                                Send real-time notifications to external services
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Webhook
                        </button>
                    </div>
                </div>

                {/* Queue Stats */}
                {queueStats && (
                    <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-secondary-900 dark:text-white">
                            <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            Delivery Queue
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                                <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">{queueStats.waiting}</p>
                                <p className="text-secondary-600 dark:text-secondary-300">Waiting</p>
                            </div>
                            <div className="text-center p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{queueStats.active}</p>
                                <p className="text-secondary-600 dark:text-secondary-300">Active</p>
                            </div>
                            <div className="text-center p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                                <p className="text-3xl font-bold text-success-600 dark:text-success-400">{queueStats.completed}</p>
                                <p className="text-secondary-600 dark:text-secondary-300">Completed</p>
                            </div>
                            <div className="text-center p-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
                                <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">{queueStats.failed}</p>
                                <p className="text-secondary-600 dark:text-secondary-300">Failed</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <>
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
                            </>
                        ) : (
                            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
                                <Webhook className="w-16 h-16 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
                                <p className="text-secondary-600 dark:text-secondary-300">Select a webhook to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Form Modal */}
                {(showForm || editingWebhook) && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
