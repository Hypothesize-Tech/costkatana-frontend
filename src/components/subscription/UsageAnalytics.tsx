import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionService } from '../../services/subscription.service';
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
        return (
            <div className="flex items-center justify-center p-12">
                <div className="spinner" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="card p-12 text-center">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    No usage data available
                </p>
            </div>
        );
    }

    const tokensChartData = {
        labels: analytics.tokens.dates,
        datasets: [
            {
                label: 'Tokens Used',
                data: analytics.tokens.trend,
                borderColor: '#06ec9e',
                backgroundColor: 'rgba(6, 236, 158, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const requestsChartData = {
        labels: analytics.requests.dates,
        datasets: [
            {
                label: 'Requests',
                data: analytics.requests.trend,
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
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                Usage Analytics
            </h2>

            {/* Projected Usage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-6">
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                        Projected Tokens
                    </div>
                    <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                        {analytics.projectedUsage.tokens.toLocaleString()}
                    </div>
                </div>
                <div className="card p-6">
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                        Projected Requests
                    </div>
                    <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                        {analytics.projectedUsage.requests.toLocaleString()}
                    </div>
                </div>
                <div className="card p-6">
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
                        Projected Logs
                    </div>
                    <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                        {analytics.projectedUsage.logs.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                        Token Usage Trend
                    </h3>
                    <div className="h-64">
                        <Line data={tokensChartData} options={chartOptions} />
                    </div>
                </div>
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                        Request Usage Trend
                    </h3>
                    <div className="h-64">
                        <Line data={requestsChartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

