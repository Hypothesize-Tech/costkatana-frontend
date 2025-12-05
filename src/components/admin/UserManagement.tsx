import React, { useState, useEffect } from 'react';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    TrashIcon,
    EyeIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    FireIcon,
    ClockIcon,
    EnvelopeIcon,
    CreditCardIcon,
    UserPlusIcon,
    UserMinusIcon,
} from '@heroicons/react/24/outline';
import {
    AdminDashboardService,
    AdminUserSummary,
    UserDetail,
    UserStats,
} from '../../services/adminDashboard.service';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useNotification } from '../../contexts/NotificationContext';
import { AdminUsersShimmer } from '../shimmer/AdminDashboardShimmer';
import { Modal } from '../common/Modal';

interface UserManagementProps {
    onRefresh?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onRefresh }) => {
    const [users, setUsers] = useState<AdminUserSummary[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role: '' as '' | 'user' | 'admin',
        isActive: undefined as boolean | undefined,
        subscriptionPlan: '' as '' | 'free' | 'pro' | 'enterprise' | 'plus',
        sortBy: 'createdAt' as 'name' | 'email' | 'createdAt' | 'lastLogin' | 'totalCost',
        sortOrder: 'desc' as 'asc' | 'desc',
    });
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchData();
    }, [filters, searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData] = await Promise.all([
                AdminDashboardService.getAllUsers({
                    search: searchTerm || undefined,
                    role: filters.role || undefined,
                    isActive: filters.isActive,
                    subscriptionPlan: filters.subscriptionPlan || undefined,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder,
                }),
                AdminDashboardService.getUserStats(),
            ]);
            setUsers(usersData);
            setStats(statsData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load users';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId: string) => {
        try {
            const userDetail = await AdminDashboardService.getUserDetail(userId);
            setSelectedUser(userDetail);
            setIsModalOpen(true);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load user details';
            showNotification(errorMessage, 'error');
        }
    };

    const handleUpdateStatus = async (userId: string, isActive: boolean) => {
        try {
            await AdminDashboardService.updateUserStatus(userId, isActive);
            showNotification(`User ${isActive ? 'activated' : 'suspended'} successfully`, 'success');
            fetchData();
            if (onRefresh) onRefresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update user status';
            showNotification(errorMessage, 'error');
        }
    };

    const handleUpdateRole = async (userId: string, role: 'user' | 'admin') => {
        try {
            await AdminDashboardService.updateUserRole(userId, role);
            showNotification('User role updated successfully', 'success');
            fetchData();
            if (onRefresh) onRefresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update user role';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await AdminDashboardService.deleteUser(userId);
            showNotification('User deleted successfully', 'success');
            fetchData();
            if (onRefresh) onRefresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete user';
            showNotification(errorMessage, 'error');
        }
    };

    if (loading && !stats) {
        return (
            <div className="p-12 bg-gradient-to-br rounded-3xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <AdminUsersShimmer />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Premium Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    <div className="glass p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 group">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transition-transform glow-primary group-hover:scale-110">
                                <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-display font-semibold">
                                Total
                            </span>
                        </div>
                        <h3 className="mb-2 text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            Total Users
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                            {formatNumber(stats.totalUsers)}
                        </p>
                        <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                            All registered users in the system
                        </p>
                    </div>

                    <div className="glass p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 group">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg transition-transform glow-primary group-hover:scale-110">
                                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-display font-semibold">
                                Active
                            </span>
                        </div>
                        <h3 className="mb-2 text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            Active Users
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                            {formatNumber(stats.activeUsers)}
                        </p>
                        <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Users currently active on the platform
                        </p>
                    </div>

                    <div className="glass p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 group">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg transition-transform glow-primary group-hover:scale-110">
                                <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-display font-semibold">
                                Admin
                            </span>
                        </div>
                        <h3 className="mb-2 text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            Admin Users
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                            {formatNumber(stats.adminUsers)}
                        </p>
                        <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Users with administrator privileges
                        </p>
                    </div>

                    <div className="glass p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70 group">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg transition-transform glow-primary group-hover:scale-110">
                                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-display font-semibold">
                                Verified
                            </span>
                        </div>
                        <h3 className="mb-2 text-xs sm:text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            Verified Users
                        </h3>
                        <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                            {formatNumber(stats.verifiedUsers)}
                        </p>
                        <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Users with verified email addresses
                        </p>
                    </div>
                </div>
            )}

            {/* Premium Search and Filters */}
            <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br rounded-xl shadow-lg from-primary-500 to-primary-600">
                        <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold font-display gradient-text">
                            Search & Filter
                        </h3>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Find and filter users by name, email, role, status, or plan
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                    <div className="flex-1 min-w-full sm:min-w-[200px]">
                        <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <MagnifyingGlassIcon className="w-4 h-4" />
                                Search Users
                            </div>
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-3 pr-4 pl-10 w-full rounded-xl border glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-dark-surface/50"
                                aria-label="Search users by name or email"
                            />
                        </div>
                    </div>
                    <div className="min-w-full sm:min-w-[140px]">
                        <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheckIcon className="w-4 h-4" />
                                Role
                            </div>
                        </label>
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value as '' | 'user' | 'admin' })}
                            className="px-3 sm:px-4 py-2 sm:py-3 w-full font-semibold rounded-xl border glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-dark-surface/50 font-display text-xs sm:text-sm"
                            aria-label="Filter users by role"
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="min-w-full sm:min-w-[140px]">
                        <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <CheckCircleIcon className="w-4 h-4" />
                                Status
                            </div>
                        </label>
                        <select
                            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                            onChange={(e) => setFilters({
                                ...filters,
                                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                            })}
                            className="px-3 sm:px-4 py-2 sm:py-3 w-full font-semibold rounded-xl border glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-dark-surface/50 font-display text-xs sm:text-sm"
                            aria-label="Filter users by status"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <div className="min-w-full sm:min-w-[140px]">
                        <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <CreditCardIcon className="w-4 h-4" />
                                Plan
                            </div>
                        </label>
                        <select
                            value={filters.subscriptionPlan}
                            onChange={(e) => setFilters({
                                ...filters,
                                subscriptionPlan: e.target.value as '' | 'free' | 'pro' | 'enterprise' | 'plus'
                            })}
                            className="px-3 sm:px-4 py-2 sm:py-3 w-full font-semibold rounded-xl border glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-dark-surface/50 font-display text-xs sm:text-sm"
                            aria-label="Filter users by subscription plan"
                        >
                            <option value="">All Plans</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="plus">Plus</option>
                        </select>
                    </div>
                    <div className="min-w-full sm:min-w-[160px]">
                        <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <ClockIcon className="w-4 h-4" />
                                Sort By
                            </div>
                        </label>
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                setFilters({
                                    ...filters,
                                    sortBy: sortBy as any,
                                    sortOrder: sortOrder as 'asc' | 'desc'
                                });
                            }}
                            className="px-4 py-3 w-full font-semibold rounded-xl border glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/50 dark:bg-dark-surface/50 font-display"
                            aria-label="Sort users"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="totalCost-desc">Highest Cost</option>
                            <option value="totalCost-asc">Lowest Cost</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Premium Users Table */}
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br rounded-xl shadow-lg from-primary-500 to-primary-600">
                            <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text">
                                Users
                            </h3>
                            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                {users.length} {users.length === 1 ? 'user' : 'users'} found
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex gap-1.5 sm:gap-2 items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r rounded-xl border transition-all duration-300 glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:scale-105 from-white/50 to-white/30 dark:from-dark-surface/50 dark:to-dark-surface/30"
                        title="Refresh user list"
                        aria-label="Refresh user list"
                    >
                        <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm font-semibold font-display">Refresh</span>
                    </button>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-primary-200/30 dark:border-primary-700/30">
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-left font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-2 items-center">
                                        <UserCircleIcon className="w-4 h-4" />
                                        <span>User</span>
                                    </div>
                                </th>
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-left font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-1.5 sm:gap-2 items-center">
                                        <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>Role</span>
                                    </div>
                                </th>
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-left font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-1.5 sm:gap-2 items-center">
                                        <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>Status</span>
                                    </div>
                                </th>
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-right font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-1.5 sm:gap-2 justify-end items-center">
                                        <CurrencyDollarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>Cost</span>
                                    </div>
                                </th>
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-right font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-1.5 sm:gap-2 justify-end items-center">
                                        <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>Requests</span>
                                    </div>
                                </th>
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-left font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-1.5 sm:gap-2 items-center">
                                        <CreditCardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>Plan</span>
                                    </div>
                                </th>
                                <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 font-semibold text-left font-display text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                    <div className="flex gap-1.5 sm:gap-2 items-center">
                                        <FunnelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>Actions</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <div className="inline-flex justify-center items-center mb-4 w-16 h-16 rounded-full bg-primary-100/50 dark:bg-primary-900/30">
                                            <UsersIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <p className="mb-2 text-lg font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                                            No Users Found
                                        </p>
                                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-body">
                                            Try adjusting your search or filters
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.userId} className="border-b transition-colors border-primary-200/10 dark:border-primary-700/10 hover:bg-white/5 dark:hover:bg-dark-surface/10 group">
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <div className="flex gap-2 sm:gap-3 items-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={`${user.name}'s avatar`}
                                                        className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full ring-2 transition-all ring-primary-200/50 group-hover:ring-primary-400/50 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br rounded-full shadow-lg transition-transform from-primary-500 to-primary-600 group-hover:scale-110 flex-shrink-0">
                                                        <UserCircleIcon className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 text-white" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold font-display text-light-text-primary dark:text-dark-text-primary text-xs sm:text-sm truncate">
                                                        {user.name}
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                                        <EnvelopeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                                        <span className="truncate">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <div className="flex gap-2 items-center">
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wide ${user.role === 'admin'
                                                    ? 'bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                                                    : 'bg-gray-100/50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-800/50'
                                                    }`}>
                                                    {user.role === 'admin' ? (
                                                        <span className="flex gap-1 items-center">
                                                            <ShieldCheckIcon className="w-3 h-3" />
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        'User'
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold border flex items-center gap-1.5 w-fit ${user.isActive
                                                ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/50'
                                                : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50'
                                                }`}>
                                                {user.isActive ? (
                                                    <>
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        <span>Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircleIcon className="w-3.5 h-3.5" />
                                                        <span>Inactive</span>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-right">
                                            <div className="flex gap-1.5 sm:gap-2 justify-end items-center">
                                                <CurrencyDollarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                                                <span className="font-semibold font-display text-light-text-primary dark:text-dark-text-primary text-xs sm:text-sm">
                                                    {formatCurrency(user.totalCost)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-right">
                                            <div className="flex gap-1.5 sm:gap-2 justify-end items-center">
                                                <ChartBarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" />
                                                <span className="font-body text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
                                                    {formatNumber(user.totalRequests)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-display font-semibold bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50 flex items-center gap-1 sm:gap-1.5 w-fit">
                                                <CreditCardIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span>{user.subscriptionPlan}</span>
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <div className="flex gap-1 sm:gap-1.5 md:gap-2 items-center">
                                                <button
                                                    onClick={() => handleViewUser(user.userId)}
                                                    className="p-2 sm:p-2.5 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 hover:border-blue-200/50 dark:hover:border-blue-800/50 border border-transparent transition-all duration-300 hover:scale-110 group/btn"
                                                    title="View detailed user information"
                                                    aria-label={`View details for ${user.name}`}
                                                >
                                                    <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 transition-transform dark:text-blue-400 group-hover/btn:scale-110" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(user.userId, !user.isActive)}
                                                    className={`p-2 sm:p-2.5 rounded-lg border border-transparent transition-all duration-300 hover:scale-110 group/btn ${user.isActive
                                                        ? 'hover:bg-orange-100/50 dark:hover:bg-orange-900/30 hover:border-orange-200/50 dark:hover:border-orange-800/50'
                                                        : 'hover:bg-green-100/50 dark:hover:bg-green-900/30 hover:border-green-200/50 dark:hover:border-green-800/50'
                                                        }`}
                                                    title={user.isActive ? 'Suspend user account' : 'Activate user account'}
                                                    aria-label={user.isActive ? `Suspend ${user.name}` : `Activate ${user.name}`}
                                                >
                                                    {user.isActive ? (
                                                        <UserMinusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 transition-transform group-hover/btn:scale-110" />
                                                    ) : (
                                                        <UserPlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 transition-transform group-hover/btn:scale-110" />
                                                    )}
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleUpdateRole(user.userId, 'admin')}
                                                        className="p-2 sm:p-2.5 rounded-lg hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 hover:border-indigo-200/50 dark:hover:border-indigo-800/50 border border-transparent transition-all duration-300 hover:scale-110 group/btn"
                                                        title="Grant administrator privileges to this user"
                                                        aria-label={`Make ${user.name} an administrator`}
                                                    >
                                                        <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 transition-transform dark:text-indigo-400 group-hover/btn:scale-110" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(user.userId)}
                                                    className="p-2 sm:p-2.5 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 hover:border-red-200/50 dark:hover:border-red-800/50 border border-transparent transition-all duration-300 hover:scale-110 group/btn"
                                                    title="Permanently delete this user account (cannot be undone)"
                                                    aria-label={`Delete ${user.name}`}
                                                >
                                                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium User Detail Modal */}
            {selectedUser && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }}
                    title="User Details"
                >
                    <div className="space-y-6">
                        {/* User Header */}
                        <div className="flex gap-4 items-center pb-4 border-b border-primary-200/30">
                            {selectedUser.avatar ? (
                                <img
                                    src={selectedUser.avatar}
                                    alt={`${selectedUser.name}'s avatar`}
                                    className="w-20 h-20 rounded-full ring-4 ring-primary-200/50"
                                />
                            ) : (
                                <div className="flex justify-center items-center w-20 h-20 bg-gradient-to-br rounded-full shadow-lg from-primary-500 to-primary-600">
                                    <UserCircleIcon className="w-12 h-12 text-white" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="mb-1 text-2xl font-bold font-display text-light-text-primary dark:text-dark-text-primary">
                                    {selectedUser.name}
                                </h3>
                                <div className="flex gap-2 items-center text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    <span>{selectedUser.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* User Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 glass rounded-xl border border-primary-200/30 hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex gap-2 items-center mb-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Role
                                    </p>
                                </div>
                                <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-display font-bold uppercase ${selectedUser.role === 'admin'
                                    ? 'bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'bg-gray-100/50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {selectedUser.role === 'admin' ? (
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                                            Admin
                                        </span>
                                    ) : (
                                        'User'
                                    )}
                                </span>
                                <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    User's access level and permissions
                                </p>
                            </div>
                            <div className="p-4 glass rounded-xl border border-primary-200/30 hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex gap-2 items-center mb-3">
                                    {selectedUser.isActive ? (
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircleIcon className="w-5 h-5 text-red-500" />
                                    )}
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Status
                                    </p>
                                </div>
                                <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-display font-bold ${selectedUser.isActive
                                    ? 'bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    }`}>
                                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <p className="mt-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Current account activation status
                                </p>
                            </div>
                            <div className="p-4 glass rounded-xl border border-primary-200/30 hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex gap-2 items-center mb-2">
                                    <CurrencyDollarIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Total Cost
                                    </p>
                                </div>
                                <p className="text-xl font-bold font-display gradient-text">
                                    {formatCurrency(selectedUser.totalCost)}
                                </p>
                                <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Lifetime spending on the platform
                                </p>
                            </div>
                            <div className="p-4 glass rounded-xl border border-primary-200/30 hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex gap-2 items-center mb-2">
                                    <ChartBarIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Total Requests
                                    </p>
                                </div>
                                <p className="text-xl font-bold font-display gradient-text">
                                    {formatNumber(selectedUser.totalRequests)}
                                </p>
                                <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Total API requests made
                                </p>
                            </div>
                            <div className="p-4 glass rounded-xl border border-primary-200/30 hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex gap-2 items-center mb-2">
                                    <BuildingOfficeIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Projects
                                    </p>
                                </div>
                                <p className="text-xl font-bold font-display gradient-text">
                                    {selectedUser.projectCount}
                                </p>
                                <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Number of active projects
                                </p>
                            </div>
                            <div className="p-4 glass rounded-xl border border-primary-200/30 hover:scale-[1.02] transition-all duration-300 group">
                                <div className="flex gap-2 items-center mb-2">
                                    <FireIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Workspaces
                                    </p>
                                </div>
                                <p className="text-xl font-bold font-display gradient-text">
                                    {selectedUser.workspaceCount}
                                </p>
                                <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary font-body">
                                    Number of workspace memberships
                                </p>
                            </div>
                        </div>

                        {/* Workspace Memberships */}
                        {selectedUser.workspaceMemberships.length > 0 && (
                            <div>
                                <div className="flex gap-2 items-center mb-3">
                                    <BuildingOfficeIcon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary">
                                        Workspace Memberships
                                    </p>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-display">
                                        {selectedUser.workspaceMemberships.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {selectedUser.workspaceMemberships.map((wm, idx) => (
                                        <div key={idx} className="p-4 glass rounded-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:scale-[1.01] transition-all duration-300">
                                            <div className="flex gap-2 items-center mb-2">
                                                <BuildingOfficeIcon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                                <p className="font-semibold font-display text-light-text-primary dark:text-dark-text-primary">
                                                    {wm.workspaceName || wm.workspaceId}
                                                </p>
                                            </div>
                                            <div className="flex gap-3 items-center text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                                                <span className="flex items-center gap-1.5">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                                                    {wm.role}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <ClockIcon className="w-3.5 h-3.5" />
                                                    Joined {new Date(wm.joinedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};
