import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { MetricsResponse } from '../../types/telemetry';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowRightIcon
} from '@heroicons/react/24/solid';

const getTrendIndicator = (current: number, previous: number) => {
    const safePrev = previous === 0 ? 0.0001 : previous;
    const percentChange = ((current - safePrev) / safePrev) * 100;

    if (percentChange > 10) return {
        icon: ArrowUpIcon,
        color: 'text-emerald-600',
        percentage: percentChange.toFixed(1)
    };

    if (percentChange < -10) return {
        icon: ArrowDownIcon,
        color: 'text-rose-600',
        percentage: Math.abs(percentChange).toFixed(1)
    };

    return {
        icon: ArrowRightIcon,
        color: 'text-gray-500',
        percentage: percentChange.toFixed(1)
    };
};

const getStatusColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.5) return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    if (value <= threshold) return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
    return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
};

export const PerformanceOverview: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');

    const { data: dashboardData, isLoading, error } = useQuery<MetricsResponse>(
        ['telemetry-metrics', timeframe],
        () => TelemetryAPI.getMetrics(timeframe),
        { refetchInterval: 30000, staleTime: 30000 }
    );

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white h-24 rounded-xl shadow-sm" />
            ))}
        </div>
    );

    if (error) return (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">
            Error loading performance metrics
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
        <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-gray-200">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    {timeframes.map(frame => (
                        <button
                            key={frame}
                            onClick={() => setTimeframe(frame)}
                            className={`px-3 py-1.5 text-sm rounded-md transition ${timeframe === frame ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            {frame}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${getStatusColor(metrics.requests_per_minute || 0, 100)}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">RPM</p>
                            <p className="text-2xl font-bold">{(metrics.requests_per_minute || 0).toFixed(1)}</p>
                        </div>
                        <rpmTrend.icon className={`w-6 h-6 ${rpmTrend.color}`} />
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{rpmTrend.percentage}% {rpmTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}</p>
                </div>

                <div className={`p-4 rounded-xl ${getStatusColor((metrics.error_rate || 0), 5)}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Error Rate</p>
                            <p className="text-2xl font-bold">{(metrics.error_rate || 0).toFixed(2)}%</p>
                        </div>
                        <errorRateTrend.icon className={`w-6 h-6 ${errorRateTrend.color}`} />
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{errorRateTrend.percentage}% {errorRateTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}</p>
                </div>

                <div className={`p-4 rounded-xl ${getStatusColor(metrics.avg_latency_ms || 0, 200)}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Avg Latency</p>
                            <p className="text-2xl font-bold">{(metrics.avg_latency_ms || 0).toFixed(1)} ms</p>
                        </div>
                        <latencyTrend.icon className={`w-6 h-6 ${latencyTrend.color}`} />
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{latencyTrend.percentage}% {latencyTrend.icon === ArrowUpIcon ? 'increase' : 'decrease'}</p>
                </div>

                <div className={`p-4 rounded-xl ${getStatusColor(metrics.p95_latency_ms || 0, 300)}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">P95 Latency</p>
                            <p className="text-2xl font-bold">{(metrics.p95_latency_ms || 0).toFixed(1)} ms</p>
                        </div>
                        <ArrowRightIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-xs mt-1 text-gray-600">Performance Threshold</p>
                </div>
            </div>
        </div>
    );
};
