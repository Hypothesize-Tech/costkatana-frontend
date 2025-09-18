import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner, ErrorBoundary } from '../components/common';
import { analyticsService, AnalyticsService } from '../services/analytics.service';
import { CostTrendChart } from '../components/analytics/CostTrendChart';
import { ServiceAnalytics } from '../components/analytics/ServiceAnalytics';
import { ModelComparison } from '../components/analytics/ModelComparison';
import { PropertyAnalytics } from '../components/analytics/PropertyAnalytics';
import { FeedbackAnalytics } from '../components/feedback';

import { formatCurrency } from '../utils/formatters';
import { ProjectService } from '../services/project.service';
import { useNotification } from '../contexts/NotificationContext';
import { useMixpanel } from '../hooks/useMixpanel';

interface Project {
  _id: string;
  name: string;
  description?: string;
  budget?: {
    amount: number;
    currency: string;
  };
}

interface AnalyticsData {
  summary: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCostPerRequest: number;
    budgetUtilization?: number;
  };
  trends: {
    costTrend: string;
    tokenTrend: string;
    insights: string[];
  };
  breakdown: {
    services: Array<{
      service: string;
      cost: number;
      percentage: number;
      requests: number;
      calls: number;
    }>;
    models: Array<{
      model: string;
      cost: number;
      percentage: number;
      requests: number;
      calls: number;
      avgTokens: number;
      avgCost: number;
    }>;
    projects?: Array<{
      projectId: string;
      projectName: string;
      cost: number;
      requests: number;
      budgetUtilization: number;
    }>;
  };
  timeline: Array<{
    date: string;
    cost: number;
    tokens: number;
    requests: number;
    calls: number;
  }>;
  project?: {
    id: string;
    name: string;
    budget: any;
  };
}

interface ProjectComparison {
  projects: Array<{
    projectId: string;
    projectName: string;
    metrics: {
      cost: number;
      tokens: number;
      requests: number;
      averageCostPerRequest: number;
    };
    budget: any;
    budgetUtilization: number;
  }>;
  summary?: {
    totalProjects: number;
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
  };
}

// Helper to parse timeRange to startDate and endDate
function getDateRange(timeRange: string): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString();
  const startDateObj = new Date(now);

  // If timeRange is a preset (e.g., '7d', '30d', etc.)
  switch (timeRange) {
    case '7d':
      startDateObj.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDateObj.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDateObj.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDateObj.setFullYear(now.getFullYear() - 1);
      break;
    default: {
      // If timeRange is a date string, use it as startDate
      // Validate date string
      const parsed = new Date(timeRange);
      if (!isNaN(parsed.getTime())) {
        return { startDate: parsed.toISOString(), endDate };
      } else {
        // fallback to 30d
        startDateObj.setDate(now.getDate() - 30);
      }
    }
  }
  return { startDate: startDateObj.toISOString(), endDate };
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, _setSelectedProject] = useState<string>('all');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ProjectComparison | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [groupBy, _setGroupBy] = useState<string>('date');
  const [loading, setLoading] = useState(true);
  const [_refreshing, setRefreshing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { showNotification } = useNotification();
  const {
    trackAnalyticsEvent,
    trackDashboardInteraction,
    trackFilterUsage
  } = useMixpanel();

  const fetchAnalyticsData = async (projectId?: string) => {
    try {
      setRefreshing(true);
      const filters: any = { groupBy };

      // Use helper to get valid ISO date strings
      const { startDate, endDate } = getDateRange(timeRange);
      filters.startDate = startDate;
      filters.endDate = endDate;

      if (projectId && projectId !== 'all') {
        filters.projectId = projectId;
        const analyticsData = await AnalyticsService.getProjectAnalytics(projectId, filters);
        // Transform the data to match AnalyticsData interface
        const transformedData = {
          summary: {
            totalCost: analyticsData?.summary?.totalCost || 0,
            totalTokens: analyticsData?.summary?.totalTokens || 0,
            totalRequests: analyticsData?.summary?.totalRequests || analyticsData?.summary?.totalCalls || 0,
            averageCostPerRequest: analyticsData?.summary?.averageCostPerRequest ||
              (analyticsData?.summary?.totalCost || 0) / (analyticsData?.summary?.totalRequests || analyticsData?.summary?.totalCalls || 1),
            budgetUtilization: analyticsData?.summary?.budgetUtilization
          },
          timeline: (analyticsData?.timeline || analyticsData?.timeSeries || []).map((item: any) => ({
            date: item?.date || '',
            cost: item?.cost || 0,
            tokens: item?.tokens || 0,
            requests: item?.calls || item?.requests || 0,
            calls: item?.calls || item?.requests || 0
          })),
          breakdown: {
            services: (analyticsData?.breakdown?.services || analyticsData?.serviceBreakdown || []).map((service: any) => ({
              service: service?.service || 'Unknown',
              cost: service?.cost || service?.totalCost || 0,
              percentage: service?.percentage || 0,
              requests: service?.requests || service?.totalRequests || service?.calls || service?.totalCalls || 0,
              calls: service?.calls || service?.totalCalls || service?.requests || service?.totalRequests || 0
            })),
            models: (analyticsData?.breakdown?.models || analyticsData?.modelBreakdown || []).map((model: any) => ({
              model: model?.model || 'Unknown',
              cost: model?.cost || model?.totalCost || 0,
              percentage: model?.percentage || 0,
              requests: model?.requests || model?.totalRequests || model?.calls || model?.totalCalls || 0,
              calls: model?.calls || model?.totalCalls || model?.requests || model?.totalRequests || 0,
              avgTokens: model?.avgTokens || (model?.totalTokens || 0) / (model?.totalRequests || model?.calls || 1),
              avgCost: model?.avgCost || (model?.cost || model?.totalCost || 0) / (model?.totalRequests || model?.calls || 1)
            }))
          },
          trends: analyticsData?.trends || { costTrend: 'stable', tokenTrend: 'stable', insights: [] }
        };

        setData(transformedData);

        // Track analytics data fetch
        trackAnalyticsEvent('project_analytics_loaded', '/analytics', 'analytics_page', {
          projectId,
          timeRange,
          groupBy,
          dataPoints: transformedData.timeline.length,
          totalCost: transformedData.summary.totalCost
        });
      } else {
        const analyticsData = await analyticsService.getAnalytics(filters);

        // Transform the data to match AnalyticsData interface
        const transformedData = {
          summary: {
            totalCost: analyticsData?.summary?.totalCost || 0,
            totalTokens: analyticsData?.summary?.totalTokens || 0,
            totalRequests: analyticsData?.summary?.totalRequests || analyticsData?.summary?.totalCalls || 0,
            averageCostPerRequest: (analyticsData?.summary?.totalCost || 0) / (analyticsData?.summary?.totalRequests || analyticsData?.summary?.totalCalls || 1),
            budgetUtilization: 0
          },
          timeline: (analyticsData?.timeline || analyticsData?.timeSeries || []).map((item: any) => ({
            date: item?.date || '',
            cost: item?.cost || 0,
            tokens: item?.tokens || 0,
            requests: item?.calls || item?.requests || 0,
            calls: item?.calls || item?.requests || 0
          })),
          breakdown: {
            services: (analyticsData?.breakdown?.services || analyticsData?.serviceBreakdown || []).map((service: any) => ({
              service: service?.service || 'Unknown',
              cost: service?.cost || service?.totalCost || 0,
              percentage: service?.percentage || 0,
              requests: service?.requests || service?.totalRequests || service?.calls || service?.totalCalls || 0,
              calls: service?.calls || service?.totalCalls || service?.requests || service?.totalRequests || 0
            })),
            models: (analyticsData?.breakdown?.models || analyticsData?.modelBreakdown || []).map((model: any) => ({
              model: model?.model || 'Unknown',
              cost: model?.cost || model?.totalCost || 0,
              percentage: model?.percentage || 0,
              requests: model?.requests || model?.totalRequests || model?.calls || model?.totalCalls || 0,
              calls: model?.calls || model?.totalCalls || model?.requests || model?.totalRequests || 0,
              avgTokens: model?.avgTokens || (model?.totalTokens || 0) / (model?.totalRequests || model?.calls || 1),
              avgCost: model?.avgCost || (model?.cost || model?.totalCost || 0) / (model?.totalRequests || model?.calls || 1)
            }))
          },
          trends: analyticsData?.trends || { costTrend: 'stable', tokenTrend: 'stable', insights: [] }
        };

        setData(transformedData);

        // Track analytics data fetch
        trackAnalyticsEvent('analytics_loaded', '/analytics', 'analytics_page', {
          timeRange,
          groupBy,
          dataPoints: transformedData.timeline.length,
          totalCost: transformedData.summary.totalCost,
          totalRequests: transformedData.summary.totalRequests
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      showNotification('Failed to load analytics data', 'error');

      // Track error
      trackAnalyticsEvent('analytics_error', '/analytics', 'analytics_page', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeRange,
        groupBy
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProjectComparison = async () => {
    if (selectedProjects.length < 2) return;

    try {
      const filters: any = {};

      // Use helper to get valid ISO date strings
      const { startDate, endDate } = getDateRange(timeRange);
      filters.startDate = startDate;
      filters.endDate = endDate;
      filters.projectIds = selectedProjects;
      filters.metric = 'cost';

      const comparisonData = await AnalyticsService.compareProjects(filters);

      // Extract data from the response structure
      const actualData = comparisonData?.data || comparisonData;

      // Transform the backend response to match frontend expectations
      const transformedProjects = (actualData?.projects || []).map((project: any) => ({
        projectId: project?.projectId || project?._id || '',
        projectName: project?.projectName || 'Unknown Project',
        metrics: {
          cost: project?.totalCost || project?.avgCost || 0,
          tokens: project?.totalTokens || 0,
          requests: project?.totalRequests || 0,
          averageCostPerRequest: project?.avgCost || 0
        },
        budget: project?.budget || null,
        budgetUtilization: project?.budgetUtilization || 0
      }));

      // Defensive: ensure summary exists and is valid
      let summary = actualData?.summary;
      if (!summary) {
        // Compute summary from projects array if missing
        const projectsArr = transformedProjects;
        summary = {
          totalProjects: projectsArr.length,
          totalCost: projectsArr.reduce((acc: number, p: any) => acc + (p?.metrics?.cost || 0), 0),
          totalTokens: projectsArr.reduce((acc: number, p: any) => acc + (p?.metrics?.tokens || 0), 0),
          totalRequests: projectsArr.reduce((acc: number, p: any) => acc + (p?.metrics?.requests || 0), 0),
        };
      } else {
        // If summary exists, ensure it uses the correct values
        summary = {
          ...summary,
          totalCost: transformedProjects.reduce((acc: number, p: any) => acc + (p?.metrics?.cost || 0), 0),
          totalTokens: transformedProjects.reduce((acc: number, p: any) => acc + (p?.metrics?.tokens || 0), 0),
          totalRequests: transformedProjects.reduce((acc: number, p: any) => acc + (p?.metrics?.requests || 0), 0),
        };
      }

      setComparison({
        ...comparisonData,
        projects: transformedProjects,
        summary
      });
    } catch (error) {
      console.error('Error fetching project comparison:', error);
      showNotification('Failed to load project comparison', 'error');
    }
  };

  const fetchProjects = async () => {
    try {
      const userProjects = await ProjectService.getProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const projectId = selectedProject === 'all' ? undefined : selectedProject;
    fetchAnalyticsData(projectId);
  }, [selectedProject, timeRange, groupBy]);

  useEffect(() => {
    if (showComparison && selectedProjects.length >= 2) {
      fetchProjectComparison();
    }
  }, [selectedProjects, timeRange, showComparison]);

  const handleRefresh = () => {
    const projectId = selectedProject === 'all' ? undefined : selectedProject;
    fetchAnalyticsData(projectId);
    if (showComparison && selectedProjects.length >= 2) {
      fetchProjectComparison();
    }

    // Track refresh action
    trackDashboardInteraction('refresh', 'analytics', '/analytics', 'analytics_page', {
      selectedProject,
      timeRange,
      groupBy,
      showComparison
    });
  };

  const handleProjectSelectionToggle = (projectId: string) => {
    const wasSelected = selectedProjects.includes(projectId);
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );

    // Track project selection
    trackFilterUsage('project_selection', projectId, '/analytics', 'project_selector', {
      action: wasSelected ? 'deselected' : 'selected',
      totalSelected: wasSelected ? selectedProjects.length - 1 : selectedProjects.length + 1
    });
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    const previousTimeRange = timeRange;
    setTimeRange(newTimeRange);

    // Track time range filter
    trackFilterUsage('time_range', newTimeRange, '/analytics', 'time_range_selector', {
      previousValue: previousTimeRange
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center mr-4 shadow-lg">
                <ChartBarIcon className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl font-display font-bold gradient-text-primary">Analytics Dashboard</h1>
            </div>
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 glass p-3 rounded-xl border border-primary-200/30">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="date"
                    value={
                      // If timeRange is a preset, show empty, else show the date string
                      ['7d', '30d', '90d', '1y'].includes(timeRange)
                        ? ''
                        : timeRange
                    }
                    onChange={(e) => {
                      // If user picks a date, set as ISO string
                      handleTimeRangeChange(e.target.value);
                    }}
                    className="input text-sm"
                  />
                  <select
                    value={['7d', '30d', '90d', '1y'].includes(timeRange) ? timeRange : ''}
                    onChange={e => handleTimeRangeChange(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="">Custom</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last 1 year</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-4 py-2 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${showComparison
                    ? 'btn-primary'
                    : 'btn-secondary'
                    }`}
                >
                  📊 Compare Periods
                </button>
                <button
                  onClick={handleRefresh}
                  className="btn-ghost px-4 py-2 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Selection (Comparison Mode) */}
        {showComparison && (
          <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-display font-bold gradient-text">
                  Project Comparison
                </h3>
              </div>
              <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300 bg-gradient-to-r from-accent-50/50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/20 px-3 py-1 rounded-lg border border-accent-200/30">
                Select 2+ projects to compare
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <label key={project._id} className="card card-hover p-4 cursor-pointer transition-all duration-300 hover:scale-105">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project._id)}
                      onChange={() => handleProjectSelectionToggle(project._id)}
                      className="mt-1 w-4 h-4 text-primary-500 border-primary-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-display font-semibold text-secondary-900 dark:text-white truncate block">
                        {project.name}
                      </span>
                      {project.description && (
                        <span className="text-xs font-body text-secondary-600 dark:text-secondary-300 truncate block mt-1">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {selectedProjects.length < 2 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-accent-50/50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-800/20 border border-accent-200/30 rounded-xl">
                <p className="text-sm font-medium text-accent-700 dark:text-accent-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Select at least 2 projects to compare
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Content */}
        {!showComparison ? (
          // Single Project/All Projects View
          data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                <div className="card card-hover p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Total Cost</p>
                      <p className="text-3xl font-display font-bold gradient-text-success">
                        {formatCurrency(data.summary.totalCost)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Total Tokens</p>
                      <p className="text-3xl font-display font-bold gradient-text">
                        {data.summary.totalTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">API Requests</p>
                      <p className="text-3xl font-display font-bold text-secondary-600 dark:text-secondary-400">
                        {data.summary.totalRequests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card card-hover p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Avg Cost/Request</p>
                      <p className="text-3xl font-display font-bold gradient-text-accent">
                        {formatCurrency(data.summary.averageCostPerRequest)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Utilization (Project View) */}
              {data.project && data.summary.budgetUtilization !== undefined && (
                <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                      <CurrencyDollarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text">
                      Budget Utilization
                    </h3>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-display font-semibold text-secondary-900 dark:text-white">
                      {data.summary.budgetUtilization.toFixed(1)}% of budget used
                    </span>
                    <span className="text-lg font-display font-bold gradient-text">
                      {formatCurrency(data.summary.totalCost)} / {data.project.budget?.amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-primary-200/30 rounded-full overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${data.summary.budgetUtilization > 90
                        ? 'bg-gradient-danger glow-danger'
                        : data.summary.budgetUtilization > 75
                          ? 'bg-gradient-warning glow-warning'
                          : 'bg-gradient-success glow-success'
                        }`}
                      style={{ width: `${Math.min(data.summary.budgetUtilization, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CostTrendChart data={data.timeline} />
                <ServiceAnalytics data={data.breakdown.services} />
              </div>

              {/* Model Comparison */}
              <ModelComparison data={data.breakdown.models} />

              {/* Property Analytics */}
              <PropertyAnalytics
                dateRange={getDateRange(timeRange)}
              />

              {/* Feedback Analytics - Return on AI Spend */}
              <FeedbackAnalytics />

              {/* Insights */}
              {data?.trends?.insights && data.trends.insights.length > 0 && (
                <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text">
                      💡 Insights & Recommendations
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {data.trends.insights.map((insight, index) => (
                      <div key={index} className="glass p-4 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1 w-3 h-3 bg-gradient-primary rounded-full shadow-lg glow-primary" />
                          <p className="font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">{insight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          // Project Comparison View
          comparison && selectedProjects.length >= 2 && (
            <>
              {/* Comparison Summary */}
              <div className="mb-8">
                <div className="card card-gradient p-8 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold gradient-text">
                      Comparison Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="card card-hover p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border-primary-200/30">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Projects</p>
                          <p className="text-3xl font-display font-bold gradient-text">
                            {comparison.summary?.totalProjects ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card card-hover p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border-success-200/30">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                          <CurrencyDollarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Total Cost</p>
                          <p className="text-3xl font-display font-bold gradient-text-success">
                            {formatCurrency(comparison.summary?.totalCost ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card card-hover p-6 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 border-secondary-200/30">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                          <ChartBarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Total Tokens</p>
                          <p className="text-3xl font-display font-bold text-secondary-600 dark:text-secondary-400">
                            {(comparison.summary?.totalTokens ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card card-hover p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border-accent-200/30">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300">Total Requests</p>
                          <p className="text-3xl font-display font-bold gradient-text-accent">
                            {(comparison.summary?.totalRequests ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Comparison Table */}
              <div className="card card-gradient shadow-2xl backdrop-blur-xl">
                <div className="px-8 py-6 border-b border-primary-200/30">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center mr-3 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold gradient-text">
                        Project Details
                      </h3>
                      <p className="mt-1 text-sm font-body text-secondary-600 dark:text-secondary-300">
                        Detailed comparison of selected projects
                      </p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-primary-200/20">
                    <thead className="glass bg-gradient-to-r from-primary-50/30 to-secondary-50/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Tokens
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Requests
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Avg Cost/Request
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-display font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                          Budget Usage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-200/20">
                      {(comparison?.projects || []).map((project, index) => (
                        <tr key={project?.projectId} className="hover:bg-primary-500/5 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                  <span className="text-sm font-display font-bold text-white">
                                    {project?.projectName?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-display font-semibold text-secondary-900 dark:text-white">
                                  {project?.projectName || 'Unknown Project'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold gradient-text">
                              {formatCurrency(project?.metrics?.cost || 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                              {(project?.metrics?.tokens || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                              {(project?.metrics?.requests || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                              {formatCurrency(project?.metrics?.averageCostPerRequest || 0)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(project?.budgetUtilization || 0) > 0 ? (
                              <div className="flex items-center">
                                <span className={`inline-flex px-3 py-1 text-xs font-display font-bold rounded-full ${(project?.budgetUtilization || 0) > 90
                                  ? 'bg-gradient-danger text-white'
                                  : (project?.budgetUtilization || 0) > 75
                                    ? 'bg-gradient-warning text-white'
                                    : 'bg-gradient-success text-white'
                                  }`}>
                                  {(project?.budgetUtilization || 0).toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">No budget set</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )
        )}

        {/* No Data State */}
        {!data && !comparison && (
          <div className="card card-gradient p-12 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-2xl glow-primary animate-pulse">
              <ChartBarIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold gradient-text mb-2">No Analytics Data</h3>
            <p className="text-lg font-body text-secondary-600 dark:text-secondary-300">
              Start using your AI services to see analytics here.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};