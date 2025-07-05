import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    CpuChipIcon,
    FunnelIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StatsCard } from '../components/dashboard/StatsCard';
import { CostChart } from '../components/dashboard/CostChart';
import { ServiceBreakdown } from '../components/dashboard/ServiceBreakdown';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DashboardService, DashboardData } from '../services/dashboard.service';
import { ProjectService } from '../services/project.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { ServiceAnalytics } from '../types/analytics.types';

interface Project {
    _id: string;
    name: string;
    description?: string;
    budget?: {
        amount: number;
        currency: string;
    };
}

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
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<string>('7d');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userToken, setUserToken] = useState<string>('');
    const { showNotification } = useNotification();

    useEffect(() => {
        let token = localStorage.getItem('userToken') || '';
        if (!token) {
            token = window.prompt('Please enter your API token:', '') || '';
            if (token) {
                localStorage.setItem('userToken', token);
            }
        }
        setUserToken(token);
    }, []);

    const fetchDashboardData = async (projectId?: string) => {
        try {
            setRefreshing(true);
            const filters: any = {};

            const now = new Date();
            const startDate = new Date();

            switch (timeRange) {
                case '24h':
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
            }

            filters.startDate = startDate.toISOString();
            filters.endDate = now.toISOString();

            if (projectId && projectId !== 'all') {
                filters.projectId = projectId;
            }

            // Use date range method if filters are provided
            const dashboardData = filters.startDate && filters.endDate
                ? await DashboardService.getDashboardDataByRange(filters.startDate, filters.endDate, projectId)
                : await DashboardService.getDashboardData(projectId);

            // Get recent activity separately
            const recentActivityData = await DashboardService.getRecentActivity(5);

            // Calculate service breakdown from recent activity if not provided properly
            const serviceBreakdownMap = new Map<string, { cost: number; requests: number; tokens: number }>();

            // Aggregate data from recent activity
            if (recentActivityData && recentActivityData.length > 0) {
                recentActivityData.forEach(activity => {
                    const service = activity.service || 'unknown';
                    const current = serviceBreakdownMap.get(service) || { cost: 0, requests: 0, tokens: 0 };
                    serviceBreakdownMap.set(service, {
                        cost: current.cost + (activity.cost || 0),
                        requests: current.requests + 1,
                        tokens: current.tokens + (activity.totalTokens || 0)
                    });
                });
            }

            // If we have incomplete service breakdown data, enhance it with calculated data
            const enhancedServiceBreakdown = dashboardData.serviceBreakdown.map(service => {
                const calculated = serviceBreakdownMap.get(service.service);
                return {
                    service: service.service,
                    cost: service.cost || calculated?.cost || 0,
                    requests: service.requests || calculated?.requests || 0,
                    percentage: service.percentage || 0,
                    tokens: calculated?.tokens || 0
                };
            });

            // If no service breakdown provided, create from aggregated data
            if (enhancedServiceBreakdown.length === 0 && serviceBreakdownMap.size > 0) {
                const totalCost = Array.from(serviceBreakdownMap.values()).reduce((sum, data) => sum + data.cost, 0);
                serviceBreakdownMap.forEach((data, service) => {
                    enhancedServiceBreakdown.push({
                        service,
                        cost: data.cost,
                        requests: data.requests,
                        percentage: totalCost > 0 ? (data.cost / totalCost) * 100 : 0,
                        tokens: data.tokens
                    });
                });
            }

            // Transform serviceBreakdown to match ServiceAnalytics interface
            const transformedServiceBreakdown: ServiceAnalytics[] = enhancedServiceBreakdown.map(service => ({
                service: service.service,
                totalCost: service.cost,
                totalTokens: service.tokens,
                totalCalls: service.requests,
                calls: service.requests,
                percentage: service.percentage,
                avgCost: service.cost / (service.requests || 1),
                avgTokens: service.tokens / (service.requests || 1),
                trend: 'stable' as const,
                percentageChange: 0
            }));

            // Calculate percentages for project breakdown
            let processedProjectBreakdown = dashboardData.projectBreakdown;
            if (processedProjectBreakdown && processedProjectBreakdown.length > 0) {
                const totalCost = processedProjectBreakdown.reduce((sum, project) => sum + project.cost, 0);
                processedProjectBreakdown = processedProjectBreakdown.map(project => ({
                    ...project,
                    percentage: totalCost > 0 ? (project.cost / totalCost) * 100 : 0
                }));
            }

            // Transform the data to match component expectations
            const transformedData: ExtendedDashboardData = {
                ...dashboardData,
                chartData: dashboardData.chartData.map(item => ({
                    ...item,
                    calls: item.requests // Add calls property for compatibility
                })),
                serviceBreakdown: dashboardData.serviceBreakdown, // Keep original for dashboard service
                recentActivity: recentActivityData.length > 0 ? recentActivityData : dashboardData.recentActivity,
                projectBreakdown: processedProjectBreakdown
            };

            // Store the transformed service breakdown separately for the ServiceBreakdown component
            (transformedData as any).transformedServiceBreakdown = transformedServiceBreakdown;

            setData(transformedData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
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
        fetchDashboardData(projectId);
    }, [selectedProject, timeRange]);

    const handleRefresh = () => {
        const projectId = selectedProject === 'all' ? undefined : selectedProject;
        fetchDashboardData(projectId);
    };

    const getSelectedProjectName = () => {
        if (selectedProject === 'all') return 'All Projects';
        const project = projects.find(p => p._id === selectedProject);
        return project?.name || 'Unknown Project';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with filters */}
            <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {getSelectedProjectName()} • Last {timeRange === '24h' ? '24 hours' : timeRange}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Project Filter */}
                    <div className="relative">
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="px-4 py-2 pr-8 text-sm bg-white rounded-lg border border-gray-300 appearance-none dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Projects</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <FunnelIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Time Range Filter */}
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 pr-8 text-sm bg-white rounded-lg border border-gray-300 appearance-none dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                        <ClockIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex gap-2 items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Cost"
                    value={data.stats.totalCost}
                    change={data.stats.costChange ? {
                        value: data.stats.costChange,
                        percentage: Math.abs(data.stats.costChange),
                        trend: data.stats.costChange > 0 ? 'up' : data.stats.costChange < 0 ? 'down' : 'stable'
                    } : undefined}
                    icon={CurrencyDollarIcon}
                    format="currency"
                />
                <StatsCard
                    title="Total Tokens"
                    value={data.stats.totalTokens}
                    change={data.stats.tokensChange ? {
                        value: data.stats.tokensChange,
                        percentage: Math.abs(data.stats.tokensChange),
                        trend: data.stats.tokensChange > 0 ? 'up' : data.stats.tokensChange < 0 ? 'down' : 'stable'
                    } : undefined}
                    icon={CpuChipIcon}
                />
                <StatsCard
                    title="API Requests"
                    value={data.stats.totalRequests}
                    change={data.stats.requestsChange ? {
                        value: data.stats.requestsChange,
                        percentage: Math.abs(data.stats.requestsChange),
                        trend: data.stats.requestsChange > 0 ? 'up' : data.stats.requestsChange < 0 ? 'down' : 'stable'
                    } : undefined}
                    icon={ChartBarIcon}
                />
                <StatsCard
                    title="Avg Cost/Request"
                    value={data.stats.averageCostPerRequest}
                    icon={CurrencyDollarIcon}
                    format="currency"
                />
            </div>

            {/* Project Breakdown (only show when viewing all projects) */}
            {selectedProject === 'all' && data.projectBreakdown && data.projectBreakdown.length > 0 && (
                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Project Breakdown
                    </h3>
                    <div className="space-y-4">
                        {data.projectBreakdown.map((project) => (
                            <div key={project.projectId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {project.projectName}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {project.requests} requests
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        ${project.cost.toFixed(2)}
                                    </p>
                                    {project.budgetUtilization && project.budgetUtilization > 0 && (
                                        <p className={`text-sm ${project.budgetUtilization > 80
                                            ? 'text-red-600 dark:text-red-400'
                                            : project.budgetUtilization > 60
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : 'text-green-600 dark:text-green-400'
                                            }`}>
                                            {project.budgetUtilization.toFixed(1)}% of budget
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts and Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CostChart data={data.chartData} />
                <ServiceBreakdown data={(data as any).transformedServiceBreakdown || []} />
            </div>

            <RecentActivity
                topPrompts={data.recentActivity?.map((activity: any) => ({
                    prompt: activity.prompt,
                    totalCost: typeof activity.cost === 'number' ? activity.cost : 0,
                    totalCalls: activity.totalTokens ? 1 : (activity.totalCalls || 1),
                    avgCost: typeof activity.cost === 'number' ? activity.cost : 0,
                    lastUsed: typeof activity.createdAt === 'string'
                        ? activity.createdAt
                        : (typeof activity.timestamp === 'string' ? activity.timestamp : ''),
                    services: [activity.service || activity.type || 'unknown'],
                    models: [activity.model].filter(Boolean)
                })) || []}
                optimizationOpportunities={0}
            />
        </div>
    );
};