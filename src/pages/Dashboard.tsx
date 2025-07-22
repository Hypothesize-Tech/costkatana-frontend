import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    CpuChipIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    ChatBubbleLeftRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Squares2X2Icon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { ConversationalAgent } from '../components/chat/ConversationalAgent';
import { StatsCard } from '../components/dashboard/StatsCard';
import { CostChart } from '../components/dashboard/CostChart';
import { ServiceBreakdown } from '../components/dashboard/ServiceBreakdown';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DashboardService, DashboardData } from '../services/dashboard.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimestamp, formatSafeDate } from '../utils/formatters';
import logo from '../assets/logo.png';
import { useProject } from '@/contexts/ProjectContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Extended DashboardData interface to include projectBreakdown
interface ExtendedDashboardData extends DashboardData {
    projectBreakdown?: Array<{
        projectId: string;
        projectName: string;
        cost: number;
        requests: number;
        percentage: number;
        budgetUtilization?: number;
    }>;
}

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<ExtendedDashboardData | null>(null);
    const [timeRange, setTimeRange] = useState<string>('7d');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // View mode states
    const [viewMode, setViewMode] = useState<'split' | 'chat' | 'dashboard'>('chat');
    const [dashboardPanelCollapsed, setDashboardPanelCollapsed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { showNotification } = useNotification();
    const { selectedProject, setSelectedProject, projects, getSelectedProjectName } = useProject();

    const fetchDashboardData = async (projectId?: string) => {
        try {
            setRefreshing(true);

            // Get dashboard data
            const dashboardData = await DashboardService.getDashboardData(projectId);

            // Get recent activity separately for better data
            const recentActivityData = await DashboardService.getRecentActivity(5);

            // Process recent activity data
            if (recentActivityData.length > 0) {
                // Data available, use it as is
            } else {
                // No recent activity data available
            }

            // Enhanced data processing
            const enhanced = {
                ...dashboardData,
                recentActivity: recentActivityData.length > 0 ? recentActivityData : dashboardData.recentActivity || [],
                transformedServiceBreakdown: dashboardData.serviceBreakdown?.map((service: any) => ({
                    service: service.service || 'Unknown',
                    totalCost: service.cost || 0,
                    totalTokens: service.tokens || 0,
                    totalCalls: service.requests || 0,
                    calls: service.requests || 0,
                    percentage: service.percentage || 0,
                    avgCost: (service.cost || 0) / (service.requests || 1),
                    avgTokens: (service.tokens || 0) / (service.requests || 1),
                    trend: 'stable' as const,
                    percentageChange: 0
                })) || []
            };

            // Add project breakdown if multiple projects exist
            if (projects.length > 1 && selectedProject === 'all') {
                const projectBreakdown = await Promise.all(
                    projects.map(async (project) => {
                        const projectData = await DashboardService.getDashboardData(project._id);
                        return {
                            projectId: project._id,
                            projectName: project.name,
                            cost: projectData.stats.totalCost || 0,
                            requests: projectData.stats.totalRequests || 0,
                            percentage: ((projectData.stats.totalCost || 0) / (dashboardData.stats.totalCost || 1)) * 100,
                            budgetUtilization: (project as any).budget ?
                                ((projectData.stats.totalCost || 0) / (project as any).budget) * 100 : undefined
                        };
                    })
                );
                enhanced.projectBreakdown = projectBreakdown;
            }

            setData(enhanced as ExtendedDashboardData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(selectedProject === 'all' ? undefined : selectedProject);
    }, [selectedProject, timeRange]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchDashboardData(selectedProject === 'all' ? undefined : selectedProject);
            setLoading(false);
        };

        loadInitialData();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // No data state
    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex justify-center items-center">
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChartBarIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Data Available</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Unable to load dashboard data at this time.</p>
                    <button
                        onClick={() => fetchDashboardData(selectedProject === 'all' ? undefined : selectedProject)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <ArrowPathIcon className="w-5 h-5 mr-2" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ">
            {/* Professional Header */}
            <header className=" dark:bg-slate-900/80 backdrop-blur-xl  sticky top-0 z-20">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Brand & Project Info */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                                    <img src={logo} alt="logo" className="w-14 h-14" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                        Cost Katana
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {getSelectedProjectName()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-4">
                            {/* View Mode Toggle */}
                            <div className="hidden md:flex items-center bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
                                <button
                                    onClick={() => setViewMode('chat')}
                                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${viewMode === 'chat'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                                    Chat
                                </button>
                                <button
                                    onClick={() => setViewMode('split')}
                                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${viewMode === 'split'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <Squares2X2Icon className="w-4 h-4 mr-2" />
                                    Split
                                </button>
                                <button
                                    onClick={() => setViewMode('dashboard')}
                                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${viewMode === 'dashboard'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Analytics
                                </button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Bars3Icon className="w-6 h-6" />
                            </button>

                            {/* Project Filter */}
                            <Menu as="div" className="relative">
                                <Menu.Button className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md">
                                    {selectedProject === 'all' ? 'All Projects' : getSelectedProjectName()}
                                    <ChevronDownIcon className="ml-2 w-4 h-4" />
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                                        <div className="py-2">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setSelectedProject('all')}
                                                        className={`${active ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                                                            } ${selectedProject === 'all' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'} 
                                                        block w-full text-left px-4 py-3 text-sm transition-colors`}
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
                                                            className={`${active ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                                                                } ${selectedProject === project._id ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'} 
                                                            block w-full text-left px-4 py-3 text-sm transition-colors`}
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

                            {/* Time Range Filter */}
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2.5 text-sm font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 dark:text-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                            </select>

                            {/* Refresh Button */}
                            <button
                                onClick={() => fetchDashboardData(selectedProject === 'all' ? undefined : selectedProject)}
                                disabled={refreshing}
                                className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                            >
                                {refreshing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ArrowPathIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <Transition show={sidebarOpen} as={Fragment}>
                <div className="fixed inset-0 z-50 md:hidden">
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    </Transition.Child>

                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <div className="relative flex w-full flex-col bg-white dark:bg-slate-900 shadow-xl">
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Menu</h2>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { setViewMode('chat'); setSidebarOpen(false); }}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${viewMode === 'chat'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-3" />
                                        Chat Interface
                                    </button>
                                    <button
                                        onClick={() => { setViewMode('split'); setSidebarOpen(false); }}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${viewMode === 'split'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Squares2X2Icon className="w-5 h-5 mr-3" />
                                        Split View
                                    </button>
                                    <button
                                        onClick={() => { setViewMode('dashboard'); setSidebarOpen(false); }}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${viewMode === 'dashboard'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <ChartBarIcon className="w-5 h-5 mr-3" />
                                        Analytics Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Transition>

            {/* Main Content */}
            <main className="flex-1 min-h-0 flex">
                {/* Chat Interface Area */}
                <div className={`transition-all duration-500 ease-in-out ${viewMode === 'dashboard' ? 'w-0 overflow-hidden' :
                    viewMode === 'chat' ? 'w-full' :
                        'w-2/3'
                    } flex flex-col`}>
                    <div className="h-[calc(100vh-5rem)] p-6">
                        <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                            <ConversationalAgent />
                        </div>
                    </div>
                </div>

                {/* Dashboard Panel */}
                {viewMode !== 'chat' && (
                    <div className={`transition-all duration-500 ease-in-out ${viewMode === 'dashboard' ? 'w-full' : 'w-1/3'
                        } flex flex-col`}>

                        {/* Dashboard Content */}
                        <div className="h-[calc(100vh-5rem)] p-6 pl-0">
                            <div className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col">

                                {/* Dashboard Header */}
                                <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200/50 dark:border-slate-700/50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                                <ChartBarIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                Analytics Dashboard
                                            </h2>
                                        </div>
                                        {viewMode === 'split' && (
                                            <button
                                                onClick={() => setDashboardPanelCollapsed(!dashboardPanelCollapsed)}
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all"
                                            >
                                                {dashboardPanelCollapsed ? (
                                                    <ChevronRightIcon className="w-5 h-5" />
                                                ) : (
                                                    <ChevronLeftIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                {!dashboardPanelCollapsed && (
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {/* Quick Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Total Cost</p>
                                                        <p className="text-lg font-bold text-green-900 dark:text-green-100">${data.stats.totalCost.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                                        <ChartBarIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Requests</p>
                                                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{data.stats.totalRequests.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3">
                                                        <ClockIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Avg Cost</p>
                                                        <p className="text-lg font-bold text-amber-900 dark:text-amber-100">${data.stats.averageCostPerRequest.toFixed(4)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3">
                                                        <CpuChipIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Services</p>
                                                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{data.serviceBreakdown?.length || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Charts and Analytics */}
                                        {viewMode === 'dashboard' ? (
                                            // Full dashboard view
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                                    <StatsCard
                                                        title="Total Cost"
                                                        value={data.stats.totalCost}
                                                        icon={CurrencyDollarIcon}
                                                        format="currency"
                                                        change={data.stats.costChange ? {
                                                            value: data.stats.costChange,
                                                            percentage: Math.abs(data.stats.costChange),
                                                            trend: data.stats.costChange > 0 ? 'up' : 'down'
                                                        } : undefined}
                                                    />
                                                    <StatsCard
                                                        title="Total Requests"
                                                        value={data.stats.totalRequests}
                                                        icon={ChartBarIcon}
                                                    />
                                                    <StatsCard
                                                        title="Avg Cost/Request"
                                                        value={data.stats.averageCostPerRequest}
                                                        icon={CurrencyDollarIcon}
                                                        format="currency"
                                                    />
                                                    <StatsCard
                                                        title="Active Services"
                                                        value={data.serviceBreakdown?.length || 0}
                                                        icon={CpuChipIcon}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                                        <CostChart data={data.chartData} />
                                                    </div>
                                                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                                        <ServiceBreakdown data={(data as any).transformedServiceBreakdown || []} />
                                                    </div>
                                                </div>

                                                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                                                    <RecentActivity
                                                        topPrompts={data.recentActivity?.map((activity: any) => ({
                                                            prompt: activity.prompt || activity.description,
                                                            totalCost: typeof activity.cost === 'number' ? activity.cost : 0,
                                                            totalCalls: 1,
                                                            avgCost: typeof activity.cost === 'number' ? activity.cost : 0,
                                                            lastUsed: formatSafeDate(activity.timestamp),
                                                            services: [activity.service || activity.type || 'unknown'],
                                                            models: []
                                                        })) || []}
                                                        optimizationOpportunities={0}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            // Compact split view
                                            <div className="space-y-6">
                                                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                                        <CpuChipIcon className="w-4 h-4 mr-2 text-blue-600" />
                                                        Service Breakdown
                                                    </h3>
                                                    <ServiceBreakdown data={(data as any).transformedServiceBreakdown || []} />
                                                </div>

                                                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                                        <ChartBarIcon className="w-4 h-4 mr-2 text-blue-600" />
                                                        Cost Trend
                                                    </h3>
                                                    <CostChart data={data.chartData} />
                                                </div>

                                                {data.recentActivity && data.recentActivity.length > 0 ? (
                                                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50">
                                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                                                            <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
                                                            Recent Activity
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {data.recentActivity.slice(0, 5).map((activity: any, index) => {
                                                                const timestamp = activity.timestamp || activity.createdAt || activity.updatedAt || activity.date || new Date();

                                                                return (
                                                                    <div key={activity.id || index} className="flex justify-between items-center py-3 px-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200/30 dark:border-slate-600/30">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                                                {activity.description || activity.prompt || 'Recent activity'}
                                                                            </p>
                                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                                {formatTimestamp(timestamp)}
                                                                            </p>
                                                                        </div>
                                                                        <div className="ml-4 text-right">
                                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                                ${(activity.cost || 0).toFixed(4)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200/50 dark:border-slate-700/50">
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <ClockIcon className="w-6 h-6 text-slate-400" />
                                                            </div>
                                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">No Recent Activity</h3>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">Start using AI models to see activity here</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};