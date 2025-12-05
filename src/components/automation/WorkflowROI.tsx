import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { automationService } from '../../services/automation.service';
import { WorkflowROIMetrics } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface WorkflowROIProps {
  workflowId: string;
  startDate: string;
  endDate: string;
}

export const WorkflowROI: React.FC<WorkflowROIProps> = ({
  workflowId,
  startDate,
  endDate
}) => {
  const [roiMetrics, setRoiMetrics] = useState<WorkflowROIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchROI();
  }, [workflowId, startDate, endDate]);

  const fetchROI = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationService.getWorkflowROI(workflowId, startDate, endDate);
      if (response.success) {
        setRoiMetrics(response.data);
      } else {
        setError('Failed to load ROI metrics');
      }
    } catch (err) {
      setError('Failed to load ROI metrics');
      console.error('Error fetching workflow ROI:', err);
    } finally {
      setLoading(false);
    }
  };

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
    if (score >= 80) return 'from-[#06ec9e] via-emerald-500 to-[#009454]';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getEfficiencyLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !roiMetrics) {
    return (
      <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <span className="font-body">{error || 'No ROI data available'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-display font-bold gradient-text-primary truncate">
            {roiMetrics.workflowName}
          </h3>
          <p className="text-xs sm:text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary capitalize">
            {roiMetrics.platform} • ROI Analysis
          </p>
        </div>
        <button
          onClick={fetchROI}
          className="px-3 sm:px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-500/20 text-xs sm:text-sm font-medium hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Total Cost
            </span>
            <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
            {formatCurrency(roiMetrics.totalCost)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {formatNumber(roiMetrics.totalExecutions)} executions
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Cost/Execution
            </span>
            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(roiMetrics.averageCostPerExecution)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Average per execution
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Cost Change
            </span>
            {roiMetrics.costChange >= 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#06ec9e] dark:text-emerald-400" />
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-display font-bold ${roiMetrics.costChange >= 0 ? 'text-red-600 dark:text-red-400' : 'text-[#06ec9e] dark:text-emerald-400'
            }`}>
            {roiMetrics.costChange >= 0 ? '+' : ''}{formatCurrency(roiMetrics.costChange)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {roiMetrics.costChangePercentage >= 0 ? '+' : ''}{roiMetrics.costChangePercentage.toFixed(1)}% vs previous
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Efficiency Score
            </span>
            <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-display font-bold bg-gradient-to-r ${getEfficiencyColor(roiMetrics.efficiencyScore)} bg-clip-text text-transparent`}>
            {roiMetrics.efficiencyScore.toFixed(0)}/100
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {getEfficiencyLabel(roiMetrics.efficiencyScore)}
          </div>
        </div>
      </div>

      {/* Efficiency Score Visualization */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 gradient-text-primary">
          Efficiency Score
        </h4>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              {getEfficiencyLabel(roiMetrics.efficiencyScore)}
            </span>
            <span className="text-sm font-display font-bold gradient-text-primary">
              {roiMetrics.efficiencyScore.toFixed(1)}/100
            </span>
          </div>
          <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getEfficiencyColor(roiMetrics.efficiencyScore)} transition-all duration-500`}
              style={{ width: `${roiMetrics.efficiencyScore}%` }}
            />
          </div>
        </div>
        {roiMetrics.roiRank && roiMetrics.totalWorkflows && (
          <div className="flex items-center gap-2 text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            <TrophyIcon className="w-4 h-4" />
            Ranked #{roiMetrics.roiRank} of {roiMetrics.totalWorkflows} workflows
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 gradient-text-primary">
            Cost Breakdown
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                AI Cost
              </span>
              <span className="font-display font-bold gradient-text-primary">
                {formatCurrency(roiMetrics.totalAICost)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Orchestration Cost
              </span>
              <span className="font-display font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(roiMetrics.totalOrchestrationCost)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10 bg-gradient-to-r from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
              <span className="text-sm font-body font-semibold text-light-text-primary dark:text-dark-text-primary">
                Total Cost
              </span>
              <span className="font-display font-bold gradient-text-primary">
                {formatCurrency(roiMetrics.totalCost)}
              </span>
            </div>
          </div>
          {roiMetrics.totalCost > 0 && (
            <div className="mt-4 h-32">
              <Bar
                data={{
                  labels: ['AI Cost', 'Orchestration Cost'],
                  datasets: [
                    {
                      label: 'Cost ($)',
                      data: [roiMetrics.totalAICost, roiMetrics.totalOrchestrationCost],
                      backgroundColor: [
                        'rgba(6, 236, 158, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => {
                          return `Cost: ${formatCurrency(context.parsed.y)}`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value: any) => formatCurrency(value),
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Efficiency Factors */}
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 gradient-text-primary">
            Efficiency Factors
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Cost Per Execution
                </span>
                <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {formatCurrency(roiMetrics.efficiencyFactors.costPerExecution)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454]"
                  style={{ width: `${Math.min((1 - roiMetrics.efficiencyFactors.costPerExecution / 1) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Orchestration Overhead
                </span>
                <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {(roiMetrics.efficiencyFactors.orchestrationOverhead * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: `${roiMetrics.efficiencyFactors.orchestrationOverhead * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Model Efficiency
                </span>
                <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {(roiMetrics.efficiencyFactors.modelEfficiency * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                  style={{ width: `${roiMetrics.efficiencyFactors.modelEfficiency * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                  Caching Utilization
                </span>
                <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {(roiMetrics.efficiencyFactors.cachingUtilization * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                  style={{ width: `${roiMetrics.efficiencyFactors.cachingUtilization * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Trend Chart */}
      {roiMetrics.trends && roiMetrics.trends.dailyCosts && roiMetrics.trends.dailyCosts.length > 0 && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h4 className="text-base sm:text-lg font-display font-bold gradient-text-primary">
              Daily Cost Trend
            </h4>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-body px-2 py-1 rounded ${roiMetrics.trends.costPerExecutionTrend === 'improving'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : roiMetrics.trends.costPerExecutionTrend === 'degrading'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                {roiMetrics.trends.costPerExecutionTrend === 'improving' && <ArrowTrendingDownIcon className="w-4 h-4 inline mr-1" />}
                {roiMetrics.trends.costPerExecutionTrend === 'degrading' && <ArrowTrendingUpIcon className="w-4 h-4 inline mr-1" />}
                {roiMetrics.trends.costPerExecutionTrend.charAt(0).toUpperCase() + roiMetrics.trends.costPerExecutionTrend.slice(1)}
              </span>
            </div>
          </div>
          <div className="h-48 sm:h-64">
            <Line
              data={{
                labels: roiMetrics.trends.dailyCosts.map((d) => {
                  const date = new Date(d.date);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [
                  {
                    label: 'Daily Cost',
                    data: roiMetrics.trends.dailyCosts.map((d) => d.cost),
                    borderColor: '#06ec9e',
                    backgroundColor: 'rgba(6, 236, 158, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: 'Executions',
                    data: roiMetrics.trends.dailyCosts.map((d) => d.executions),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        if (context.datasetIndex === 0) {
                          return `Cost: ${formatCurrency(context.parsed.y)}`;
                        }
                        return `Executions: ${formatNumber(context.parsed.y)}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value: any) => formatCurrency(value),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Cost Per Outcome */}
      {roiMetrics.costPerOutcome !== undefined && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-display font-bold mb-3 sm:mb-4 gradient-text-primary">
            Cost Per Outcome
          </h4>
          <div className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary mb-2">
            {formatCurrency(roiMetrics.costPerOutcome)}
          </div>
          <p className="text-xs sm:text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            Average cost per business outcome
          </p>
          {roiMetrics.outcomes && roiMetrics.outcomes.length > 0 && (
            <div className="mt-4 space-y-2">
              {roiMetrics.outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                >
                  <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary capitalize">
                    {outcome.type}
                  </span>
                  <div className="text-right">
                    <div className="font-display font-semibold text-sm gradient-text-primary">
                      {formatCurrency(outcome.averageCost)}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatNumber(outcome.count)} outcomes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowROI;


