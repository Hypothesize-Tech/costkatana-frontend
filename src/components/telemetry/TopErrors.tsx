import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { BackendMetrics } from '../../types/telemetry';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const TopErrors: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');
    const { data, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-top-errors', timeframe],
        queryFn: () => TelemetryAPI.getMetricsDetail(timeframe),
        staleTime: 60000,
        refetchInterval: 60000
    });

    if (isLoading) return <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse h-40" />;
    if (error) return (
        <div className="glass rounded-xl p-6 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-body text-secondary-900 dark:text-white">
                    Failed to load top errors
                </span>
            </div>
        </div>
    );

    const errs = data?.top_errors || [];

    return (
        <div className="glass rounded-xl p-8 border border-danger-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-danger">Top Errors</h2>
                </div>
                <div className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl p-1">
                    {['1h', '24h', '7d'].map((frame) => (
                        <button key={frame} onClick={() => setTimeframe(frame)} className={`px-4 py-2 font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-danger text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-danger/10'}`}>{frame}</button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-primary-200/30">
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-primary">Type</th>
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-danger">Count</th>
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-secondary">Latest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errs.map((e, i) => (
                            <tr key={`${e.type}-${i}`} className="border-b border-primary-200/20 hover:bg-gradient-danger/5 transition-all duration-200">
                                <td className="px-4 py-3 font-body text-secondary-900 dark:text-white">{e.type || 'Unknown'}</td>
                                <td className="px-4 py-3 font-display font-semibold gradient-text-danger">{e.count}</td>
                                <td className="px-4 py-3 font-body text-secondary-600 dark:text-secondary-300">{new Date(e.latest_occurrence).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
