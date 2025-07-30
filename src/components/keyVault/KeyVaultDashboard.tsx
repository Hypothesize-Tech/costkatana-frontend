import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    KeyIcon,
    ShieldCheckIcon,
    PlusIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { KeyVaultService, KeyVaultDashboard as DashboardData } from '../../services/keyVault.service';
import { CreateProviderKeyModal } from './CreateProviderKeyModal';
import { CreateProxyKeyModal } from './CreateProxyKeyModal';
import { ProviderKeyCard } from './ProviderKeyCard';
import { ProxyKeyCard } from './ProxyKeyCard';

export const KeyVaultDashboard: React.FC = () => {
    const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);
    const [showCreateProxyModal, setShowCreateProxyModal] = useState(false);
    const queryClient = useQueryClient();

    // Fetch dashboard data
    const {
        data: dashboardData,
        isLoading,
        error,
        refetch
    } = useQuery<DashboardData>({
        queryKey: ['keyVaultDashboard'],
        queryFn: KeyVaultService.getDashboard,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Delete provider key mutation
    const deleteProviderKeyMutation = useMutation({
        mutationFn: KeyVaultService.deleteProviderKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['keyVaultDashboard'] });
        },
    });

    // Delete proxy key mutation
    const deleteProxyKeyMutation = useMutation({
        mutationFn: KeyVaultService.deleteProxyKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['keyVaultDashboard'] });
        },
    });

    // Toggle proxy key status mutation
    const toggleProxyKeyMutation = useMutation({
        mutationFn: ({ proxyKeyId, isActive }: { proxyKeyId: string; isActive: boolean }) =>
            KeyVaultService.updateProxyKeyStatus(proxyKeyId, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['keyVaultDashboard'] });
        },
    });

    const handleDeleteProviderKey = async (providerKeyId: string) => {
        if (window.confirm('Are you sure you want to delete this provider key? This will also delete all associated proxy keys.')) {
            deleteProviderKeyMutation.mutate(providerKeyId);
        }
    };

    const handleDeleteProxyKey = async (proxyKeyId: string) => {
        if (window.confirm('Are you sure you want to delete this proxy key?')) {
            deleteProxyKeyMutation.mutate(proxyKeyId);
        }
    };

    const handleToggleProxyKey = async (proxyKeyId: string, currentStatus: boolean) => {
        toggleProxyKeyMutation.mutate({
            proxyKeyId,
            isActive: !currentStatus
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading Key Vault</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>Failed to load Key Vault data. Please try again.</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => refetch()}
                                className="bg-red-100 px-4 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const analytics = dashboardData?.analytics;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
                            <h1 className="text-xl font-semibold text-gray-900">Key Vault</h1>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCreateProviderModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Provider Key
                            </button>
                            <button
                                onClick={() => setShowCreateProxyModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <KeyIcon className="h-4 w-4 mr-2" />
                                Create Proxy Key
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <KeyIcon className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-blue-900">Total Keys</p>
                                        <p className="text-2xl font-bold text-blue-600">{analytics.totalKeys}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <ChartBarIcon className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-green-900">Total Requests</p>
                                        <p className="text-2xl font-bold text-green-600">{analytics.totalRequests.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-yellow-900">Total Cost</p>
                                        <p className="text-2xl font-bold text-yellow-600">${analytics.totalCost.toFixed(4)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <ClockIcon className="h-8 w-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-purple-900">Daily Cost</p>
                                        <p className="text-2xl font-bold text-purple-600">${analytics.dailyCost.toFixed(4)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Provider Keys Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Provider Keys</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Master API keys from your AI providers, stored securely and encrypted.
                    </p>
                </div>
                <div className="p-6">
                    {dashboardData?.providerKeys.length === 0 ? (
                        <div className="text-center py-12">
                            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No provider keys</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by adding your first provider API key.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateProviderModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Provider Key
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dashboardData?.providerKeys.map((providerKey) => (
                                <ProviderKeyCard
                                    key={providerKey._id}
                                    providerKey={providerKey}
                                    onDelete={() => handleDeleteProviderKey(providerKey._id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Proxy Keys Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Proxy Keys</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Controlled access keys that provide secure, limited access to your provider keys.
                    </p>
                </div>
                <div className="p-6">
                    {dashboardData?.proxyKeys.length === 0 ? (
                        <div className="text-center py-12">
                            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No proxy keys</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Create proxy keys to provide controlled access to your applications.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateProxyModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    disabled={!dashboardData?.providerKeys.length}
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Create Proxy Key
                                </button>
                                {!dashboardData?.providerKeys.length && (
                                    <p className="mt-2 text-xs text-gray-400">
                                        You need at least one provider key to create proxy keys.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData?.proxyKeys.map((proxyKey) => (
                                <ProxyKeyCard
                                    key={proxyKey._id}
                                    proxyKey={proxyKey}
                                    onDelete={() => handleDeleteProxyKey(proxyKey.keyId)}
                                    onToggle={() => handleToggleProxyKey(proxyKey.keyId, proxyKey.isActive)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateProviderModal && (
                <CreateProviderKeyModal
                    isOpen={showCreateProviderModal}
                    onClose={() => setShowCreateProviderModal(false)}
                    onSuccess={() => {
                        setShowCreateProviderModal(false);
                        queryClient.invalidateQueries({ queryKey: ['keyVaultDashboard'] });
                    }}
                />
            )}

            {showCreateProxyModal && (
                <CreateProxyKeyModal
                    isOpen={showCreateProxyModal}
                    onClose={() => setShowCreateProxyModal(false)}
                    providerKeys={dashboardData?.providerKeys || []}
                    onSuccess={() => {
                        setShowCreateProxyModal(false);
                        queryClient.invalidateQueries({ queryKey: ['keyVaultDashboard'] });
                    }}
                />
            )}
        </div>
    );
};