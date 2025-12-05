import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TelemetryAPI } from '../../services/telemetry/telemetryApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BackendMetrics, ModelCost } from '../../types/telemetry';
import {
    BanknotesIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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
        staleTime: 60000,
        refetchOnWindowFocus: false,
        retry: false,
    });

    if (isLoading) return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-lg backdrop-blur-xl animate-pulse glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="h-48 sm:h-56 md:h-64 rounded-xl bg-gradient-primary/20" />
        </div>
    );

    if (error) return (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r rounded-xl border shadow-lg backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex gap-2 sm:gap-3 items-center">
                <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-danger shrink-0">
                    <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm md:text-base font-body text-secondary-900 dark:text-white">
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
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex justify-center items-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-success glow-success shrink-0">
                        <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display gradient-text-primary">AI Cost Analytics</h2>
                </div>
                <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 flex flex-wrap gap-1">
                    {timeframes.map((frame) => (
                        <button
                            key={frame}
                            onClick={() => setTimeframe(frame)}
                            className={`btn px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-display font-medium rounded-md transition-all duration-200 ${timeframe === frame ? 'bg-gradient-primary text-white shadow-lg' : 'text-secondary-600 dark:text-secondary-300 hover:bg-gradient-primary/10'}`}
                        >
                            {frame}
                        </button>
                    ))}
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="p-6 sm:p-8 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-accent-200/30 dark:border-accent-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex justify-center items-center mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-accent/20">
                        <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent-500 dark:text-accent-400" />
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-body text-secondary-600 dark:text-secondary-300">
                        No cost data available for the selected timeframe
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:gap-6 md:grid-cols-2">
                    {/* Donut Chart */}
                    <div className="">
                        <div className="h-56 sm:h-64 md:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="total_cost_usd"
                                        nameKey="display_name"
                                        isAnimationActive={false}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props: { payload?: { index?: number } }) => {
                                        const original = chartData[props?.payload?.index ?? 0]?.model_name || name;
                                        return [`$${Number(value || 0).toFixed(2)}`, original];
                                    }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Custom legend below the chart */}
                        <div className="mt-4 sm:mt-5 md:mt-6">
                            <h4 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold font-display gradient-text-secondary">Models</h4>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {chartData.map((m, index) => (
                                    <div key={`${m.display_name}-${index}`} className="glass rounded-lg p-1.5 sm:p-2 border border-primary-200/30 shadow-lg backdrop-blur-xl flex items-center max-w-[160px] sm:max-w-[180px]">
                                        <span className="inline-block mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs sm:text-sm truncate font-body text-secondary-900 dark:text-white" title={m.model_name}>{m.display_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown Table */}
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-success-200/30 dark:border-success-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                            <div className="flex gap-2 sm:gap-3 items-center">
                                <div className="flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-gradient-success glow-success shrink-0">
                                    <BanknotesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold font-display gradient-text-success">Total Cost</h3>
                            </div>
                            <span className="text-2xl sm:text-3xl font-bold font-display gradient-text-success">${(totalCost || 0).toFixed(2)}</span>
                        </div>
                        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5 lg:-mx-6 px-3 sm:px-4 md:px-5 lg:px-6">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-primary-200/30">
                                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-primary">Model</th>
                                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-success">Cost ($)</th>
                                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-secondary">Requests</th>
                                        <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-left font-display gradient-text-accent">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costs.map((model, index) => {
                                        const key = `${model.model_name}-${index}`;
                                        const pct = totalCost > 0 ? ((model.total_cost_usd || 0) / totalCost * 100).toFixed(1) : '0.0';
                                        return (
                                            <tr key={key} className="border-b transition-all duration-200 border-primary-200/20 hover:bg-gradient-primary/5">
                                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                                                    <div className="flex gap-2 sm:gap-3 items-center">
                                                        <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                        <span className="text-xs sm:text-sm font-body text-secondary-900 dark:text-white truncate max-w-[140px] sm:max-w-[180px] md:max-w-[220px]" title={model.model_name}>{formatModelLabel(model.model_name)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-success">${(model.total_cost_usd || 0).toFixed(2)}</td>
                                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-body text-secondary-900 dark:text-white">{model.request_count || 0}</td>
                                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold font-display gradient-text-accent">{pct}%</td>
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
