import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { MetricsResponse } from '../../types/telemetry';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    ChartBarIcon
} from '@heroicons/react/24/solid';

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
        { refetchInterval: 30000, staleTime: 30000 }
    );

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="glass h-32 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl" />
            ))}
        </div>
    );

    if (error) return (
        <div className="glass rounded-xl p-6 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-body text-secondary-900 dark:text-white">
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
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-highlight flex items-center justify-center shadow-lg">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">Performance Overview</h2>
                </div>
                <div className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl p-1">
                    {timeframes.map(frame => (
                        <button
                            key={frame}
                            onClick={() => setTimeframe(frame)}
                            className={`px-4 py-2 font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-primary text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-primary/10'}`}
                        >
                            {frame}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="font-display font-medium gradient-text-primary text-sm uppercase tracking-wide">RPM</p>
                            <p className="text-3xl font-display font-bold gradient-text-primary mt-2">{(metrics.requests_per_minute || 0).toFixed(1)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                            <rpmTrend.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="font-body text-secondary-600 dark:text-secondary-300 text-sm">
                        {rpmTrend.percentage}% {rpmTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}
                    </p>
                </div>

                <div className="glass rounded-xl p-6 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="font-display font-medium gradient-text-danger text-sm uppercase tracking-wide">Error Rate</p>
                            <p className="text-3xl font-display font-bold gradient-text-danger mt-2">{(metrics.error_rate || 0).toFixed(2)}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                            <errorRateTrend.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="font-body text-secondary-600 dark:text-secondary-300 text-sm">
                        {errorRateTrend.percentage}% {errorRateTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}
                    </p>
                </div>

                <div className="glass rounded-xl p-6 border border-accent-200/30 dark:border-accent-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="font-display font-medium gradient-text-accent text-sm uppercase tracking-wide">Avg Latency</p>
                            <p className="text-3xl font-display font-bold gradient-text-accent mt-2">{(metrics.avg_latency_ms || 0).toFixed(1)} ms</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-lg">
                            <latencyTrend.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="font-body text-secondary-600 dark:text-secondary-300 text-sm">
                        {latencyTrend.percentage}% {latencyTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}
                    </p>
                </div>

                <div className="glass rounded-xl p-6 border border-secondary-200/30 dark:border-secondary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 transition-all duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="font-display font-medium gradient-text-secondary text-sm uppercase tracking-wide">P95 Latency</p>
                            <p className="text-3xl font-display font-bold gradient-text-secondary mt-2">{(metrics.p95_latency_ms || 0).toFixed(1)} ms</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                            <ArrowRightIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="font-body text-secondary-600 dark:text-secondary-300 text-sm">
                        Performance Threshold
                    </p>
                </div>
            </div>
        </div>
    );
};
