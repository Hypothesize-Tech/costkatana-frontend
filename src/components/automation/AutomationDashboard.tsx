import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
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
import { AutomationAnalytics, AutomationStats } from '../../types/automation.types';
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

const AutomationDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AutomationAnalytics[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'workflows'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));

      const [analyticsResponse, statsResponse] = await Promise.all([
        automationService.getAnalytics({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        automationService.getStats()
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Failed to fetch automation data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'zapier':
        return 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700';
      case 'make':
        return 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
      case 'n8n':
        return 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700';
      default:
        return 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return <BoltIcon className="w-5 h-5 text-white" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
            Automation Cost Tracking
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 rounded-xl border border-primary-200/30 dark:border-primary-500/20 bg-white dark:bg-dark-card text-sm font-body"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="btn btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Cost
              </span>
              <CurrencyDollarIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-display font-bold gradient-text-primary">
              {formatCurrency(stats.totalCost)}
            </div>
            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              {formatNumber(stats.totalRequests)} requests
            </div>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Requests
              </span>
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(stats.totalRequests)}
            </div>
            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              {stats.activeConnections} active connections
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
              {formatNumber(stats.totalTokens)}
            </div>
            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              Across all platforms
            </div>
          </div>

          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Connections
              </span>
              <CheckCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-display font-bold text-orange-600 dark:text-orange-400">
              {stats.totalConnections}
            </div>
            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
              {stats.activeConnections} active
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'platforms'
                ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
            }`}
          >
            By Platform
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'workflows'
                ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
                : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
            }`}
          >
            By Workflow
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Time Series Chart */}
          {analytics.length > 0 && analytics[0].timeSeries && analytics[0].timeSeries.length > 0 && (
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
              <h3 className="text-lg font-display font-bold mb-4 gradient-text-primary">
                Cost & Usage Trends
              </h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: analytics[0].timeSeries.map((d) => {
                      const date = new Date(d.date);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }),
                    datasets: [
                      {
                        label: 'Cost ($)',
                        data: analytics[0].timeSeries.map((d) => d.cost),
                        borderColor: '#06ec9e',
                        backgroundColor: 'rgba(6, 236, 158, 0.1)',
                        fill: true,
                        tension: 0.4,
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Breakdown */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
              <h3 className="text-lg font-display font-bold mb-4 gradient-text-primary">
                Platform Breakdown
              </h3>
              {stats.platformBreakdown.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {stats.platformBreakdown.map((platform, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getPlatformColor(platform.platform)} flex items-center justify-center`}>
                            {getPlatformIcon(platform.platform)}
                          </div>
                          <div>
                            <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">
                              {platform.platform}
                            </div>
                            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                              {platform.connections} connection{platform.connections !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-bold gradient-text-primary">
                            {formatCurrency(platform.cost)}
                          </div>
                          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                            {formatNumber(platform.requests)} requests
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Platform Cost Distribution Chart */}
                  <div className="h-48 mt-4">
                    <Bar
                      data={{
                        labels: stats.platformBreakdown.map((p) => p.platform.toUpperCase()),
                        datasets: [
                          {
                            label: 'Cost ($)',
                            data: stats.platformBreakdown.map((p) => p.cost),
                            backgroundColor: stats.platformBreakdown.map((p) => {
                              const colors: Record<string, string> = {
                                zapier: 'rgba(255, 152, 0, 0.8)',
                                make: 'rgba(33, 150, 243, 0.8)',
                                n8n: 'rgba(156, 39, 176, 0.8)',
                              };
                              return colors[p.platform.toLowerCase()] || 'rgba(100, 100, 100, 0.8)';
                            }),
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
                </>
              ) : (
                <div className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary">
                  No platform data available
                </div>
              )}
            </div>

            {/* Top Workflows */}
            <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
              <h3 className="text-lg font-display font-bold mb-4 gradient-text-primary">
                Top Workflows
              </h3>
              {stats.topWorkflows.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {stats.topWorkflows.slice(0, 5).map((workflow, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                            {workflow.workflowName}
                          </div>
                          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary capitalize">
                            {workflow.platform}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-display font-bold gradient-text-primary">
                            {formatCurrency(workflow.cost)}
                          </div>
                          <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                            {formatNumber(workflow.requests)} requests
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Workflow Cost Distribution */}
                  {stats.topWorkflows.length > 0 && (
                    <div className="h-48 mt-4">
                      <Bar
                        data={{
                          labels: stats.topWorkflows.slice(0, 5).map((w) => 
                            w.workflowName.length > 15 ? w.workflowName.substring(0, 15) + '...' : w.workflowName
                          ),
                          datasets: [
                            {
                              label: 'Cost ($)',
                              data: stats.topWorkflows.slice(0, 5).map((w) => w.cost),
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
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary">
                  No workflow data available
                </div>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          {analytics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.map((platformData, index) => (
                <div
                  key={index}
                  className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${getPlatformColor(platformData.platform)} flex items-center justify-center`}>
                      {getPlatformIcon(platformData.platform)}
                    </div>
                    <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">
                      {platformData.platform} Metrics
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Avg Cost/Request:</span>
                      <span className="font-semibold gradient-text-primary">
                        {formatCurrency(platformData.averageCostPerRequest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Avg Tokens/Request:</span>
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {formatNumber(platformData.averageTokensPerRequest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-text-tertiary dark:text-dark-text-tertiary">Total Workflows:</span>
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {platformData.workflows.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'platforms' && (
        <div className="space-y-6">
          {analytics.map((platformData, index) => (
            <div
              key={index}
              className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getPlatformColor(platformData.platform)} flex items-center justify-center`}>
                    {getPlatformIcon(platformData.platform)}
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary capitalize">
                      {platformData.platform}
                    </h3>
                    <div className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatNumber(platformData.totalRequests)} requests
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-bold gradient-text-primary">
                    {formatCurrency(platformData.totalCost)}
                  </div>
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    Avg: {formatCurrency(platformData.averageCostPerRequest)}/request
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Total Cost
                  </div>
                  <div className="text-lg font-display font-bold gradient-text-primary">
                    {formatCurrency(platformData.totalCost)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Total Requests
                  </div>
                  <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    {formatNumber(platformData.totalRequests)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-1">
                    Total Tokens
                  </div>
                  <div className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    {formatNumber(platformData.totalTokens)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-display font-semibold mb-3 text-light-text-primary dark:text-dark-text-primary">
                  Workflows ({platformData.workflows.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {platformData.workflows.slice(0, 10).map((workflow, wfIndex) => (
                    <div
                      key={wfIndex}
                      className="flex items-center justify-between p-2 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-body font-medium text-sm text-light-text-primary dark:text-dark-text-primary truncate">
                          {workflow.workflowName}
                        </div>
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          {formatNumber(workflow.totalRequests)} requests
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-display font-semibold text-sm gradient-text-primary">
                          {formatCurrency(workflow.totalCost)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6">
          <h3 className="text-lg font-display font-bold mb-4 gradient-text-primary">
            All Workflows
          </h3>
          <div className="space-y-3">
            {analytics.flatMap(platform => 
              platform.workflows.map((workflow, index) => (
                <div
                  key={`${platform.platform}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getPlatformColor(platform.platform)} flex items-center justify-center flex-shrink-0`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                        {workflow.workflowName}
                      </div>
                      <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary capitalize">
                        {platform.platform} • {formatNumber(workflow.totalRequests)} requests
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-display font-bold gradient-text-primary">
                      {formatCurrency(workflow.totalCost)}
                    </div>
                    <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatNumber(workflow.totalTokens)} tokens
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationDashboard;

