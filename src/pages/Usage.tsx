import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, FunnelIcon, ArrowDownTrayIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';
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
    const dateRange = getDateRange(filters.dateRange || '7d');
    const params: any = {
      page: currentPage,
      limit,
      projectId: selectedProject && selectedProject !== 'all' ? selectedProject : undefined,
      service: filters.service || undefined,
      model: filters.model || undefined,
      minCost: filters.minCost ? filters.minCost.toString() : undefined,
      maxCost: filters.maxCost ? filters.maxCost.toString() : undefined,
      q: debouncedSearch || undefined,
      ...dateRange
    };

    // Add custom properties as property.* query parameters
    if (filters.customProperties && typeof filters.customProperties === 'object') {
      Object.entries(filters.customProperties).forEach(([key, value]) => {
        params[`property.${key}`] = value;
      });
    }

    return params;
  }, [currentPage, limit, selectedProject, filters.service, filters.model, filters.minCost, filters.maxCost, debouncedSearch, filters.dateRange, filters.customProperties]);

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
    } catch (error) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              API Usage
            </h1>
            {data?.usage && data.usage.some((item: any) => item.cost > 0.01 || item.totalTokens > 500) && (
              <div className="ml-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                💰 Savings
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track and manage your AI API usage across all providers
            {selectedProject !== 'all' && (
              <span className="ml-1 text-blue-600 dark:text-blue-400">
                • {getSelectedProjectName()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          {/* Project Selection */}
          <Menu as="div" className="inline-block relative text-left">
            <div>
              <Menu.Button className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setSelectedProject('all')}
                        className={`${active ? 'text-gray-900 bg-gray-100' : 'text-gray-700'
                          } ${selectedProject === 'all' ? 'bg-blue-50 text-blue-900' : ''
                          } group flex items-center px-4 py-2 text-sm w-full text-left`}
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
                          className={`${active ? 'text-gray-900 bg-gray-100' : 'text-gray-700'
                            } ${selectedProject === project._id ? 'bg-blue-50 text-blue-900' : ''
                            } group flex items-center px-4 py-2 text-sm w-full text-left`}
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

          <button
            onClick={() => setShowTrackModal(true)}
            className="inline-flex items-center btn-primary"
          >
            <PlusIcon className="mr-2 w-5 h-5" />
            Track Usage
          </button>
          <div className="inline-block relative text-left">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center btn-outline"
            >
              <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 card">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search prompts, models, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center btn-outline"
          >
            <FunnelIcon className="mr-2 w-5 h-5" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="inline-flex justify-center items-center ml-2 w-5 h-5 text-xs font-medium text-white rounded-full bg-primary-600">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
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
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-purple-900">
                    💡 Cost Optimization Opportunities
                  </h3>
                  <p className="text-sm text-purple-700">
                    Scroll down to see AI-powered suggestions for reducing your costs
                  </p>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('cost-opportunities')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Failed to load usage data</p>
            <p className="text-sm text-gray-600 mt-2">
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

      {/* Track Usage Modal */}
      <TrackUsageModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        projectId={selectedProject}
      />
    </div>
  );
}