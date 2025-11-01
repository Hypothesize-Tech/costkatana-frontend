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
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
          <span className="text-white text-2xl">🔐</span>
        </div>
        <h3 className="text-xl font-display font-bold gradient-text-primary mb-2">Loading Key Vault...</h3>
        <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">Fetching your secure keys and analytics</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl border border-danger-200/30 shadow-2xl backdrop-blur-xl bg-gradient-danger/10 p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">❌</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold gradient-text-danger mb-2">Error loading Key Vault</h3>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Failed to load Key Vault data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="btn btn-danger"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const analytics = dashboardData?.analytics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-8 border-b border-primary-200/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">🔐 Key Vault</h1>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Secure storage and management for your AI provider keys
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateProviderModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Provider Key
              </button>
              <button
                onClick={() => setShowCreateProxyModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <KeyIcon className="h-5 w-5" />
                Create Proxy Key
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <KeyIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-body text-sm text-primary-600 dark:text-primary-400 mb-1">Total Keys</p>
                    <p className="text-3xl font-display font-bold gradient-text-primary">{analytics.totalKeys}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-body text-sm text-success-600 dark:text-success-400 mb-1">Total Requests</p>
                    <p className="text-3xl font-display font-bold gradient-text-success">{analytics.totalRequests.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-warning-50/50 to-warning-100/50 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-body text-sm text-warning-600 dark:text-warning-400 mb-1">Total Cost</p>
                    <p className="text-3xl font-display font-bold gradient-text-warning">${analytics.totalCost.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-body text-sm text-accent-600 dark:text-accent-400 mb-1">Daily Cost</p>
                    <p className="text-3xl font-display font-bold gradient-text-accent">${analytics.dailyCost.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Provider Keys Section */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-6 border-b border-primary-200/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🔐</span>
            </div>
            <h2 className="text-xl font-display font-bold gradient-text-primary">Provider Keys</h2>
          </div>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
            Master API keys from your AI providers, stored securely and encrypted.
          </p>
        </div>
        <div className="p-6">
          {dashboardData?.providerKeys.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-secondary mx-auto mb-6 flex items-center justify-center shadow-lg">
                <KeyIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary mb-2">No provider keys</h3>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-8">
                Get started by adding your first provider API key.
              </p>
              <button
                onClick={() => setShowCreateProviderModal(true)}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="h-5 w-5" />
                Add Provider Key
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-6 border-b border-primary-200/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🔑</span>
            </div>
            <h2 className="text-xl font-display font-bold gradient-text-primary">Proxy Keys</h2>
          </div>
          <p className="font-body text-light-text-secondary dark:text-dark-text-secondary">
            Controlled access keys that provide secure, limited access to your provider keys.
          </p>
        </div>
        <div className="p-6">
          {dashboardData?.proxyKeys.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-accent mx-auto mb-6 flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary mb-2">No proxy keys</h3>
              <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-8">
                Create proxy keys to provide controlled access to your applications.
              </p>
              <button
                onClick={() => setShowCreateProxyModal(true)}
                className="btn btn-secondary flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!dashboardData?.providerKeys.length}
              >
                <PlusIcon className="h-5 w-5" />
                Create Proxy Key
              </button>
              {!dashboardData?.providerKeys.length && (
                <div className="glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-warning/10 mt-6 max-w-md mx-auto">
                  <p className="text-sm font-body text-warning-700 dark:text-warning-300">
                    ⚠️ You need at least one provider key to create proxy keys.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
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