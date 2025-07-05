import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    KeyIcon,
    ChartBarIcon,
    CogIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { userService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';
import { analyticsService } from '../../services/analytics.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ApiKeyIntegration } from './ApiKeyIntegration';
import { formatCurrency } from '../../utils/formatters';

export const IntegrationDashboard: React.FC = () => {
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);

    const { data: apiKeys, isLoading: loadingKeys } = useQuery(
        ['api-keys'],
        userService.getDashboardApiKeys
    );

    const { data: projects, isLoading: loadingProjects } = useQuery(
        ['projects'],
        ProjectService.getProjects
    );

    const { data: analytics, isLoading: loadingAnalytics } = useQuery(
        ['analytics-overview'],
        () => analyticsService.getAnalytics({
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
        })
    );

    const integrationStatus = {
        apiKeysConfigured: apiKeys?.length || 0,
        projectsWithUsage: projects?.filter(p => p.usage?.totalCost && p.usage.totalCost > 0).length || 0,
        totalProjects: projects?.length || 0,
        recentActivity: analytics?.timeline?.slice(-7) || []
    };

    const getIntegrationHealth = () => {
        const score = (
            (integrationStatus.apiKeysConfigured > 0 ? 25 : 0) +
            (integrationStatus.projectsWithUsage > 0 ? 25 : 0) +
            (integrationStatus.totalProjects > 0 ? 25 : 0) +
            (integrationStatus.recentActivity.length > 0 ? 25 : 0)
        );

        if (score >= 75) return { status: 'healthy', color: 'green', label: 'Excellent' };
        if (score >= 50) return { status: 'warning', color: 'yellow', label: 'Good' };
        return { status: 'error', color: 'red', label: 'Needs Setup' };
    };

    const health = getIntegrationHealth();

    if (loadingKeys || loadingProjects || loadingAnalytics) {
        return <LoadingSpinner />;
    }

    return (
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Integration Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Monitor your API integrations and project usage
                </p>
            </div>

            {/* Integration Health */}
            <div className="mb-8">
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Integration Health
                        </h2>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${health.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                            {health.color === 'green' ? <CheckCircleIcon className="mr-1 w-4 h-4" /> :
                                health.color === 'yellow' ? <ExclamationTriangleIcon className="mr-1 w-4 h-4" /> :
                                    <ExclamationTriangleIcon className="mr-1 w-4 h-4" />}
                            {health.label}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {integrationStatus.apiKeysConfigured}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                API Keys
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {integrationStatus.projectsWithUsage}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Active Projects
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics?.summary?.totalRequests || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total Requests
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(analytics?.summary?.totalCost || 0)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Total Cost
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <button
                        onClick={() => setShowIntegrationModal(true)}
                        className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 transition-colors dark:bg-blue-900/20 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                        <CogIcon className="mr-3 w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                            <div className="font-medium text-blue-900 dark:text-blue-100">
                                Integration Guide
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                Setup API keys and projects
                            </div>
                        </div>
                    </button>

                    <a
                        href="/settings"
                        className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 transition-colors dark:bg-green-900/20 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                        <KeyIcon className="mr-3 w-8 h-8 text-green-600 dark:text-green-400" />
                        <div className="text-left">
                            <div className="font-medium text-green-900 dark:text-green-100">
                                Manage API Keys
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                                Add or update API keys
                            </div>
                        </div>
                    </a>

                    <a
                        href="/analytics"
                        className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200 transition-colors dark:bg-purple-900/20 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    >
                        <ChartBarIcon className="mr-3 w-8 h-8 text-purple-600 dark:text-purple-400" />
                        <div className="text-left">
                            <div className="font-medium text-purple-900 dark:text-purple-100">
                                View Analytics
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">
                                Detailed usage reports
                            </div>
                        </div>
                    </a>
                </div>
            </div>

            {/* API Keys Status */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    API Keys Status
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    {apiKeys && apiKeys.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {apiKeys.map((apiKey, index) => (
                                <div key={index} className="flex justify-between items-center p-4">
                                    <div className="flex items-center">
                                        <KeyIcon className="mr-3 w-5 h-5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900 capitalize dark:text-white">
                                                {apiKey.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {apiKey.maskedKey}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                        <CheckCircleIcon className="mr-1 w-4 h-4" />
                                        <span className="text-sm">Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <KeyIcon className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                No API Keys Configured
                            </h3>
                            <p className="mb-4 text-gray-500 dark:text-gray-400">
                                Add API keys to start tracking your AI usage
                            </p>
                            <a
                                href="/settings"
                                className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                            >
                                Add API Keys
                                <ArrowTopRightOnSquareIcon className="ml-2 w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects Overview */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Projects Overview
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    {projects && projects.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {projects.slice(0, 5).map((project) => (
                                <div key={project._id} className="flex justify-between items-center p-4">
                                    <div className="flex items-center">
                                        <div className="flex justify-center items-center mr-3 w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                                            <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {project.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {project.description || 'No description'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(project.usage?.totalCost || 0)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {project.usage?.totalRequests || 0} requests
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <DocumentTextIcon className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                No Projects Found
                            </h3>
                            <p className="mb-4 text-gray-500 dark:text-gray-400">
                                Create projects to organize your AI usage
                            </p>
                            <a
                                href="/projects"
                                className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                            >
                                Create Project
                                <ArrowTopRightOnSquareIcon className="ml-2 w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    {integrationStatus.recentActivity.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {integrationStatus.recentActivity.map((activity, index) => (
                                <div key={index} className="flex justify-between items-center p-4">
                                    <div className="flex items-center">
                                        <ClockIcon className="mr-3 w-5 h-5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {activity.requests} API requests
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(activity.cost)}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {activity.tokens?.toLocaleString()} tokens
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <ClockIcon className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                No Recent Activity
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Start using the API to see activity here
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Integration Modal */}
            <ApiKeyIntegration
                isOpen={showIntegrationModal}
                onClose={() => setShowIntegrationModal(false)}
            />
        </div>
    );
}; 