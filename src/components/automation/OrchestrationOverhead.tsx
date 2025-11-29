import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { automationService } from '../../services/automation.service';
import { OrchestrationOverheadAnalytics } from '../../types/automation.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface OrchestrationOverheadProps {
  startDate?: string;
  endDate?: string;
  platform?: string;
}

export const OrchestrationOverhead: React.FC<OrchestrationOverheadProps> = ({
  startDate,
  endDate,
  platform
}) => {
  const [analytics, setAnalytics] = useState<OrchestrationOverheadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverhead();
  }, [startDate, endDate, platform]);

  const fetchOverhead = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automationService.getOrchestrationOverhead({
        startDate,
        endDate,
        platform
      });
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load orchestration overhead');
      }
    } catch (err) {
      setError('Failed to load orchestration overhead');
      console.error('Error fetching orchestration overhead:', err);
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

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'zapier':
        return 'rgba(255, 152, 0, 0.8)';
      case 'make':
        return 'rgba(33, 150, 243, 0.8)';
      case 'n8n':
        return 'rgba(156, 39, 176, 0.8)';
      default:
        return 'rgba(100, 100, 100, 0.8)';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="glass rounded-xl border border-red-200/30 dark:border-red-500/20 shadow-lg backdrop-blur-xl p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <span className="font-body">{error || 'No overhead data available'}</span>
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
            Orchestration Overhead
          </h3>
          <p className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
            Hidden costs from automation platforms
          </p>
        </div>
        <button
          onClick={fetchOverhead}
          className="px-4 py-2 rounded-xl bg-white dark:bg-dark-card border border-primary-200/30 dark:border-primary-500/20 text-sm font-medium hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors flex items-center gap-2"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Total Cost
            </span>
            <CurrencyDollarIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-bold gradient-text-primary">
            {formatCurrency(analytics.totalCost)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            AI + Orchestration
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              AI Cost
            </span>
            <BoltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(analytics.totalAICost)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {analytics.totalCost > 0
              ? `${((analytics.totalAICost / analytics.totalCost) * 100).toFixed(1)}% of total`
              : '0% of total'}
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Orchestration Cost
            </span>
            <ChartBarIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(analytics.totalOrchestrationCost)}
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            {analytics.totalCost > 0
              ? `${((analytics.totalOrchestrationCost / analytics.totalCost) * 100).toFixed(1)}% of total`
              : '0% of total'}
          </div>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Avg Overhead %
            </span>
            <InformationCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
            {analytics.averageOverheadPercentage.toFixed(1)}%
          </div>
          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
            Platform overhead
          </div>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
        <h4 className="text-lg font-display font-bold mb-4 gradient-text-primary">
          Cost Breakdown
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <Pie
              data={{
                labels: ['AI Cost', 'Orchestration Cost'],
                datasets: [
                  {
                    data: [analytics.totalAICost, analytics.totalOrchestrationCost],
                    backgroundColor: [
                      'rgba(6, 236, 158, 0.8)',
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
          <div className="h-64">
            <Bar
              data={{
                labels: ['AI Cost', 'Orchestration Cost'],
                datasets: [
                  {
                    label: 'Cost ($)',
                    data: [analytics.totalAICost, analytics.totalOrchestrationCost],
                    backgroundColor: [
                      'rgba(6, 236, 158, 0.8)',
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
      </div>

      {/* Platform Breakdown */}
      {analytics.platformBreakdown && analytics.platformBreakdown.length > 0 && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
          <h4 className="text-lg font-display font-bold mb-4 gradient-text-primary">
            Platform Breakdown
          </h4>
          <div className="space-y-4">
            {analytics.platformBreakdown.map((platform, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">
                      {platform.platform}
                    </h5>
                    <p className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      Overhead: {platform.overheadPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold gradient-text-primary">
                      {formatCurrency(platform.totalCost)}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      Total cost
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-500/20">
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                      AI Cost
                    </div>
                    <div className="text-sm font-display font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(platform.aiCost)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/20 border border-orange-200/30 dark:border-orange-500/20">
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                      Orchestration Cost
                    </div>
                    <div className="text-sm font-display font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(platform.orchestrationCost)}
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                    style={{ width: `${platform.overheadPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 h-64">
            <Bar
              data={{
                labels: analytics.platformBreakdown.map((p) => p.platform.toUpperCase()),
                datasets: [
                  {
                    label: 'AI Cost',
                    data: analytics.platformBreakdown.map((p) => p.aiCost),
                    backgroundColor: 'rgba(6, 236, 158, 0.8)',
                  },
                  {
                    label: 'Orchestration Cost',
                    data: analytics.platformBreakdown.map((p) => p.orchestrationCost),
                    backgroundColor: 'rgba(251, 146, 60, 0.8)',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
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

      {/* Info Message */}
      <div className="glass rounded-xl border border-blue-200/30 dark:border-blue-500/20 shadow-lg backdrop-blur-xl p-4 bg-blue-50/50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-body font-semibold text-blue-800 dark:text-blue-300 mb-1">
              What is Orchestration Overhead?
            </p>
            <p className="text-xs font-body text-blue-700 dark:text-blue-400">
              Orchestration overhead includes costs from automation platforms like Zapier, Make, and n8n.
              These are fees for workflow runs, data operations, task counts, and webhook volume that are
              separate from your AI model costs. Understanding this overhead helps you see the true total cost
              of your automation workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrchestrationOverhead;


