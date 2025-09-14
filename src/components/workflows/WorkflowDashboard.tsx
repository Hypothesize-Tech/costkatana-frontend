import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface WorkflowStep {
  id: string;
  name: string;
  step?: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  responseTime?: number;
  cost?: number;
  tokens?: number;
  metadata?: {
    cost?: number;
    tokens?: { total: number };
    latency?: number;
    cacheHit?: boolean;
  };
  model?: string;
  service?: string;
  sequence?: number;
  timestamp?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId?: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  duration: number | null;
  cost: number;
  totalCost?: number;
  startTime: Date;
  endTime?: Date;
  steps?: WorkflowStep[];
  totalTokens?: number;
  requestCount?: number;
  averageCost?: number;
}

interface CostTrend {
  date: string;
  amount: number;
}

interface DashboardData {
  overview: {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    totalCost: number;
    activeWorkflows: number;
  };
  recentExecutions: WorkflowExecution[];
  performanceMetrics: {
    throughput: { period: string; values: number[] };
    latency: { p50: number; p95: number; p99: number };
    errorRate: { current: number; trend: number };
  };
  costAnalysis: {
    totalSpend: number;
    breakdown: { category: string; amount: number; percentage: number }[];
    trend: { daily: CostTrend[] };
  };
  alerts: {
    type: 'warning' | 'info' | 'error';
    message: string;
    timestamp: Date;
  }[];
}

interface ObservabilityDashboardResponse {
  overview: {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    totalCost: number;
    activeWorkflows: number;
  };
  recentExecutions: Array<{
    workflowId: string;
    workflowName: string;
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    averageCost: number;
    startTime: string;
    endTime: string;
    duration: number;
    steps: Array<{
      step: string;
      sequence: number;
      cost: number;
      tokens: number;
      responseTime: number;
      model: string;
      service: string;
      timestamp: string;
    }>;
  }>;
  performanceMetrics: {
    throughput: { period: string; values: number[] };
    latency: { p50: number; p95: number; p99: number };
    errorRate: { current: number; trend: number };
  };
  costAnalysis: {
    totalSpend: number;
    breakdown: { category: string; amount: number; percentage: number }[];
    trend: { daily: CostTrend[] };
  };
  alerts: {
    type: 'warning' | 'info' | 'error';
    message: string;
    timestamp: string;
  }[];
}

const WorkflowDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'analytics' | 'traces'>('overview');

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      // Import the workflow service dynamically to avoid circular dependencies
      const { workflowService } = await import('../../services/workflow.service');

      // Fetch real dashboard data from API
      const response = await workflowService.getObservabilityDashboard();
      const data = response as unknown as ObservabilityDashboardResponse;

      // Transform the data to match our interface
      const transformedData: DashboardData = {
        overview: {
          totalExecutions: data.overview.totalExecutions,
          successRate: data.overview.successRate,
          averageDuration: data.overview.averageDuration,
          totalCost: data.overview.totalCost,
          activeWorkflows: data.overview.activeWorkflows
        },
        performanceMetrics: data.performanceMetrics,
        costAnalysis: data.costAnalysis,
        alerts: (data.alerts || []).map(alert => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        })),
        recentExecutions: data.recentExecutions.map((exec) => ({
          id: exec.workflowId,
          workflowName: exec.workflowName,
          status: 'completed' as const,
          duration: exec.duration,
          cost: exec.totalCost,
          totalCost: exec.totalCost,
          startTime: new Date(exec.startTime),
          endTime: new Date(exec.endTime),
          totalTokens: exec.totalTokens,
          requestCount: exec.requestCount,
          averageCost: exec.averageCost,
          steps: exec.steps.map((step) => ({
            id: step.step,
            name: step.step,
            type: `${step.service}/${step.model}`,
            status: 'completed' as const,
            duration: step.responseTime,
            responseTime: step.responseTime,
            cost: step.cost,
            tokens: step.tokens,
            sequence: step.sequence,
            model: step.model,
            service: step.service,
            timestamp: step.timestamp,
            metadata: {
              cost: step.cost,
              tokens: { total: step.tokens },
              latency: step.responseTime,
              cacheHit: false
            }
          }))
        }))
      };


      setDashboardData(transformedData);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty data structure on error
      setDashboardData({
        overview: {
          totalExecutions: 0,
          successRate: 0,
          averageDuration: 0,
          totalCost: 0,
          activeWorkflows: 0
        },
        recentExecutions: [],
        performanceMetrics: {
          throughput: { period: 'hour', values: [] },
          latency: { p50: 0, p95: 0, p99: 0 },
          errorRate: { current: 0, trend: 0 }
        },
        costAnalysis: {
          totalSpend: 0,
          breakdown: [],
          trend: { daily: [] }
        },
        alerts: []
      });
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // No automatic interval refresh - using manual refresh button instead
  }, [fetchDashboardData]);



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'paused':
        return <PauseIcon className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <StopIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'Running...';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }



  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 p-6">
      {/* Header */}
      <div className="p-6 glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="mb-2 text-2xl font-display font-bold gradient-text-primary">AI Workflow Observatory</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Monitor, trace, and optimize your AI workflow executions</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className={`px-4 py-2 glass rounded-xl border border-accent-200/30 flex items-center transition-all duration-300 ${refreshing ? 'bg-light-bg-300 dark:bg-dark-bg-300 cursor-not-allowed text-light-text-tertiary dark:text-dark-text-tertiary' : 'btn-primary'
              }`}
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
        <div className="border-b border-accent-200/30">
          <nav className="flex px-6 space-x-8" aria-label="Tabs">
            {['overview', 'executions', 'analytics', 'traces'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overview' | 'executions' | 'analytics' | 'traces')}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-all duration-300 ${activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-accent-300/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overview Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                <div className="p-6 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Executions</p>
                      <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                        {dashboardData.overview.totalExecutions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-success-600 dark:text-success-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-success-600 dark:text-success-400">Success Rate</p>
                      <p className="text-2xl font-bold text-success-900 dark:text-success-100">
                        {dashboardData.overview.successRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20">
                  <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Avg Duration</p>
                      <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{formatDuration(dashboardData.overview.averageDuration)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-warning-50/30 to-warning-100/30 dark:from-warning-900/20 dark:to-warning-800/20">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-warning-600 dark:text-warning-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-warning-600 dark:text-warning-400">Total Cost</p>
                      <p className="text-2xl font-bold text-warning-900 dark:text-warning-100">{formatCost(dashboardData.overview.totalCost)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20">
                  <div className="flex items-center">
                    <PlayIcon className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-accent-600 dark:text-accent-400">Active Workflows</p>
                      <p className="text-2xl font-bold text-accent-900 dark:text-accent-100">{dashboardData.overview.activeWorkflows}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Distribution */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Cost Analysis by Workflow Type */}
                <div className="p-6 glass rounded-xl border border-accent-200/30 bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50">
                  <h3 className="mb-4 text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Cost Distribution by Workflow</h3>
                  <div className="space-y-4">
                    {dashboardData.costAnalysis.breakdown && dashboardData.costAnalysis.breakdown.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.category}</span>
                          <span className="text-sm font-medium text-gray-700">{formatCost(item.amount)} ({item.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${index % 5 === 0 ? 'bg-blue-600' :
                              index % 5 === 1 ? 'bg-green-600' :
                                index % 5 === 2 ? 'bg-yellow-600' :
                                  index % 5 === 3 ? 'bg-purple-600' :
                                    'bg-indigo-600'
                              }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Cost Trend */}
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Daily Cost Trend</h3>
                  <div className="space-y-4">
                    {dashboardData.costAnalysis.trend.daily && dashboardData.costAnalysis.trend.daily.map((day, index) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{day.date}</span>
                          <span className="text-sm font-medium text-gray-700">{formatCost(day.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-blue-600"
                            style={{ width: `${(day.amount / Math.max(...dashboardData.costAnalysis.trend.daily.map(d => d.amount))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Workflow Activity */}
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Workflow Activity</h3>
                <div className="overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recentExecutions.slice(0, 5).map((execution) => (
                        <tr key={execution.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{execution.workflowName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.steps?.length || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(execution.duration)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCost(execution.cost)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.totalTokens?.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(execution.startTime).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Metrics Summary */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Hourly Throughput */}
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Hourly Throughput</h3>

                  {(() => {
                    const values = dashboardData.performanceMetrics.throughput.values || [];
                    const max = Math.max(1, ...values);
                    const BAR_MAX = 128; // px
                    const MIN_BAR = 6;   // px

                    if (!values.length) {
                      return (
                        <div className="h-36 flex items-center justify-center rounded-md bg-gray-50 text-xs text-gray-400">
                          No data available
                        </div>
                      );
                    }

                    return (
                      <div className="h-40 rounded-md bg-gray-50 p-3">
                        <div className="h-full flex items-end gap-2 overflow-x-auto">
                          {values.map((value, index) => {
                            const heightPx = Math.max(MIN_BAR, Math.round((value / max) * BAR_MAX));
                            const isZero = value === 0;

                            return (
                              <div key={index} className="flex flex-col items-center">
                                <div
                                  className={`w-3 sm:w-4 rounded-md ${isZero ? 'bg-gray-300' : 'bg-gradient-to-t from-blue-600 to-blue-400 shadow'
                                    } transition-[height] duration-300`}
                                  style={{ height: `${heightPx}px` }}
                                  title={`Hour ${index}: ${value} executions`}
                                  aria-label={`Hour ${index}: ${value} executions`}
                                />
                                <span className="mt-1 text-[10px] text-gray-500">{index}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-2 text-xs text-gray-500">Executions per hour (last 24 hours)</div>
                </div>

                {/* Latency Metrics */}
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Response Time</h3>
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            P50
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {formatDuration(dashboardData.performanceMetrics.latency.p50)}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div style={{ width: "50%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                            P95
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-purple-600">
                            {formatDuration(dashboardData.performanceMetrics.latency.p95)}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                        <div style={{ width: "95%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                            P99
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-red-600">
                            {formatDuration(dashboardData.performanceMetrics.latency.p99)}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                        <div style={{ width: "99%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Model Usage */}
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Model Distribution</h3>
                  <div className="space-y-3">
                    {(() => {
                      // Count model usage across all executions
                      const modelCounts: Record<string, number> = {};
                      dashboardData.recentExecutions.forEach(exec => {
                        exec.steps?.forEach(step => {
                          if (step.model) {
                            modelCounts[step.model] = (modelCounts[step.model] || 0) + 1;
                          }
                        });
                      });

                      // Convert to array and sort by count
                      const sortedModels = Object.entries(modelCounts)
                        .map(([model, count]) => ({ model, count }))
                        .sort((a, b) => b.count - a.count);

                      const totalCalls = sortedModels.reduce((sum, item) => sum + item.count, 0);

                      return sortedModels.slice(0, 5).map((item, index) => (
                        <div key={index} className="relative">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{item.model}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {item.count} calls ({((item.count / totalCalls) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${index % 5 === 0 ? 'bg-green-600' :
                                index % 5 === 1 ? 'bg-blue-600' :
                                  index % 5 === 2 ? 'bg-yellow-600' :
                                    index % 5 === 3 ? 'bg-purple-600' :
                                      'bg-indigo-600'
                                }`}
                              style={{ width: `${(item.count / totalCalls) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {dashboardData.alerts.length > 0 && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
                  <div className="space-y-3">
                    {dashboardData.alerts.map((alert, index) => (
                      <div key={index} className={`flex items-start p-3 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}>
                        {alert.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />}
                        {alert.type === 'error' && <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5" />}
                        {alert.type === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />}
                        <div className="flex-1 ml-3">
                          <p className="text-sm text-gray-900">{alert.message}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'executions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Workflow Executions</h3>

              <div className="overflow-hidden ring-1 ring-black ring-opacity-5 shadow md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Workflow
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Started
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentExecutions && dashboardData.recentExecutions.length > 0 ? (
                      dashboardData.recentExecutions.map((execution) => (
                        <tr key={execution.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(execution.status)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {execution.workflowName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {execution.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatDuration(execution.duration)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatCost(execution.cost)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(execution.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedExecution(execution.id);
                                setActiveTab('traces');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Trace
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No executions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="mb-4 text-lg font-medium text-gray-900">Latency Percentiles</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P50</span>
                      <span className="text-sm font-medium">{formatNumber(dashboardData.performanceMetrics.latency.p50)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P95</span>
                      <span className="text-sm font-medium">{formatNumber(dashboardData.performanceMetrics.latency.p95)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P99</span>
                      <span className="text-sm font-medium">{formatNumber(dashboardData.performanceMetrics.latency.p99)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="mb-4 text-lg font-medium text-gray-900">Error Rate</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {formatNumber(dashboardData.performanceMetrics.errorRate.current)}%
                    </div>
                    <div className={`text-sm ${dashboardData.performanceMetrics.errorRate.trend < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {dashboardData.performanceMetrics.errorRate.trend > 0 ? '+' : ''}
                      {formatNumber(dashboardData.performanceMetrics.errorRate.trend)}% from last period
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="mb-4 text-lg font-medium text-gray-900">Cost Breakdown</h4>
                  <div className="space-y-3">
                    {dashboardData.costAnalysis.breakdown && dashboardData.costAnalysis.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{item.category}</span>
                        <span className="text-sm font-medium">{formatCost(item.amount)} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Workflow Traces</h3>

              {selectedExecution ? (
                <div className="space-y-6">
                  {/* Selected Execution Details */}
                  {(() => {
                    const execution = dashboardData.recentExecutions.find(exec => exec.id === selectedExecution);
                    if (!execution) return <div>Execution not found</div>;

                    return (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">
                            {execution.workflowName} - {execution.id}
                          </h4>
                          <button
                            onClick={() => setSelectedExecution(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            × Close
                          </button>
                        </div>

                        {/* Execution Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Status</div>
                            <div className="text-lg font-semibold text-gray-900">{execution.status}</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Duration</div>
                            <div className="text-lg font-semibold text-gray-900">{formatDuration(execution.duration)}</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Total Cost</div>
                            <div className="text-lg font-semibold text-gray-900">{formatCost(execution.cost)}</div>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Started</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {new Date(execution.startTime).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Trace */}
                        {execution.steps && execution.steps.length > 0 ? (
                          <div className="space-y-4">
                            <h5 className="text-md font-medium text-gray-900">Execution Steps</h5>
                            <div className="space-y-3">
                              {execution.steps.map((step, index) => (
                                <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">{step.name}</div>
                                    </div>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                      {step.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Cost:</span>
                                      <span className="ml-2 font-medium">{formatCost(step.metadata?.cost || 0)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Tokens:</span>
                                      <span className="ml-2 font-medium">{step.metadata?.tokens?.total || 0}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Latency:</span>
                                      <span className="ml-2 font-medium">{step.metadata?.latency || 0}ms</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Type:</span>
                                      <span className="ml-2 font-medium">{step.type}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            No step details available for this execution
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">Select a workflow execution to view detailed trace information</p>
                  <p className="text-sm text-gray-400 mt-2">Click "View Trace" on any execution in the Executions tab</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;