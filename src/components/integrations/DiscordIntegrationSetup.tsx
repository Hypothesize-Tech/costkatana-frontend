import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { useNotifications } from '../../contexts/NotificationContext';
import {
    XMarkIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    HashtagIcon,
    LightBulbIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { AlertType } from '../../types/integration.types';
import { apiClient } from '@/config/api';

interface DiscordIntegrationSetupProps {
    onClose: () => void;
    onComplete: () => void;
}

export const DiscordIntegrationSetup: React.FC<DiscordIntegrationSetupProps> = ({
    onClose,
    onComplete,
}) => {
    const [integrationMethod, setIntegrationMethod] = useState<'webhook' | 'oauth'>('oauth');
    const [name, setName] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<AlertType>>(
        new Set(['cost_threshold', 'anomaly', 'system'])
    );

    const { showNotification } = useNotifications();

    // Listen for OAuth callback messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'discord-oauth-success') {
                showNotification('Discord connected successfully via OAuth!', 'success');
                onComplete();
            } else if (event.data.type === 'discord-oauth-error') {
                showNotification(`OAuth failed: ${event.data.message}`, 'error');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onComplete, showNotification]);

    // OAuth flow initiation
    const initiateOAuthMutation = useMutation(
        async () => {
            const response = await apiClient.get('/integrations/discord/auth');
            return response.data.data;
        },
        {
            onSuccess: (data: { authUrl?: string }) => {
                if (data?.authUrl) {
                    // Open OAuth in popup window
                    const width = 600;
                    const height = 700;
                    const left = window.screen.width / 2 - width / 2;
                    const top = window.screen.height / 2 - height / 2;

                    window.open(
                        data.authUrl,
                        'Discord OAuth',
                        `width=${width},height=${height},left=${left},top=${top}`
                    );
                }
            },
            onError: (error: unknown) => {
                const errorMessage = error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data?.message || 'Failed to initiate Discord OAuth'
                    : 'Failed to initiate Discord OAuth';
                showNotification(errorMessage, 'error');
            }
        }
    );

    const createWebhookMutation = useMutation(
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
                showNotification('Discord webhook integration created successfully!', 'success');
                onComplete();
            },
            onError: () => {
                showNotification('Failed to create Discord webhook integration', 'error');
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
        if (integrationMethod === 'oauth') {
            initiateOAuthMutation.mutate();
        } else {
            createWebhookMutation.mutate();
        }
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
                            Receive alerts and use chat commands
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
                        {/* Integration Method Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Integration Method *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIntegrationMethod('oauth')}
                                    className={`p-4 border-2 rounded-lg transition-all text-left ${integrationMethod === 'oauth'
                                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                        OAuth (Recommended)
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Full bot access, list channels, send messages
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIntegrationMethod('webhook')}
                                    className={`p-4 border-2 rounded-lg transition-all text-left ${integrationMethod === 'webhook'
                                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                        Webhook
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Simple setup, alerts only
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* OAuth Instructions */}
                        {integrationMethod === 'oauth' && (
                            <>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                                    <div className="flex items-start gap-2 mb-2">
                                        <SparklesIcon className="w-5 h-5 text-blue-900 dark:text-blue-300 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                            OAuth provides full Discord bot capabilities:
                                        </p>
                                    </div>
                                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 list-disc list-inside">
                                        <li>List all channels, users, and roles in your server</li>
                                        <li>Send messages via chat commands (@discord)</li>
                                        <li>Create/delete channels and roles</li>
                                        <li>Manage users (kick, ban, assign roles)</li>
                                        <li>Automatic alert delivery</li>
                                        <li>Full Administrator access to your server</li>
                                    </ul>
                                    <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                                        Click <strong>"Connect with OAuth"</strong> below and authorize the bot in your Discord server.
                                    </p>
                                </div>

                                {/* Command Reference */}
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-500/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-900 dark:text-purple-300" />
                                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                                            Available Chat Commands:
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Channel Management */}
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <HashtagIcon className="w-4 h-4 text-purple-800 dark:text-purple-200" />
                                                <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                                                    Channel Management:
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:list-channels
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord create channel "name"
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:channel:ID delete
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:channel:ID send "message"
                                                </code>
                                            </div>
                                        </div>

                                        {/* User Management */}
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <UserGroupIcon className="w-4 h-4 text-purple-800 dark:text-purple-200" />
                                                <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                                                    User Management:
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:list-users
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:user:USER_ID kick
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:user:USER_ID ban
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:user:USER_ID unban
                                                </code>
                                            </div>
                                        </div>

                                        {/* Role Management */}
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <ShieldCheckIcon className="w-4 h-4 text-purple-800 dark:text-purple-200" />
                                                <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                                                    Role Management:
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord:list-roles
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord create role "name"
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord assign role user:ID role:ID
                                                </code>
                                                <code className="block text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                                                    @discord remove role user:ID role:ID
                                                </code>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-start gap-2">
                                        <LightBulbIcon className="w-4 h-4 text-purple-700 dark:text-purple-300 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-purple-700 dark:text-purple-300">
                                            <strong>Tip:</strong> Type <code className="px-1 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded">@</code> in chat to see autocomplete suggestions!
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Webhook Fields */}
                        {integrationMethod === 'webhook' && (
                            <>
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
                                            <li>Open your Discord server</li>
                                            <li>Go to Server Settings → Integrations → Webhooks</li>
                                            <li>Click "Create Webhook" or "New Webhook"</li>
                                            <li>Give it a name and select a channel</li>
                                            <li>Click "Copy Webhook URL"</li>
                                            <li>Paste it here</li>
                                        </ol>
                                        <div className="mt-2 flex items-start gap-2">
                                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-700 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                <strong>Note:</strong> Webhooks can only send alerts. For chat commands like <code>@discord:list-channels</code>, use OAuth instead.
                                            </p>
                                        </div>
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
                            </>
                        )}
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
                            disabled={
                                (integrationMethod === 'webhook' && (createWebhookMutation.isLoading || !name || !webhookUrl)) ||
                                (integrationMethod === 'oauth' && initiateOAuthMutation.isLoading)
                            }
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-primary text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/60 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                        >
                            {integrationMethod === 'oauth' ? (
                                initiateOAuthMutation.isLoading ? 'Opening OAuth...' : 'Connect with OAuth'
                            ) : (
                                createWebhookMutation.isLoading ? 'Creating...' : 'Create Webhook Integration'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
