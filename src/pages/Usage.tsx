import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, FunnelIcon, ChevronDownIcon, SparklesIcon, ClockIcon, CircleStackIcon, ArrowDownTrayIcon, CloudArrowUpIcon, ChartBarIcon, FolderIcon, CurrencyDollarIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { EnhancedUsageList } from '@/components/usage/EnhancedUsageList';
import { UsageShimmer } from '@/components/shimmer/UsageShimmer';
import { usePagination, useDebounce } from '@/hooks';
import { UsageFilters as IUsageFilters } from '@/types';
import { UsageFilter } from '@/components/usage/UsageFilter';
import { TrackUsageModal } from '@/components/usage/TrackUsageModal';
import { UsageChart } from '@/components/usage/UsageChart';
import { UsageSearch } from '@/components/usage/UsageSearch';
import { UsageExport } from '@/components/usage/UsageExport';
import { UsageUpload } from '@/components/usage/UsageUpload';
import { useProject } from '@/contexts/ProjectContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HighCostSuggestions, WhatIfSimulationModal } from '@/components/experimentation';
import { RequestDetailsModal } from '@/components/usage/RequestDetailsModal';
import OptimizationSuggestionsModal from '@/components/usage/OptimizationSuggestionsModal';
import type { Usage } from '@/types';

export default function Usage() {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<IUsageFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [usageForSimulation, setUsageForSimulation] = useState<Usage | null>(null);
  // NEW: States for comprehensive tracking features
  const [selectedUsageDetails, setSelectedUsageDetails] = useState<Usage | null>(null);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);

  const { selectedProject, setSelectedProject, projects, getSelectedProjectName } = useProject();

  const debouncedSearch = useDebounce(searchQuery, 500);
  const { limit } = usePagination();

  // Convert date range filter to startDate/endDate
  const getDateRange = (dateRange: string, customStartDate?: string, customEndDate?: string) => {
    // If custom date range is selected and dates are provided, use them
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      };
    }

    // If custom is selected but dates not provided, return undefined
    if (dateRange === 'custom') {
      return { startDate: undefined, endDate: undefined };
    }

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
      ...getDateRange(filters.dateRange || '30d', filters.startDate, filters.endDate)
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

  const { data, isLoading, error, refetch } = useQuery<any>(
    ['usage', queryParams],
    async () => {
      // Use standard usage query for basic mode
      return usageService.getUsage(queryParams);
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds cache
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000, // 1 second delay between retries
    }
  );

  // Transform data based on response type
  const transformedData: {
    usage: any[];
    pagination: any;
    summary: any;
    enhancedData: any;
  } | null = useMemo(() => {
    if (!data) return null;

    try {
      // Standard data format
      const standardData = data as any;
      // The pagination is at the root level, not nested
      const paginationData = standardData?.pagination || {};

      // Show pagination if we have valid pagination data
      const shouldShowPagination = paginationData &&
        typeof paginationData.totalPages === 'number' &&
        paginationData.totalPages > 0;

      return {
        usage: standardData?.usage || standardData?.data || [],
        pagination: shouldShowPagination ? {
          currentPage: paginationData.currentPage || 1,
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalItems || 0,
          itemsPerPage: paginationData.itemsPerPage || 20,
          hasNext: paginationData.hasNext || false,
          hasPrev: paginationData.hasPrev || false,
        } : null,
        summary: standardData?.summary || {},
        enhancedData: null,
      };
    } catch (error) {
      console.error('Error transforming data:', error);
      return {
        usage: [],
        pagination: {},
        summary: {},
        enhancedData: null,
      };
    }
  }, [data]);

  // Fetch previous period data for trend calculation
  const previousPeriodParams = useMemo(() => {
    const dateRange = filters.dateRange || '30d';
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


  const { data: previousData } = useQuery<any>(
    ['usage', 'previous', previousPeriodParams],
    () => usageService.getUsage(previousPeriodParams),
    {
      enabled: !!transformedData?.usage && transformedData.usage.length > 0,
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
    }
  );

  // Extract unique services and models from usage data
  const availableServices = useMemo(() => {
    if (!transformedData?.usage || !Array.isArray(transformedData.usage)) return [];
    try {
      const services = new Set<string>();
      transformedData.usage.forEach((item: any) => {
        if (item?.service) services.add(item.service);
      });
      return Array.from(services).sort();
    } catch (error) {
      console.error('Error extracting services:', error);
      return [];
    }
  }, [transformedData?.usage]);

  const availableModels = useMemo(() => {
    if (!transformedData?.usage || !Array.isArray(transformedData.usage)) return [];
    try {
      const models = new Set<string>();
      transformedData.usage.forEach((item: any) => {
        if (item?.model) models.add(item.model);
      });
      return Array.from(models).sort();
    } catch (error) {
      console.error('Error extracting models:', error);
      return [];
    }
  }, [transformedData?.usage]);

  // Calculate trends by comparing current period with previous period
  const calculateTrends = useMemo(() => {
    if (!transformedData?.usage || !previousData?.usage) {
      return {
        costTrend: 0,
        callsTrend: 0,
        responseTrend: 0,
        tokensTrend: 0,
      };
    }

    try {
      const currentUsage = Array.isArray(transformedData.usage) ? transformedData.usage : [];
      const prevUsage = Array.isArray(previousData?.usage) ? previousData.usage :
        (Array.isArray(previousData?.data) ? previousData.data : []);

      const currentCost = currentUsage.reduce((sum: number, item: any) => sum + (item?.cost || 0), 0);
      const previousCost = prevUsage.reduce((sum: number, item: any) => sum + (item?.cost || 0), 0);
      const costTrend = previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0;

      const currentCalls = currentUsage.length;
      const previousCalls = prevUsage.length;
      const callsTrend = previousCalls > 0 ? ((currentCalls - previousCalls) / previousCalls) * 100 : 0;

      const currentAvgResponse = currentUsage.length > 0
        ? currentUsage.reduce((sum: number, item: any) => sum + (item?.responseTime || 0), 0) / currentUsage.length
        : 0;
      const previousAvgResponse = prevUsage.length > 0
        ? prevUsage.reduce((sum: number, item: any) => sum + (item?.responseTime || 0), 0) / prevUsage.length
        : 0;
      const responseTrend = previousAvgResponse > 0 ? ((currentAvgResponse - previousAvgResponse) / previousAvgResponse) * 100 : 0;

      const currentTokens = currentUsage.reduce((sum: number, item: any) => sum + (item?.totalTokens || 0), 0);
      const previousTokens = prevUsage.reduce((sum: number, item: any) => sum + (item?.totalTokens || 0), 0);
      const tokensTrend = previousTokens > 0 ? ((currentTokens - previousTokens) / previousTokens) * 100 : 0;

      return {
        costTrend: Math.round(costTrend * 10) / 10,
        callsTrend: Math.round(callsTrend * 10) / 10,
        responseTrend: Math.round(responseTrend * 10) / 10,
        tokensTrend: Math.round(tokensTrend * 10) / 10,
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {
        costTrend: 0,
        callsTrend: 0,
        responseTrend: 0,
        tokensTrend: 0,
      };
    }
  }, [transformedData?.usage, previousData]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refetch();
  };

  // NEW: Handlers for comprehensive tracking features
  const handleViewRequestDetails = (usage: Usage) => {
    setSelectedUsageDetails(usage);
    setShowRequestDetailsModal(true);
  };

  // Called when user switches to "Network Details" tab (lazy load)
  const handleFetchNetworkDetails = async (usageId: string) => {
    try {
      const networkData = await usageService.getNetworkDetails(usageId);
      if (networkData?.requestTracking) {
        setSelectedUsageDetails((prev) =>
          prev ? { ...prev, requestTracking: networkData.requestTracking } : prev
        );
      }
    } catch {
      // Keep showing basic usage if network details fail
    }
  };

  const handleViewOptimizations = (usage: Usage) => {
    setSelectedUsageDetails(usage);
    setShowOptimizationModal(true);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="mx-auto space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 sm:p-4 md:p-6 lg:p-8 relative z-10">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 flex-shrink-0">
                <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-display gradient-text-primary truncate">
                  Usage Monitoring
                </h1>
                <p className="mt-0.5 sm:mt-1 md:mt-2 text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300 line-clamp-2">
                  Track and manage your AI API usage{selectedProject !== 'all' ? ` • ${getSelectedProjectName()}` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">

              {/* Project Selection */}
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[40px] sm:min-h-[44px] [touch-action:manipulation] active:scale-95 flex-shrink-0">
                    <FolderIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline truncate max-w-[120px] md:max-w-none">{getSelectedProjectName()}</span>
                    <span className="sm:hidden">Project</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" aria-hidden="true" />
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
                  <Menu.Items className="absolute right-0 z-[9999] mt-2 w-48 sm:w-56 md:w-64 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl origin-top-right glass bg-gradient-light-panel dark:bg-gradient-dark-panel focus:outline-none max-h-[60vh] overflow-y-auto">
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

              {/* Quick Actions - Direct buttons instead of dropdown for better UX */}
              <button
                onClick={() => setShowTrackModal(true)}
                className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[40px] sm:min-h-[44px] [touch-action:manipulation] whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Track</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[40px] sm:min-h-[44px] [touch-action:manipulation] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[40px] sm:min-h-[44px] [touch-action:manipulation] active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <CloudArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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
            {/* Usage Chart */}
            {transformedData?.usage && Array.isArray(transformedData.usage) && transformedData.usage.length > 0 && (
              <UsageChart
                data={transformedData.summary?.chartData || []}
                type="line"
                metric="cost"
              />
            )}

            {/* Stats Cards */}
            {transformedData?.usage && transformedData.usage.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Cost */}
                <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-success-500/20 to-success-600/20 dark:from-success-500/30 dark:to-success-600/30 flex-shrink-0">
                      <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                        Total Cost
                      </dt>
                      <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                        ${(transformedData.summary?.totalCost || 0).toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* API Calls */}
                <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-primary-500/20 to-primary-600/20 dark:from-primary-500/30 dark:to-primary-600/30 flex-shrink-0">
                      <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                        API Calls
                      </dt>
                      <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                        {(transformedData.summary?.totalCalls || 0).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Average Response Time */}
                <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-accent-500/20 to-accent-600/20 dark:from-accent-500/30 dark:to-accent-600/30 flex-shrink-0">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                        Avg Response Time
                      </dt>
                      <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                        {(() => {
                          const avgTime = transformedData.summary?.avgResponseTime || 0;
                          return avgTime > 1000 ? `${(avgTime / 1000).toFixed(1)}s` : `${Math.round(avgTime)}ms`;
                        })()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Tokens Used */}
                <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-[#06ec9e]/20 to-emerald-500/20 dark:from-[#06ec9e]/30 dark:to-emerald-500/30 flex-shrink-0">
                      <HashtagIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#06ec9e] dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                        Tokens Used
                      </dt>
                      <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                        {(transformedData.summary?.totalTokens || 0).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Network Performance Cards */}
                {transformedData.summary?.avgNetworkTime !== undefined && (
                  <>
                    {/* Average Network Time */}
                    <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                      <div className="flex items-center">
                        <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-orange-500/20 to-orange-600/20 dark:from-orange-500/30 dark:to-orange-600/30 flex-shrink-0">
                          <CircleStackIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                            Avg Network Time
                          </dt>
                          <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                            {(() => {
                              const avgTime = transformedData.summary?.avgNetworkTime || 0;
                              return avgTime > 1000 ? `${(avgTime / 1000).toFixed(1)}s` : `${Math.round(avgTime)}ms`;
                            })()}
                          </dd>
                        </div>
                      </div>
                    </div>

                    {/* Data Transferred */}
                    <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                      <div className="flex items-center">
                        <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-purple-500/20 to-purple-600/20 dark:from-purple-500/30 dark:to-purple-600/30 flex-shrink-0">
                          <CloudArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                            Data Transferred
                          </dt>
                          <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                            {(() => {
                              const totalData = (transformedData.summary?.totalDataTransferred || 0);
                              if (totalData > 1024 * 1024) {
                                return `${(totalData / (1024 * 1024)).toFixed(1)} MB`;
                              } else if (totalData > 1024) {
                                return `${(totalData / 1024).toFixed(1)} KB`;
                              }
                              return `${totalData.toFixed(0)} B`;
                            })()}
                          </dd>
                        </div>
                      </div>
                    </div>

                    {/* Potential Savings */}
                    {transformedData.summary?.potentialSavings > 0 && (
                      <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.02] transition-transform duration-300 [touch-action:manipulation]">
                        <div className="flex items-center">
                          <div className="p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4 bg-gradient-to-br rounded-lg sm:rounded-xl from-green-500/20 to-green-600/20 dark:from-green-500/30 dark:to-green-600/30 flex-shrink-0">
                            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <dt className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 truncate">
                              Potential Savings
                            </dt>
                            <dd className="text-lg sm:text-xl md:text-2xl font-bold font-display text-secondary-900 dark:text-white truncate">
                              ${(transformedData.summary?.potentialSavings || 0).toFixed(2)}
                            </dd>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {/* Search and Filters */}
            <div className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 sm:flex-row">
                <div className="relative flex-1 min-w-0">
                  <UsageSearch
                    onSearch={setSearchQuery}
                    placeholder="Search prompts, models, services..."
                  />
                </div>
                <button
                  onClick={() => setShowFilters(true)}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[40px] sm:min-h-[44px] [touch-action:manipulation] active:scale-95 flex-shrink-0"
                >
                  <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Filters</span>
                  {Object.keys(filters).length > 0 && (
                    <span className="inline-flex justify-center items-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-medium text-white rounded-full shadow-lg bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454]">
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
            {transformedData?.usage && transformedData.usage.length > 0 && (
              <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br rounded-lg sm:rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass from-[#06ec9e]/10 via-emerald-50/50 to-[#009454]/10 dark:from-[#06ec9e]/20 dark:via-emerald-900/30 dark:to-[#009454]/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                      <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl shadow-lg bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454]">
                        <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold font-display gradient-text-primary truncate">
                          Cost Optimization Opportunities
                        </h3>
                        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300 line-clamp-2">
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
                      className="w-full sm:w-auto group relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-display font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden bg-gradient-to-r from-[#06ec9e] via-emerald-500 to-[#009454] shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 min-h-[40px] sm:min-h-[44px] [touch-action:manipulation] text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
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
                <EnhancedUsageList
                  pagination={transformedData?.pagination}
                  usage={transformedData?.usage || []}
                  onRefresh={handleRefresh}
                  onPageChange={handlePageChange}
                  showNetworkDetails={true}
                  showOptimizationSuggestions={true}
                  onViewDetails={handleViewRequestDetails}
                  onViewOptimizations={handleViewOptimizations}
                />

                {/* Cost Optimization Opportunities - Always render container for scroll target */}
                {transformedData?.usage && transformedData.usage.length > 0 && (
                  <div id="cost-opportunities" className="mt-6">
                    <HighCostSuggestions
                      usages={transformedData.usage}
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

        {/* Unified Usage & Request Details Modal (row click and eye icon) */}
        {selectedUsageDetails && (
          <RequestDetailsModal
            isOpen={showRequestDetailsModal}
            onClose={() => {
              setShowRequestDetailsModal(false);
              setSelectedUsageDetails(null);
            }}
            usage={selectedUsageDetails}
            onFetchNetworkDetails={handleFetchNetworkDetails}
            onSimulate={(usage: Usage) => {
              setUsageForSimulation(usage);
              setShowRequestDetailsModal(false);
              setSimulationModalOpen(true);
            }}
          />
        )}

        {/* NEW: Optimization Suggestions Modal */}
        {selectedUsageDetails && (
          <OptimizationSuggestionsModal
            isOpen={showOptimizationModal}
            onClose={() => {
              setShowOptimizationModal(false);
              setSelectedUsageDetails(null);
            }}
            usage={selectedUsageDetails}
          />
        )}
      </div>
    </div>
  );
}