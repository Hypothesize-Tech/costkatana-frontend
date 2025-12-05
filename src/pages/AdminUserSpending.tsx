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
import { useNotification } from '../contexts/NotificationContext';
import { AdminUserSpendingShimmer } from '../components/shimmer/AdminDashboardShimmer';

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
        return <AdminUserSpendingShimmer />;
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <div className="mx-auto space-y-4 sm:space-y-5 md:space-y-6 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
                        <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br rounded-xl shadow-lg from-primary-500 to-primary-600 glow-primary">
                            <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display gradient-text-primary">
                                Admin User Spending Analytics
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Track and analyze user spending patterns across the platform
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border shadow-sm backdrop-blur-sm transition-all duration-300 font-display glass bg-white/80 dark:bg-gray-800/80 border-primary-200/30 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-light-text-primary dark:text-dark-text-primary hover:shadow-md"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-br rounded-lg shadow-lg transition-all duration-300 font-display from-primary-500 to-primary-600 disabled:opacity-50 hover:from-primary-600 hover:to-primary-700 hover:shadow-xl disabled:cursor-not-allowed glow-primary hover:scale-105 disabled:hover:scale-100"
                        >
                            <ArrowPathIcon
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`}
                            />
                            <span className="hidden xs:inline">Refresh</span>
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border shadow-sm backdrop-blur-sm transition-all duration-300 font-display glass bg-white/80 dark:bg-gray-800/80 border-primary-200/30 hover:bg-primary-500/10 dark:hover:bg-primary-900/20 hover:shadow-md text-primary-600 dark:text-primary-400"
                        >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Export</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
                <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
                    <SpendingChartSwitcher trendsData={trends} loading={refreshing} />

                    {/* Top Users Chart */}
                    <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl">
                        <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 sm:p-2.5 rounded-xl glow-primary shadow-lg">
                                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold font-display gradient-text-primary">
                                    Top Spending Users
                                </h3>
                                <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    Top 10 users by cost
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            {summary?.topSpendingUsers.slice(0, 10).map((user, index) => (
                                <div
                                    key={user.userId}
                                    className="flex justify-between items-center p-2.5 sm:p-3 rounded-lg border backdrop-blur-sm glass bg-white/50 dark:bg-gray-800/50 border-primary-200/30"
                                >
                                    <div className="flex gap-2 sm:gap-3 items-center min-w-0 flex-1">
                                        <div className="flex justify-center items-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-xs font-bold text-white bg-gradient-to-br rounded-full shadow-sm from-primary-500 to-primary-600 font-display glow-primary flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs sm:text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary truncate">
                                                {user.userEmail || 'Unknown User'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold font-display gradient-text-primary ml-2 flex-shrink-0">
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
                    <div className="p-6 sm:p-8 md:p-12 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="text-center">
                            <div className="flex justify-center items-center mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br rounded-full from-primary-500/20 to-primary-600/20">
                                <ExclamationTriangleIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-500" />
                            </div>
                            <h3 className="mb-2 text-base sm:text-lg font-bold font-display gradient-text-primary">
                                No Data Available
                            </h3>
                            <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                Try adjusting your filters or date range to see user spending data.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

