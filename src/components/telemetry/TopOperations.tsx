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

    if (isLoading) return <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200 animate-pulse h-40" />;
    if (error) return <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">Failed to load top operations</div>;

    const ops = data?.top_operations || [];

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Operations</h2>
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    {['1h', '24h', '7d'].map((frame) => (
                        <button key={frame} onClick={() => setTimeframe(frame)} className={`px-3 py-1.5 text-sm rounded-md transition ${timeframe === frame ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{frame}</button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-600 border-b">
                            <th className="px-3 py-2">Operation</th>
                            <th className="px-3 py-2">Count</th>
                            <th className="px-3 py-2">Avg Latency (ms)</th>
                            <th className="px-3 py-2">Error Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ops.map((op, i) => (
                            <tr key={`${op.name}-${i}`} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2">{op.name}</td>
                                <td className="px-3 py-2">{op.count}</td>
                                <td className="px-3 py-2">{Number(op.avg_duration_ms || 0).toFixed(1)}</td>
                                <td className="px-3 py-2">{Number(op.error_rate || 0).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
