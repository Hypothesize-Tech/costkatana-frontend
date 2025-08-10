import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BackendMetrics, ModelCost } from '../../types/telemetry';

const COLORS = [
    '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
] as const;

const formatModelLabel = (name: string): string => {
    if (!name) return 'Unknown Model';
    if (name.includes('/')) {
        const seg = name.split('/').pop() || name;
        return seg.length > 28 ? seg.slice(0, 25) + '…' : seg;
    }
    // Otherwise trim long names
    return name.length > 28 ? name.slice(0, 25) + '…' : name;
};

export const CostAnalytics: React.FC = () => {
    const [timeframe, setTimeframe] = useState<string>('24h');

    const { data: metrics, isLoading, error } = useQuery<BackendMetrics>({
        queryKey: ['telemetry-cost', timeframe],
        queryFn: async () => TelemetryAPI.getMetricsDetail(timeframe),
        refetchInterval: 60000,
        staleTime: 60000,
        refetchOnWindowFocus: false,
        retry: false,
    });

    if (isLoading) return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200 animate-pulse">
            <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
    );

    if (error) return (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl ring-1 ring-rose-200">
            Error loading cost analytics
        </div>
    );

    const rawCosts = metrics?.cost_by_model || [];
    const costs: ModelCost[] = rawCosts.map((item) => ({
        model_name: item.model || 'Unknown Model',
        total_cost_usd: item.total_cost ?? 0,
        request_count: item.request_count ?? 0,
    }));

    const totalCost = costs.reduce((sum, model) => sum + (model.total_cost_usd || 0), 0);
    const timeframes = ['1h', '24h', '7d', '30d'];

    // Prepare chart data with display labels
    const chartData = costs.map((c) => ({
        ...c,
        display_name: formatModelLabel(c.model_name)
    }));

    return (
        <div className="bg-white shadow-sm rounded-2xl p-6 ring-1 ring-gray-200">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-900">AI Cost Analytics</h2>
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    {timeframes.map((frame) => (
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

            {chartData.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No cost data available for the selected timeframe</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut Chart */}
                    <div className="">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="total_cost_usd"
                                        nameKey="display_name"
                                        isAnimationActive={false}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props: any) => {
                                        const original = chartData[props?.payload?.index]?.model_name || name;
                                        return [`$${Number(value || 0).toFixed(2)}`, original];
                                    }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Custom legend below the chart */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            {chartData.map((m, index) => (
                                <div key={`${m.display_name}-${index}`} className="flex items-center text-xs text-gray-700 max-w-[180px]">
                                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="truncate" title={m.model_name}>{m.display_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cost Breakdown Table */}
                    <div>
                        <div className="flex items-baseline justify-between mb-3">
                            <h3 className="text-base font-semibold">Total Cost</h3>
                            <span className="text-2xl font-bold">${(totalCost || 0).toFixed(2)}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-600 border-b">
                                        <th className="px-3 py-2">Model</th>
                                        <th className="px-3 py-2">Cost ($)</th>
                                        <th className="px-3 py-2">Requests</th>
                                        <th className="px-3 py-2">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costs.map((model, index) => {
                                        const key = `${model.model_name}-${index}`;
                                        const pct = totalCost > 0 ? ((model.total_cost_usd || 0) / totalCost * 100).toFixed(1) : '0.0';
                                        return (
                                            <tr key={key} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center">
                                                        <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                        <span className="truncate max-w-[220px]" title={model.model_name}>{formatModelLabel(model.model_name)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">${(model.total_cost_usd || 0).toFixed(2)}</td>
                                                <td className="px-3 py-2">{model.request_count || 0}</td>
                                                <td className="px-3 py-2">{pct}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
