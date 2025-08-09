import React, { useState, useEffect } from 'react';
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
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  duration: number | null;
  cost: number;
  startTime: Date;
  steps?: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  metadata?: {
    cost?: number;
    tokens?: { total: number };
    latency?: number;
    cacheHit?: boolean;
  };
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
    trend: { daily: number[] };
  };
  alerts: {
    type: 'warning' | 'info' | 'error';
    message: string;
    timestamp: Date;
  }[];
}

const WorkflowDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'analytics' | 'traces'>('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Import the workflow service dynamically to avoid circular dependencies
      const { workflowService } = await import('../../services/workflow.service');

      // Fetch real dashboard data from API
      const data = await workflowService.getObservabilityDashboard();
      // Transform the data to match our interface
      const transformedData: DashboardData = {
        ...data,
        recentExecutions: data.recentExecutions.map(exec => ({
          ...exec,
          status: exec.status as 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
        }))
      };
      setDashboardData(transformedData);
      setLoading(false);
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
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">AI Workflow Observatory</h1>
        <p className="text-gray-600">Monitor, trace, and optimize your AI workflow executions</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex px-6 space-x-8" aria-label="Tabs">
            {['overview', 'executions', 'analytics', 'traces'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Executions</p>
                      <p className="text-2xl font-bold text-blue-900">{dashboardData.overview.totalExecutions}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Success Rate</p>
                      <p className="text-2xl font-bold text-green-900">{dashboardData.overview.successRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Avg Duration</p>
                      <p className="text-2xl font-bold text-purple-900">{formatDuration(dashboardData.overview.averageDuration)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Total Cost</p>
                      <p className="text-2xl font-bold text-yellow-900">{formatCost(dashboardData.overview.totalCost)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                  <div className="flex items-center">
                    <PlayIcon className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-indigo-600">Active Workflows</p>
                      <p className="text-2xl font-bold text-indigo-900">{dashboardData.overview.activeWorkflows}</p>
                    </div>
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
                    {dashboardData.recentExecutions.map((execution) => (
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
                            onClick={() => setSelectedExecution(execution.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Trace
                          </button>
                        </td>
                      </tr>
                    ))}
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
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.latency.p50}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P95</span>
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.latency.p95}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">P99</span>
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.latency.p99}ms</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="mb-4 text-lg font-medium text-gray-900">Error Rate</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {dashboardData.performanceMetrics.errorRate.current}%
                    </div>
                    <div className={`text-sm ${dashboardData.performanceMetrics.errorRate.trend < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {dashboardData.performanceMetrics.errorRate.trend > 0 ? '+' : ''}
                      {dashboardData.performanceMetrics.errorRate.trend}% from last period
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <h4 className="mb-4 text-lg font-medium text-gray-900">Cost Breakdown</h4>
                  <div className="space-y-3">
                    {dashboardData.costAnalysis.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{item.category}</span>
                        <span className="text-sm font-medium">{formatCost(item.amount)} ({item.percentage}%)</span>
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
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">Select a workflow execution to view detailed trace information</p>
                {selectedExecution && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-600">Loading trace for execution: {selectedExecution}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDashboard;