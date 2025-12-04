import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, FunnelIcon, ChevronDownIcon, SparklesIcon, ClockIcon, CircleStackIcon, ArrowDownTrayIcon, CloudArrowUpIcon, ChartBarIcon, FolderIcon, CurrencyDollarIcon, HashtagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { UsageList } from '@/components/usage/UsageList';
import { UsageShimmer } from '@/components/shimmer/UsageShimmer';
import { usePagination, useDebounce } from '@/hooks';
import { UsageFilters as IUsageFilters } from '@/types';
import { UsageFilter } from '@/components/usage/UsageFilter';
import { TrackUsageModal } from '@/components/usage/TrackUsageModal';
import { UsageChart } from '@/components/usage/UsageChart';
import { UsageStats } from '@/components/usage/UsageStats';
import { UsageSearch } from '@/components/usage/UsageSearch';
import { UsageExport } from '@/components/usage/UsageExport';
import { UsageUpload } from '@/components/usage/UsageUpload';
import { useProject } from '@/contexts/ProjectContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HighCostSuggestions, WhatIfSimulationModal } from '@/components/experimentation';
import type { Usage } from '@/types';

export default function Usage() {
  const navigate = useNavigate();
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<IUsageFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [usageForSimulation, setUsageForSimulation] = useState<Usage | null>(null);
  const { selectedProject, setSelectedProject, projects, getSelectedProjectName } = useProject();


  const debouncedSearch = useDebounce(searchQuery, 500);
  const { limit } = usePagination();

  // Convert date range filter to startDate/endDate
  const getDateRange = (dateRange: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        return { startDate: undefined, endDate: undefined };
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  // Prepare query parameters with memoization to prevent infinite re-renders
  const queryParams = useMemo(() => {
    // Ensure limit doesn't exceed API maximum of 100
    const safeLimit = Math.min(limit, 100);
    const params: any = {
      page: currentPage,
      limit: safeLimit,
      q: debouncedSearch,
      ...getDateRange(filters.dateRange || '7d')
    };

    if (filters.service) params.service = filters.service;
    if (filters.model) params.model = filters.model;
    if (filters.minCost) params.minCost = filters.minCost;
    if (filters.maxCost) params.maxCost = filters.maxCost;
    if (filters.userEmail) params.userEmail = filters.userEmail;
    if (filters.customerEmail) params.customerEmail = filters.customerEmail;
    if (selectedProject && selectedProject !== 'all') params.projectId = selectedProject;

    // Handle custom properties
    if (filters.customProperties && Object.keys(filters.customProperties).length > 0) {
      Object.entries(filters.customProperties).forEach(([key, value]) => {
        if (key && value) {
          params[`properties.${key}`] = value;
        }
      });
    }

    return params;
  }, [currentPage, limit, debouncedSearch, filters, selectedProject]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['usage', queryParams],
    queryFn: () => usageService.getUsage(queryParams),
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000, // 1 second delay between retries
  });

  // Fetch previous period data for trend calculation
  const previousPeriodParams = useMemo(() => {
    const dateRange = filters.dateRange || '7d';
    const now = new Date();
    const currentStart = new Date();

    let days = 7;
    switch (dateRange) {
      case '1d': days = 1; break;
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
    }

    currentStart.setDate(now.getDate() - days);
    const previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - days);

    const params: any = {
      page: 1,
      limit: 100, // API maximum limit
      startDate: previousStart.toISOString(),
      endDate: previousEnd.toISOString(),
    };

    if (selectedProject && selectedProject !== 'all') params.projectId = selectedProject;
    if (filters.service) params.service = filters.service;
    if (filters.model) params.model = filters.model;

    return params;
  }, [filters.dateRange, selectedProject, filters.service, filters.model]);

  const { data: previousData } = useQuery({
    queryKey: ['usage', 'previous', previousPeriodParams],
    queryFn: () => usageService.getUsage(previousPeriodParams),
    enabled: !!data?.usage && data.usage.length > 0,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Extract unique services and models from usage data
  const availableServices = useMemo(() => {
    if (!data?.usage) return [];
    const services = new Set<string>();
    data.usage.forEach((item: any) => {
      if (item.service) services.add(item.service);
    });
    return Array.from(services).sort();
  }, [data?.usage]);

  const availableModels = useMemo(() => {
    if (!data?.usage) return [];
    const models = new Set<string>();
    data.usage.forEach((item: any) => {
      if (item.model) models.add(item.model);
    });
    return Array.from(models).sort();
  }, [data?.usage]);

  // Calculate trends by comparing current period with previous period
  const calculateTrends = useMemo(() => {
    if (!data?.usage || !previousData?.usage) {
      return {
        costTrend: 0,
        callsTrend: 0,
        responseTrend: 0,
        tokensTrend: 0,
      };
    }

    const currentCost = data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
    const previousCost = previousData.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
    const costTrend = previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0;

    const currentCalls = data.usage.length;
    const previousCalls = previousData.usage.length;
    const callsTrend = previousCalls > 0 ? ((currentCalls - previousCalls) / previousCalls) * 100 : 0;

    const currentAvgResponse = data.usage.length > 0
      ? data.usage.reduce((sum: number, item: any) => sum + (item.responseTime || 0), 0) / data.usage.length
      : 0;
    const previousAvgResponse = previousData.usage.length > 0
      ? previousData.usage.reduce((sum: number, item: any) => sum + (item.responseTime || 0), 0) / previousData.usage.length
      : 0;
    const responseTrend = previousAvgResponse > 0 ? ((currentAvgResponse - previousAvgResponse) / previousAvgResponse) * 100 : 0;

    const currentTokens = data.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0);
    const previousTokens = previousData.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0);
    const tokensTrend = previousTokens > 0 ? ((currentTokens - previousTokens) / previousTokens) * 100 : 0;

    return {
      costTrend: Math.round(costTrend * 10) / 10,
      callsTrend: Math.round(callsTrend * 10) / 10,
      responseTrend: Math.round(responseTrend * 10) / 10,
      tokensTrend: Math.round(tokensTrend * 10) / 10,
    };
  }, [data?.usage, previousData?.usage]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };


  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="mx-auto space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display gradient-text-primary">
                  API Usage
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-secondary-600 dark:text-secondary-300">
                  Track and manage your AI API usage across all providers{selectedProject !== 'all' ? ` • ${getSelectedProjectName()}` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Project Selection */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95">
                    <FolderIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{getSelectedProjectName()}</span>
                    <span className="sm:hidden">Project</span>
                    <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-[9999] mt-2 w-56 sm:w-64 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl origin-top-right glass bg-gradient-light-panel dark:bg-gradient-dark-panel focus:outline-none">
                    <div className="py-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject('all')}
                            className={`${active ? 'bg-[#06ec9e]/10 dark:bg-emerald-500/10 text-[#06ec9e] dark:text-emerald-400' : 'text-secondary-700 dark:text-secondary-300'
                              } ${selectedProject === 'all' ? 'bg-[#06ec9e]/20 dark:bg-emerald-500/20 text-[#06ec9e] dark:text-emerald-400 font-semibold' : ''
                              } group flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left rounded-lg mx-2 transition-colors min-h-[44px] [touch-action:manipulation]`}
                          >
                            <FolderIcon className="w-4 h-4" />
                            All Projects
                          </button>
                        )}
                      </Menu.Item>
                      {projects.map((project) => (
                        <Menu.Item key={project._id}>
                          {({ active }) => (
                            <button
                              onClick={() => setSelectedProject(project._id)}
                              className={`${active ? 'bg-[#06ec9e]/10 dark:bg-emerald-500/10 text-[#06ec9e] dark:text-emerald-400' : 'text-secondary-700 dark:text-secondary-300'
                                } ${selectedProject === project._id ? 'bg-[#06ec9e]/20 dark:bg-emerald-500/20 text-[#06ec9e] dark:text-emerald-400 font-semibold' : ''
                                } group flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left rounded-lg mx-2 transition-colors min-h-[44px] [touch-action:manipulation]`}
                            >
                              <FolderIcon className="w-4 h-4" />
                              {project.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* View Requests Button */}
              <button
                onClick={() => navigate('/requests')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span>Requests</span>
              </button>

              {/* Quick Actions - Direct buttons instead of dropdown for better UX */}
              <button
                onClick={() => setShowTrackModal(true)}
                className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[44px] [touch-action:manipulation] whitespace-nowrap flex-shrink-0"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Track</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>

        {/* Usage Content */}
        {isLoading ? (
          <UsageShimmer />
        ) : (
          <>
            {/* Usage Stats */}
            {data?.usage && data.usage.length > 0 && (
              <UsageStats
                stats={{
                  totalCost: data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0),
                  costTrend: calculateTrends.costTrend,
                  totalCalls: data.usage.length,
                  callsTrend: calculateTrends.callsTrend,
                  avgResponseTime: Math.round(data.usage.reduce((sum: number, item: any) => sum + (item.responseTime || 0), 0) / data.usage.length),
                  responseTrend: calculateTrends.responseTrend,
                  totalTokens: data.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0),
                  tokensTrend: calculateTrends.tokensTrend,
                }}
                period={filters.dateRange || '7d'}
              />
            )}

            {/* Usage Chart */}
            {data?.usage && data.usage.length > 0 && (
              <UsageChart
                data={(() => {
                  // Group usage by date for chart
                  const groupedByDate: Record<string, { date: string; cost: number; calls: number; tokens: number }> = {};
                  data.usage.forEach((item: any) => {
                    const date = new Date(item.createdAt).toISOString().split('T')[0];
                    if (!groupedByDate[date]) {
                      groupedByDate[date] = { date, cost: 0, calls: 0, tokens: 0 };
                    }
                    groupedByDate[date].cost += item.cost || 0;
                    groupedByDate[date].calls += 1;
                    groupedByDate[date].tokens += item.totalTokens || 0;
                  });
                  return Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date));
                })()}
                type="line"
                metric="cost"
              />
            )}

            {/* Stats Cards */}
            {data?.usage && data.usage.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Cost */}
                <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-3 mr-3 sm:mr-4 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20 dark:from-success-500/30 dark:to-success-600/30">
                      <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">
                        Total Cost
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold font-display text-secondary-900 dark:text-white">
                        ${data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0).toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Total Tokens */}
                <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-3 mr-3 sm:mr-4 bg-gradient-to-br rounded-xl from-[#06ec9e]/20 to-emerald-500/20 dark:from-[#06ec9e]/30 dark:to-emerald-500/30">
                      <HashtagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#06ec9e] dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                        Total Tokens
                      </dt>
                      <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                        {data.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Token Breakdown */}
                <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-3 mr-3 sm:mr-4 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20 dark:from-highlight-500/30 dark:to-highlight-600/30">
                      <CircleStackIcon className="w-5 h-5 sm:w-6 sm:h-6 text-highlight-600 dark:text-highlight-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">
                        Token Breakdown
                      </dt>
                      <dd className="text-xs sm:text-sm text-secondary-900 dark:text-white">
                        <div className="mt-2 space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-secondary-600 dark:text-secondary-300">Input:</span>
                            <span className="font-semibold">{data.usage.reduce((sum: number, item: any) => sum + ((item as any).promptTokens || 0), 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-secondary-600 dark:text-secondary-300">Output:</span>
                            <span className="font-semibold">{data.usage.reduce((sum: number, item: any) => sum + ((item as any).completionTokens || 0), 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Average Response Time */}
                <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-3 mr-3 sm:mr-4 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20 dark:from-accent-500/30 dark:to-accent-600/30">
                      <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300">
                        Avg Response
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold font-display text-secondary-900 dark:text-white">
                        {(() => {
                          const avgTime = data.usage.reduce((sum: number, item: any) => sum + (item.responseTime || 0), 0) / data.usage.length;
                          return avgTime > 1000 ? `${(avgTime / 1000).toFixed(1)}s` : `${Math.round(avgTime)}ms`;
                        })()}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <UsageSearch
                    onSearch={setSearchQuery}
                    placeholder="Search prompts, models, services..."
                  />
                </div>
                <button
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span>Filters</span>
                  {Object.keys(filters).length > 0 && (
                    <span className="inline-flex justify-center items-center w-5 h-5 text-xs font-medium text-white rounded-full shadow-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454]">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Modal */}
            <UsageFilter
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              onFilterChange={handleFilterChange}
              services={availableServices}
              models={availableModels}
            />

            {/* Export Modal */}
            <UsageExport
              filters={queryParams}
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
            />

            {/* Upload Modal */}
            <UsageUpload
              onUploadComplete={() => refetch()}
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
            />

            {/* Cost Optimization Opportunities Banner */}
            {data?.usage && data.usage.length > 0 && (
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="p-4 sm:p-6 bg-gradient-to-br rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454]">
                        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold font-display gradient-text-primary">
                          Cost Optimization Opportunities
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                          Scroll down to see AI-powered suggestions for reducing your costs
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Try to find the element, with retry logic
                        const scrollToOpportunities = () => {
                          const element = document.getElementById('cost-opportunities');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            // Retry after a short delay in case component is still rendering
                            setTimeout(() => {
                              const retryElement = document.getElementById('cost-opportunities');
                              if (retryElement) {
                                retryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 300);
                          }
                        };
                        scrollToOpportunities();
                      }}
                      className="w-full sm:w-auto group relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[44px] [touch-action:manipulation]"
                    >
                      View Opportunities
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Usage List */}
            {error ? (
              <div className="p-6 text-center">
                <div className="mb-4 text-red-600">
                  <p className="text-lg font-semibold">Failed to load usage data</p>
                  <p className="mt-2 text-sm text-gray-600">
                    {error instanceof Error ? error.message : 'An error occurred while loading usage data'}
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <UsageList
                  pagination={data?.pagination}
                  usage={data?.usage || []}
                  onRefresh={handleRefresh}
                  onPageChange={handlePageChange}
                />

                {/* Cost Optimization Opportunities - Always render container for scroll target */}
                {data?.usage && data.usage.length > 0 && (
                  <div id="cost-opportunities" className="mt-6">
                    <HighCostSuggestions
                      usages={data.usage}
                      onSimulate={(usage) => {
                        setUsageForSimulation(usage);
                        setSimulationModalOpen(true);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Track Usage Modal */}
        <TrackUsageModal
          isOpen={showTrackModal}
          onClose={() => setShowTrackModal(false)}
          projectId={selectedProject}
        />

        {/* What-If Simulation Modal */}
        <WhatIfSimulationModal
          isOpen={simulationModalOpen}
          onClose={() => {
            setSimulationModalOpen(false);
            setUsageForSimulation(null);
          }}
          usage={usageForSimulation}
        />
      </div>
    </div>
  );
}