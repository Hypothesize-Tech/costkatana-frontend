import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '../../services/subscription.service';
import { UsageAnalyticsShimmer } from '../shimmer/UsageAnalyticsShimmer';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const UsageAnalytics: React.FC = () => {
    const { data: analytics, isLoading } = useQuery(
        ['subscription-usage-analytics'],
        () => SubscriptionService.getUsageAnalytics()
    );

    if (isLoading) {
        return <UsageAnalyticsShimmer />;
    }

    if (!analytics) {
        return (
            <div className="card p-8 sm:p-10 md:p-12 text-center">
                <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
                    No usage data available
                </p>
            </div>
        );
    }

    // Safely access data with fallbacks to prevent errors
    const tokensData = analytics.tokens || { used: 0, limit: -1, percentage: 0, dates: [], trend: [] };
    const requestsData = analytics.requests || { used: 0, limit: -1, percentage: 0, dates: [], trend: [] };
    const projectedUsage = analytics.projectedUsage || { tokens: 0, requests: 0, logs: 0 };

    // Create chart data with safe defaults
    const tokensChartData = {
        labels: tokensData.dates || [],
        datasets: [
            {
                label: 'Tokens Used',
                data: tokensData.trend || [],
                borderColor: '#06ec9e',
                backgroundColor: 'rgba(6, 236, 158, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const requestsChartData = {
        labels: requestsData.dates || [],
        datasets: [
            {
                label: 'Requests',
                data: requestsData.trend || [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(6, 236, 158, 0.1)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                Usage Analytics
            </h2>

            {/* Current Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="card p-4 sm:p-5 md:p-6">
                    <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                        Tokens Used
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                        {tokensData.used?.toLocaleString() || '0'}
                    </div>
                    {tokensData.limit !== -1 && (
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            of {tokensData.limit?.toLocaleString() || '0'}
                        </div>
                    )}
                </div>
                <div className="card p-4 sm:p-5 md:p-6">
                    <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                        Requests Used
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                        {requestsData.used?.toLocaleString() || '0'}
                    </div>
                    {requestsData.limit !== -1 && (
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            of {requestsData.limit?.toLocaleString() || '0'}
                        </div>
                    )}
                </div>
                <div className="card p-4 sm:p-5 md:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                        Logs Used
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                        {analytics.logs?.used?.toLocaleString() || '0'}
                    </div>
                    {analytics.logs?.limit !== -1 && (
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            of {analytics.logs?.limit?.toLocaleString() || '0'}
                        </div>
                    )}
                </div>
            </div>

            {/* Projected Usage - Only show if data exists */}
            {projectedUsage && (projectedUsage.tokens > 0 || projectedUsage.requests > 0 || projectedUsage.logs > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="card p-4 sm:p-5 md:p-6">
                        <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                            Projected Tokens
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                            {projectedUsage.tokens?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div className="card p-4 sm:p-5 md:p-6">
                        <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                            Projected Requests
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                            {projectedUsage.requests?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div className="card p-4 sm:p-5 md:p-6 sm:col-span-2 lg:col-span-1">
                        <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                            Projected Logs
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                            {projectedUsage.logs?.toLocaleString() || '0'}
                        </div>
                    </div>
                </div>
            )}

            {/* Charts - Only show if we have trend data */}
            {(tokensChartData.labels.length > 0 || requestsChartData.labels.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {tokensChartData.labels.length > 0 && (
                        <div className="card p-3 sm:p-4 md:p-5 lg:p-6">
                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-light-text dark:text-dark-text mb-2 sm:mb-3 md:mb-4">
                                Token Usage Trend
                            </h3>
                            <div className="h-40 sm:h-48 md:h-56 lg:h-64">
                                <Line data={tokensChartData} options={chartOptions} />
                            </div>
                        </div>
                    )}
                    {requestsChartData.labels.length > 0 && (
                        <div className="card p-3 sm:p-4 md:p-5 lg:p-6">
                            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-light-text dark:text-dark-text mb-2 sm:mb-3 md:mb-4">
                                Request Usage Trend
                            </h3>
                            <div className="h-40 sm:h-48 md:h-56 lg:h-64">
                                <Line data={requestsChartData} options={chartOptions} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

