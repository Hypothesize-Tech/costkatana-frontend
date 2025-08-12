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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Webhook className="w-8 h-8 text-blue-600" />
                            Webhooks
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Send real-time notifications to external services
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Webhook
                    </button>
                </div>

                {/* Queue Stats */}
                {queueStats && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Delivery Queue
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-yellow-600">{queueStats.waiting}</p>
                                <p className="text-gray-600">Waiting</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{queueStats.active}</p>
                                <p className="text-gray-600">Active</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{queueStats.completed}</p>
                                <p className="text-gray-600">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-600">{queueStats.failed}</p>
                                <p className="text-gray-600">Failed</p>
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
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Select a webhook to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Form Modal */}
                {(showForm || editingWebhook) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
