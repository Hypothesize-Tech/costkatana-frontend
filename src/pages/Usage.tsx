import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon, ChevronDownIcon, SparklesIcon, ClockIcon, CircleStackIcon, EllipsisVerticalIcon, ArrowDownTrayIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { UsageList } from '@/components/usage/UsageList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
import { Hash } from 'lucide-react';
import { usePopper } from 'react-popper';

export default function Usage() {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<IUsageFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedProject, setSelectedProject, projects, getSelectedProjectName } = useProject();

  // Actions dropdown state
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  const { styles: actionsStyles, attributes: actionsAttributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 16,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top-end', 'top-start', 'bottom-start'],
          padding: 16,
        },
      },
      {
        name: 'computeStyles',
        options: {
          gpuAcceleration: true,
        },
      },
    ],
  });

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node) &&
        referenceElement &&
        !referenceElement.contains(event.target as Node)
      ) {
        setActionsDropdownOpen(false);
      }
    };

    if (actionsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionsDropdownOpen, referenceElement]);


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
    const params: any = {
      page: currentPage,
      limit,
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
      limit: 10000, // Get all for comparison
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
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="mx-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-4xl font-bold font-display gradient-text-primary">
                  API Usage
                </h1>
                {data?.usage && data.usage.some((item: any) => item.cost > 0.01 || item.totalTokens > 500) && (
                  <div className="px-3 py-1 ml-4 text-xs font-medium text-white rounded-full shadow-lg animate-pulse bg-gradient-success">
                    💰 Savings
                  </div>
                )}
              </div>
              <p className="mt-2 text-secondary-600 dark:text-secondary-300">
                Track and manage your AI API usage across all providers{selectedProject !== 'all' ? ` • ${getSelectedProjectName()}` : ''}
              </p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              {/* Project Selection */}
              <Menu as="div" className="inline-block relative z-50 text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center items-center btn btn-secondary">
                    {getSelectedProjectName()}
                    <ChevronDownIcon className="-mr-1 ml-2 w-5 h-5" aria-hidden="true" />
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
                  <Menu.Items className="absolute right-0 z-50 mt-2 w-56 rounded-xl border shadow-xl backdrop-blur-xl origin-top-right glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel focus:outline-none">
                    <div className="py-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject('all')}
                            className={`btn ${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
                              } ${selectedProject === 'all' ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' : ''
                              } group flex items-center px-4 py-2 text-sm w-full text-left rounded-lg mx-2 transition-colors`}
                          >
                            All Projects
                          </button>
                        )}
                      </Menu.Item>
                      {projects.map((project) => (
                        <Menu.Item key={project._id}>
                          {({ active }) => (
                            <button
                              onClick={() => setSelectedProject(project._id)}
                              className={`btn ${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
                                } ${selectedProject === project._id ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300' : ''
                                } group flex items-center px-4 py-2 text-sm w-full text-left rounded-lg mx-2 transition-colors`}
                            >
                              {project.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              <Link
                to="/requests"
                className="btn inline-flex items-center px-4 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-xl shadow-lg backdrop-blur-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300"
              >
                <ClockIcon className="mr-2 w-5 h-5" />
                Request
              </Link>

              {/* Actions Dropdown */}
              <div className="inline-block relative">
                <button
                  ref={setReferenceElement}
                  onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                  className="inline-flex items-center btn btn-secondary"
                  aria-label="Actions"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>

                {actionsDropdownOpen && referenceElement && createPortal(
                  <div
                    ref={(node) => {
                      setPopperElement(node);
                      if (actionsDropdownRef) {
                        (actionsDropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                      }
                    }}
                    style={{
                      ...actionsStyles.popper,
                      zIndex: 99999,
                    }}
                    {...actionsAttributes.popper}
                    className="w-56"
                  >
                    <div className="overflow-hidden py-2 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-scale-in">
                      <button
                        onClick={() => {
                          setShowTrackModal(true);
                          setActionsDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 mx-2 w-full text-sm text-left rounded-lg transition-colors group text-secondary-700 dark:text-secondary-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <PlusIcon className="mr-3 w-5 h-5" />
                        Track Usage
                      </button>
                      <button
                        onClick={() => {
                          setShowExportModal(true);
                          setActionsDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 mx-2 w-full text-sm text-left rounded-lg transition-colors group text-secondary-700 dark:text-secondary-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <ArrowDownTrayIcon className="mr-3 w-5 h-5" />
                        Export Data
                      </button>
                      <button
                        onClick={() => {
                          setShowUploadModal(true);
                          setActionsDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 mx-2 w-full text-sm text-left rounded-lg transition-colors group text-secondary-700 dark:text-secondary-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <CloudArrowUpIcon className="mr-3 w-5 h-5" />
                        Import Usage
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Content */}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Cost */}
              <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                <div className="flex items-center">
                  <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-success-500/20 to-success-600/20">
                    <span className="text-lg font-bold font-display text-success-600 dark:text-success-400">$</span>
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Total Cost
                    </dt>
                    <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
                      ${data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0).toFixed(2)}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Total Tokens */}
              <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                <div className="flex items-center">
                  <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20">
                    <Hash className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
              <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                <div className="flex items-center">
                  <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-highlight-500/20 to-highlight-600/20">
                    <CircleStackIcon className="w-6 h-6 text-highlight-600 dark:text-highlight-400" />
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Token Breakdown
                    </dt>
                    <dd className="text-sm text-secondary-900 dark:text-white">
                      <div className="mt-2 space-y-2">
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
              <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
                <div className="flex items-center">
                  <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20">
                    <ClockIcon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Avg Response
                    </dt>
                    <dd className="text-2xl font-bold font-display text-secondary-900 dark:text-white">
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
          <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <UsageSearch
                  onSearch={setSearchQuery}
                  placeholder="Search prompts, models, services..."
                />
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="btn inline-flex items-center px-4 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-primary-200/30 rounded-xl shadow-lg backdrop-blur-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300"
              >
                <FunnelIcon className="mr-2 w-5 h-5" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <span className="inline-flex justify-center items-center ml-2 w-5 h-5 text-xs font-medium text-white rounded-full shadow-lg bg-gradient-primary">
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
            <div className="mb-8">
              <div className="p-6 bg-gradient-to-br rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 from-primary-500/10 to-success-500/10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold font-display gradient-text-primary">
                        💡 Cost Optimization Opportunities
                      </h3>
                      <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
                        Scroll down to see AI-powered suggestions for reducing your costs
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => document.getElementById('cost-opportunities')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn btn-primary"
                  >
                    View Opportunities
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Usage List */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
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
            <UsageList
              pagination={data?.pagination}
              usage={data?.usage || []}
              onRefresh={handleRefresh}
              onPageChange={handlePageChange}
            />
          )}
        </>

        {/* Track Usage Modal */}
        <TrackUsageModal
          isOpen={showTrackModal}
          onClose={() => setShowTrackModal(false)}
          projectId={selectedProject}
        />
      </div>
    </div>
  );
}