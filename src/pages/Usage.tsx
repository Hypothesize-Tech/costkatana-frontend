import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon, ArrowDownTrayIcon, ChevronDownIcon, SparklesIcon, ClockIcon, ChartPieIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { sessionsService, Session, SessionsSummary } from '@/services/sessions.service';
import { UsageList } from '@/components/usage/UsageList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePagination, useDebounce } from '@/hooks';
import { UsageFilters as IUsageFilters } from '@/types';
import toast from 'react-hot-toast';
import { UsageFilter } from '@/components/usage/UsageFilter';
import { TrackUsageModal } from '@/components/usage/TrackUsageModal';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Search, Calendar, Tag, AlertCircle, Activity, CheckCircle, DollarSign, Hash } from 'lucide-react';

export default function Usage() {
  const [activeTab, setActiveTab] = useState<'usage' | 'sessions'>('usage');
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<IUsageFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedProject, setSelectedProject, projects, getSelectedProjectName } = useProject();
  const { user } = useAuth();

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsSummary, setSessionsSummary] = useState<SessionsSummary | null>(null);
  const [sessionsFilters, setSessionsFilters] = useState({
    label: '',
    from: '',
    to: '',
    page: 1,
    limit: 20
  });
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);

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

  // Sessions query
  const { data: sessionsData, isLoading: sessionsDataLoading, error: sessionsDataError, refetch: refetchSessions } = useQuery({
    queryKey: ['sessions', sessionsFilters, selectedProject],
    queryFn: () => sessionsService.listSessions({
      userId: user?.id || undefined,
      label: sessionsFilters.label || undefined,
      from: sessionsFilters.from || undefined,
      to: sessionsFilters.to || undefined,
      page: sessionsFilters.page,
      limit: sessionsFilters.limit
    }),
    enabled: activeTab === 'sessions',
    keepPreviousData: true,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });

  // Sessions summary query
  const { data: sessionsSummaryData } = useQuery({
    queryKey: ['sessions-summary', user?.id, selectedProject],
    queryFn: () => sessionsService.getSessionsSummary(user?.id),
    enabled: activeTab === 'sessions',
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
  });

  // Update sessions data when query returns
  useMemo(() => {
    if (sessionsData) {
      setSessions(sessionsData.sessions);
      setSessionsTotalPages(sessionsData.totalPages);
    }
  }, [sessionsData]);

  // Update sessions summary when query returns
  useMemo(() => {
    if (sessionsSummaryData) {
      setSessionsSummary(sessionsSummaryData);
    }
  }, [sessionsSummaryData]);

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
    if (activeTab === 'usage') {
      refetch();
    } else {
      refetchSessions();
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Sessions helper functions
  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleSessionsSearch = () => {
    setSessionsFilters(prev => ({ ...prev, page: 1 }));
    refetchSessions();
  };

  const handleSessionsPageChange = (page: number) => {
    setSessionsFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'usage' ? 'API Usage' : 'Sessions'}
            </h1>
            {activeTab === 'usage' && data?.usage && data.usage.some((item: any) => item.cost > 0.01 || item.totalTokens > 500) && (
              <div className="px-2 py-1 ml-3 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse">
                💰 Savings
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {activeTab === 'usage'
              ? `Track and manage your AI API usage across all providers${selectedProject !== 'all' ? ` • ${getSelectedProjectName()}` : ''}`
              : `Trace and visualize agent flows${selectedProject !== 'all' ? ` • ${getSelectedProjectName()}` : ''}`
            }
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

          {activeTab === 'usage' && (
            <>
              <Link
                to="/requests"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md border border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <ClockIcon className="mr-2 w-5 h-5" />
                Request
              </Link>
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
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'usage'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center">
              <CircleStackIcon className="mr-2 w-5 h-5" />
              Usage
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sessions'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center">
              <ChartPieIcon className="mr-2 w-5 h-5" />
              Sessions
            </div>
          </button>
        </nav>
      </div>

      {/* Usage Tab Content */}
      {activeTab === 'usage' && (
        <>
          {/* Stats Cards */}
          {data?.usage && data.usage.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Cost */}
              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-md dark:bg-green-900">
                        <span className="text-sm font-semibold text-green-600">$</span>
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Cost
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          ${data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0).toFixed(2)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Tokens */}
              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-md dark:bg-blue-900">
                        <span className="text-sm font-semibold text-blue-600">T</span>
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Tokens
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {data.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0).toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Breakdown */}
              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-purple-100 rounded-md dark:bg-purple-900">
                        <span className="text-sm font-semibold text-purple-600">I/O</span>
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Token Breakdown
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Input:</span>
                              <span>{data.usage.reduce((sum: number, item: any) => sum + ((item as any).promptTokens || 0), 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Output:</span>
                              <span>{data.usage.reduce((sum: number, item: any) => sum + ((item as any).completionTokens || 0), 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Average Response Time */}
              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-orange-100 rounded-md dark:bg-orange-900">
                        <span className="text-sm font-semibold text-orange-600">⏱</span>
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Avg Response
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {(() => {
                            const avgTime = data.usage.reduce((sum: number, item: any) => sum + (item.responseTime || 0), 0) / data.usage.length;
                            return avgTime > 1000 ? `${(avgTime / 1000).toFixed(1)}s` : `${Math.round(avgTime)}ms`;
                          })()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                      <SparklesIcon className="w-6 h-6 text-white" />
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
                    className="px-4 py-2 text-white bg-purple-600 rounded-md transition-colors hover:bg-purple-700"
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
      )}

      {/* Sessions Tab Content */}
      {activeTab === 'sessions' && (
        <>
          {/* Sessions Summary Cards */}
          {sessionsSummary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-md dark:bg-blue-900">
                        <Hash className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Sessions
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {sessionsSummary.totalSessions}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-blue-100 rounded-md dark:bg-blue-900">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Active
                        </dt>
                        <dd className="text-lg font-medium text-blue-600 dark:text-blue-400">
                          {sessionsSummary.activeSessions}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-md dark:bg-green-900">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Total Cost
                        </dt>
                        <dd className="text-lg font-medium text-green-600 dark:text-green-400">
                          ${sessionsSummary.totalCost.toFixed(4)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-8 h-8 bg-purple-100 rounded-md dark:bg-purple-900">
                        <Activity className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 ml-5 w-0">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                          Avg Duration
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatDuration(sessionsSummary.averageDuration)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Filters */}
          <div className="p-4 card">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="relative">
                <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by label..."
                  className="py-2 pr-3 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={sessionsFilters.label}
                  onChange={(e) => setSessionsFilters(prev => ({ ...prev, label: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSessionsSearch()}
                />
              </div>

              <div className="relative">
                <Calendar className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  className="py-2 pr-3 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={sessionsFilters.from}
                  onChange={(e) => setSessionsFilters(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>

              <div className="relative">
                <Calendar className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  className="py-2 pr-3 pl-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={sessionsFilters.to}
                  onChange={(e) => setSessionsFilters(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>

              <button
                onClick={handleSessionsSearch}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>

          {/* Sessions List */}
          {sessionsDataLoading ? (
            <LoadingSpinner />
          ) : sessionsDataError ? (
            <div className="p-6 text-center">
              <div className="mb-4 text-red-600">
                <p className="text-lg font-semibold">Failed to load sessions data</p>
                <p className="mt-2 text-sm text-gray-600">
                  {sessionsDataError instanceof Error ? sessionsDataError.message : 'An error occurred while loading sessions data'}
                </p>
              </div>
              <button
                onClick={() => refetchSessions()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
              {sessions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No sessions found</p>
                </div>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Session ID
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Label
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Started
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Spans
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sessions.map(session => (
                        <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusIcon(session.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                              {session.sessionId.substring(0, 8)}...
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {session.label && (
                              <span className="inline-flex gap-1 items-center px-2 py-1 text-xs bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                                <Tag className="w-3 h-3" />
                                {session.label}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                            {formatDate(session.startedAt)}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {formatDuration(session.summary?.totalDuration)}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {session.summary?.totalSpans || 0}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {session.summary?.totalCost ? (
                              <span className="text-green-600 dark:text-green-400">
                                ${session.summary.totalCost.toFixed(4)}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/sessions/${session.sessionId}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {sessionsTotalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-3 border-t dark:border-gray-600">
                      <button
                        onClick={() => handleSessionsPageChange(sessionsFilters.page - 1)}
                        disabled={sessionsFilters.page === 1}
                        className="px-3 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {sessionsFilters.page} of {sessionsTotalPages}
                      </span>
                      <button
                        onClick={() => handleSessionsPageChange(sessionsFilters.page + 1)}
                        disabled={sessionsFilters.page === sessionsTotalPages}
                        className="px-3 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
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