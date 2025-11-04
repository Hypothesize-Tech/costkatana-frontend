import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AlertType } from '../../types/integration.types';

interface DiscordIntegrationSetupProps {
    onClose: () => void;
    onComplete: () => void;
}

export const DiscordIntegrationSetup: React.FC<DiscordIntegrationSetupProps> = ({
    onClose,
    onComplete,
}) => {
    const [name, setName] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<AlertType>>(
        new Set(['cost_threshold', 'anomaly', 'system'])
    );

    const { showNotification } = useNotifications();

    const createMutation = useMutation(
        () =>
            integrationService.createIntegration({
                type: 'discord_webhook',
                name,
                credentials: {
                    webhookUrl,
                },
                alertRouting: Object.fromEntries(
                    Array.from(selectedAlertTypes).map((type) => [
                        type,
                        {
                            enabled: true,
                            severities: ['medium', 'high', 'critical'],
                        },
                    ])
                ),
            }),
        {
            onSuccess: () => {
                showNotification('Discord integration created successfully!', 'success');
                onComplete();
            },
            onError: () => {
                showNotification('Failed to create Discord integration', 'error');
            },
        }
    );

    const alertTypes: { value: AlertType; label: string }[] = [
        { value: 'cost_threshold', label: 'Cost Threshold Alerts' },
        { value: 'usage_spike', label: 'Usage Spike Alerts' },
        { value: 'optimization_available', label: 'Optimization Opportunities' },
        { value: 'anomaly', label: 'Anomaly Detection' },
        { value: 'system', label: 'System Notifications' },
    ];

    const toggleAlertType = (type: AlertType) => {
        const newSet = new Set(selectedAlertTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        setSelectedAlertTypes(newSet);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-5"
            onClick={onClose}
        >
            <div
                className="glass rounded-xl border border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-primary-200/20">
                    <div>
                        <h2 className="text-2xl font-display font-bold gradient-text-primary mb-1">
                            Connect Discord
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            Receive alerts in your Discord server
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Integration Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Production Alerts"
                                required
                                className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Discord Webhook URL *
                            </label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://discord.com/api/webhooks/..."
                                required
                                className="w-full px-4 py-3 border border-primary-200/30 dark:border-primary-200/20 rounded-lg text-sm bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 shadow-sm"
                            />
                            <div className="p-3 mt-2 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                                <p className="mb-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                                    How to get your Discord Webhook URL:
                                </p>
                                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 list-decimal list-inside">
                                    <li>Open your Discord server where you want to receive alerts</li>
                                    <li>Go to <strong>Server Settings</strong> → <strong>Integrations</strong> → <strong>Webhooks</strong></li>
                                    <li>Or right-click on the channel → <strong>Edit Channel</strong> → <strong>Integrations</strong> → <strong>Webhooks</strong></li>
                                    <li>Click <strong>"Create Webhook"</strong> or <strong>"New Webhook"</strong></li>
                                    <li>Give it a name (e.g., "CostKatana Alerts")</li>
                                    <li>Select the channel where alerts should be posted</li>
                                    <li>Click <strong>"Copy Webhook URL"</strong> (starts with <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">https://discord.com/api/webhooks/</code>)</li>
                                    <li>Paste it here</li>
                                </ol>
                                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                    <strong>Note:</strong> You need <strong>Manage Webhooks</strong> permission in the channel.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Select Alert Types
                            </label>
                            <div className="space-y-3">
                                {alertTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className="flex items-center gap-3 p-3.5 border border-primary-200/20 dark:border-primary-200/30 rounded-lg cursor-pointer transition-all bg-white/50 dark:bg-gray-800/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:border-primary-300/40 dark:hover:border-primary-400/50 hover:shadow-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAlertTypes.has(type.value)}
                                            onChange={() => toggleAlertType(type.value)}
                                            className="w-[18px] h-[18px] rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                                            {type.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-primary-200/20">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white/80 dark:bg-gray-800/80 text-primary-600 dark:text-primary-400 border border-primary-200/30 dark:border-primary-200/40 hover:bg-primary-50/90 dark:hover:bg-primary-900/30 hover:border-primary-300/50 dark:hover:border-primary-400/60 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isLoading || !name || !webhookUrl}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                        >
                            {createMutation.isLoading ? 'Creating...' : 'Create Integration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
