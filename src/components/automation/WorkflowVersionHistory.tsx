import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { automationService } from '../../services/automation.service';
import { WorkflowVersion, WorkflowVersionComparison } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WorkflowVersionHistoryProps {
  workflowId: string;
  onVersionClick?: (version: WorkflowVersion) => void;
  onCompareClick?: (version1: number, version2: number) => void;
}

export const WorkflowVersionHistory: React.FC<WorkflowVersionHistoryProps> = ({
  workflowId,
  onVersionClick,
  onCompareClick
}) => {
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<{ v1?: number; v2?: number }>({});
  const [comparison, setComparison] = useState<WorkflowVersionComparison | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [workflowId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationService.getWorkflowVersions(workflowId);
      if (response.success) {
        setVersions(response.data);
      } else {
        setError('Failed to load version history');
      }
    } catch (err) {
      setError('Failed to load version history');
      console.error('Error fetching workflow versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionNumber: number) => {
    if (!selectedVersions.v1) {
      setSelectedVersions({ v1: versionNumber });
    } else if (!selectedVersions.v2 && selectedVersions.v1 !== versionNumber) {
      setSelectedVersions({ ...selectedVersions, v2: versionNumber });
    } else {
      setSelectedVersions({ v1: versionNumber });
    }
  };

  const compareVersions = async () => {
    if (!selectedVersions.v1 || !selectedVersions.v2) return;

    try {
      setComparing(true);
      const response = await automationService.compareWorkflowVersions(
        workflowId,
        selectedVersions.v1,
        selectedVersions.v2
      );
      if (response.success) {
        setComparison({
          version1: response.data.version1,
          version2: response.data.version2,
          differences: response.data.differences.map((d: { type: string; description: string; details: Record<string, unknown> }) => ({
            type: d.type as 'cost_change' | 'model_change' | 'step_add' | 'step_remove' | 'step_modify' | 'trigger_change' | 'metadata_change',
            description: d.description,
            details: d.details as Record<string, unknown>
          })),
          costImpact: response.data.costImpact
        });
      }
    } catch (err) {
      console.error('Error comparing versions:', err);
    } finally {
      setComparing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'cost_change':
        return <CurrencyDollarIcon className="w-4 h-4" />;
      case 'model_change':
        return <ArrowPathIcon className="w-4 h-4" />;
      case 'step_add':
        return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'step_remove':
        return <ArrowTrendingDownIcon className="w-4 h-4" />;
      default:
        return <DocumentDuplicateIcon className="w-4 h-4" />;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'cost_change':
        return 'text-[#06ec9e] dark:text-emerald-400';
      case 'model_change':
        return 'text-blue-600 dark:text-blue-400';
      case 'step_add':
        return 'text-green-600 dark:text-green-400';
      case 'step_remove':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <span className="font-body">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold gradient-text-primary">
            Version History
          </h3>
          <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            {versions.length} version{versions.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        {selectedVersions.v1 && selectedVersions.v2 && (
          <button
            onClick={compareVersions}
            disabled={comparing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {comparing ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-4 h-4" />
                Compare Versions
              </>
            )}
          </button>
        )}
      </div>

      {/* Version Timeline */}
      <div className="space-y-4">
        {versions.map((version, index) => {
          const isSelected = selectedVersions.v1 === version.versionNumber || selectedVersions.v2 === version.versionNumber;
          const isLatest = index === 0;

          return (
            <div
              key={version.id}
              className={`glass rounded-xl border shadow-lg backdrop-blur-xl p-6 cursor-pointer hover:shadow-xl transition-all ${isSelected
                  ? 'border-[#06ec9e] dark:border-emerald-400 bg-[#06ec9e]/10 dark:bg-emerald-900/20'
                  : 'border-primary-200/30 dark:border-primary-500/20'
                } ${isLatest ? 'ring-2 ring-[#06ec9e]/20 dark:ring-emerald-400/20' : ''}`}
              onClick={() => handleVersionSelect(version.versionNumber)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${isLatest
                    ? 'from-[#06ec9e] via-emerald-500 to-[#009454]'
                    : 'from-gray-400 to-gray-500'
                  } text-white flex items-center justify-center flex-shrink-0 font-display font-bold`}>
                  v{version.versionNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                      Version {version.versionNumber}
                    </h4>
                    {isLatest && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#06ec9e]/20 text-[#06ec9e] dark:bg-emerald-900/30 dark:text-emerald-400">
                        Latest
                      </span>
                    )}
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                      {version.snapshot.platform}
                    </span>
                  </div>
                  <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-3">
                    {formatDate(version.createdAt)}
                  </p>

                  {/* Snapshot Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="p-2 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                        Steps
                      </div>
                      <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {version.snapshot.steps.length}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                        AI Steps
                      </div>
                      <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {version.snapshot.steps.filter(s => s.isAIStep).length}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                        Est. Cost
                      </div>
                      <div className="text-sm font-display font-semibold gradient-text-primary">
                        {formatCurrency(version.snapshot.totalEstimatedCost)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                        Est. Tokens
                      </div>
                      <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {version.snapshot.totalEstimatedTokens.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Changes */}
                  {version.changes && version.changes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary-200/20 dark:border-primary-500/10">
                      <p className="text-xs font-body font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Changes from previous version:
                      </p>
                      <div className="space-y-1">
                        {version.changes.map((change, changeIndex) => (
                          <div
                            key={changeIndex}
                            className="flex items-start gap-2 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary"
                          >
                            <span className={getChangeTypeColor(change.type)}>
                              {getChangeTypeIcon(change.type)}
                            </span>
                            <span>{change.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-primary-200/20 dark:border-primary-500/10">
                      <div className="flex items-center gap-2 text-sm font-body text-[#06ec9e] dark:text-emerald-400">
                        <ChevronRightIcon className="w-4 h-4" />
                        {selectedVersions.v1 === version.versionNumber && !selectedVersions.v2
                          ? 'Select another version to compare'
                          : 'Selected for comparison'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
          <h4 className="text-lg font-display font-bold mb-4 gradient-text-primary">
            Version Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                Version {comparison.version1?.versionNumber || 'N/A'}
              </p>
              {comparison.version1 && (
                <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-2xl font-display font-bold gradient-text-primary mb-2">
                    {formatCurrency(comparison.version1.snapshot.totalEstimatedCost)}
                  </div>
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    {comparison.version1.snapshot.steps.length} steps
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                Version {comparison.version2?.versionNumber || 'N/A'}
              </p>
              {comparison.version2 && (
                <div className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-2xl font-display font-bold gradient-text-primary mb-2">
                    {formatCurrency(comparison.version2.snapshot.totalEstimatedCost)}
                  </div>
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    {comparison.version2.snapshot.steps.length} steps
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cost Impact */}
          <div className="mb-6 p-4 rounded-lg border border-primary-200/20 dark:border-primary-500/10 bg-gradient-to-r from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-body font-semibold text-light-text-primary dark:text-dark-text-primary">
                Cost Impact
              </span>
              <span className={`text-lg font-display font-bold ${comparison.costImpact >= 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-[#06ec9e] dark:text-emerald-400'
                }`}>
                {comparison.costImpact >= 0 ? '+' : ''}{formatCurrency(comparison.costImpact)}
              </span>
            </div>
          </div>

          {/* Differences */}
          {comparison.differences && comparison.differences.length > 0 && (
            <div>
              <h5 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
                Differences:
              </h5>
              <div className="space-y-2">
                {comparison.differences.map((diff, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                  >
                    <span className={getChangeTypeColor(diff.type)}>
                      {getChangeTypeIcon(diff.type)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                        {diff.description}
                      </p>
                      {diff.details && Object.keys(diff.details).length > 0 && (
                        <div className="mt-2 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          {Object.entries(diff.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-semibold">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {versions.length === 0 && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-12 text-center">
          <ClockIcon className="w-12 h-12 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
          <p className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No version history
          </p>
          <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            Version tracking will begin once workflow changes are detected.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowVersionHistory;

