import React, { useState, useEffect, useCallback } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowPathIcon,
  CheckCircleIcon
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
import { AutomationShimmer } from '../shimmer/AutomationShimmer';
import { WorkflowQuotaStatusComponent } from './WorkflowQuotaStatus';
import { WorkflowOptimizationRecommendations } from './WorkflowOptimizationRecommendations';
import { WorkflowROIComparison } from './WorkflowROIComparison';
import { OrchestrationOverhead } from './OrchestrationOverhead';
import { WorkflowAlerts } from './WorkflowAlerts';
import { WorkflowDetailView } from './WorkflowDetailView';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'workflows' | 'quota' | 'optimization' | 'roi' | 'overhead' | 'alerts'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // Calculate date range strings
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };

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

  const getPlatformIcon = (_platform: string) => {
    return <BoltIcon className="w-5 h-5 text-white" />;
  };

  if (loading) {
    return <AutomationShimmer />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] dark:from-emerald-600 dark:via-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg">
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl font-display gradient-text-primary">
            Automation Cost Tracking
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 text-sm bg-white rounded-xl border border-primary-200/30 dark:border-primary-500/20 dark:bg-dark-card font-body"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex gap-2 items-center px-4 py-2 rounded-xl btn btn-secondary"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Cost
              </span>
              <CurrencyDollarIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-display gradient-text-primary">
              {formatCurrency(stats.totalCost)}
            </div>
            <div className="mt-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              {formatNumber(stats.totalRequests)} requests
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Requests
              </span>
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 font-display dark:text-blue-400">
              {formatNumber(stats.totalRequests)}
            </div>
            <div className="mt-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              {stats.activeConnections} active connections
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Total Tokens
              </span>
              <BoltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600 font-display dark:text-purple-400">
              {formatNumber(stats.totalTokens)}
            </div>
            <div className="mt-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              Across all platforms
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                Connections
              </span>
              <CheckCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-600 font-display dark:text-orange-400">
              {stats.totalConnections}
            </div>
            <div className="mt-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
              {stats.activeConnections} active
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveTab('overview'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('platforms'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'platforms'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            By Platform
          </button>
          <button
            onClick={() => { setActiveTab('workflows'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'workflows'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            By Workflow
          </button>
          <button
            onClick={() => { setActiveTab('quota'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'quota'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            Quota
          </button>
          <button
            onClick={() => { setActiveTab('optimization'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'optimization'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            Optimization
          </button>
          <button
            onClick={() => { setActiveTab('roi'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'roi'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            ROI Analysis
          </button>
          <button
            onClick={() => { setActiveTab('overhead'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'overhead'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            Overhead
          </button>
          <button
            onClick={() => { setActiveTab('alerts'); setSelectedWorkflowId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'alerts'
              ? 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] text-white'
              : 'bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary'
              }`}
          >
            Alerts
          </button>
        </div>
      </div>

      {/* Workflow Detail View */}
      {selectedWorkflowId && (() => {
        const { start, end } = getDateRange();
        return (
          <WorkflowDetailView
            key={selectedWorkflowId}
            workflowId={selectedWorkflowId}
            onBack={() => setSelectedWorkflowId(null)}
            startDate={start}
            endDate={end}
          />
        );
      })()}

      {/* Tab Content */}
      {!selectedWorkflowId && activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Time Series Chart */}
          {analytics.length > 0 && analytics[0].timeSeries && analytics[0].timeSeries.length > 0 && (
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
              <h3 className="mb-4 text-lg font-bold font-display gradient-text-primary">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Platform Breakdown */}
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
              <h3 className="mb-4 text-lg font-bold font-display gradient-text-primary">
                Platform Breakdown
              </h3>
              {stats.platformBreakdown.length > 0 ? (
                <>
                  <div className="mb-4 space-y-3">
                    {stats.platformBreakdown.map((platform, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                      >
                        <div className="flex gap-3 items-center">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getPlatformColor(platform.platform)} flex items-center justify-center`}>
                            {getPlatformIcon(platform.platform)}
                          </div>
                          <div>
                            <div className="font-semibold capitalize font-display text-light-text-primary dark:text-dark-text-primary">
                              {platform.platform}
                            </div>
                            <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                              {platform.connections} connection{platform.connections !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-display gradient-text-primary">
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
                  <div className="mt-4 h-48">
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
                <div className="py-8 text-center text-light-text-tertiary dark:text-dark-text-tertiary">
                  No platform data available
                </div>
              )}
            </div>

            {/* Top Workflows */}
            <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
              <h3 className="mb-4 text-lg font-bold font-display gradient-text-primary">
                Top Workflows
              </h3>
              {stats.topWorkflows.length > 0 ? (
                <>
                  <div className="mb-4 space-y-3">
                    {stats.topWorkflows.slice(0, 5).map((workflow, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate font-display text-light-text-primary dark:text-dark-text-primary">
                            {workflow.workflowName}
                          </div>
                          <div className="text-xs capitalize font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                            {workflow.platform}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-bold font-display gradient-text-primary">
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
                    <div className="mt-4 h-48">
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
                <div className="py-8 text-center text-light-text-tertiary dark:text-dark-text-tertiary">
                  No workflow data available
                </div>
              )}
            </div>
          </div>

          {/* Additional Metrics */}
          {analytics.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {analytics.map((platformData, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
                >
                  <div className="flex gap-2 items-center mb-3">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${getPlatformColor(platformData.platform)} flex items-center justify-center`}>
                      {getPlatformIcon(platformData.platform)}
                    </div>
                    <h4 className="font-semibold capitalize font-display text-light-text-primary dark:text-dark-text-primary">
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

          {/* Quota Status Widget */}
          <div className="mt-6">
            <WorkflowQuotaStatusComponent />
          </div>
        </div>
      )}

      {!selectedWorkflowId && activeTab === 'quota' && (
        <WorkflowQuotaStatusComponent showUpgradeButton={true} />
      )}

      {!selectedWorkflowId && activeTab === 'optimization' && (() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        return (
          <WorkflowOptimizationRecommendations
            startDate={startDateStr}
            endDate={endDateStr}
            onRecommendationClick={(rec) => {
              if (rec.workflowId) {
                setSelectedWorkflowId(rec.workflowId);
              }
            }}
          />
        );
      })()}

      {!selectedWorkflowId && activeTab === 'roi' && (() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        return (
          <WorkflowROIComparison
            startDate={startDateStr}
            endDate={endDateStr}
            onWorkflowClick={(workflowId) => setSelectedWorkflowId(workflowId)}
          />
        );
      })()}

      {!selectedWorkflowId && activeTab === 'overhead' && (() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        return (
          <OrchestrationOverhead
            startDate={startDateStr}
            endDate={endDateStr}
          />
        );
      })()}

      {!selectedWorkflowId && activeTab === 'alerts' && (
        <WorkflowAlerts />
      )}

      {!selectedWorkflowId && activeTab === 'platforms' && (
        <div className="space-y-6">
          {analytics.map((platformData, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getPlatformColor(platformData.platform)} flex items-center justify-center`}>
                    {getPlatformIcon(platformData.platform)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold capitalize font-display text-light-text-primary dark:text-dark-text-primary">
                      {platformData.platform}
                    </h3>
                    <div className="text-sm font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                      {formatNumber(platformData.totalRequests)} requests
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-display gradient-text-primary">
                    {formatCurrency(platformData.totalCost)}
                  </div>
                  <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    Avg: {formatCurrency(platformData.averageCostPerRequest)}/request
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                <div className="p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="mb-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    Total Cost
                  </div>
                  <div className="text-lg font-bold font-display gradient-text-primary">
                    {formatCurrency(platformData.totalCost)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="mb-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    Total Requests
                  </div>
                  <div className="text-lg font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                    {formatNumber(platformData.totalRequests)}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-primary-200/20 dark:border-primary-500/10">
                  <div className="mb-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    Total Tokens
                  </div>
                  <div className="text-lg font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                    {formatNumber(platformData.totalTokens)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="mb-3 text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                  Workflows ({platformData.workflows.length})
                </h4>
                <div className="overflow-y-auto space-y-2 max-h-64">
                  {platformData.workflows.slice(0, 10).map((workflow, wfIndex) => (
                    <div
                      key={wfIndex}
                      className="flex justify-between items-center p-2 rounded-lg border border-primary-200/20 dark:border-primary-500/10"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate font-body text-light-text-primary dark:text-dark-text-primary">
                          {workflow.workflowName}
                        </div>
                        <div className="text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                          {formatNumber(workflow.totalRequests)} requests
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-semibold font-display gradient-text-primary">
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

      {!selectedWorkflowId && activeTab === 'workflows' && (
        <div className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20">
          <h3 className="mb-4 text-lg font-bold font-display gradient-text-primary">
            All Workflows
          </h3>
          <div className="space-y-3">
            {analytics.flatMap(platform =>
              platform.workflows.map((workflow, index) => (
                <div
                  key={`${platform.platform}-${index}`}
                  onClick={() => setSelectedWorkflowId(workflow.workflowId)}
                  className="flex justify-between items-center p-4 rounded-lg border transition-colors cursor-pointer border-primary-200/20 dark:border-primary-500/10 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                >
                  <div className="flex flex-1 gap-3 items-center min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getPlatformColor(platform.platform)} flex items-center justify-center flex-shrink-0`}>
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate font-display text-light-text-primary dark:text-dark-text-primary">
                        {workflow.workflowName}
                      </div>
                      <div className="text-xs capitalize font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                        {platform.platform} • {formatNumber(workflow.totalRequests)} requests
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="font-bold font-display gradient-text-primary">
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

