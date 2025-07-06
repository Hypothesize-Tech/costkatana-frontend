// src/components/settings/ApiKeySettings.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, CogIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '../../contexts/NotificationContext';

interface ApiKeySettingsProps {
    profile: any;
    onUpdate: (data: any) => void;
}

const PERMISSION_OPTIONS = [
    { id: 'read', name: 'Read Only', description: 'View projects, usage data, and analytics' },
    { id: 'write', name: 'Read & Write', description: 'Track usage, create projects, and modify data' },
    { id: 'admin', name: 'Admin', description: 'Full access including user management' },
];

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newKey, setNewKey] = useState({
        name: '',
        permissions: ['read'] as string[],
        expiresAt: ''
    });

    const [showCreatedKey, setShowCreatedKey] = useState<string | null>(null);
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const { data: apiKeys, isLoading } = useQuery(
        ['dashboard-api-keys'],
        userService.getDashboardApiKeys
    );
    const createKeyMutation = useMutation(
        (data: { name: string; permissions: string[]; expiresAt?: string }) =>
            userService.createDashboardApiKey(data.name, data.permissions, data.expiresAt),
        {
            onSuccess: (response) => {
                queryClient.invalidateQueries(['dashboard-api-keys']);
                showNotification('Dashboard API key created successfully', 'success');
                setShowCreatedKey(response.data.apiKey);
                setShowAddForm(false);
                setNewKey({ name: '', permissions: ['read'], expiresAt: '' });
            },
            onError: () => {
                showNotification('Failed to create API key', 'error');
            },
        }
    );

    const deleteKeyMutation = useMutation(
        (keyId: string) => userService.deleteDashboardApiKey(keyId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['dashboard-api-keys']);
                showNotification('API key deleted successfully', 'success');
            },
            onError: () => {
                showNotification('Failed to delete API key', 'error');
            },
        }
    );

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.name.trim()) {
            showNotification('Please enter a name for the API key', 'error');
            return;
        }
        createKeyMutation.mutate({
            name: newKey.name.trim(),
            permissions: newKey.permissions,
            expiresAt: newKey.expiresAt || undefined
        });
    };



    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showNotification('API key copied to clipboard', 'success');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const isExpired = (expiresAt?: string) => {
        return expiresAt ? new Date(expiresAt) < new Date() : false;
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Dashboard API Keys</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Create API keys to access your dashboard data programmatically. These keys can be used to retrieve project information, track usage, and access analytics.
                </p>
            </div>

            {/* Show newly created key */}
            {showCreatedKey && (
                <div className="p-4 mb-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-green-900">
                            🎉 API Key Created Successfully
                        </h3>
                        <button
                            onClick={() => setShowCreatedKey(null)}
                            className="text-lg text-green-600 hover:text-green-800"
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-3 mb-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-800">
                            ⚠️ IMPORTANT: Copy this API key now!
                        </p>
                        <p className="mt-1 text-xs text-yellow-700">
                            This is the only time you'll see the full key. After closing this dialog, only a masked version will be shown for security.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block mb-1 text-xs font-medium text-green-800">
                                Full API Key (copy this):
                            </label>
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 p-3 font-mono text-sm break-all bg-white rounded border border-green-300">
                                    {showCreatedKey}
                                </code>
                                <button
                                    onClick={() => {
                                        copyToClipboard(showCreatedKey);
                                        showNotification('Full API key copied to clipboard!', 'success');
                                    }}
                                    className="px-4 py-3 text-sm font-medium text-white whitespace-nowrap bg-green-600 rounded border hover:bg-green-700"
                                >
                                    Copy Full Key
                                </button>
                            </div>
                        </div>
                        <div className="p-2 text-xs text-green-700 bg-green-100 rounded">
                            <strong>Usage:</strong> Set this as your <code>API_KEY</code> environment variable:<br />
                            <code className="px-1 bg-white rounded">API_KEY={showCreatedKey}</code>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing API Keys */}
            <div className="mb-6 space-y-4">
                {apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0 ? (
                    apiKeys.map((apiKey: any) => (
                        <div
                            key={apiKey.keyId}
                            className={`bg-white p-4 rounded-lg border ${isExpired(apiKey.expiresAt) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {apiKey.name}
                                        </h3>
                                        {isExpired(apiKey.expiresAt) && (
                                            <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block mb-1 text-xs font-medium text-gray-700">
                                                    Masked Key ID (for reference only):
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    <code className="px-2 py-1 font-mono text-sm bg-gray-100 rounded">
                                                        {apiKey.maskedKey}
                                                    </code>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-amber-50 rounded border border-amber-200">
                                                <p className="text-xs font-medium text-amber-800">
                                                    🔒 Security Notice
                                                </p>
                                                <p className="mt-1 text-xs text-amber-700">
                                                    Full API key was only shown once during creation. If you need the full key again, you'll need to delete this key and create a new one.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>Permissions: {apiKey.permissions.join(', ')}</span>
                                            <span>Created: {formatDate(apiKey.createdAt)}</span>
                                            {apiKey.expiresAt && (
                                                <span>Expires: {formatDate(apiKey.expiresAt)}</span>
                                            )}
                                            {apiKey.lastUsed && (
                                                <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteKeyMutation.mutate(apiKey.keyId)}
                                    className="ml-4 text-red-600 hover:text-red-800"
                                    disabled={deleteKeyMutation.isLoading}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-6 text-center bg-gray-50 rounded-lg">
                        <CogIcon className="mx-auto w-12 h-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No API keys configured</p>
                        <p className="text-xs text-gray-400">Create an API key to access your dashboard data</p>
                    </div>
                )}
            </div>

            {/* Add New Key Form */}
            {showAddForm ? (
                <form onSubmit={handleCreateKey} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="mb-4 text-sm font-medium text-gray-900">Create New API Key</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                value={newKey.name}
                                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                                className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., Production API, Development Access"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Permissions
                            </label>
                            <div className="mt-2 space-y-2">
                                {PERMISSION_OPTIONS.map(permission => (
                                    <label key={permission.id} className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={newKey.permissions.includes(permission.id)}
                                            onChange={(e) => {
                                                const permissions = e.target.checked
                                                    ? [...newKey.permissions, permission.id]
                                                    : newKey.permissions.filter(p => p !== permission.id);
                                                setNewKey({ ...newKey, permissions });
                                            }}
                                            className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        />
                                        <div className="ml-3">
                                            <span className="text-sm font-medium text-gray-700">
                                                {permission.name}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                {permission.description}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expiration (Optional)
                            </label>
                            <input
                                type="date"
                                value={newKey.expiresAt}
                                onChange={(e) => setNewKey({ ...newKey, expiresAt: e.target.value })}
                                className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Leave empty for no expiration
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewKey({ name: '', permissions: ['read'], expiresAt: '' });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createKeyMutation.isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {createKeyMutation.isLoading ? 'Creating...' : 'Create API Key'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                >
                    <PlusIcon className="mr-2 w-4 h-4" />
                    Create API Key
                </button>
            )}

            <div className="p-4 mt-6 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Usage Instructions</h4>
                <div className="mt-2 space-y-1 text-sm text-blue-700">
                    <p>• Use these API keys in the Authorization header: <code>Bearer your_api_key</code></p>
                    <p>• Access project data: <code>GET /api/projects</code></p>
                    <p>• Track usage: <code>POST /api/usage/track</code></p>
                    <p>• View analytics: <code>GET /api/analytics</code></p>
                </div>
            </div>
        </div>
    );
};