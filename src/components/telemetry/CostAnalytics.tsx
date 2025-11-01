import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BackendMetrics, ModelCost } from '../../types/telemetry';
import { CurrencyDollarIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel animate-pulse">
            <div className="h-64 bg-gradient-primary/20 rounded-xl" />
        </div>
    );

    if (error) return (
        <div className="glass rounded-xl p-6 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-body text-secondary-900 dark:text-white">
                    Error loading cost analytics
                </span>
            </div>
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
        <div className="glass rounded-xl p-8 border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-success flex items-center justify-center shadow-lg">
                        <CurrencyDollarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">AI Cost Analytics</h2>
                </div>
                <div className="glass rounded-lg border border-primary-200/30 shadow-lg backdrop-blur-xl p-1">
                    {timeframes.map((frame) => (
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

            {chartData.length === 0 ? (
                <div className="glass rounded-xl p-8 border border-accent-200/30 dark:border-accent-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-accent/20 flex items-center justify-center mx-auto mb-4">
                        <ChartBarIcon className="w-8 h-8 text-accent-500" />
                    </div>
                    <p className="font-body text-secondary-600 dark:text-secondary-300">
                        No cost data available for the selected timeframe
                    </p>
                </div>
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
                        <div className="mt-6">
                            <h4 className="font-display font-semibold gradient-text-secondary mb-4">Models</h4>
                            <div className="flex flex-wrap gap-3">
                                {chartData.map((m, index) => (
                                    <div key={`${m.display_name}-${index}`} className="glass rounded-lg p-2 border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center max-w-[180px]">
                                        <span className="inline-block w-4 h-4 rounded-full mr-2 shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="font-body text-secondary-900 dark:text-white text-sm truncate" title={m.model_name}>{m.display_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown Table */}
                    <div className="glass rounded-xl p-6 border border-success-200/30 dark:border-success-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-display font-semibold gradient-text-success">Total Cost</h3>
                            </div>
                            <span className="text-3xl font-display font-bold gradient-text-success">${(totalCost || 0).toFixed(2)}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-primary-200/30">
                                        <th className="px-4 py-3 text-left font-display font-semibold gradient-text-primary">Model</th>
                                        <th className="px-4 py-3 text-left font-display font-semibold gradient-text-success">Cost ($)</th>
                                        <th className="px-4 py-3 text-left font-display font-semibold gradient-text-secondary">Requests</th>
                                        <th className="px-4 py-3 text-left font-display font-semibold gradient-text-accent">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costs.map((model, index) => {
                                        const key = `${model.model_name}-${index}`;
                                        const pct = totalCost > 0 ? ((model.total_cost_usd || 0) / totalCost * 100).toFixed(1) : '0.0';
                                        return (
                                            <tr key={key} className="border-b border-primary-200/20 hover:bg-gradient-primary/5 transition-all duration-200">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-block w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                        <span className="font-body text-secondary-900 dark:text-white truncate max-w-[220px]" title={model.model_name}>{formatModelLabel(model.model_name)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-display font-semibold gradient-text-success">${(model.total_cost_usd || 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 font-body text-secondary-900 dark:text-white">{model.request_count || 0}</td>
                                                <td className="px-4 py-3 font-display font-semibold gradient-text-accent">{pct}%</td>
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
