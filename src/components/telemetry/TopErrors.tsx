import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { BackendMetrics } from '../../types/telemetry';
import { AlertTriangle } from 'lucide-react';

export const TopErrors: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');
    const { data, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-top-errors', timeframe],
        queryFn: () => TelemetryAPI.getMetricsDetail(timeframe),
        staleTime: 60000,
        refetchInterval: 60000
    });

    if (isLoading) return <div className="p-8 h-40 rounded-xl border shadow-lg backdrop-blur-xl animate-pulse glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel" />;
    if (error) return (
        <div className="p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex gap-3 items-center">
                <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-danger">
                    <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="font-body text-secondary-900 dark:text-white">
                    Failed to load top errors
                </span>
            </div>
        </div>
    );

    const errs = data?.top_errors || [];

    return (
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-danger">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold font-display gradient-text-danger">Top Errors</h2>
                </div>
                <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                    {['1h', '24h', '7d'].map((frame) => (
                        <button key={frame} onClick={() => setTimeframe(frame)} className={`btn px-4 py-2 font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-danger text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-danger/10'}`}>{frame}</button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-primary-200/30">
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-primary">Type</th>
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-danger">Count</th>
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-secondary">Latest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errs.map((e, i) => (
                            <tr key={`${e.type}-${i}`} className="border-b transition-all duration-200 border-primary-200/20 hover:bg-gradient-danger/5">
                                <td className="px-4 py-3 font-body text-secondary-900 dark:text-white">{e.type || 'Unknown'}</td>
                                <td className="px-4 py-3 font-semibold font-display gradient-text-danger">{e.count}</td>
                                <td className="px-4 py-3 font-body text-secondary-600 dark:text-secondary-300">{new Date(e.latest_occurrence).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
