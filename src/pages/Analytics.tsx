import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  LightBulbIcon,
  BoltIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { ErrorBoundary } from '../components/common';
import { AnalyticsShimmer } from '../components/shimmer/AnalyticsShimmer';
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
    return <AnalyticsShimmer />;
  }

  return (
    <ErrorBoundary>
      <div className="px-5 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold gradient-text-primary">Analytics Dashboard</h1>
                  <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                    Real-time insights and performance metrics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all duration-300 hover:scale-105 shrink-0 ${showComparison
                    ? 'btn-primary'
                    : 'btn-secondary'
                    }`}
                  title="Compare Projects"
                >
                  <ArrowsRightLeftIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Compare</span>
                </button>
                <button
                  onClick={handleRefresh}
                  className="btn btn-ghost px-3 py-2 rounded-lg font-display font-semibold text-sm transition-all duration-300 hover:scale-105 shrink-0"
                  title="Refresh Data"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-primary-200/30">
              <div className="flex items-center gap-2 glass rounded-lg p-2 border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-primary-500" />
                </div>
                <input
                  type="date"
                  value={
                    ['7d', '30d', '90d', '1y'].includes(timeRange)
                      ? ''
                      : timeRange
                  }
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="input text-xs py-1.5 px-3 min-w-[140px] bg-white/80 dark:bg-gray-800/80 border-primary-200/30"
                />
                <select
                  value={['7d', '30d', '90d', '1y'].includes(timeRange) ? timeRange : ''}
                  onChange={e => handleTimeRangeChange(e.target.value)}
                  className="input text-xs py-1.5 px-3 min-w-[130px] bg-white/80 dark:bg-gray-800/80 border-primary-200/30"
                >
                  <option value="">Custom</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last 1 year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Project Selection (Comparison Mode) */}
        {showComparison && (
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                  <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold gradient-text-primary">
                    Project Comparison
                  </h3>
                  <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                    Select 2+ projects to compare
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-xs font-display font-semibold text-primary-600 dark:text-primary-400 glass px-3 py-1.5 rounded-lg border border-primary-200/30 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                <FolderIcon className="w-3.5 h-3.5" />
                {selectedProjects.length} selected
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <label key={project._id} className="glass backdrop-blur-sm rounded-lg border border-primary-200/30 p-3 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102 bg-gradient-to-br from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project._id)}
                      onChange={() => handleProjectSelectionToggle(project._id)}
                      className="mt-1 w-4 h-4 text-primary-500 border-primary-300 rounded focus:ring-primary-500 focus:ring-2 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate block">
                        {project.name}
                      </span>
                      {project.description && (
                        <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary truncate block mt-1">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {selectedProjects.length < 2 && (
              <div className="mt-4 p-3 glass rounded-lg border border-warning-200/50 bg-gradient-to-br from-warning-50/50 to-transparent dark:from-warning-900/10">
                <p className="text-xs font-display font-semibold text-warning-700 dark:text-warning-400 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
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
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-lg glow-success shadow-lg shrink-0">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Cost</p>
                      <p className="text-xl font-display font-bold gradient-text-success truncate">
                        {formatCurrency(data.summary.totalCost)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-lg glow-primary shadow-lg shrink-0">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Tokens</p>
                      <p className="text-xl font-display font-bold gradient-text-primary truncate">
                        {data.summary.totalTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2.5 rounded-lg shadow-lg shrink-0">
                      <BoltIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">API Requests</p>
                      <p className="text-xl font-display font-bold text-secondary-600 dark:text-secondary-400 truncate">
                        {data.summary.totalRequests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-2.5 rounded-lg glow-accent shadow-lg shrink-0">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Avg Cost/Request</p>
                      <p className="text-xl font-display font-bold gradient-text-accent truncate">
                        {formatCurrency(data.summary.averageCostPerRequest)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Utilization (Project View) */}
              {data.project && data.summary.budgetUtilization !== undefined && (
                <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold gradient-text-primary">
                        Budget Utilization
                      </h3>
                      <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                        {data.summary.budgetUtilization.toFixed(1)}% of budget used
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-base font-display font-bold gradient-text-primary">
                        {formatCurrency(data.summary.totalCost)} / {data.project.budget?.amount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 glass rounded-full overflow-hidden border border-primary-200/30">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${data.summary.budgetUtilization > 90
                        ? 'bg-gradient-to-r from-red-500 to-red-600 glow-danger'
                        : data.summary.budgetUtilization > 75
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 glow-warning'
                          : 'bg-gradient-to-r from-success-500 to-success-600 glow-success'
                        }`}
                      style={{ width: `${Math.min(data.summary.budgetUtilization, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 min-h-[400px]">
                  <CostTrendChart data={data.timeline} />
                </div>
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300 min-h-[400px]">
                  <ServiceAnalytics data={data.breakdown.services} />
                </div>
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
                <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                      <LightBulbIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text-primary">
                      Insights & Recommendations
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {data.trends.insights.map((insight, index) => (
                      <div key={index} className="glass backdrop-blur-sm rounded-lg p-3.5 border border-primary-200/30 hover:from-primary-50/50 hover:to-primary-100/30 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-300 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-1 w-2 h-2 bg-gradient-primary rounded-full shadow-lg glow-primary" />
                          <p className="text-sm font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">{insight}</p>
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
              <div className="mb-6">
                <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                      <ChartBarIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text-primary">
                      Comparison Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="glass backdrop-blur-sm rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-dark-card/60 dark:to-dark-card/40 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-lg glow-primary shadow-lg shrink-0">
                          <FolderIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Projects</p>
                          <p className="text-xl font-display font-bold gradient-text-primary">
                            {comparison.summary?.totalProjects ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass backdrop-blur-sm rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-dark-card/60 dark:to-dark-card/40 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-success-500 to-success-600 p-2.5 rounded-lg glow-success shadow-lg shrink-0">
                          <CurrencyDollarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Cost</p>
                          <p className="text-xl font-display font-bold gradient-text-success truncate">
                            {formatCurrency(comparison.summary?.totalCost ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass backdrop-blur-sm rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-dark-card/60 dark:to-dark-card/40 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-2.5 rounded-lg shadow-lg shrink-0">
                          <ChartBarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Tokens</p>
                          <p className="text-xl font-display font-bold text-secondary-600 dark:text-secondary-400 truncate">
                            {(comparison.summary?.totalTokens ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass backdrop-blur-sm rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/60 to-white/40 dark:from-dark-card/60 dark:to-dark-card/40 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-2.5 rounded-lg glow-accent shadow-lg shrink-0">
                          <BoltIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">Total Requests</p>
                          <p className="text-xl font-display font-bold gradient-text-accent truncate">
                            {(comparison.summary?.totalRequests ?? 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Comparison Table */}
              <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80">
                <div className="px-5 py-4 border-b border-primary-200/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg glow-primary shadow-lg">
                      <TableCellsIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold gradient-text-primary">
                        Project Details
                      </h3>
                      <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
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
                      {(comparison?.projects || []).map((project) => (
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
          <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary shadow-lg">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold gradient-text-primary mb-2">No Analytics Data</h3>
            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
              Start using your AI services to see analytics here.
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};