import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
    BarChart,
    Bar
} from 'recharts';
import { TrendingUp, Zap, Coins, DollarSign, Calendar } from 'lucide-react';
import { guardrailsService } from '../../services/guardrails.service';
import { formatNumber } from '../../utils/formatters';

interface TrendData {
    date: string;
    requests: number;
    tokens: number;
    cost: number;
}

interface UsageTrendChartProps {
    days?: number;
    chartType?: 'line' | 'area' | 'bar';
    startDate?: Date;
    endDate?: Date;
}

export const UsageTrendChart: React.FC<UsageTrendChartProps> = ({
    chartType = 'area',
    startDate,
    endDate
}) => {
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<'all' | 'requests' | 'tokens' | 'cost'>('all');
    const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '60d' | '90d' | 'custom'>('7d');
    const [customStartDate, setCustomStartDate] = useState<Date | null>(startDate || null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(endDate || null);

    useEffect(() => {
        if (selectedRange === 'custom') {
            if (customStartDate && customEndDate) {
                fetchTrendData();
            }
        } else {
            fetchTrendData();
        }
    }, [selectedRange, customStartDate, customEndDate]);

    const fetchTrendData = React.useCallback(async () => {
        try {
            setLoading(true);
            let data;
            if (selectedRange === 'custom' && customStartDate && customEndDate) {
                data = await guardrailsService.getUsageTrendByDateRange(customStartDate, customEndDate);
            } else {
                const rangeDays = {
                    '7d': 7,
                    '30d': 30,
                    '60d': 60,
                    '90d': 90,
                    'custom': 7 // Fallback for custom range when dates not selected
                }[selectedRange];
                data = await guardrailsService.getUsageTrend(rangeDays);
            }
            setTrendData(data);
        } catch (error) {
            console.error('Error fetching trend data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedRange, customStartDate, customEndDate]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-4 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-scale-in">
                    <p className="mb-3 text-sm font-bold font-display text-light-text-primary dark:text-dark-text-primary">{formatDate(label)}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="mb-1 text-sm font-body" style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'Cost'
                                ? `$${entry.value.toFixed(2)}`
                                : formatNumber(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center mb-6">
                    <div className="flex justify-center items-center mr-4 w-10 h-10 rounded-xl shadow-lg bg-gradient-primary">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold font-display gradient-text-primary">Usage Trend</h3>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="spinner-lg text-primary-500"></div>
                </div>
            </div>
        );
    }

    const renderChart = () => {
        const commonProps = {
            data: trendData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        const renderLines = () => {
            const lines = [];
            if (selectedMetric === 'all' || selectedMetric === 'requests') {
                lines.push(
                    <Line
                        key="requests"
                        type="monotone"
                        dataKey="requests"
                        stroke="#9B5DE5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#9B5DE5", strokeWidth: 2, stroke: "#fff" }}
                        name="Requests"
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'tokens') {
                lines.push(
                    <Line
                        key="tokens"
                        type="monotone"
                        dataKey="tokens"
                        stroke="#00F5D4"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#00F5D4", strokeWidth: 2, stroke: "#fff" }}
                        name="Tokens"
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'cost') {
                lines.push(
                    <Line
                        key="cost"
                        type="monotone"
                        dataKey="cost"
                        stroke="#FF9500"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#FF9500", strokeWidth: 2, stroke: "#fff" }}
                        name="Cost"
                    />
                );
            }
            return lines;
        };

        const renderAreas = () => {
            const areas = [];
            if (selectedMetric === 'all' || selectedMetric === 'requests') {
                areas.push(
                    <Area
                        key="requests"
                        type="monotone"
                        dataKey="requests"
                        stroke="#9B5DE5"
                        fill="#9B5DE5"
                        fillOpacity={0.2}
                        strokeWidth={3}
                        name="Requests"
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'tokens') {
                areas.push(
                    <Area
                        key="tokens"
                        type="monotone"
                        dataKey="tokens"
                        stroke="#00F5D4"
                        fill="#00F5D4"
                        fillOpacity={0.2}
                        strokeWidth={3}
                        name="Tokens"
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'cost') {
                areas.push(
                    <Area
                        key="cost"
                        type="monotone"
                        dataKey="cost"
                        stroke="#FF9500"
                        fill="#FF9500"
                        fillOpacity={0.2}
                        strokeWidth={3}
                        name="Cost"
                    />
                );
            }
            return areas;
        };

        const renderBars = () => {
            const bars = [];
            if (selectedMetric === 'all' || selectedMetric === 'requests') {
                bars.push(
                    <Bar
                        key="requests"
                        dataKey="requests"
                        fill="#9B5DE5"
                        name="Requests"
                        radius={[4, 4, 0, 0]}
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'tokens') {
                bars.push(
                    <Bar
                        key="tokens"
                        dataKey="tokens"
                        fill="#00F5D4"
                        name="Tokens"
                        radius={[4, 4, 0, 0]}
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'cost') {
                bars.push(
                    <Bar
                        key="cost"
                        dataKey="cost"
                        fill="#FF9500"
                        name="Cost"
                        radius={[4, 4, 0, 0]}
                    />
                );
            }
            return bars;
        };

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {renderLines()}
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {renderBars()}
                    </BarChart>
                );

            case 'area':
            default:
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#6B7280"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {renderAreas()}
                    </AreaChart>
                );
        }
    };

    return (
        <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="flex justify-center items-center mr-4 w-10 h-10 rounded-xl shadow-lg bg-gradient-primary">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold font-display gradient-text-primary">Usage Trend</h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedMetric('all')}
                            className={`btn px-4 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${selectedMetric === 'all'
                                ? 'bg-gradient-primary text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedMetric('requests')}
                            className={`btn px-4 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${selectedMetric === 'requests'
                                ? 'bg-gradient-secondary text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-secondary-500/10'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            Requests
                        </button>
                        <button
                            onClick={() => setSelectedMetric('tokens')}
                            className={`btn px-4 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${selectedMetric === 'tokens'
                                ? 'bg-gradient-success text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-success-500/10'
                                }`}
                        >
                            <Coins className="w-4 h-4" />
                            Tokens
                        </button>
                        <button
                            onClick={() => setSelectedMetric('cost')}
                            className={`btn px-4 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${selectedMetric === 'cost'
                                ? 'bg-gradient-warning text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-warning-500/10'
                                }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            Cost
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedRange('7d')}
                            className={`btn px-3 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${selectedRange === '7d'
                                ? 'bg-gradient-primary text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
                                }`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setSelectedRange('30d')}
                            className={`btn px-3 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${selectedRange === '30d'
                                ? 'bg-gradient-primary text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
                                }`}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setSelectedRange('60d')}
                            className={`btn px-3 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${selectedRange === '60d'
                                ? 'bg-gradient-primary text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
                                }`}
                        >
                            60 Days
                        </button>
                        <button
                            onClick={() => setSelectedRange('90d')}
                            className={`btn px-3 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 ${selectedRange === '90d'
                                ? 'bg-gradient-primary text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10'
                                }`}
                        >
                            90 Days
                        </button>
                        <button
                            onClick={() => setSelectedRange('custom')}
                            className={`btn px-3 py-2 text-sm rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 ${selectedRange === 'custom'
                                ? 'bg-gradient-accent text-white shadow-lg'
                                : 'glass border border-primary-200/30 dark:border-primary-700/30 shadow-lg backdrop-blur-xl text-light-text-primary dark:text-dark-text-primary hover:bg-accent-500/10'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Custom
                        </button>
                    </div>
                    {selectedRange === 'custom' && (
                        <div className="flex gap-3 items-center p-3 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30">
                            <input
                                type="date"
                                value={customStartDate?.toISOString().split('T')[0] || ''}
                                onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                                className="text-sm input"
                            />
                            <span className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">to</span>
                            <input
                                type="date"
                                value={customEndDate?.toISOString().split('T')[0] || ''}
                                onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                                className="text-sm input"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
