import React, { useState, useEffect } from 'react';
import {
    CurrencyDollarIcon,
    UsersIcon,
    ChartBarIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StatsCard } from '../components/dashboard/StatsCard';
import { UserSpendingFilters } from '../components/admin/UserSpendingFilters';
import { UserSpendingTable } from '../components/admin/UserSpendingTable';
import { SpendingChartSwitcher } from '../components/admin/SpendingChartSwitcher';
import {
    AdminUserSpendingService,
    UserSpendingSummary,
    SpendingTrends,
    PlatformSummary,
    AdminUserSpendingFilters,
} from '../services/adminUserSpending.service';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

export const AdminUserSpending: React.FC = () => {
    const [users, setUsers] = useState<UserSpendingSummary[]>([]);
    const [trends, setTrends] = useState<SpendingTrends[]>([]);
    const [summary, setSummary] = useState<PlatformSummary | null>(null);
    const [filters, setFilters] = useState<AdminUserSpendingFilters>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const { showNotification } = useNotification();

    const fetchData = async () => {
        try {
            setRefreshing(true);

            const [usersData, trendsData, summaryData] = await Promise.all([
                AdminUserSpendingService.getAllUsersSpending(filters),
                AdminUserSpendingService.getSpendingTrends(timeRange, filters),
                AdminUserSpendingService.getPlatformSummary(filters),
            ]);

            setUsers(usersData);
            setTrends(trendsData);
            setSummary(summaryData);
        } catch (error: any) {
            console.error('Error fetching admin user spending data:', error);
            showNotification(
                error.response?.data?.message || 'Failed to load user spending data',
                'error'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters, timeRange]);

    const handleExport = async () => {
        try {
            const blob = await AdminUserSpendingService.exportUserSpending('csv', filters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-spending-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('Data exported successfully', 'success');
        } catch (error: any) {
            console.error('Error exporting data:', error);
            showNotification('Failed to export data', 'error');
        }
    };

    // Extract unique services from users
    const services = Array.from(
        new Set(users.flatMap((user) => user.services.map((s) => s.service)))
    ).sort();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center p-6">
                <div className="text-center glass backdrop-blur-xl rounded-2xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-base font-display font-semibold gradient-text-primary">
                        Loading user spending analytics...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl glow-primary shadow-lg">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold gradient-text-primary">
                                Admin User Spending Analytics
                            </h1>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                Track and analyze user spending patterns across the platform
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
                            className="px-4 py-2 text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold text-white bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg disabled:opacity-50 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed glow-primary hover:scale-105 disabled:hover:scale-100"
                        >
                            <ArrowPathIcon
                                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md text-primary-600 dark:text-primary-400"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatsCard
                            title="Total Users"
                            value={summary.totalUsers}
                            icon={UsersIcon}
                            format="number"
                        />
                        <StatsCard
                            title="Total Platform Cost"
                            value={summary.totalCost}
                            icon={CurrencyDollarIcon}
                            format="currency"
                        />
                        <StatsCard
                            title="Average Cost/User"
                            value={summary.averageCostPerUser}
                            icon={CurrencyDollarIcon}
                            format="currency"
                        />
                        <StatsCard
                            title="Total Requests"
                            value={summary.totalRequests}
                            icon={ChartBarIcon}
                            format="number"
                        />
                    </div>
                )}

                {/* Filters */}
                <UserSpendingFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    services={services}
                />

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <SpendingChartSwitcher trendsData={trends} loading={refreshing} />

                    {/* Top Users Chart */}
                    <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg">
                                <UsersIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-display font-bold gradient-text-primary">
                                    Top Spending Users
                                </h3>
                                <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    Top 10 users by cost
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {summary?.topSpendingUsers.slice(0, 10).map((user, index) => (
                                <div
                                    key={user.userId}
                                    className="flex items-center justify-between p-3 glass bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-primary-200/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-display font-bold glow-primary shadow-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                {user.userEmail || 'Unknown User'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-display font-bold gradient-text-primary">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(user.cost)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Spending Table */}
                <UserSpendingTable
                    users={users}
                    loading={refreshing}
                    onExport={handleExport}
                />

                {/* No Data State */}
                {users.length === 0 && !refreshing && (
                    <div className="glass backdrop-blur-xl rounded-xl p-12 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ExclamationTriangleIcon className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="text-lg font-display font-bold gradient-text-primary mb-2">
                                No Data Available
                            </h3>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Try adjusting your filters or date range to see user spending data.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

