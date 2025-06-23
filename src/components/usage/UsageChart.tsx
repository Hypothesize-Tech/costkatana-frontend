// src/components/usage/UsageChart.tsx
import React from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface UsageChartProps {
    data: Array<{
        date: string;
        cost: number;
        calls: number;
        tokens: number;
    }>;
    type?: 'line' | 'bar';
    metric?: 'cost' | 'calls' | 'tokens';
}

export const UsageChart: React.FC<UsageChartProps> = ({
    data,
    type = 'line',
    metric = 'cost',
}) => {
    const formattedData = data.map(item => ({
        ...item,
        displayDate: formatDate(item.date, 'short'),
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="text-sm font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {
                                entry.name === 'Cost'
                                    ? formatCurrency(entry.value)
                                    : entry.value.toLocaleString()
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getYAxisTickFormatter = (metric: string) => {
        if (metric === 'cost') {
            return (value: number) => `$${value}`;
        }
        return (value: number) => value.toLocaleString();
    };

    const ChartComponent = type === 'line' ? LineChart : BarChart;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Usage Over Time</h3>
                <p className="text-sm text-gray-600">Track your API usage trends</p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={getYAxisTickFormatter(metric)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {metric === 'cost' && (
                        type === 'line' ? (
                            <Line
                                type="monotone"
                                dataKey="cost"
                                stroke="#6366f1"
                                strokeWidth={2}
                                name="Cost"
                            />
                        ) : (
                            <Bar
                                dataKey="cost"
                                fill="#6366f1"
                                name="Cost"
                            />
                        )
                    )}

                    {metric === 'calls' && (
                        type === 'line' ? (
                            <Line
                                type="monotone"
                                dataKey="calls"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="API Calls"
                            />
                        ) : (
                            <Bar
                                dataKey="calls"
                                fill="#10b981"
                                name="API Calls"
                            />
                        )
                    )}

                    {metric === 'tokens' && (
                        type === 'line' ? (
                            <Line
                                type="monotone"
                                dataKey="tokens"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="Tokens"
                            />
                        ) : (
                            <Bar
                                dataKey="tokens"
                                fill="#f59e0b"
                                name="Tokens"
                            />
                        )
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
};