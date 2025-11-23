import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiTrendingUp,
    FiDollarSign,
    FiPackage,
    FiBarChart2,
    FiPieChart,
    FiActivity,
    FiClock
} from 'react-icons/fi';
import { templateAnalyticsService, TemplateUsageStats, TopTemplate, CostSavingsReport } from '../services/templateAnalytics.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const TemplateAnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<TemplateUsageStats | null>(null);
    const [topTemplates, setTopTemplates] = useState<TopTemplate[]>([]);
    const [savingsReport, setSavingsReport] = useState<CostSavingsReport | null>(null);
    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
    const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [statsData, topTemplatesData, savingsData] = await Promise.all([
                templateAnalyticsService.getTemplateUsageOverview(dateRange),
                templateAnalyticsService.getTopTemplates(period, 10),
                templateAnalyticsService.getCostSavingsReport(period)
            ]);
            setStats(statsData);
            setTopTemplates(topTemplatesData);
            setSavingsReport(savingsData);
        } catch (error) {
            console.error('Error loading analytics:', error);
            showNotification('Failed to load template analytics', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(Math.round(num));
    };

    const getPeriodLabel = (p: string) => {
        switch (p) {
            case '24h': return 'Last 24 Hours';
            case '7d': return 'Last 7 Days';
            case '30d': return 'Last 30 Days';
            case '90d': return 'Last 90 Days';
            default: return 'Last 30 Days';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="p-6 mx-auto max-w-7xl">
                {/* Header */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-3xl from-primary-600/10 to-success-600/10"></div>
                    <div className="relative p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-4 items-center mb-4">
                            <button
                                onClick={() => navigate('/templates')}
                                className="flex gap-2 items-center btn btn-secondary"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back to Templates
                            </button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                                    <FiBarChart2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold font-display gradient-text-primary">
                                        Template Analytics
                                    </h1>
                                    <p className="mt-2 text-secondary-600 dark:text-secondary-300">
                                        Track template usage, cost savings, and performance metrics
                                    </p>
                                </div>
                            </div>
                            {/* Period Selector */}
                            <div className="flex gap-2">
                                {(['24h', '7d', '30d', '90d'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${period === p
                                            ? 'bg-gradient-primary text-white shadow-lg'
                                            : 'bg-white dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-600'
                                            }`}
                                    >
                                        {getPeriodLabel(p)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-3 items-center mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                                <FiPackage className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-secondary-900 dark:text-white">Templates Used</h3>
                        </div>
                        <div className="text-3xl font-bold gradient-text-primary">{stats?.totalTemplatesUsed || 0}</div>
                        <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                            {stats?.totalUsageCount || 0} total uses
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-3 items-center mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-success-500 to-success-600">
                                <FiDollarSign className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-secondary-900 dark:text-white">Cost Saved</h3>
                        </div>
                        <div className="text-3xl font-bold gradient-text-success">
                            {formatCurrency(stats?.totalCostSaved || 0)}
                        </div>
                        <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                            Estimated savings
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-accent-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-3 items-center mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600">
                                <FiActivity className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-secondary-900 dark:text-white">Tokens Saved</h3>
                        </div>
                        <div className="text-3xl font-bold gradient-text-accent">
                            {formatNumber(stats?.totalTokensSaved || 0)}
                        </div>
                        <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                            Avg {formatNumber(stats?.averageTokenReduction || 0)}/use
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-warning-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-3 items-center mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-warning-500 to-warning-600">
                                <FiTrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-secondary-900 dark:text-white">Monthly Projection</h3>
                        </div>
                        <div className="text-3xl font-bold gradient-text-warning">
                            {formatCurrency(savingsReport?.projectedMonthlySavings || 0)}
                        </div>
                        <div className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                            Expected savings
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Context Breakdown */}
                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-3 items-center mb-6">
                            <div className="p-2 rounded-lg bg-gradient-primary">
                                <FiPieChart className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Usage by Context</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats?.contextBreakdown || []}
                                    dataKey="count"
                                    nameKey="context"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry) => `${entry.context}: ${entry.count}`}
                                >
                                    {stats?.contextBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Breakdown */}
                    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-3 items-center mb-6">
                            <div className="p-2 rounded-lg bg-gradient-success">
                                <FiBarChart2 className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Usage by Category</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats?.categoryBreakdown || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Templates Table */}
                <div className="p-6 mt-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex gap-3 items-center mb-6">
                        <div className="p-2 rounded-lg bg-gradient-accent">
                            <FiTrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Top Templates</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-secondary-700 dark:text-secondary-300">Rank</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-secondary-700 dark:text-secondary-300">Template</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-left text-secondary-700 dark:text-secondary-300">Category</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-secondary-700 dark:text-secondary-300">Uses</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-secondary-700 dark:text-secondary-300">Total Cost</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-secondary-700 dark:text-secondary-300">Avg Cost</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-secondary-700 dark:text-secondary-300">Savings</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-right text-secondary-700 dark:text-secondary-300">Last Used</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topTemplates.map((template) => (
                                    <tr
                                        key={template.templateId}
                                        className="border-b border-secondary-100 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/templates/${template.templateId}`)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${template.rank === 1 ? 'bg-gradient-to-br from-warning-400 to-warning-600' :
                                                template.rank === 2 ? 'bg-gradient-to-br from-secondary-400 to-secondary-600' :
                                                    template.rank === 3 ? 'bg-gradient-to-br from-accent-400 to-accent-600' :
                                                        'bg-gradient-to-br from-secondary-300 to-secondary-500'
                                                }`}>
                                                {template.rank}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-secondary-900 dark:text-white">{template.templateName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                                {template.templateCategory}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-secondary-900 dark:text-white">
                                            {formatNumber(template.usageCount)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-secondary-600 dark:text-secondary-400">
                                            {formatCurrency(template.totalCost)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-secondary-600 dark:text-secondary-400">
                                            {formatCurrency(template.averageCost)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-success-600 dark:text-success-400">
                                            {formatCurrency(template.costSavingsEstimate)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm text-secondary-600 dark:text-secondary-400">
                                            {new Date(template.lastUsed).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Most Used Template Highlight */}
                {stats?.mostUsedTemplate && (
                    <div className="p-6 mt-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex gap-4 items-start">
                            <div className="p-3 rounded-xl bg-gradient-success shadow-lg glow-success">
                                <FiClock className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                                    Most Used Template
                                </h3>
                                <p className="text-2xl font-bold gradient-text-success mb-1">
                                    {stats.mostUsedTemplate.name}
                                </p>
                                <p className="text-secondary-600 dark:text-secondary-400">
                                    Used {formatNumber(stats.mostUsedTemplate.usageCount)} times during this period
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateAnalyticsPage;

