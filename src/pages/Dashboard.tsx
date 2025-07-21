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
    Squares2X2Icon
} from '@heroicons/react/24/outline';
import { ChatInterface } from '../components/chat/ChatInterface';
import { StatsCard } from '../components/dashboard/StatsCard';
import { CostChart } from '../components/dashboard/CostChart';
import { ServiceBreakdown } from '../components/dashboard/ServiceBreakdown';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DashboardService, DashboardData } from '../services/dashboard.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { formatTimestamp, formatSafeDate } from '../utils/formatters';

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
    const [viewMode, setViewMode] = useState<'split' | 'chat' | 'dashboard'>('split');
    const [dashboardPanelCollapsed, setDashboardPanelCollapsed] = useState(false);
    
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
            <div className="h-[calc(100vh-2rem)] flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    // No data state
    if (!data) {
        return (
            <div className="h-[calc(100vh-2rem)] flex justify-center items-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    <button
                        onClick={() => fetchDashboardData(selectedProject === 'all' ? undefined : selectedProject)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            {/* Smart Header with View Controls */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                AI Cost Optimizer
                            </h1>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {getSelectedProjectName()}
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Magical View Mode Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('chat')}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                    viewMode === 'chat' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                                Chat
                            </button>
                            <button
                                onClick={() => setViewMode('split')}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                    viewMode === 'split' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Squares2X2Icon className="w-4 h-4 mr-1" />
                                Both
                            </button>
                            <button
                                onClick={() => setViewMode('dashboard')}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                    viewMode === 'dashboard' 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <ChartBarIcon className="w-4 h-4 mr-1" />
                                Dashboard
                            </button>
                        </div>

                        {/* Project Filter */}
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    {selectedProject === 'all' ? 'All Projects' : getSelectedProjectName()}
                                    <ChevronDownIcon className="-mr-1 ml-2 w-4 h-4" />
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
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                                    <div className="py-1">
                                        {projects.map((project) => (
                                            <Menu.Item key={project._id}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setSelectedProject(project._id)}
                                                        className={`${
                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                        } block w-full text-left px-4 py-2 text-sm`}
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
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="24h">24h</option>
                            <option value="7d">7d</option>
                            <option value="30d">30d</option>
                            <option value="90d">90d</option>
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchDashboardData(selectedProject === 'all' ? undefined : selectedProject)}
                            disabled={refreshing}
                            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg disabled:opacity-50 hover:bg-blue-700"
                        >
                            {refreshing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ArrowPathIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Magical Dual-View Content */}
            <div className="flex-1 min-h-0 flex">
                {/* Chat Interface Area */}
                <div className={`transition-all duration-300 ease-in-out ${
                    viewMode === 'dashboard' ? 'w-0 overflow-hidden' : 
                    viewMode === 'chat' ? 'w-full' :
                    'w-2/3'
                } flex flex-col`}>
                    <ChatInterface />
                </div>

                {/* Dashboard Panel */}
                {viewMode !== 'chat' && (
                    <div className={`transition-all duration-300 ease-in-out ${
                        viewMode === 'dashboard' ? 'w-full' : 'w-1/3'
                    } border-l border-gray-200 bg-gray-50 flex flex-col`}>
                        
                        {/* Dashboard Panel Header */}
                        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
                                    Dashboard Insights
                                </h2>
                                <button
                                    onClick={() => setDashboardPanelCollapsed(!dashboardPanelCollapsed)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    {dashboardPanelCollapsed ? (
                                        <ChevronRightIcon className="w-4 h-4" />
                                    ) : (
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        {!dashboardPanelCollapsed && (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center">
                                            <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-2" />
                                            <div>
                                                <p className="text-xs text-green-600 font-medium">Cost</p>
                                                <p className="text-sm font-bold text-green-900">${data.stats.totalCost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center">
                                            <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
                                            <div>
                                                <p className="text-xs text-blue-600 font-medium">Requests</p>
                                                <p className="text-sm font-bold text-blue-900">{data.stats.totalRequests.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center">
                                            <ClockIcon className="w-5 h-5 text-yellow-600 mr-2" />
                                            <div>
                                                <p className="text-xs text-yellow-600 font-medium">Avg Cost</p>
                                                <p className="text-sm font-bold text-yellow-900">${data.stats.averageCostPerRequest.toFixed(4)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center">
                                            <CpuChipIcon className="w-5 h-5 text-purple-600 mr-2" />
                                            <div>
                                                <p className="text-xs text-purple-600 font-medium">Services</p>
                                                <p className="text-sm font-bold text-purple-900">{data.serviceBreakdown?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts - Compact versions for split view */}
                                {viewMode === 'dashboard' ? (
                                    // Full dashboard view
                                    <div className="space-y-6">
                                                                                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                            <CostChart data={data.chartData} />
                                            <ServiceBreakdown data={(data as any).transformedServiceBreakdown || []} />
                                        </div>

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
                                ) : (
                                    // Compact split view
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Service Breakdown</h3>
                                            <ServiceBreakdown data={(data as any).transformedServiceBreakdown || []} />
                                        </div>

                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Cost Trend</h3>
                                            <CostChart data={data.chartData} />
                                        </div>

                                                                                {data.recentActivity && data.recentActivity.length > 0 ? (
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h3>
                                                <div className="space-y-2">
                                                    {data.recentActivity.slice(0, 5).map((activity: any, index) => {
                                                        // Try multiple timestamp fields
                                                        const timestamp = activity.timestamp || activity.createdAt || activity.updatedAt || activity.date || new Date();
                                                        
                                                        return (
                                                            <div key={activity.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-gray-900 truncate">
                                                                        {activity.description || activity.prompt || 'Recent activity'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatTimestamp(timestamp)}
                                                                    </p>
                                                                </div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    ${(activity.cost || 0).toFixed(4)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h3>
                                                <div className="text-center py-8 text-gray-500">
                                                    <p className="text-sm">No recent activity found</p>
                                                    <p className="text-xs mt-1">Start using AI models to see activity here</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};