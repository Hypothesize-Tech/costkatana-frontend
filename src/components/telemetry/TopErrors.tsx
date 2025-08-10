import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { BackendMetrics } from '../../types/telemetry';

export const TopErrors: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('1h');
    const { data, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-top-errors', timeframe],
        queryFn: () => TelemetryAPI.getMetricsDetail(timeframe),
        staleTime: 60000,
        refetchInterval: 60000
    });

    if (isLoading) return <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200 animate-pulse h-40" />;
    if (error) return <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">Failed to load top errors</div>;

    const errs = data?.top_errors || [];

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Errors</h2>
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
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Count</th>
                            <th className="px-3 py-2">Latest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errs.map((e, i) => (
                            <tr key={`${e.type}-${i}`} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2">{e.type || 'Unknown'}</td>
                                <td className="px-3 py-2">{e.count}</td>
                                <td className="px-3 py-2">{new Date(e.latest_occurrence).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
