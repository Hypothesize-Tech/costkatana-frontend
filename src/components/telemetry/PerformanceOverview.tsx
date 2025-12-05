import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { MetricsResponse } from '../../types/telemetry';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

const getTrendIndicator = (current: number, previous: number) => {
    const safePrev = previous === 0 ? 0.0001 : previous;
    const percentChange = ((current - safePrev) / safePrev) * 100;

    if (percentChange > 10) return {
        icon: ArrowUpIcon,
        color: 'text-success-600 dark:text-success-400',
        percentage: percentChange.toFixed(1)
    };

    if (percentChange < -10) return {
        icon: ArrowDownIcon,
        color: 'text-danger-600 dark:text-danger-400',
        percentage: Math.abs(percentChange).toFixed(1)
    };

    return {
        icon: ArrowRightIcon,
        color: 'text-secondary-500 dark:text-secondary-400',
        percentage: percentChange.toFixed(1)
    };
};

export const PerformanceOverview: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');

    const { data: dashboardData, isLoading, error } = useQuery<MetricsResponse>(
        ['telemetry-metrics', timeframe],
        () => TelemetryAPI.getMetrics(timeframe),
        {   staleTime: 30000 }
    );

    if (isLoading) return (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-pulse sm:grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-28 md:h-32 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30" />
            ))}
        </div>
    );

    if (error) return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex gap-2 sm:gap-3 items-center">
                <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-danger shrink-0">
                    <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm md:text-base font-body text-secondary-900 dark:text-white">
                    Error loading performance metrics
                </span>
            </div>
        </div>
    );

    const metrics = dashboardData || {
        requests_per_minute: 0,
        error_rate: 0,
        avg_latency_ms: 0,
        p95_latency_ms: 0
    };

    const rpmTrend = getTrendIndicator(metrics.requests_per_minute || 0, (metrics.requests_per_minute || 0) * 0.9);
    const errorRateTrend = getTrendIndicator(metrics.error_rate || 0, (metrics.error_rate || 0) * 0.9);
    const latencyTrend = getTrendIndicator(metrics.avg_latency_ms || 0, (metrics.avg_latency_ms || 0) * 0.9);

    const timeframes = ['1h', '24h', '7d'];

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-highlight glow-highlight shrink-0">
                        <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">Performance Overview</h2>
                </div>
                <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 flex flex-wrap gap-1">
                    {timeframes.map(frame => (
                        <button
                            key={frame}
                            onClick={() => setTimeframe(frame)}
                            className={`btn px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-display btn font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-primary text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-primary/10'}`}
                        >
                            {frame}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 sm:grid-cols-2 md:grid-cols-4">
                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-primary">RPM</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-primary truncate">{(metrics.requests_per_minute || 0).toFixed(1)}</p>
                        </div>
                        <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg shadow-lg bg-gradient-primary glow-primary shrink-0 ml-2">
                            <rpmTrend.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">
                        {rpmTrend.percentage}% {rpmTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}
                    </p>
                </div>

                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-danger">Error Rate</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-danger">{(metrics.error_rate || 0).toFixed(2)}%</p>
                        </div>
                        <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg shadow-lg bg-gradient-danger glow-danger shrink-0 ml-2">
                            <errorRateTrend.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">
                        {errorRateTrend.percentage}% {errorRateTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}
                    </p>
                </div>

                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-accent">Avg Latency</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-accent">{(metrics.avg_latency_ms || 0).toFixed(1)} ms</p>
                        </div>
                        <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg shadow-lg bg-gradient-accent glow-accent shrink-0 ml-2">
                            <latencyTrend.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">
                        {latencyTrend.percentage}% {latencyTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}
                    </p>
                </div>

                <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-200 glass border-secondary-200/30 dark:border-secondary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium tracking-wide uppercase font-display gradient-text-secondary">P95 Latency</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold font-display gradient-text-secondary">{(metrics.p95_latency_ms || 0).toFixed(1)} ms</p>
                        </div>
                        <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg shadow-lg bg-gradient-secondary glow-secondary shrink-0 ml-2">
                            <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm font-body text-secondary-600 dark:text-secondary-300">
                        Performance Threshold
                    </p>
                </div>
            </div>
        </div>
    );
};
