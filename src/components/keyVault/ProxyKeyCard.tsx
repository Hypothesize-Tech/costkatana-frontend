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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <KeyIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {proxyKey.name}
            </h3>
            <p className="text-sm text-gray-500">
              Linked to {proxyKey.providerKeyId.name} ({proxyKey.providerKeyId.provider})
            </p>
            {proxyKey.description && (
              <p className="text-sm text-gray-600 mt-1">
                {proxyKey.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className={`p-2 rounded-md transition-colors ${proxyKey.isActive
              ? 'text-green-600 hover:bg-green-50'
              : 'text-gray-400 hover:bg-gray-50'
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
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Delete proxy key"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Proxy Key ID */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Proxy Key ID:</span>
            <button
              onClick={() => setShowKeyId(!showKeyId)}
              className="text-blue-600 hover:text-blue-700"
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
            className="text-gray-500 hover:text-gray-700"
            title="Copy to clipboard"
          >
            <ClipboardIcon className="h-4 w-4" />
          </button>
        </div>
        <code className="text-sm font-mono text-gray-800 break-all">
          {showKeyId ? proxyKey.keyId : proxyKey.keyId.replace(/(.{10}).*(.{10})/, '$1...***...$2')}
        </code>
        {copied && (
          <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
        )}
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {proxyKey.usageStats.totalRequests.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total Requests</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(proxyKey.usageStats.totalCost)}
          </div>
          <div className="text-xs text-gray-500">Total Cost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(proxyKey.usageStats.dailyCost)}
          </div>
          <div className="text-xs text-gray-500">Daily Cost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(proxyKey.usageStats.monthlyCost)}
          </div>
          <div className="text-xs text-gray-500">Monthly Cost</div>
        </div>
      </div>

      {/* Budget Status */}
      {(proxyKey.budgetLimit || proxyKey.dailyBudgetLimit || proxyKey.monthlyBudgetLimit) && (
        <div className="mb-4">
          <div className={`p-3 rounded-lg ${budgetStatus.status === 'over' ? 'bg-red-50 border border-red-200' :
            budgetStatus.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className={`h-4 w-4 ${budgetStatus.status === 'over' ? 'text-red-600' :
                budgetStatus.status === 'warning' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
              <span className={`text-sm font-medium ${budgetStatus.status === 'over' ? 'text-red-800' :
                budgetStatus.status === 'warning' ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                {budgetStatus.message}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              {proxyKey.budgetLimit && (
                <div>Total Budget: {formatCurrency(proxyKey.budgetLimit)}</div>
              )}
              {proxyKey.dailyBudgetLimit && (
                <div>Daily Budget: {formatCurrency(proxyKey.dailyBudgetLimit)}</div>
              )}
              {proxyKey.monthlyBudgetLimit && (
                <div>Monthly Budget: {formatCurrency(proxyKey.monthlyBudgetLimit)}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheckIcon className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Permissions</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {proxyKey.permissions.map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Last Used</span>
          </div>
          <div className="text-gray-600">
            {formatDate(proxyKey.lastUsed)}
          </div>
        </div>
      </div>

      {/* Security Restrictions */}
      {(proxyKey.allowedIPs?.length || proxyKey.allowedDomains?.length || proxyKey.rateLimit) && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Security Restrictions</h4>
          <div className="space-y-2 text-sm">
            {proxyKey.rateLimit && (
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Rate limit: {proxyKey.rateLimit.toLocaleString()}/min
                </span>
              </div>
            )}
            {proxyKey.allowedIPs?.length && (
              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  IP whitelist: {proxyKey.allowedIPs.length} address(es)
                </span>
              </div>
            )}
            {proxyKey.allowedDomains?.length && (
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Domain whitelist: {proxyKey.allowedDomains.length} domain(s)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proxyKey.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {proxyKey.isActive ? 'Active' : 'Inactive'}
        </span>
        <div className="text-xs text-gray-500">
          Created {formatDate(proxyKey.createdAt)}
        </div>
      </div>
    </div>
  );
};