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
    } catch {
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
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-4xl font-display font-bold gradient-text-primary">
                  {activeTab === 'usage' ? 'API Usage' : 'Sessions'}
                </h1>
                {activeTab === 'usage' && data?.usage && data.usage.some((item: any) => item.cost > 0.01 || item.totalTokens > 500) && (
                  <div className="px-3 py-1 ml-4 text-xs font-medium text-white bg-gradient-to-r from-warning-500 to-error-500 rounded-full animate-pulse shadow-lg">
                    💰 Savings
                  </div>
                )}
              </div>
              <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 origin-top-right focus:outline-none">
                    <div className="py-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedProject('all')}
                            className={`${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-light-text-primary dark:text-dark-text-primary'
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
                              className={`${active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-light-text-primary dark:text-dark-text-primary'
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

              {activeTab === 'usage' && (
                <>
                  <Link
                    to="/requests"
                    className="btn-secondary inline-flex items-center"
                  >
                    <ClockIcon className="mr-2 w-5 h-5" />
                    Request
                  </Link>
                  <button
                    onClick={() => setShowTrackModal(true)}
                    className="btn-primary inline-flex items-center"
                  >
                    <PlusIcon className="mr-2 w-5 h-5" />
                    Track Usage
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="btn-outline inline-flex items-center"
                  >
                    <ArrowDownTrayIcon className="mr-2 w-5 h-5" />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('usage')}
              className={`py-3 px-4 font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === 'usage'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                }`}
            >
              <div className="flex items-center">
                <CircleStackIcon className="mr-2 w-5 h-5" />
                Usage
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-3 px-4 font-display font-semibold text-sm transition-all duration-300 rounded-lg ${activeTab === 'sessions'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Cost */}
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20 mr-4">
                      <span className="text-lg font-display font-bold text-success-600 dark:text-success-400">$</span>
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Total Cost
                      </dt>
                      <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                        ${data.usage.reduce((sum: number, item: any) => sum + (item.cost || 0), 0).toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Total Tokens */}
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 mr-4">
                      <Hash className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Total Tokens
                      </dt>
                      <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                        {data.usage.reduce((sum: number, item: any) => sum + (item.totalTokens || 0), 0).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Token Breakdown */}
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 mr-4">
                      <CircleStackIcon className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Token Breakdown
                      </dt>
                      <dd className="text-sm text-light-text-primary dark:text-dark-text-primary">
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Input:</span>
                            <span className="font-semibold">{data.usage.reduce((sum: number, item: any) => sum + ((item as any).promptTokens || 0), 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Output:</span>
                            <span className="font-semibold">{data.usage.reduce((sum: number, item: any) => sum + ((item as any).completionTokens || 0), 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Average Response Time */}
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 mr-4">
                      <ClockIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Avg Response
                      </dt>
                      <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
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
            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
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
                  className="inline-flex items-center btn-outline"
                >
                  <FunnelIcon className="mr-2 w-5 h-5" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <span className="inline-flex justify-center items-center ml-2 w-5 h-5 text-xs font-medium text-white rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="pt-6 mt-6 border-t border-accent-200/30">
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
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex flex-shrink-0 justify-center items-center w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-display font-bold gradient-text-primary">
                          💡 Cost Optimization Opportunities
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
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
        )}

        {/* Sessions Tab Content */}
        {activeTab === 'sessions' && (
          <>
            {/* Sessions Summary Cards */}
            {sessionsSummary && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 mr-4">
                      <Hash className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Total Sessions
                      </dt>
                      <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                        {sessionsSummary.totalSessions}
                      </dd>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 mr-4">
                      <Activity className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Active
                      </dt>
                      <dd className="text-2xl font-display font-bold text-secondary-600 dark:text-secondary-400">
                        {sessionsSummary.activeSessions}
                      </dd>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-success-500/20 to-success-600/20 mr-4">
                      <DollarSign className="h-6 w-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Total Cost
                      </dt>
                      <dd className="text-2xl font-display font-bold text-success-600 dark:text-success-400">
                        ${sessionsSummary.totalCost.toFixed(4)}
                      </dd>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 mr-4">
                      <ClockIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Avg Duration
                      </dt>
                      <dd className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                        {formatDuration(sessionsSummary.averageDuration)}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Filters */}
            <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="relative">
                  <Search className="absolute top-3 left-3 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by label..."
                    className="input pl-10"
                    value={sessionsFilters.label}
                    onChange={(e) => setSessionsFilters(prev => ({ ...prev, label: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleSessionsSearch()}
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute top-3 left-3 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="datetime-local"
                    className="input pl-10"
                    value={sessionsFilters.from}
                    onChange={(e) => setSessionsFilters(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute top-3 left-3 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                  <input
                    type="datetime-local"
                    className="input pl-10"
                    value={sessionsFilters.to}
                    onChange={(e) => setSessionsFilters(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>

                <button
                  onClick={handleSessionsSearch}
                  className="btn-primary"
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
              <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300 overflow-hidden">
                {sessions.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                      <ChartPieIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      No Sessions Found
                    </h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">No sessions found for the selected filters.</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="glass rounded-lg border border-accent-200/20 bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Session ID
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Label
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Started
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Spans
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Cost
                          </th>
                          <th className="px-6 py-3 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="glass bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-y divide-accent-200/20">
                        {sessions.map(session => (
                          <tr key={session._id} className="hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-secondary-500/5 transition-all duration-300">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusIcon(session.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                {session.sessionId.substring(0, 8)}...
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {session.label && (
                                <span className="inline-flex gap-1 items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-accent-500/20 to-warning-500/20 text-accent-600 dark:text-accent-400 rounded-full border border-accent-200/30">
                                  <Tag className="w-3 h-3" />
                                  {session.label}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
                              {formatDate(session.startedAt)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-secondary-500/20 to-accent-500/20 text-secondary-600 dark:text-secondary-400">
                                {formatDuration(session.summary?.totalDuration)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-light-text-primary dark:text-dark-text-primary whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-600 dark:text-primary-400">
                                {session.summary?.totalSpans || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                              {session.summary?.totalCost ? (
                                <span className="text-success-600 dark:text-success-400">
                                  ${session.summary.totalCost.toFixed(4)}
                                </span>
                              ) : (
                                <span className="text-light-text-secondary dark:text-dark-text-secondary">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                to={`/sessions/${session.sessionId}`}
                                className="btn-outline text-sm"
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
                      <div className="flex justify-between items-center px-6 py-4 border-t border-accent-200/30 bg-gradient-to-r from-light-bg-200/50 to-light-bg-300/50 dark:from-dark-bg-200/50 dark:to-dark-bg-300/50">
                        <button
                          onClick={() => handleSessionsPageChange(sessionsFilters.page - 1)}
                          disabled={sessionsFilters.page === 1}
                          className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                          Page {sessionsFilters.page} of {sessionsTotalPages}
                        </span>
                        <button
                          onClick={() => handleSessionsPageChange(sessionsFilters.page + 1)}
                          disabled={sessionsFilters.page === sessionsTotalPages}
                          className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}