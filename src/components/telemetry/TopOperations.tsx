import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { BackendMetrics } from '../../types/telemetry';
import { Rocket, AlertTriangle } from 'lucide-react';

export const TopOperations: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');
    const { data, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-top-ops', timeframe],
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
                    Failed to load top operations
                </span>
            </div>
        </div>
    );

    const ops = data?.top_operations || [];

    return (
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 items-center">
                    <div className="flex justify-center items-center w-10 h-10 rounded-xl shadow-lg bg-gradient-success">
                        <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold font-display gradient-text-success">Top Operations</h2>
                </div>
                <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                    {['1h', '24h', '7d'].map((frame) => (
                        <button key={frame} onClick={() => setTimeframe(frame)} className={`btn px-4 py-2 font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-success text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-success/10'}`}>{frame}</button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-primary-200/30">
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-primary">Operation</th>
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-success">Count</th>
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-accent">Avg Latency (ms)</th>
                            <th className="px-4 py-3 font-semibold text-left font-display gradient-text-danger">Error Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ops.map((op, i) => (
                            <tr key={`${op.name}-${i}`} className="border-b transition-all duration-200 border-primary-200/20 hover:bg-gradient-success/5">
                                <td className="px-4 py-3 font-body text-secondary-900 dark:text-white">{op.name}</td>
                                <td className="px-4 py-3 font-semibold font-display gradient-text-success">{op.count}</td>
                                <td className="px-4 py-3 font-semibold font-display gradient-text-accent">{Number(op.avg_duration_ms || 0).toFixed(1)}</td>
                                <td className="px-4 py-3 font-semibold font-display gradient-text-danger">{Number(op.error_rate || 0).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
