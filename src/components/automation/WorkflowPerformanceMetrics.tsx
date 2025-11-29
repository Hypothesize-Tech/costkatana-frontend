import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  BoltIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { automationService } from '../../services/automation.service';
import { WorkflowPerformanceMetrics } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface WorkflowPerformanceMetricsProps {
  workflowId: string;
  startDate?: string;
  endDate?: string;
}

export const WorkflowPerformanceMetricsComponent: React.FC<WorkflowPerformanceMetricsProps> = ({
  workflowId,
  startDate,
  endDate
}) => {
  const [metrics, setMetrics] = useState<WorkflowPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [workflowId, startDate, endDate]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationService.getWorkflowMetrics(workflowId, {
        startDate,
        endDate
      });
      if (response.success) {
        setMetrics(response.data);
      } else {
        setError('Failed to load metrics');
      }
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Error fetching workflow metrics:', err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <span className="font-body">{error || 'No metrics available'}</span>
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
            {metrics.workflowName}
          </h3>
          <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary capitalize">
            {metrics.platform} • {metrics.workflowId}
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-500/20 text-sm font-medium hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors flex items-center gap-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Total Cost
            </span>
            <CurrencyDollarIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-bold gradient-text-primary">
            {formatCurrency(metrics.totalCost)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {formatNumber(metrics.totalExecutions)} executions
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Avg Cost/Execution
            </span>
            <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(metrics.averageCostPerExecution)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Per execution
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Total Tokens
            </span>
            <BoltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
            {formatNumber(metrics.totalTokens)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {formatNumber(Math.round(metrics.averageTokensPerExecution))} avg/execution
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Avg Response Time
            </span>
            <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400">
            {metrics.averageResponseTime ? `${metrics.averageResponseTime.toFixed(0)}ms` : 'N/A'}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Average latency
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      {metrics.timeSeries && metrics.timeSeries.length > 0 && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
          <h4 className="text-lg font-display font-bold mb-4 gradient-text-primary">
            Cost & Usage Trends
          </h4>
          <div className="h-64">
            <Line
              data={{
                labels: metrics.timeSeries.map((d) => {
                  const date = new Date(d.date);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [
                  {
                    label: 'Cost ($)',
                    data: metrics.timeSeries.map((d) => d.cost),
                    borderColor: '#06ec9e',
                    backgroundColor: 'rgba(6, 236, 158, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y',
                  },
                  {
                    label: 'Executions',
                    data: metrics.timeSeries.map((d) => d.executions),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1',
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
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    beginAtZero: true,
                    ticks: {
                      callback: (value: any) => formatCurrency(value),
                    },
                  },
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: (value: any) => formatNumber(value),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Per Step */}
        {metrics.costPerStep && metrics.costPerStep.length > 0 && (
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
            <h4 className="text-lg font-display font-bold mb-4 gradient-text-primary">
              Cost Per Step
            </h4>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {metrics.costPerStep.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.sequence}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary truncate">
                        {step.step || `Step ${step.sequence}`}
                      </div>
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                        {formatNumber(step.executions)} executions
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-display font-bold text-sm gradient-text-primary">
                      {formatCurrency(step.cost)}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatCurrency(step.averageCost)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-48">
              <Bar
                data={{
                  labels: metrics.costPerStep.map((s) => s.step || `Step ${s.sequence}`),
                  datasets: [
                    {
                      label: 'Cost ($)',
                      data: metrics.costPerStep.map((s) => s.cost),
                      backgroundColor: 'rgba(6, 236, 158, 0.8)',
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
          </div>
        )}

        {/* Model Usage Distribution */}
        {metrics.modelUsage && metrics.modelUsage.length > 0 && (
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
            <h4 className="text-lg font-display font-bold mb-4 gradient-text-primary">
              Model Usage Distribution
            </h4>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {metrics.modelUsage.map((model, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary truncate">
                      {model.model}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary capitalize">
                      {model.service} • {formatNumber(model.executions)} executions
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-display font-bold text-sm gradient-text-primary">
                      {formatCurrency(model.cost)}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {model.percentageOfTotal.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-48">
              <Pie
                data={{
                  labels: metrics.modelUsage.map((m) => m.model),
                  datasets: [
                    {
                      data: metrics.modelUsage.map((m) => m.cost),
                      backgroundColor: [
                        'rgba(6, 236, 158, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom' as const,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => {
                          const label = context.label || '';
                          const value = formatCurrency(context.parsed);
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowPerformanceMetricsComponent;


