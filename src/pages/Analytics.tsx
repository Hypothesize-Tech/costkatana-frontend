// src/pages/Analytics.tsx
import React, { useState, useEffect } from 'react';
import {
    CalendarIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { analyticsService, AnalyticsService } from '../services/analytics.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { CostTrendChart } from '../components/analytics/CostTrendChart';
import { ServiceAnalytics } from '../components/analytics/ServiceAnalytics';
import { ModelComparison } from '../components/analytics/ModelComparison';

import { formatCurrency } from '../utils/formatters';
import { ProjectService } from '../services/project.service';
import { useNotification } from '../contexts/NotificationContext';

interface Project {
    _id: string;
    name: string;
    description?: string;
    budget?: {
        amount: number;
        currency: string;
    };
}

interface AnalyticsData {
    summary: {
        totalCost: number;
        totalTokens: number;
        totalRequests: number;
        averageCostPerRequest: number;
        budgetUtilization?: number;
    };
    trends: {
        costTrend: string;
        tokenTrend: string;
        insights: string[];
    };
    breakdown: {
        services: Array<{
            service: string;
            cost: number;
            percentage: number;
            requests: number;
            calls: number;
        }>;
        models: Array<{
            model: string;
            cost: number;
            percentage: number;
            requests: number;
            calls: number;
            avgTokens: number;
            avgCost: number;
        }>;
        projects?: Array<{
            projectId: string;
            projectName: string;
            cost: number;
            requests: number;
            budgetUtilization: number;
        }>;
    };
    timeline: Array<{
        date: string;
        cost: number;
        tokens: number;
        requests: number;
        calls: number;
    }>;
    project?: {
        id: string;
        name: string;
        budget: any;
    };
}

interface ProjectComparison {
    projects: Array<{
        projectId: string;
        projectName: string;
        metrics: {
            cost: number;
            tokens: number;
            requests: number;
            averageCostPerRequest: number;
        };
        budget: any;
        budgetUtilization: number;
    }>;
    summary?: {
        totalProjects: number;
        totalCost: number;
        totalTokens: number;
        totalRequests: number;
    };
}

export const Analytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, _setSelectedProject] = useState<string>('all');
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [comparison, setComparison] = useState<ProjectComparison | null>(null);
    const [timeRange, setTimeRange] = useState<string>('30d');
    const [groupBy, _setGroupBy] = useState<string>('date');
    const [loading, setLoading] = useState(true);
    const [_refreshing, setRefreshing] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const { showNotification } = useNotification();

    const fetchAnalyticsData = async (projectId?: string) => {
        try {
            setRefreshing(true);
            const filters: any = { groupBy };

            // Add date range filter
            const now = new Date();
            const startDate = new Date();

            switch (timeRange) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(now.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filters.startDate = startDate.toISOString();
            filters.endDate = now.toISOString();

            if (projectId && projectId !== 'all') {
                filters.projectId = projectId;
                const analyticsData = await AnalyticsService.getProjectAnalytics(projectId, filters);
                console.log("analyticsData", analyticsData)

                // Transform the data to match AnalyticsData interface
                const transformedData = {
                    summary: {
                        totalCost: analyticsData.summary?.totalCost || 0,
                        totalTokens: analyticsData.summary?.totalTokens || 0,
                        totalRequests: analyticsData.summary?.totalRequests || analyticsData.summary?.totalCalls || 0,
                        averageCostPerRequest: analyticsData.summary?.averageCostPerRequest ||
                            (analyticsData.summary?.totalCost || 0) / (analyticsData.summary?.totalRequests || analyticsData.summary?.totalCalls || 1),
                        budgetUtilization: analyticsData.summary?.budgetUtilization
                    },
                    timeline: (analyticsData.timeline || analyticsData.timeSeries || []).map((item: any) => ({
                        date: item.date,
                        cost: item.cost || 0,
                        tokens: item.tokens || 0,
                        requests: item.calls || item.requests || 0,
                        calls: item.calls || item.requests || 0
                    })),
                    breakdown: {
                        services: (analyticsData.breakdown?.services || analyticsData.serviceBreakdown || []).map((service: any) => ({
                            service: service.service,
                            cost: service.cost || service.totalCost || 0,
                            percentage: service.percentage || 0,
                            requests: service.requests || service.totalRequests || service.calls || service.totalCalls || 0,
                            calls: service.calls || service.totalCalls || service.requests || service.totalRequests || 0
                        })),
                        models: (analyticsData.breakdown?.models || analyticsData.modelBreakdown || []).map((model: any) => ({
                            model: model.model,
                            cost: model.cost || model.totalCost || 0,
                            percentage: model.percentage || 0,
                            requests: model.requests || model.totalRequests || model.calls || model.totalCalls || 0,
                            calls: model.calls || model.totalCalls || model.requests || model.totalRequests || 0,
                            avgTokens: model.avgTokens || (model.totalTokens || 0) / (model.totalRequests || model.calls || 1),
                            avgCost: model.avgCost || (model.cost || model.totalCost || 0) / (model.totalRequests || model.calls || 1)
                        }))
                    },
                    trends: analyticsData.trends || { costTrend: 'stable', tokenTrend: 'stable', insights: [] }
                };

                setData(transformedData);
            } else {
                const analyticsData = await analyticsService.getAnalytics(filters);

                // Transform the data to match AnalyticsData interface
                const transformedData = {
                    summary: {
                        totalCost: analyticsData.summary?.totalCost || 0,
                        totalTokens: analyticsData.summary?.totalTokens || 0,
                        totalRequests: analyticsData.summary?.totalRequests || analyticsData.summary?.totalCalls || 0,
                        averageCostPerRequest: (analyticsData.summary?.totalCost || 0) / (analyticsData.summary?.totalRequests || analyticsData.summary?.totalCalls || 1),
                        budgetUtilization: 0
                    },
                    timeline: (analyticsData.timeline || analyticsData.timeSeries || []).map((item: any) => ({
                        date: item.date,
                        cost: item.cost || 0,
                        tokens: item.tokens || 0,
                        requests: item.calls || item.requests || 0,
                        calls: item.calls || item.requests || 0
                    })),
                    breakdown: {
                        services: (analyticsData.breakdown?.services || analyticsData.serviceBreakdown || []).map((service: any) => ({
                            service: service.service,
                            cost: service.cost || service.totalCost || 0,
                            percentage: service.percentage || 0,
                            requests: service.requests || service.totalRequests || service.calls || service.totalCalls || 0,
                            calls: service.calls || service.totalCalls || service.requests || service.totalRequests || 0
                        })),
                        models: (analyticsData.breakdown?.models || analyticsData.modelBreakdown || []).map((model: any) => ({
                            model: model.model,
                            cost: model.cost || model.totalCost || 0,
                            percentage: model.percentage || 0,
                            requests: model.requests || model.totalRequests || model.calls || model.totalCalls || 0,
                            calls: model.calls || model.totalCalls || model.requests || model.totalRequests || 0,
                            avgTokens: model.avgTokens || (model.totalTokens || 0) / (model.totalRequests || model.calls || 1),
                            avgCost: model.avgCost || (model.cost || model.totalCost || 0) / (model.totalRequests || model.calls || 1)
                        }))
                    },
                    trends: analyticsData.trends || { costTrend: 'stable', tokenTrend: 'stable', insights: [] }
                };

                setData(transformedData);
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            showNotification('Failed to load analytics data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchProjectComparison = async () => {
        if (selectedProjects.length < 2) return;

        try {
            const filters: any = {};

            // Add date range filter
            const now = new Date();
            const startDate = new Date();

            switch (timeRange) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(now.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filters.startDate = startDate.toISOString();
            filters.endDate = now.toISOString();
            filters.projectIds = selectedProjects;
            filters.metric = 'cost';

            const comparisonData = await AnalyticsService.compareProjects(filters);

            // Defensive: ensure summary exists and is valid
            let summary = comparisonData.summary;
            if (!summary) {
                // Compute summary from projects array if missing
                const projectsArr = Array.isArray(comparisonData.projects) ? comparisonData.projects : [];
                summary = {
                    totalProjects: projectsArr.length,
                    totalCost: projectsArr.reduce((acc: number, p: any) => acc + (p.metrics?.cost || 0), 0),
                    totalTokens: projectsArr.reduce((acc: number, p: any) => acc + (p.metrics?.tokens || 0), 0),
                    totalRequests: projectsArr.reduce((acc: number, p: any) => acc + (p.metrics?.requests || 0), 0),
                };
            }
            setComparison({ ...comparisonData, summary });
        } catch (error) {
            console.error('Error fetching project comparison:', error);
            showNotification('Failed to load project comparison', 'error');
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
        fetchAnalyticsData(projectId);
    }, [selectedProject, timeRange, groupBy]);

    useEffect(() => {
        if (showComparison && selectedProjects.length >= 2) {
            fetchProjectComparison();
        }
    }, [selectedProjects, timeRange, showComparison]);

    const handleRefresh = () => {
        const projectId = selectedProject === 'all' ? undefined : selectedProject;
        fetchAnalyticsData(projectId);
        if (showComparison && selectedProjects.length >= 2) {
            fetchProjectComparison();
        }
    };

    const handleProjectSelectionToggle = (projectId: string) => {
        setSelectedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-4 text-3xl font-bold text-gray-900">Analytics</h1>
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-3 py-2 rounded-md border border-gray-300"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowComparison(!showComparison)}
                                className={`px-4 py-2 rounded-md ${showComparison
                                    ? 'text-white bg-indigo-600'
                                    : 'text-gray-700 bg-white border border-gray-300'
                                    }`}
                            >
                                Compare Periods
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Project Selection (Comparison Mode) */}
                {showComparison && (
                    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Select Projects to Compare
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <label key={project._id} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedProjects.includes(project._id)}
                                        onChange={() => handleProjectSelectionToggle(project._id)}
                                        className="text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {project.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedProjects.length < 2 && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Select at least 2 projects to compare
                            </p>
                        )}
                    </div>
                )}

                {/* Analytics Content */}
                {!showComparison ? (
                    // Single Project/All Projects View
                    data && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(data.summary.totalCost)}
                                            </p>
                                        </div>
                                        <CurrencyDollarIcon className="w-12 h-12 text-indigo-600 opacity-20" />
                                    </div>
                                </div>

                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {data.summary.totalTokens.toLocaleString()}
                                            </p>
                                        </div>
                                        <ChartBarIcon className="w-12 h-12 text-green-600 opacity-20" />
                                    </div>
                                </div>

                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">API Requests</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {data.summary.totalRequests.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 text-purple-600 opacity-20">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V7h4a1 1 0 100-2H6zm5 0a1 1 0 10-2 0v8a1 1 0 102 0V5zm5 0a1 1 0 10-2 0v8a1 1 0 102 0V5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Avg Cost/Request</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatCurrency(data.summary.averageCostPerRequest)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 text-orange-600 opacity-20">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V7h4a1 1 0 100-2H6zm5 0a1 1 0 10-2 0v8a1 1 0 102 0V5zm5 0a1 1 0 10-2 0v8a1 1 0 102 0V5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Utilization (Project View) */}
                            {data.project && data.summary.budgetUtilization !== undefined && (
                                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        Budget Utilization
                                    </h3>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {data.summary.budgetUtilization.toFixed(1)}% of budget used
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(data.summary.totalCost)} / {data.project.budget?.amount?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                                        <div
                                            className={`h-2 rounded-full ${data.summary.budgetUtilization > 90
                                                ? 'bg-red-600'
                                                : data.summary.budgetUtilization > 75
                                                    ? 'bg-yellow-600'
                                                    : 'bg-green-600'
                                                }`}
                                            style={{ width: `${Math.min(data.summary.budgetUtilization, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Charts */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <CostTrendChart data={data.timeline} />
                                <ServiceAnalytics data={data.breakdown.services} />
                            </div>

                            {/* Model Comparison */}
                            <ModelComparison data={data.breakdown.models} />

                            {/* Insights */}
                            {data.trends.insights.length > 0 && (
                                <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                        Insights & Recommendations
                                    </h3>
                                    <div className="space-y-3">
                                        {data.trends.insights.map((insight, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-600 rounded-full" />
                                                <p className="text-gray-700 dark:text-gray-300">{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )
                ) : (
                    // Project Comparison View
                    comparison && selectedProjects.length >= 2 && (
                        <>
                            {/* Comparison Summary */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {comparison.summary?.totalProjects ?? 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Combined Cost</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(comparison.summary?.totalCost ?? 0)}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Combined Tokens</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(comparison.summary?.totalTokens ?? 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Combined Requests</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(comparison.summary?.totalRequests ?? 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Project Comparison Table */}
                            <div className="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Project Comparison
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                                                    Project
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                                                    Cost
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                                                    Tokens
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                                                    Requests
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                                                    Avg Cost/Request
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                                                    Budget Usage
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            {(comparison.projects || []).map((project) => (
                                                <tr key={project.projectId}>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {project.projectName}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                                                        {formatCurrency(project.metrics.cost)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                                                        {project.metrics.tokens.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                                                        {project.metrics.requests.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                                                        {formatCurrency(project.metrics.averageCostPerRequest)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        {project.budgetUtilization > 0 ? (
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${project.budgetUtilization > 90
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                : project.budgetUtilization > 75
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                }`}>
                                                                {project.budgetUtilization.toFixed(1)}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500">No budget</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )
                )}

                {/* No Data State */}
                {!data && !comparison && (
                    <div className="py-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};