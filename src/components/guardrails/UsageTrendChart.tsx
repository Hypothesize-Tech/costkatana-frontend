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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-sm mb-2">{formatDate(label)}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-xs" style={{ color: entry.color }}>
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
            <Card>
                <CardHeader>
                    <CardTitle>Usage Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
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
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
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
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
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
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 3 }}
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
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        strokeWidth={2}
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
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                        strokeWidth={2}
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
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.3}
                        strokeWidth={2}
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
                        fill="#3B82F6"
                        name="Requests"
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'tokens') {
                bars.push(
                    <Bar
                        key="tokens"
                        dataKey="tokens"
                        fill="#10B981"
                        name="Tokens"
                    />
                );
            }
            if (selectedMetric === 'all' || selectedMetric === 'cost') {
                bars.push(
                    <Bar
                        key="cost"
                        dataKey="cost"
                        fill="#F59E0B"
                        name="Cost"
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
        <Card>
            <CardHeader>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <CardTitle>Usage Trend</CardTitle>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedMetric('all')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedMetric === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setSelectedMetric('requests')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedMetric === 'requests'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Requests
                            </button>
                            <button
                                onClick={() => setSelectedMetric('tokens')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedMetric === 'tokens'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Tokens
                            </button>
                            <button
                                onClick={() => setSelectedMetric('cost')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedMetric === 'cost'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Cost
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedRange('7d')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedRange === '7d'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => setSelectedRange('30d')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedRange === '30d'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                30 Days
                            </button>
                            <button
                                onClick={() => setSelectedRange('60d')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedRange === '60d'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                60 Days
                            </button>
                            <button
                                onClick={() => setSelectedRange('90d')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedRange === '90d'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                90 Days
                            </button>
                            <button
                                onClick={() => setSelectedRange('custom')}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedRange === 'custom'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Custom
                            </button>
                        </div>
                        {selectedRange === 'custom' && (
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={customStartDate?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                                    className="px-2 py-1 text-xs border rounded"
                                />
                                <span className="text-xs text-gray-500 self-center">to</span>
                                <input
                                    type="date"
                                    value={customEndDate?.toISOString().split('T')[0] || ''}
                                    onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                                    className="px-2 py-1 text-xs border rounded"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    {renderChart()}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
