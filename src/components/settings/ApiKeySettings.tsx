// src/components/settings/ApiKeySettings.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '../../contexts/NotificationContext';

interface ApiKeySettingsProps {
    profile: any;
    onUpdate: (data: any) => void;
}

const AI_SERVICES = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo, and more' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude 3 models' },
    { id: 'google', name: 'Google AI', description: 'Gemini Pro and PaLM' },
    { id: 'aws-bedrock', name: 'AWS Bedrock', description: 'Multiple foundation models' },
];

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newKey, setNewKey] = useState({ service: '', key: '' });
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const { data: apiKeys, isLoading } = useQuery(
        ['api-keys'],
        userService.getApiKeys
    );

    const addKeyMutation = useMutation(
        (data: { service: string; key: string }) => userService.addApiKey(data.service, data.key),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['api-keys']);
                showNotification('API key added successfully', 'success');
                setShowAddForm(false);
                setNewKey({ service: '', key: '' });
            },
            onError: () => {
                showNotification('Failed to add API key', 'error');
            },
        }
    );

    const removeKeyMutation = useMutation(
        (service: string) => userService.removeApiKey(service),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['api-keys']);
                showNotification('API key removed successfully', 'success');
            },
            onError: () => {
                showNotification('Failed to remove API key', 'error');
            },
        }
    );

    const handleAddKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.service || !newKey.key) {
            showNotification('Please select a service and enter an API key', 'error');
            return;
        }
        addKeyMutation.mutate(newKey);
    };

    const toggleKeyVisibility = (service: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(service)) {
            newVisible.delete(service);
        } else {
            newVisible.add(service);
        }
        setVisibleKeys(newVisible);
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return '*'.repeat(key.length);
        return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Manage your API keys for different AI services. Keys are encrypted and stored securely.
                </p>
            </div>

            {/* Existing API Keys */}
            <div className="space-y-4 mb-6">
                {apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0 ? (
                    apiKeys.map((apiKey: any) => {
                        const service = AI_SERVICES.find(s => s.id === apiKey.service);
                        return (
                            <div
                                key={apiKey.service}
                                className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {service?.name || apiKey.service}
                                        </h3>
                                        <p className="text-sm text-gray-500">{service?.description}</p>
                                        <div className="mt-2 flex items-center space-x-2">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {visibleKeys.has(apiKey.service)
                                                    ? apiKey.key
                                                    : maskApiKey(apiKey.key)}
                                            </code>
                                            <button
                                                onClick={() => toggleKeyVisibility(apiKey.service)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {visibleKeys.has(apiKey.service) ? (
                                                    <EyeSlashIcon className="h-4 w-4" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeKeyMutation.mutate(apiKey.service)}
                                        className="ml-4 text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">No API keys configured</p>
                    </div>
                )}
            </div>

            {/* Add New Key Form */}
            {showAddForm ? (
                <form onSubmit={handleAddKey} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Add New API Key</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Service
                            </label>
                            <select
                                value={newKey.service}
                                onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select a service</option>

                                {AI_SERVICES.filter(
                                    service => !apiKeys?.find((k: { service: string }) => k.service === service.id)
                                ).map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                API Key
                            </label>
                            <input
                                type="password"
                                value={newKey.key}
                                onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="sk-..."
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewKey({ service: '', key: '' });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addKeyMutation.isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {addKeyMutation.isLoading ? 'Adding...' : 'Add Key'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add API Key
                </button>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Security Note</h4>
                <p className="mt-1 text-sm text-blue-700">
                    API keys are encrypted before storage and are never transmitted to our servers.
                    Only you have access to your keys.
                </p>
            </div>
        </div>
    );
};