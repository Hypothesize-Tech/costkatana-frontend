import React, { useState, useEffect, useMemo } from 'react';
import {
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { automationService } from '../../services/automation.service';
import { WorkflowROIMetrics } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WorkflowROIComparisonProps {
  startDate: string;
  endDate: string;
  onWorkflowClick?: (workflowId: string) => void;
}

type SortField = 'efficiencyScore' | 'totalCost' | 'totalExecutions' | 'averageCostPerExecution' | 'workflowName';
type SortDirection = 'asc' | 'desc';

export const WorkflowROIComparison: React.FC<WorkflowROIComparisonProps> = ({
  startDate,
  endDate,
  onWorkflowClick
}) => {
  const [workflows, setWorkflows] = useState<WorkflowROIMetrics[]>([]);
  const [summary, setSummary] = useState<{
    totalWorkflows: number;
    averageEfficiencyScore: number;
    totalCost: number;
    totalExecutions: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('efficiencyScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchComparison();
  }, [startDate, endDate]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationService.getWorkflowROIComparison(startDate, endDate);
      if (response.success) {
        setWorkflows(response.data.workflows);
        setSummary(response.data.summary);
      } else {
        setError('Failed to load ROI comparison');
      }
    } catch (err) {
      setError('Failed to load ROI comparison');
      console.error('Error fetching ROI comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedWorkflows = useMemo(() => {
    return [...workflows].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'efficiencyScore':
          aValue = a.efficiencyScore;
          bValue = b.efficiencyScore;
          break;
        case 'totalCost':
          aValue = a.totalCost;
          bValue = b.totalCost;
          break;
        case 'totalExecutions':
          aValue = a.totalExecutions;
          bValue = b.totalExecutions;
          break;
        case 'averageCostPerExecution':
          aValue = a.averageCostPerExecution;
          bValue = b.averageCostPerExecution;
          break;
        case 'workflowName':
          aValue = a.workflowName.toLowerCase();
          bValue = b.workflowName.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [workflows, sortField, sortDirection]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-[#06ec9e] dark:text-emerald-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
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
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Workflows
              </span>
              <ChartBarIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-display font-bold gradient-text-primary">
              {summary.totalWorkflows}
            </div>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Avg Efficiency
              </span>
              <TrophyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
              {summary.averageEfficiencyScore.toFixed(1)}
            </div>
            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              Out of 100
            </div>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Cost
              </span>
              <CurrencyDollarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(summary.totalCost)}
            </div>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Executions
              </span>
              <BoltIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400">
              {formatNumber(summary.totalExecutions)}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50/30 dark:bg-primary-900/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('workflowName')}
                    className="flex items-center text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-[#06ec9e] dark:hover:text-emerald-400 transition-colors"
                  >
                    Workflow
                    <SortIcon field="workflowName" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('efficiencyScore')}
                    className="flex items-center text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-[#06ec9e] dark:hover:text-emerald-400 transition-colors"
                  >
                    Efficiency Score
                    <SortIcon field="efficiencyScore" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('totalCost')}
                    className="flex items-center text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-[#06ec9e] dark:hover:text-emerald-400 transition-colors"
                  >
                    Total Cost
                    <SortIcon field="totalCost" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('totalExecutions')}
                    className="flex items-center text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-[#06ec9e] dark:hover:text-emerald-400 transition-colors"
                  >
                    Executions
                    <SortIcon field="totalExecutions" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('averageCostPerExecution')}
                    className="flex items-center text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-[#06ec9e] dark:hover:text-emerald-400 transition-colors"
                  >
                    Cost/Execution
                    <SortIcon field="averageCostPerExecution" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Platform
                </th>
                <th className="px-6 py-4 text-left text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-500/10">
              {sortedWorkflows.map((workflow, index) => (
                <tr
                  key={workflow.workflowId}
                  className={`hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors ${
                    onWorkflowClick ? 'cursor-pointer' : ''
                  } ${index < 3 ? 'bg-gradient-to-r from-[#06ec9e]/5 via-emerald-50/10 to-[#009454]/5 dark:from-[#06ec9e]/10 dark:via-emerald-900/20 dark:to-[#009454]/10' : ''}`}
                  onClick={() => onWorkflowClick && onWorkflowClick(workflow.workflowId)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {index < 3 && (
                        <TrophyIcon className={`w-5 h-5 ${
                          index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'
                        }`} />
                      )}
                      <div>
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                          {workflow.workflowName}
                        </div>
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          {workflow.workflowId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-display font-bold ${getEfficiencyColor(workflow.efficiencyScore)}`}>
                        {workflow.efficiencyScore.toFixed(1)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEfficiencyBadge(workflow.efficiencyScore)}`}>
                        {workflow.efficiencyScore >= 80 ? 'Excellent' : workflow.efficiencyScore >= 60 ? 'Good' : workflow.efficiencyScore >= 40 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-display font-semibold gradient-text-primary">
                      {formatCurrency(workflow.totalCost)}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatCurrency(workflow.totalAICost)} AI + {formatCurrency(workflow.totalOrchestrationCost)} orchestration
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {formatNumber(workflow.totalExecutions)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {formatCurrency(workflow.averageCostPerExecution)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                      {workflow.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {workflow.trends.costPerExecutionTrend === 'improving' && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                          <ArrowDownIcon className="w-4 h-4" />
                          Improving
                        </span>
                      )}
                      {workflow.trends.costPerExecutionTrend === 'degrading' && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                          <ArrowUpIcon className="w-4 h-4" />
                          Degrading
                        </span>
                      )}
                      {workflow.trends.costPerExecutionTrend === 'stable' && (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Stable
                        </span>
                      )}
                      {workflow.costChangePercentage !== 0 && (
                        <span className={`text-xs font-body ${
                          workflow.costChangePercentage < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          ({workflow.costChangePercentage >= 0 ? '+' : ''}{workflow.costChangePercentage.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedWorkflows.length === 0 && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-12 text-center">
          <ChartBarIcon className="w-12 h-12 mx-auto text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
          <p className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            No workflow data available
          </p>
          <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            No workflows have usage data for the selected time period.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowROIComparison;


