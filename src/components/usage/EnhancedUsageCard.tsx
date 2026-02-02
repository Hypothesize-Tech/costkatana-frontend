import React, { useState } from 'react';
import { EyeIcon, ClockIcon, CurrencyDollarIcon, ExclamationTriangleIcon, CheckCircleIcon, TagIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Usage } from '@/types';
import { DetailBreakdownModal } from './DetailBreakdownModal';

interface EnhancedUsageCardProps {
  usage: Usage;
  className?: string;
  showDetailButton?: boolean;
  compact?: boolean;
}

export function EnhancedUsageCard({ 
  usage, 
  className = '', 
  showDetailButton = true,
  compact = false 
}: EnhancedUsageCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatCost = (cost: number) => {
    return cost < 0.001 ? `$${cost.toFixed(6)}` : `$${cost.toFixed(4)}`;
  };

  const formatTime = (time: number) => {
    return time > 1000 ? `${(time / 1000).toFixed(1)}s` : `${Math.round(time)}ms`;
  };

  const getStatusColor = () => {
    return usage.errorOccurred ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';
  };

  const getStatusIcon = () => {
    return usage.errorOccurred ? ExclamationTriangleIcon : CheckCircleIcon;
  };

  if (compact) {
    return (
      <>
        <div className={`p-3 rounded-lg border border-primary-200/20 dark:border-primary-600/20 bg-white/30 dark:bg-dark-card/30 hover:bg-white/50 dark:hover:bg-dark-card/50 transition-colors ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                usage.errorOccurred ? 'bg-red-400' : 'bg-emerald-400'
              }`}></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-secondary-900 dark:text-white truncate">
                    {usage.model}
                  </span>
                  <span className="text-xs text-secondary-600 dark:text-secondary-400">
                    {usage.service}
                  </span>
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-400">
                  {new Date(usage.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-secondary-600 dark:text-secondary-400 flex-shrink-0">
              <span>{formatCost(usage.cost)}</span>
              <span>{formatTime(usage.responseTime)}</span>
              {showDetailButton && (
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <DetailBreakdownModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          usage={usage}
        />
      </>
    );
  }

  return (
    <>
      <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.01] transition-transform duration-300 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg flex-shrink-0">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-secondary-900 dark:text-white truncate">
                  {usage.service}
                </h3>
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  {usage.model}
                </span>
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {new Date(usage.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            usage.errorOccurred 
              ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400'
          }`}>
            {React.createElement(getStatusIcon(), { className: 'w-3 h-3' })}
            {usage.errorOccurred ? 'Error' : 'Success'}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-secondary-600 dark:text-secondary-400">Cost</span>
            </div>
            <p className="font-semibold text-secondary-900 dark:text-white">
              {formatCost(usage.cost)}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-secondary-600 dark:text-secondary-400">Time</span>
            </div>
            <p className="font-semibold text-secondary-900 dark:text-white">
              {formatTime(usage.responseTime)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TagIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-secondary-600 dark:text-secondary-400">Tokens</span>
            </div>
            <p className="font-semibold text-secondary-900 dark:text-white">
              {usage.totalTokens.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-sm text-secondary-700 dark:text-secondary-300 line-clamp-2">
            {usage.prompt?.substring(0, 150)}{usage.prompt && usage.prompt.length > 150 ? '...' : ''}
          </p>
        </div>

        {/* Tags */}
        {usage.tags && usage.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {usage.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-800/50 dark:text-secondary-300"
              >
                {tag}
              </span>
            ))}
            {usage.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600 dark:bg-secondary-800/50 dark:text-secondary-400">
                +{usage.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* User Info */}
        {usage.userEmail && (
          <div className="flex items-center gap-2 mb-4 text-sm text-secondary-600 dark:text-secondary-400">
            <UserIcon className="w-4 h-4" />
            <span className="truncate">{usage.userEmail}</span>
          </div>
        )}

        {/* Actions */}
        {showDetailButton && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowDetailModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 rounded-lg transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              View Details
            </button>
          </div>
        )}

        {/* Optimization Badge */}
        {usage.optimizationApplied && (
          <div className="absolute top-2 right-2">
            <div className="p-1 rounded-full bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg">
              <SparklesIcon className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>

      <DetailBreakdownModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        usage={usage}
      />
    </>
  );
}