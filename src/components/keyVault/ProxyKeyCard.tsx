import React, { useState } from 'react';
import {
  TrashIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import { ProxyKey } from '../../services/keyVault.service';

interface ProxyKeyCardProps {
  proxyKey: ProxyKey;
  onDelete: () => void;
  onToggle: () => void;
}

export const ProxyKeyCard: React.FC<ProxyKeyCardProps> = ({ proxyKey, onDelete, onToggle }) => {
  const [showKeyId, setShowKeyId] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getBudgetStatus = () => {
    const { usageStats, budgetLimit, dailyBudgetLimit, monthlyBudgetLimit } = proxyKey;

    if (budgetLimit && usageStats.totalCost >= budgetLimit) {
      return { status: 'over', message: 'Over total budget limit' };
    }
    if (dailyBudgetLimit && usageStats.dailyCost >= dailyBudgetLimit) {
      return { status: 'over', message: 'Over daily budget limit' };
    }
    if (monthlyBudgetLimit && usageStats.monthlyCost >= monthlyBudgetLimit) {
      return { status: 'over', message: 'Over monthly budget limit' };
    }

    // Check if approaching limits (80% threshold)
    if (budgetLimit && usageStats.totalCost >= budgetLimit * 0.8) {
      return { status: 'warning', message: 'Approaching total budget limit' };
    }
    if (dailyBudgetLimit && usageStats.dailyCost >= dailyBudgetLimit * 0.8) {
      return { status: 'warning', message: 'Approaching daily budget limit' };
    }
    if (monthlyBudgetLimit && usageStats.monthlyCost >= monthlyBudgetLimit * 0.8) {
      return { status: 'warning', message: 'Approaching monthly budget limit' };
    }

    return { status: 'good', message: 'Within budget limits' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 hover:border-primary-300/50 transition-all duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
            <KeyIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-display font-bold gradient-text-primary truncate mb-2">
              {proxyKey.name}
            </h3>
            <p className="font-body text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Linked to <span className="font-semibold gradient-text-primary">{proxyKey.providerKeyId.name}</span> ({proxyKey.providerKeyId.provider})
            </p>
            {proxyKey.description && (
              <p className="font-body text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                {proxyKey.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${proxyKey.isActive
              ? 'bg-gradient-success text-white shadow-lg'
              : 'glass border border-primary-200/30 shadow-lg backdrop-blur-xl text-light-text-tertiary dark:text-dark-text-tertiary hover:border-success-200/50'
              }`}
            title={proxyKey.isActive ? 'Deactivate' : 'Activate'}
          >
            {proxyKey.isActive ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeSlashIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 rounded-lg glass border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-500 hover:border-danger-200/50 transition-all duration-300 hover:scale-110"
            title="Delete proxy key"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Proxy Key ID */}
      <div className="mb-6 glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
              <span className="text-white text-xs">🔑</span>
            </div>
            <span className="font-display font-semibold gradient-text-primary">Proxy Key ID:</span>
            <button
              onClick={() => setShowKeyId(!showKeyId)}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300"
            >
              {showKeyId ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={() => copyToClipboard(proxyKey.keyId)}
            className="w-8 h-8 rounded-lg glass border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-500 hover:border-primary-200/50 transition-all duration-300 hover:scale-110"
            title="Copy to clipboard"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
        </div>
        <code className="font-mono text-sm bg-primary-100/50 dark:bg-primary-900/50 p-3 rounded-lg block break-all gradient-text-primary">
          {showKeyId ? proxyKey.keyId : proxyKey.keyId.replace(/(.{10}).*(.{10})/, '$1...***...$2')}
        </code>
        {copied && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-success flex items-center justify-center shadow-lg">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-sm font-body gradient-text-success">Copied to clipboard!</p>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl text-center">
          <div className="text-3xl font-display font-bold gradient-text-primary mb-1">
            {proxyKey.usageStats.totalRequests.toLocaleString()}
          </div>
          <div className="font-body text-xs text-primary-600 dark:text-primary-400">Total Requests</div>
        </div>
        <div className="glass p-4 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl text-center">
          <div className="text-3xl font-display font-bold gradient-text-success mb-1">
            {formatCurrency(proxyKey.usageStats.totalCost)}
          </div>
          <div className="font-body text-xs text-success-600 dark:text-success-400">Total Cost</div>
        </div>
        <div className="glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl text-center">
          <div className="text-3xl font-display font-bold gradient-text-warning mb-1">
            {formatCurrency(proxyKey.usageStats.dailyCost)}
          </div>
          <div className="font-body text-xs text-warning-600 dark:text-warning-400">Daily Cost</div>
        </div>
        <div className="glass p-4 rounded-xl border border-accent-200/30 shadow-lg backdrop-blur-xl text-center">
          <div className="text-3xl font-display font-bold gradient-text-accent mb-1">
            {formatCurrency(proxyKey.usageStats.monthlyCost)}
          </div>
          <div className="font-body text-xs text-accent-600 dark:text-accent-400">Monthly Cost</div>
        </div>
      </div>

      {/* Budget Status */}
      {(proxyKey.budgetLimit || proxyKey.dailyBudgetLimit || proxyKey.monthlyBudgetLimit) && (
        <div className="mb-6">
          <div className={`glass p-4 rounded-xl border ${budgetStatus.status === 'over'
            ? 'border-danger-200/30 bg-gradient-danger/10'
            : budgetStatus.status === 'warning'
              ? 'border-warning-200/30 bg-gradient-warning/10'
              : 'border-success-200/30 bg-gradient-success/10'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${budgetStatus.status === 'over'
                ? 'bg-gradient-danger'
                : budgetStatus.status === 'warning'
                  ? 'bg-gradient-warning'
                  : 'bg-gradient-success'
                }`}>
                <CurrencyDollarIcon className="h-4 w-4 text-white" />
              </div>
              <span className={`font-display font-semibold ${budgetStatus.status === 'over'
                ? 'gradient-text-danger'
                : budgetStatus.status === 'warning'
                  ? 'gradient-text-warning'
                  : 'gradient-text-success'
                }`}>
                {budgetStatus.message}
              </span>
            </div>
            <div className="space-y-2">
              {proxyKey.budgetLimit && (
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Budget:</span>
                  <span className="font-display font-semibold gradient-text-primary">{formatCurrency(proxyKey.budgetLimit)}</span>
                </div>
              )}
              {proxyKey.dailyBudgetLimit && (
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Daily Budget:</span>
                  <span className="font-display font-semibold gradient-text-primary">{formatCurrency(proxyKey.dailyBudgetLimit)}</span>
                </div>
              )}
              {proxyKey.monthlyBudgetLimit && (
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">Monthly Budget:</span>
                  <span className="font-display font-semibold gradient-text-primary">{formatCurrency(proxyKey.monthlyBudgetLimit)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="h-3 w-3 text-white" />
            </div>
            <span className="font-display font-semibold gradient-text-primary">Permissions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {proxyKey.permissions.map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-3 py-1 rounded-full font-display font-medium text-sm bg-gradient-primary/20 text-primary-700 dark:text-primary-300 capitalize"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>

        <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
              <ClockIcon className="h-3 w-3 text-white" />
            </div>
            <span className="font-display font-semibold gradient-text-primary">Last Used</span>
          </div>
          <div className="font-body text-light-text-primary dark:text-dark-text-primary">
            {formatDate(proxyKey.lastUsed)}
          </div>
        </div>
      </div>

      {/* Security Restrictions */}
      {(proxyKey.allowedIPs?.length || proxyKey.allowedDomains?.length || proxyKey.rateLimit) && (
        <div className="border-t border-primary-200/30 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🔒</span>
            </div>
            <h4 className="text-lg font-display font-bold gradient-text-primary">Security Restrictions</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proxyKey.rateLimit && (
              <div className="glass p-4 rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-warning flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-2 w-2 text-white" />
                  </div>
                  <span className="font-body text-sm text-warning-600 dark:text-warning-400">Rate Limit</span>
                </div>
                <span className="font-display font-semibold gradient-text-primary">
                  {proxyKey.rateLimit.toLocaleString()}/min
                </span>
              </div>
            )}
            {proxyKey.allowedIPs?.length && (
              <div className="glass p-4 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                    <GlobeAltIcon className="h-2 w-2 text-white" />
                  </div>
                  <span className="font-body text-sm text-primary-600 dark:text-primary-400">IP Whitelist</span>
                </div>
                <span className="font-display font-semibold gradient-text-primary">
                  {proxyKey.allowedIPs.length} address(es)
                </span>
              </div>
            )}
            {proxyKey.allowedDomains?.length && (
              <div className="glass p-4 rounded-xl border border-success-200/30 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-success flex items-center justify-center shadow-lg">
                    <UserGroupIcon className="h-2 w-2 text-white" />
                  </div>
                  <span className="font-body text-sm text-success-600 dark:text-success-400">Domain Whitelist</span>
                </div>
                <span className="font-display font-semibold gradient-text-primary">
                  {proxyKey.allowedDomains.length} domain(s)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-primary-200/30">
        <span className={`inline-flex items-center px-4 py-2 rounded-full font-display font-semibold text-sm ${proxyKey.isActive
          ? 'bg-gradient-success/20 text-success-700 dark:text-success-300'
          : 'bg-gradient-secondary/20 text-secondary-700 dark:text-secondary-300'
          }`}>
          {proxyKey.isActive ? '✅ Active' : '⏸️ Inactive'}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg">
            <span className="text-white text-xs">📅</span>
          </div>
          <span className="font-body text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Created {formatDate(proxyKey.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};