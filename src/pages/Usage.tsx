import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon, ArrowDownTrayIcon, ChevronDownIcon, SparklesIcon, ClockIcon, ChartPieIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { UsageList } from '@/components/usage/UsageList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePagination, useDebounce } from '@/hooks';
import { UsageFilters as IUsageFilters } from '@/types';
import toast from 'react-hot-toast';
import { UsageFilter } from '@/components/usage/UsageFilter';
import { TrackUsageModal } from '@/components/usage/TrackUsageModal';
import { useProject } from '@/contexts/ProjectContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Hash, Search } from 'lucide-react';

export default function Usage() {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<IUsageFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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


  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await usageService.exportUsage({
        format,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        service: queryParams.service,
        model: queryParams.model,
        projectId: queryParams.projectId
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-export-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Usage data exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export usage data');
    }
  };

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
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-4xl font-display font-bold gradient-text-primary">
                  API Usage
                </h1>
                {data?.usage && data.usage.some((item: any) => item.cost > 0.01 || item.totalTokens > 500) && (
                  <div className="px-3 py-1 ml-4 text-xs font-medium text-white bg-gradient-success rounded-full animate-pulse shadow-lg">
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
              <Menu as="div" className="inline-block relative text-left">
                <div>
                  <Menu.Button className="btn-secondary inline-flex justify-center items-center">
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel origin-top-right focus:outline-none">
                    <div className="py-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject('all')}
                            className={`${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
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
                              className={`${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300'
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
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-secondary-200/30 rounded-xl shadow-lg backdrop-blur-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300"
              >
                <ClockIcon className="mr-2 w-5 h-5" />
                Request
              </Link>
              <button
                onClick={() => setShowTrackModal(true)}
                className="btn-secondary"
              >
                <PlusIcon className="mr-2 w-5 h-5" />
                Track Usage
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="btn-primary"
              >
                <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Usage Content */}
        <>
          {/* Stats Cards */}
          {data?.usage && data.usage.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Cost */}
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20 mr-4">
                    <span className="text-lg font-display font-bold text-success-600 dark:text-success-400">$</span>
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Total Cost
                    </dt>
                    <dd className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                      ${data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0).toFixed(2)}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Total Tokens */}
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 mr-4">
                    <Hash className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Total Tokens
                    </dt>
                    <dd className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                      {data.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0).toLocaleString()}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Token Breakdown */}
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-highlight-500/20 to-highlight-600/20 mr-4">
                    <CircleStackIcon className="h-6 w-6 text-highlight-600 dark:text-highlight-400" />
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Token Breakdown
                    </dt>
                    <dd className="text-sm text-secondary-900 dark:text-white">
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-600 dark:text-secondary-300 font-medium">Input:</span>
                          <span className="font-semibold">{data.usage.reduce((sum: number, item: any) => sum + ((item as any).promptTokens || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-600 dark:text-secondary-300 font-medium">Output:</span>
                          <span className="font-semibold">{data.usage.reduce((sum: number, item: any) => sum + ((item as any).completionTokens || 0), 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </dd>
                  </div>
                </div>
              </div>

              {/* Average Response Time */}
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 card-hover">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 mr-4">
                    <ClockIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div className="flex-1">
                    <dt className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                      Avg Response
                    </dt>
                    <dd className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
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
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-secondary-600 dark:text-secondary-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search prompts, models, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-gradient-professional dark:bg-gradient-secondary border border-primary-200/30 rounded-xl shadow-lg backdrop-blur-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300"
              >
                <FunnelIcon className="mr-2 w-5 h-5" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <span className="inline-flex justify-center items-center ml-2 w-5 h-5 text-xs font-medium text-white rounded-full bg-gradient-primary shadow-lg">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="pt-6 mt-6 border-t border-primary-200/30">
                <UsageFilter
                  onFilterChange={handleFilterChange}
                  services={[]}
                  models={[]}
                />
              </div>
            )}
          </div>

          {/* Cost Optimization Opportunities Banner */}
          {data?.usage && data.usage.length > 0 && (
            <div className="mb-8">
              <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-500/10 to-success-500/10 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-primary rounded-xl shadow-lg glow-primary">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-display font-bold gradient-text-primary">
                        💡 Cost Optimization Opportunities
                      </h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">
                        Scroll down to see AI-powered suggestions for reducing your costs
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => document.getElementById('cost-opportunities')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-primary"
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
                className="btn-primary"
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