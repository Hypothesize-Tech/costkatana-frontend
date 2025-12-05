import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { BackendMetrics } from '../../types/telemetry';
import {
    RocketLaunchIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const TopOperations: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');
    const { data, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-top-ops', timeframe],
        queryFn: () => TelemetryAPI.getMetricsDetail(timeframe),
        staleTime: 60000,
    });

    if (isLoading) return <div className="p-3 sm:p-4 md:p-6 lg:p-8 h-32 sm:h-36 md:h-40 rounded-xl border shadow-lg backdrop-blur-xl animate-pulse glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel" />;
    if (error) return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-danger shrink-0">
                        <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                <span className="text-xs sm:text-sm md:text-base font-body text-secondary-900 dark:text-white">
                    Failed to load top operations
                </span>
            </div>
        </div>
    );

    const ops = data?.top_operations || [];

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-success glow-success shrink-0">
                        <RocketLaunchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-success">Top Operations</h2>
                </div>
                <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 flex flex-wrap gap-1">
                    {['1h', '24h', '7d'].map((frame) => (
                        <button key={frame} onClick={() => setTimeframe(frame)} className={`btn px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-success text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-success/10'}`}>{frame}</button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="border-b border-primary-200/30">
                            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-primary">Operation</th>
                            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-success">Count</th>
                            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-accent">Avg Latency (ms)</th>
                            <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-danger">Error Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ops.map((op, i) => (
                            <tr key={`${op.name}-${i}`} className="border-b transition-all duration-200 border-primary-200/20 hover:bg-gradient-success/5">
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate max-w-[200px]" title={op.name}>{op.name}</td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-success">{op.count}</td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-accent">{Number(op.avg_duration_ms || 0).toFixed(1)}</td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-danger">{Number(op.error_rate || 0).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
