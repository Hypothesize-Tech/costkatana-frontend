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
import { WorkflowDashboardShimmer } from '../shimmer/WorkflowDashboardShimmer';

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
  automationPlatform?: 'zapier' | 'make' | 'n8n'; // Add automation platform
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
  const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({
    overview: false,
    executions: false,
    analytics: false,
    traces: false,
  });

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
        recentExecutions: data.recentExecutions.map((exec: any) => ({
          id: exec.workflowId,
          workflowName: exec.workflowName,
          automationPlatform: exec.automationPlatform, // Include automation platform
          status: 'completed' as const,
          duration: exec.duration,
          cost: exec.totalCost,
          totalCost: exec.totalCost,
          startTime: new Date(exec.startTime),
          endTime: new Date(exec.endTime),
          totalTokens: exec.totalTokens,
          requestCount: exec.requestCount,
          averageCost: exec.averageCost,
          steps: exec.steps.map((step: any) => ({
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
            automationPlatform: step.automationPlatform, // Include automation platform in steps
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
  }, [fetchDashboardData]);

  useEffect(() => {
    setTabLoading(prev => ({ ...prev, [activeTab]: true }));
    setTabLoading(prev => ({ ...prev, [activeTab]: false }));
  }, [activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-danger-600 dark:text-danger-400" />;
      case 'paused':
        return <PauseIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />;
      case 'cancelled':
        return <StopIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-light-text-tertiary dark:text-dark-text-tertiary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300';
      case 'completed':
        return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300';
      case 'failed':
        return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300';
      case 'paused':
        return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300';
      case 'cancelled':
        return 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300';
      default:
        return 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300';
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

  if (loading || tabLoading[activeTab]) {
    return <WorkflowDashboardShimmer activeTab={activeTab} />;
  }

  if (!dashboardData) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-secondary-500 dark:text-secondary-400">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3 min-h-screen sm:p-4 sm:space-y-4 md:space-y-6 bg-gradient-light-ambient dark:bg-gradient-dark-ambient lg:p-6">
      {/* Header */}
      <div className="p-3 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-2xl">
        <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center sm:gap-4">
          <div className="flex gap-2 items-center sm:gap-3 md:gap-4 w-full sm:w-auto">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 sm:p-2.5 md:p-3 md:rounded-xl flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1 sm:flex-none">
              <h1 className="mb-0.5 text-lg font-bold font-display sm:mb-1 sm:text-xl md:mb-2 md:text-2xl lg:text-3xl gradient-text-primary break-words">AI Workflow Observatory</h1>
              <p className="text-xs font-body sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300 break-words">Monitor, trace, and optimize your AI workflow executions</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className={`w-full sm:w-auto group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden [touch-action:manipulation] min-h-[44px] sm:px-4 sm:py-2.5 md:px-5 md:py-3 md:rounded-xl ${refreshing
              ? 'bg-secondary-200 dark:bg-secondary-700 cursor-not-allowed text-secondary-500 dark:text-secondary-400'
              : 'bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700'
              }`}
          >
            <ArrowPathIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            <span className="md:hidden">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl">
        <div className="border-b border-primary-200/30 dark:border-primary-700/30">
          <nav className="flex overflow-x-auto flex-nowrap gap-1 px-2 sm:px-4 md:px-6 sm:gap-2 md:gap-4 md:flex-wrap md:space-x-8 scrollbar-hide" aria-label="Tabs" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {['overview', 'executions', 'analytics', 'traces'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overview' | 'executions' | 'analytics' | 'traces')}
                className={`btn py-2.5 px-3 border-b-2 font-display font-medium text-xs capitalize transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95 whitespace-nowrap flex-shrink-0 sm:py-3 sm:px-4 sm:text-sm md:py-4 md:px-1 ${activeTab === tab
                  ? 'border-[#06ec9e] dark:border-emerald-400 text-[#06ec9e] dark:text-emerald-400'
                  : 'border-transparent text-secondary-600 dark:text-secondary-300 hover:text-[#06ec9e] dark:hover:text-emerald-400 hover:border-[#06ec9e]/50 dark:hover:border-emerald-400/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Overview Metrics */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-5">
                <div className="p-3 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20 hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation] sm:p-4 md:p-6 md:rounded-xl">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-[#06ec9e] dark:text-emerald-400 flex-shrink-0 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    <div className="ml-2 min-w-0 sm:ml-3 md:ml-4">
                      <p className="text-xs font-medium text-emerald-700 font-body dark:text-emerald-300 sm:text-sm">Total Executions</p>
                      <p className="text-lg font-bold text-emerald-900 font-display dark:text-emerald-100 sm:text-xl md:text-2xl">
                        {dashboardData.overview.totalExecutions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 glass rounded-lg border border-success-200/30 dark:border-success-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-success-50/30 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation] sm:p-4 md:p-6 md:rounded-xl">
                  <div className="flex items-center">
                    <CheckCircleIcon className="flex-shrink-0 w-5 h-5 text-success-600 dark:text-success-400 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    <div className="ml-2 min-w-0 sm:ml-3 md:ml-4">
                      <p className="text-xs font-medium font-body text-success-600 dark:text-success-400 sm:text-sm">Success Rate</p>
                      <p className="text-lg font-bold font-display text-success-900 dark:text-success-100 sm:text-xl md:text-2xl">
                        {dashboardData.overview.successRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 glass rounded-lg border border-secondary-200/30 dark:border-secondary-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-secondary-50/30 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20 hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation] sm:p-4 md:p-6 md:rounded-xl">
                  <div className="flex items-center">
                    <ClockIcon className="flex-shrink-0 w-5 h-5 text-secondary-600 dark:text-secondary-400 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    <div className="ml-2 min-w-0 sm:ml-3 md:ml-4">
                      <p className="text-xs font-medium font-body text-secondary-600 dark:text-secondary-400 sm:text-sm">Avg Duration</p>
                      <p className="text-lg font-bold font-display text-secondary-900 dark:text-secondary-100 sm:text-xl md:text-2xl">{formatDuration(dashboardData.overview.averageDuration)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 glass rounded-lg border border-accent-200/30 dark:border-accent-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-accent-50/30 to-accent-100/30 dark:from-accent-900/20 dark:to-accent-800/20 hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation] sm:p-4 md:p-6 md:rounded-xl">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="flex-shrink-0 w-5 h-5 text-accent-600 dark:text-accent-400 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    <div className="ml-2 min-w-0 sm:ml-3 md:ml-4">
                      <p className="text-xs font-medium font-body text-accent-600 dark:text-accent-400 sm:text-sm">Total Cost</p>
                      <p className="text-lg font-bold font-display text-accent-900 dark:text-accent-100 sm:text-xl md:text-2xl">{formatCost(dashboardData.overview.totalCost)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 glass rounded-lg border border-highlight-200/30 dark:border-highlight-500/20 shadow-xl backdrop-blur-xl bg-gradient-to-br from-highlight-50/30 to-highlight-100/30 dark:from-highlight-900/20 dark:to-highlight-800/20 hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation] sm:p-4 md:p-6 md:rounded-xl">
                  <div className="flex items-center">
                    <PlayIcon className="flex-shrink-0 w-5 h-5 text-highlight-600 dark:text-highlight-400 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    <div className="ml-2 min-w-0 sm:ml-3 md:ml-4">
                      <p className="text-xs font-medium font-body text-highlight-600 dark:text-highlight-400 sm:text-sm">Active Workflows</p>
                      <p className="text-lg font-bold font-display text-highlight-900 dark:text-highlight-100 sm:text-xl md:text-2xl">{dashboardData.overview.activeWorkflows}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Distribution */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
                {/* Cost Analysis by Workflow Type */}
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-secondary-900 dark:text-white">Cost Distribution by Workflow</h3>
                  <div className="space-y-4">
                    {dashboardData.costAnalysis.breakdown && dashboardData.costAnalysis.breakdown.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium font-body text-secondary-700 dark:text-secondary-300">{item.category}</span>
                          <span className="text-sm font-medium font-body text-secondary-700 dark:text-secondary-300">{formatCost(item.amount)} ({item.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${index % 5 === 0 ? 'bg-gradient-to-r from-[#06ec9e] to-emerald-500' :
                              index % 5 === 1 ? 'bg-success-600' :
                                index % 5 === 2 ? 'bg-accent-600' :
                                  index % 5 === 3 ? 'bg-highlight-600' :
                                    'bg-secondary-600'
                              }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Cost Trend */}
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-secondary-900 dark:text-white">Daily Cost Trend</h3>
                  <div className="space-y-4">
                    {dashboardData.costAnalysis.trend.daily && dashboardData.costAnalysis.trend.daily.map((day, index) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium font-body text-secondary-700 dark:text-secondary-300">{day.date}</span>
                          <span className="text-sm font-medium font-body text-secondary-700 dark:text-secondary-300">{formatCost(day.amount)}</span>
                        </div>
                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-[#06ec9e] to-emerald-500"
                            style={{ width: `${(day.amount / Math.max(...dashboardData.costAnalysis.trend.daily.map(d => d.amount))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Workflow Activity */}
              <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-secondary-900 dark:text-white">Recent Workflow Activity</h3>
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-2">
                  {dashboardData.recentExecutions.slice(0, 5).map((execution) => (
                    <div key={execution.id} className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100/50 dark:bg-dark-bg-100/50">
                      <div className="font-medium text-xs font-display text-secondary-900 dark:text-white mb-2 truncate">{execution.workflowName}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-body text-secondary-600 dark:text-secondary-300">
                        <div><span className="font-medium">Steps:</span> {execution.steps?.length || 0}</div>
                        <div><span className="font-medium">Duration:</span> {formatDuration(execution.duration)}</div>
                        <div><span className="font-medium">Cost:</span> {formatCost(execution.cost)}</div>
                        <div><span className="font-medium">Tokens:</span> {execution.totalTokens?.toLocaleString()}</div>
                      </div>
                      <div className="mt-2 text-xs font-body text-secondary-500 dark:text-secondary-400">
                        {new Date(execution.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Tablet/Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-lg border glass border-primary-200/30 dark:border-primary-500/20">
                  <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                    <thead className="bg-gradient-to-r rounded-lg border glass border-primary-200/20 dark:border-primary-700/20 from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">Workflow</th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">Steps</th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">Duration</th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">Cost</th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">Tokens</th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gradient-to-br divide-y glass from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20 dark:divide-primary-700/20">
                      {dashboardData.recentExecutions.slice(0, 5).map((execution) => (
                        <tr key={execution.id} className="hover:bg-gradient-to-r hover:from-[#06ec9e]/5 hover:to-emerald-500/5 dark:hover:from-[#06ec9e]/10 dark:hover:to-emerald-500/10 transition-colors duration-300">
                          <td className="px-3 py-4 text-xs font-medium whitespace-nowrap sm:px-6 sm:text-sm font-display text-secondary-900 dark:text-white">{execution.workflowName}</td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 sm:text-sm font-body text-secondary-600 dark:text-secondary-300">{execution.steps?.length || 0}</td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 sm:text-sm font-body text-secondary-600 dark:text-secondary-300">{formatDuration(execution.duration)}</td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 sm:text-sm font-body text-secondary-600 dark:text-secondary-300">{formatCost(execution.cost)}</td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 sm:text-sm font-body text-secondary-600 dark:text-secondary-300">{execution.totalTokens?.toLocaleString()}</td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 sm:text-sm font-body text-secondary-600 dark:text-secondary-300">
                            {new Date(execution.startTime).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Metrics Summary */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
                {/* Hourly Throughput */}
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Hourly Throughput</h3>

                  {(() => {
                    const values = dashboardData.performanceMetrics.throughput.values || [];
                    const max = Math.max(1, ...values);
                    const BAR_MAX = 128; // px
                    const MIN_BAR = 6;   // px

                    if (!values.length) {
                      return (
                        <div className="flex justify-center items-center h-28 text-xs rounded-md glass bg-light-bg-200 dark:bg-dark-bg-200 font-body text-light-text-tertiary dark:text-dark-text-tertiary sm:h-36">
                          No data available
                        </div>
                      );
                    }

                    return (
                      <div className="p-2 h-32 rounded-md glass bg-light-bg-200 dark:bg-dark-bg-200 sm:p-3 sm:h-40">
                        <div className="flex overflow-x-auto gap-1.5 items-end h-full sm:gap-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {values.map((value, index) => {
                            const heightPx = Math.max(MIN_BAR, Math.round((value / max) * BAR_MAX));
                            const isZero = value === 0;

                            return (
                              <div key={index} className="flex flex-col items-center flex-shrink-0">
                                <div
                                  className={`w-2.5 rounded-md sm:w-3 md:w-4 ${isZero ? 'bg-secondary-300 dark:bg-secondary-700' : 'bg-gradient-to-t from-[#06ec9e] to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 shadow'
                                    } transition-[height] duration-300`}
                                  style={{ height: `${heightPx}px` }}
                                  title={`Hour ${index}: ${value} executions`}
                                  aria-label={`Hour ${index}: ${value} executions`}
                                />
                                <span className="mt-1 text-[9px] font-body text-light-text-tertiary dark:text-dark-text-tertiary sm:text-[10px]">{index}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-2 text-[10px] font-body text-light-text-tertiary dark:text-dark-text-tertiary sm:text-xs">Executions per hour (last 24 hours)</div>
                </div>

                {/* Latency Metrics */}
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Response Time</h3>
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-body text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#06ec9e] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30">
                            P50
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-body text-xs font-semibold inline-block text-[#06ec9e] dark:text-emerald-400">
                            {formatDuration(dashboardData.performanceMetrics.latency.p50)}
                          </span>
                        </div>
                      </div>
                      <div className="flex overflow-hidden mb-4 h-2 text-xs bg-emerald-100 rounded dark:bg-emerald-900/30">
                        <div style={{ width: "50%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#06ec9e] to-emerald-500 dark:from-emerald-500 dark:to-emerald-600"></div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold uppercase rounded-full font-body text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-900/30">
                            P95
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="inline-block text-xs font-semibold font-body text-secondary-600 dark:text-secondary-400">
                            {formatDuration(dashboardData.performanceMetrics.latency.p95)}
                          </span>
                        </div>
                      </div>
                      <div className="flex overflow-hidden mb-4 h-2 text-xs rounded bg-secondary-100 dark:bg-secondary-900/30">
                        <div style={{ width: "95%" }} className="flex flex-col justify-center text-center text-white whitespace-nowrap shadow-none bg-secondary-500 dark:bg-secondary-600"></div>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold uppercase rounded-full font-body text-danger-600 dark:text-danger-400 bg-danger-100 dark:bg-danger-900/30">
                            P99
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="inline-block text-xs font-semibold font-body text-danger-600 dark:text-danger-400">
                            {formatDuration(dashboardData.performanceMetrics.latency.p99)}
                          </span>
                        </div>
                      </div>
                      <div className="flex overflow-hidden mb-4 h-2 text-xs rounded bg-danger-100 dark:bg-danger-900/30">
                        <div style={{ width: "99%" }} className="flex flex-col justify-center text-center text-white whitespace-nowrap shadow-none bg-danger-500 dark:bg-danger-600"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Model Usage */}
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Model Distribution</h3>
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
                            <span className="text-sm font-medium font-body text-light-text-secondary dark:text-dark-text-secondary">{item.model}</span>
                            <span className="text-sm font-medium font-body text-light-text-secondary dark:text-dark-text-secondary">
                              {item.count} calls ({((item.count / totalCalls) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${index % 5 === 0 ? 'bg-success-600' :
                                index % 5 === 1 ? 'bg-gradient-to-r from-[#06ec9e] to-emerald-500' :
                                  index % 5 === 2 ? 'bg-warning-600' :
                                    index % 5 === 3 ? 'bg-accent-600' :
                                      'bg-highlight-600'
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
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h3 className="mb-2 text-sm font-semibold font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Alerts & Notifications</h3>
                  <div className="space-y-3">
                    {dashboardData.alerts.map((alert, index) => (
                      <div key={index} className={`flex items-start p-3 rounded-lg glass border ${alert.type === 'warning' ? 'bg-warning-50/50 dark:bg-warning-900/20 border-warning-200/30 dark:border-warning-800/30' :
                        alert.type === 'error' ? 'bg-danger-50/50 dark:bg-danger-900/20 border-danger-200/30 dark:border-danger-800/30' :
                          'bg-primary-50/50 dark:bg-primary-900/20 border-primary-200/30 dark:border-primary-800/30'
                        }`}>
                        {alert.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5" />}
                        {alert.type === 'error' && <XCircleIcon className="w-5 h-5 text-danger-600 dark:text-danger-400 mt-0.5" />}
                        {alert.type === 'info' && <InformationCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />}
                        <div className="flex-1 ml-3">
                          <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary">{alert.message}</p>
                          <p className="mt-1 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">
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
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h3 className="text-sm font-semibold font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary">Recent Workflow Executions</h3>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {dashboardData.recentExecutions && dashboardData.recentExecutions.length > 0 ? (
                  dashboardData.recentExecutions.map((execution) => (
                    <div key={execution.id} className="p-3 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                      <div className="flex items-start gap-2 mb-2">
                        {getStatusIcon(execution.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1.5 items-center mb-1">
                            <div className="text-xs font-medium truncate font-display text-light-text-primary dark:text-dark-text-primary">
                              {execution.workflowName}
                            </div>
                            {execution.automationPlatform && (
                              <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full capitalize ${execution.automationPlatform === 'zapier' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                execution.automationPlatform === 'make' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                }`}>
                                {execution.automationPlatform}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] truncate font-body text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                            ID: {execution.id}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs font-body">
                            <div>
                              <span className="text-light-text-secondary dark:text-dark-text-secondary">Status:</span>
                              <span className={`ml-1 inline-flex px-1.5 py-0.5 text-[10px] font-display font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                                {execution.status}
                              </span>
                            </div>
                            <div>
                              <span className="text-light-text-secondary dark:text-dark-text-secondary">Duration:</span>
                              <span className="ml-1 font-medium text-light-text-primary dark:text-dark-text-primary">{formatDuration(execution.duration)}</span>
                            </div>
                            <div>
                              <span className="text-light-text-secondary dark:text-dark-text-secondary">Cost:</span>
                              <span className="ml-1 font-medium text-light-text-primary dark:text-dark-text-primary">{formatCost(execution.cost)}</span>
                            </div>
                            <div>
                              <span className="text-light-text-secondary dark:text-dark-text-secondary">Started:</span>
                              <span className="ml-1 text-light-text-tertiary dark:text-dark-text-tertiary text-[10px]">{new Date(execution.startTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedExecution(execution.id);
                              setActiveTab('traces');
                            }}
                            className="mt-2 w-full btn btn-secondary text-[#06ec9e] dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 min-h-[40px] px-3 py-2 text-xs [touch-action:manipulation] active:scale-95"
                          >
                            View Trace
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center font-body text-light-text-tertiary dark:text-dark-text-tertiary">
                    No executions found
                  </div>
                )}
              </div>

              {/* Tablet/Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 md:rounded-xl">
                <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
                  <thead className="bg-gradient-to-r glass from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                    <tr>
                      <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">
                        Workflow
                      </th>
                      <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">
                        Status
                      </th>
                      <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">
                        Duration
                      </th>
                      <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">
                        Cost
                      </th>
                      <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">
                        Started
                      </th>
                      <th className="px-3 py-3 text-xs font-medium tracking-wider text-left uppercase sm:px-6 font-display text-secondary-500 dark:text-secondary-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gradient-to-br divide-y glass from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20 dark:divide-primary-700/20">
                    {dashboardData.recentExecutions && dashboardData.recentExecutions.length > 0 ? (
                      dashboardData.recentExecutions.map((execution) => (
                        <tr key={execution.id} className="hover:bg-gradient-to-r hover:from-[#06ec9e]/5 hover:to-emerald-500/5 dark:hover:from-[#06ec9e]/10 dark:hover:to-emerald-500/10 transition-colors duration-300">
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="flex items-center">
                              {getStatusIcon(execution.status)}
                              <div className="ml-2 min-w-0 sm:ml-3">
                                <div className="flex gap-2 items-center">
                                  <div className="text-xs font-medium truncate font-display sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                                    {execution.workflowName}
                                  </div>
                                  {execution.automationPlatform && (
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${execution.automationPlatform === 'zapier' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                      execution.automationPlatform === 'make' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                      }`}>
                                      {execution.automationPlatform}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs truncate font-body sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                                  ID: {execution.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <span className={`inline-flex px-2 py-1 text-xs font-display font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 font-display sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                            {formatDuration(execution.duration)}
                          </td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 font-display sm:text-sm text-light-text-primary dark:text-dark-text-primary">
                            {formatCost(execution.cost)}
                          </td>
                          <td className="px-3 py-4 text-xs whitespace-nowrap sm:px-6 font-body sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                            {new Date(execution.startTime).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 text-xs font-medium whitespace-nowrap sm:px-6 sm:text-sm font-display">
                            <button
                              onClick={() => {
                                setSelectedExecution(execution.id);
                                setActiveTab('traces');
                              }}
                              className="btn btn-secondary text-[#06ec9e] dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 min-h-[36px] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm [touch-action:manipulation] active:scale-95"
                            >
                              View Trace
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center sm:px-6 font-body text-light-text-tertiary dark:text-dark-text-tertiary">
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
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h3 className="text-sm font-semibold font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary">Performance Analytics</h3>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3">
                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h4 className="mb-2 text-sm font-medium font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Latency Percentiles</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">P50</span>
                      <span className="text-sm font-medium font-body text-light-text-primary dark:text-dark-text-primary">{formatNumber(dashboardData.performanceMetrics.latency.p50)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">P95</span>
                      <span className="text-sm font-medium font-body text-light-text-primary dark:text-dark-text-primary">{formatNumber(dashboardData.performanceMetrics.latency.p95)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">P99</span>
                      <span className="text-sm font-medium font-body text-light-text-primary dark:text-dark-text-primary">{formatNumber(dashboardData.performanceMetrics.latency.p99)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h4 className="mb-2 text-sm font-medium font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Error Rate</h4>
                  <div className="text-center">
                    <div className="text-xl font-bold font-display sm:text-2xl md:text-3xl text-danger-600 dark:text-danger-400">
                      {formatNumber(dashboardData.performanceMetrics.errorRate.current)}%
                    </div>
                    <div className={`font-body text-[10px] sm:text-xs md:text-sm ${dashboardData.performanceMetrics.errorRate.trend < 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                      }`}>
                      {dashboardData.performanceMetrics.errorRate.trend > 0 ? '+' : ''}
                      {formatNumber(dashboardData.performanceMetrics.errorRate.trend)}% from last period
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                  <h4 className="mb-2 text-sm font-medium font-display sm:mb-3 sm:text-base md:mb-4 md:text-lg text-light-text-primary dark:text-dark-text-primary">Cost Breakdown</h4>
                  <div className="space-y-3">
                    {dashboardData.costAnalysis.breakdown && dashboardData.costAnalysis.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{item.category}</span>
                        <span className="text-sm font-medium font-body text-light-text-primary dark:text-dark-text-primary">{formatCost(item.amount)} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h3 className="text-sm font-semibold font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary">Workflow Traces</h3>

              {selectedExecution ? (
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Selected Execution Details */}
                  {(() => {
                    const execution = dashboardData.recentExecutions.find(exec => exec.id === selectedExecution);
                    if (!execution) return <div className="font-body text-light-text-primary dark:text-dark-text-primary">Execution not found</div>;

                    return (
                      <div className="p-3 rounded-lg border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6 md:rounded-xl">
                        <div className="flex flex-col gap-2 justify-between items-start mb-3 sm:flex-row sm:items-center sm:gap-3 md:gap-4 md:mb-4">
                          <h4 className="text-sm font-medium font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary break-words">
                            <span className="block sm:inline">{execution.workflowName}</span>
                            <span className="block text-xs sm:text-sm md:text-base text-light-text-tertiary dark:text-dark-text-tertiary sm:inline sm:ml-2">- {execution.id}</span>
                          </h4>
                          <button
                            onClick={() => setSelectedExecution(null)}
                            className="btn btn-icon-secondary text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-primary dark:hover:text-dark-text-primary min-h-[40px] px-3 py-2 text-xs sm:min-h-[36px] sm:px-4 sm:text-sm [touch-action:manipulation] active:scale-95"
                          >
                            × Close
                          </button>
                        </div>

                        {/* Execution Summary */}
                        <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-2 md:grid-cols-4 sm:gap-3 md:gap-4 md:mb-6">
                          <div className="p-2 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-200 dark:bg-dark-bg-200 sm:p-3">
                            <div className="text-[10px] font-body sm:text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary">Status</div>
                            <div className="text-sm font-semibold font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary break-words">{execution.status}</div>
                          </div>
                          <div className="p-2 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-200 dark:bg-dark-bg-200 sm:p-3">
                            <div className="text-[10px] font-body sm:text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary">Duration</div>
                            <div className="text-sm font-semibold font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary break-words">{formatDuration(execution.duration)}</div>
                          </div>
                          <div className="p-2 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-200 dark:bg-dark-bg-200 sm:p-3">
                            <div className="text-[10px] font-body sm:text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Cost</div>
                            <div className="text-sm font-semibold font-display sm:text-base md:text-lg text-light-text-primary dark:text-dark-text-primary break-words">{formatCost(execution.cost)}</div>
                          </div>
                          <div className="p-2 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-200 dark:bg-dark-bg-200 sm:p-3">
                            <div className="text-[10px] font-body sm:text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary">Started</div>
                            <div className="text-xs font-semibold font-display sm:text-sm md:text-base text-light-text-primary dark:text-dark-text-primary break-words">
                              {new Date(execution.startTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Trace */}
                        {execution.steps && execution.steps.length > 0 ? (
                          <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <h5 className="text-xs font-medium font-display sm:text-sm md:text-md text-light-text-primary dark:text-dark-text-primary">Execution Steps</h5>
                            <div className="space-y-2 sm:space-y-3">
                              {execution.steps.map((step, index) => (
                                <div key={step.id} className="p-2.5 rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-3 md:p-4">
                                  <div className="flex flex-col gap-2 justify-between items-start mb-2 sm:flex-row sm:items-center sm:gap-0">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                      <div className="w-5 h-5 bg-gradient-to-br from-[#06ec9e]/20 to-emerald-500/20 dark:from-[#06ec9e]/30 dark:to-emerald-500/30 text-[#06ec9e] dark:text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-display font-medium border border-[#06ec9e]/30 dark:border-emerald-500/30 sm:w-6 sm:h-6 sm:text-xs md:text-sm flex-shrink-0">
                                        {index + 1}
                                      </div>
                                      <div className="text-xs font-medium font-display sm:text-sm text-light-text-primary dark:text-dark-text-primary break-words">{step.name}</div>
                                    </div>
                                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full font-display bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 sm:px-2 sm:py-1 sm:text-xs">
                                      {step.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-2 md:grid-cols-4 sm:gap-3 md:gap-4 sm:text-xs md:text-sm">
                                    <div>
                                      <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Cost:</span>
                                      <span className="ml-2 font-medium font-display text-light-text-primary dark:text-dark-text-primary">{formatCost(step.metadata?.cost || 0)}</span>
                                    </div>
                                    <div>
                                      <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Tokens:</span>
                                      <span className="ml-2 font-medium font-display text-light-text-primary dark:text-dark-text-primary">{step.metadata?.tokens?.total || 0}</span>
                                    </div>
                                    <div>
                                      <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Latency:</span>
                                      <span className="ml-2 font-medium font-display text-light-text-primary dark:text-dark-text-primary">{step.metadata?.latency || 0}ms</span>
                                    </div>
                                    <div>
                                      <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">Type:</span>
                                      <span className="ml-2 font-medium font-display text-light-text-primary dark:text-dark-text-primary">{step.type}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center font-body text-light-text-tertiary dark:text-dark-text-tertiary sm:py-8">
                            No step details available for this execution
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-4 text-center rounded-lg border glass border-primary-200/30 dark:border-primary-500/20 bg-light-bg-200 dark:bg-dark-bg-200 sm:p-6 md:p-8 md:rounded-xl">
                  <p className="text-xs font-body sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Select a workflow execution to view detailed trace information</p>
                  <p className="mt-2 text-[10px] font-body sm:text-xs md:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Click "View Trace" on any execution in the Executions tab</p>
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
