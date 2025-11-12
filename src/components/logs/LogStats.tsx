import React from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { FiActivity, FiAlertTriangle, FiClock, FiDollarSign } from 'react-icons/fi';

interface LogStatsProps {
    stats: {
        totalCalls: number;
        errorRate: number;
        avgLatency: number;
        totalCost: number;
        callsByService: { name: string; count: number }[];
        errorsByType: { name: string; count: number }[];
        latencyTrend: { timestamp: string; avgLatency: number }[];
        costTrend: { timestamp: string; totalCost: number }[];
    };
}

const COLORS = ['#06ec9e', '#009454', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

export const LogStats: React.FC<LogStatsProps> = ({ stats }) => {
    if (!stats) {
        return null;
    }

    return (
        <div className="space-y-6 mt-6">
            {/* Summary Cards - Matching StatsCard.tsx Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Calls */}
                <div className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Total Calls</p>
                            <p className="text-3xl font-bold gradient-text-primary">
                                {stats.totalCalls.toLocaleString()}
                            </p>
                        </div>
                        <div className="ml-6 shrink-0">
                            <div className="p-3.5 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
                                <FiActivity className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Rate */}
                <div className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Error Rate</p>
                            <p className="text-3xl font-bold gradient-text-primary">
                                {(stats.errorRate * 100).toFixed(2)}%
                            </p>
                        </div>
                        <div className="ml-6 shrink-0">
                            <div className="p-3.5 rounded-xl shadow-lg bg-gradient-to-r from-red-500 to-red-600 glow-danger group-hover:scale-110 transition-transform duration-300">
                                <FiAlertTriangle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avg Latency */}
                <div className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Avg Latency</p>
                            <p className="text-3xl font-bold gradient-text-primary">
                                {stats.avgLatency.toFixed(0)}ms
                            </p>
                        </div>
                        <div className="ml-6 shrink-0">
                            <div className="p-3.5 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                <FiClock className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Total Cost</p>
                            <p className="text-3xl font-bold gradient-text-primary">
                                ${stats.totalCost.toFixed(4)}
                            </p>
                        </div>
                        <div className="ml-6 shrink-0">
                            <div className="p-3.5 rounded-xl shadow-lg bg-gradient-to-r from-success-500 to-success-600 shadow-success-500/30 group-hover:scale-110 transition-transform duration-300">
                                <FiDollarSign className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calls by Service */}
                {stats.callsByService && stats.callsByService.length > 0 && (
                    <div className="card shadow-xl p-6">
                        <h4 className="text-lg font-bold gradient-text-primary mb-4">
                            Calls by Service
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={stats.callsByService}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {stats.callsByService.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        color: '#1e293b'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Errors by Type */}
                {stats.errorsByType && stats.errorsByType.length > 0 && (
                    <div className="card shadow-xl p-6">
                        <h4 className="text-lg font-bold gradient-text-primary mb-4">
                            Errors by Type
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.errorsByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="name" stroke="#64748b" className="dark:stroke-slate-400" />
                                <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        color: '#1e293b'
                                    }}
                                />
                                <Bar dataKey="count" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Trends */}
            <div className="grid grid-cols-1 gap-6">
                {/* Latency Trend */}
                {stats.latencyTrend && stats.latencyTrend.length > 0 && (
                    <div className="card shadow-xl p-6">
                        <h4 className="text-lg font-bold gradient-text-primary mb-4">
                            Latency Trend
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats.latencyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="timestamp" stroke="#64748b" className="dark:stroke-slate-400" />
                                <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        color: '#1e293b'
                                    }}
                                />
                                <Legend wrapperStyle={{ color: '#64748b' }} />
                                <Line
                                    type="monotone"
                                    dataKey="avgLatency"
                                    stroke="#06ec9e"
                                    strokeWidth={2}
                                    dot={{ fill: '#06ec9e', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Cost Trend */}
                {stats.costTrend && stats.costTrend.length > 0 && (
                    <div className="card shadow-xl p-6">
                        <h4 className="text-lg font-bold gradient-text-primary mb-4">
                            Cost Trend
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats.costTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="timestamp" stroke="#64748b" className="dark:stroke-slate-400" />
                                <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        color: '#1e293b'
                                    }}
                                />
                                <Legend wrapperStyle={{ color: '#64748b' }} />
                                <Line
                                    type="monotone"
                                    dataKey="totalCost"
                                    stroke="#009454"
                                    strokeWidth={2}
                                    dot={{ fill: '#009454', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};
