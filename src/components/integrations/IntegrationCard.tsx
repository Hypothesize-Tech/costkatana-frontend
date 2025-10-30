import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { integrationService } from '../../services/integration.service';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  TrashIcon,
  PlayIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Integration } from '../../types/integration.types';

interface IntegrationCardProps {
  integration: Integration;
  onUpdate: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onUpdate,
}) => {
  const { showNotification } = useNotifications();

  const testMutation = useMutation(
    () => integrationService.testIntegration(integration.id),
    {
      onSuccess: (data) => {
        if (data.success) {
          showNotification('Test message sent successfully!', 'success');
        } else {
          showNotification(`Test failed: ${data.message}`, 'error');
        }
        onUpdate();
      },
      onError: () => {
        showNotification('Failed to test integration', 'error');
      },
    }
  );

  const deleteMutation = useMutation(
    () => integrationService.deleteIntegration(integration.id),
    {
      onSuccess: () => {
        showNotification('Integration deleted successfully', 'success');
        onUpdate();
      },
      onError: () => {
        showNotification('Failed to delete integration', 'error');
      },
    }
  );

  const toggleStatusMutation = useMutation(
    () =>
      integrationService.updateIntegration(integration.id, {
        status: integration.status === 'active' ? 'inactive' : 'active',
      }),
    {
      onSuccess: () => {
        showNotification(
          `Integration ${integration.status === 'active' ? 'disabled' : 'enabled'}`,
          'success'
        );
        onUpdate();
      },
      onError: () => {
        showNotification('Failed to update integration status', 'error');
      },
    }
  );

  const getTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      slack_webhook: 'Slack Webhook',
      slack_oauth: 'Slack App',
      discord_webhook: 'Discord Webhook',
      discord_oauth: 'Discord Bot',
      custom_webhook: 'Custom Webhook',
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = () => {
    const statusConfig = {
      active: {
        label: 'Active',
        className: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-primary-500/20 dark:to-primary-600/30 text-emerald-800 dark:text-primary-400 shadow-sm shadow-primary-500/20',
        icon: CheckCircleIcon
      },
      inactive: {
        label: 'Inactive',
        className: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/20 dark:to-gray-600/30 text-gray-700 dark:text-gray-400 shadow-sm shadow-gray-500/20',
        icon: ClockIcon
      },
      error: {
        label: 'Error',
        className: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-500/20 dark:to-red-600/30 text-red-800 dark:text-red-400 shadow-sm shadow-red-500/20',
        icon: XCircleIcon
      },
      pending: {
        label: 'Pending',
        className: 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/30 text-yellow-800 dark:text-yellow-400 shadow-sm shadow-yellow-500/20',
        icon: ClockIcon
      },
    };

    const config = statusConfig[integration.status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the integration "${integration.name}"?`
      )
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-200/40 bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 transition-all duration-300 shadow-lg backdrop-blur-xl hover:shadow-2xl hover:-translate-y-0.5 hover:border-primary-300/50 dark:hover:border-primary-400/60">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-display font-bold gradient-text-primary mb-1">
            {integration.name}
          </h3>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {getTypeDisplay(integration.type)}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      {integration.description && (
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
          {integration.description}
        </p>
      )}

      {/* Error Message */}
      {integration.errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/15 border-l-2 border-red-500 dark:border-red-400 rounded-md mb-4 text-sm text-red-800 dark:text-red-300">
          <XCircleIcon className="w-4 h-4 flex-shrink-0" />
          {integration.errorMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700/50 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
            Success Rate
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {integration.stats.totalDeliveries > 0
              ? `${((integration.stats.successfulDeliveries / integration.stats.totalDeliveries) * 100).toFixed(1)}%`
              : 'N/A'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
            Total Deliveries
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {integration.stats.totalDeliveries}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
            Avg Response
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {integration.stats.averageResponseTime > 0
              ? `${integration.stats.averageResponseTime.toFixed(0)}ms`
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => testMutation.mutate()}
          disabled={testMutation.isLoading || integration.status === 'inactive'}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/90 dark:bg-gray-800/90 border border-primary-200/30 dark:border-primary-200/40 rounded-lg text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-gradient-primary hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-white/90 dark:disabled:hover:bg-gray-800/90"
          title="Test Integration"
        >
          <PlayIcon className="w-4 h-4" />
          {testMutation.isLoading ? 'Testing...' : 'Test'}
        </button>
        <button
          onClick={() => toggleStatusMutation.mutate()}
          disabled={toggleStatusMutation.isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/90 dark:bg-gray-800/90 border border-primary-200/30 dark:border-primary-200/40 rounded-lg text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-gradient-primary hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          title={integration.status === 'active' ? 'Disable' : 'Enable'}
        >
          <Cog6ToothIcon className="w-4 h-4" />
          {integration.status === 'active' ? 'Disable' : 'Enable'}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/90 dark:bg-gray-800/90 border border-red-200/30 dark:border-red-200/40 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          title="Delete Integration"
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};
