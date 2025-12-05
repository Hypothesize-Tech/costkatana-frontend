import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Key,
  Shield,
  Plus,
  BarChart3,
  DollarSign,
  Clock,
  Lock,
  AlertCircle
} from 'lucide-react';
import { KeyVaultService, KeyVaultDashboard as DashboardData } from '../../services/keyVault.service';
import { CreateProviderKeyModal } from './CreateProviderKeyModal';
import { CreateProxyKeyModal } from './CreateProxyKeyModal';
import { ProviderKeyCard } from './ProviderKeyCard';
import { ProxyKeyCard } from './ProxyKeyCard';
import { KeyVaultShimmer } from '../shimmer/KeyVaultShimmer';

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
    return <KeyVaultShimmer />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-danger-200/30 bg-gradient-danger/10">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-danger flex-shrink-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="mb-2 text-base sm:text-lg font-bold font-display gradient-text-danger">Error loading Key Vault</h3>
            <p className="mb-4 text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
              Failed to load Key Vault data. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="btn btn-danger text-sm sm:text-base"
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-4 sm:p-6 lg:p-8 border-b border-primary-200/30">
          <div className="flex flex-col gap-4 sm:gap-6 justify-between items-start lg:flex-row lg:items-center">
            <div className="flex gap-3 sm:gap-4 items-center w-full lg:w-auto">
              <div className="flex justify-center items-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl font-bold font-display gradient-text-primary">
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                    Key Vault
                  </span>
                </h1>
                <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Secure storage and management for your AI provider keys
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowCreateProviderModal(true)}
                className="flex gap-2 items-center justify-center btn btn-primary text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Provider Key</span>
                <span className="sm:hidden">Add Provider</span>
              </button>
              <button
                onClick={() => setShowCreateProxyModal(true)}
                className="flex gap-2 items-center justify-center btn btn-secondary text-sm sm:text-base"
              >
                <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Create Proxy Key</span>
                <span className="sm:hidden">Create Proxy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 sm:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-primary-200/30 from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 hover:scale-105">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
                    <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs sm:text-sm font-body text-primary-600 dark:text-primary-400">Total Keys</p>
                    <p className="text-2xl sm:text-3xl font-bold font-display gradient-text-primary truncate">{analytics.totalKeys}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-success-200/30 from-success-50/50 to-success-100/50 dark:from-success-900/20 dark:to-success-800/20 hover:scale-105">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-success flex-shrink-0">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs sm:text-sm font-body text-success-600 dark:text-success-400">Total Requests</p>
                    <p className="text-2xl sm:text-3xl font-bold font-display gradient-text-success truncate">{analytics.totalRequests.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-warning-200/30 from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20 hover:scale-105">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-warning flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs sm:text-sm font-body text-warning-600 dark:text-warning-400">Total Cost</p>
                    <p className="text-2xl sm:text-3xl font-bold font-display gradient-text-warning truncate">${analytics.totalCost.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-transform duration-300 glass border-accent-200/30 from-accent-50/50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/20 hover:scale-105">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-accent flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs sm:text-sm font-body text-accent-600 dark:text-accent-400">Daily Cost</p>
                    <p className="text-2xl sm:text-3xl font-bold font-display gradient-text-accent truncate">${analytics.dailyCost.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Provider Keys Section */}
      <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-4 sm:p-6 border-b border-primary-200/30">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">Provider Keys</h2>
          </div>
          <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
            Master API keys from your AI providers, stored securely and encrypted.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          {dashboardData?.providerKeys.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg bg-gradient-secondary">
                <Key className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold font-display gradient-text-primary">No provider keys</h3>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary px-4">
                Get started by adding your first provider API key.
              </p>
              <button
                onClick={() => setShowCreateProviderModal(true)}
                className="flex gap-2 items-center mx-auto btn btn-primary text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Provider Key
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-4 sm:p-6 border-b border-primary-200/30">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-secondary flex-shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">Proxy Keys</h2>
          </div>
          <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
            Controlled access keys that provide secure, limited access to your provider keys.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          {dashboardData?.proxyKeys.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <div className="flex justify-center items-center mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg bg-gradient-accent">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-bold font-display gradient-text-primary">No proxy keys</h3>
              <p className="mb-6 sm:mb-8 text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary px-4">
                Create proxy keys to provide controlled access to your applications.
              </p>
              <button
                onClick={() => setShowCreateProxyModal(true)}
                className="flex gap-2 items-center mx-auto btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={!dashboardData?.providerKeys.length}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Proxy Key
              </button>
              {!dashboardData?.providerKeys.length && (
                <div className="p-3 sm:p-4 mx-auto mt-4 sm:mt-6 max-w-md rounded-xl border shadow-lg backdrop-blur-xl glass border-warning-200/30 bg-gradient-warning/10 dark:bg-gradient-warning/20">
                  <p className="flex gap-2 items-center text-xs sm:text-sm font-body text-warning-700 dark:text-warning-300">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    You need at least one provider key to create proxy keys.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
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