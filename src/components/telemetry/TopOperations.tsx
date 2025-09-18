import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { BackendMetrics } from '../../types/telemetry';

export const TopOperations: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');
    const { data, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-top-ops', timeframe],
        queryFn: () => TelemetryAPI.getMetricsDetail(timeframe),
        staleTime: 60000,
        refetchInterval: 60000
    });

    if (isLoading) return <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse h-40" />;
    if (error) return (
        <div className="glass rounded-xl p-6 border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">⚠️</span>
                </div>
                <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                    Failed to load top operations
                </span>
            </div>
        </div>
    );

    const ops = data?.top_operations || [];

    return (
        <div className="glass rounded-xl p-8 border border-success-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg">🚀</span>
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-success">Top Operations</h2>
                </div>
                <div className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl p-1">
                    {['1h', '24h', '7d'].map((frame) => (
                        <button key={frame} onClick={() => setTimeframe(frame)} className={`px-4 py-2 font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-success text-white shadow-lg' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gradient-success/10'}`}>{frame}</button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-primary-200/30">
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-primary">Operation</th>
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-success">Count</th>
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-accent">Avg Latency (ms)</th>
                            <th className="px-4 py-3 text-left font-display font-semibold gradient-text-danger">Error Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ops.map((op, i) => (
                            <tr key={`${op.name}-${i}`} className="border-b border-primary-200/20 hover:bg-gradient-success/5 transition-all duration-200">
                                <td className="px-4 py-3 font-body text-light-text-primary dark:text-dark-text-primary">{op.name}</td>
                                <td className="px-4 py-3 font-display font-semibold gradient-text-success">{op.count}</td>
                                <td className="px-4 py-3 font-display font-semibold gradient-text-accent">{Number(op.avg_duration_ms || 0).toFixed(1)}</td>
                                <td className="px-4 py-3 font-display font-semibold gradient-text-danger">{Number(op.error_rate || 0).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
