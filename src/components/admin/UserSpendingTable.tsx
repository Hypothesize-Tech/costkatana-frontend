import React, { useState } from 'react';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ArrowDownTrayIcon,
    CurrencyDollarIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { UserSpendingSummary } from '../../services/adminUserSpending.service';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { UserSpendingModal } from './UserSpendingModal';

interface UserSpendingTableProps {
    users: UserSpendingSummary[];
    loading?: boolean;
    onExport?: () => void;
}

type SortField = 'totalCost' | 'totalTokens' | 'totalRequests' | 'userEmail' | 'userName';
type SortDirection = 'asc' | 'desc';

export const UserSpendingTable: React.FC<UserSpendingTableProps> = ({
    users,
    loading = false,
    onExport,
}) => {
    const [sortField, setSortField] = useState<SortField>('totalCost');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedUser, setSelectedUser] = useState<UserSpendingSummary | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        if (sortField === 'userEmail' || sortField === 'userName') {
            aValue = aValue?.toLowerCase() || '';
            bValue = bValue?.toLowerCase() || '';
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const totalPages = Math.ceil(sortedUsers.length / pageSize);
    const paginatedUsers = sortedUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const toggleRowExpansion = (userId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedRows(newExpanded);
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return (
                <div className="flex flex-col">
                    <ArrowUpIcon className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary opacity-40" />
                    <ArrowDownIcon className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary opacity-40 -mt-1" />
                </div>
            );
        }
        return sortDirection === 'asc' ? (
            <ArrowUpIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        ) : (
            <ArrowDownIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        );
    };

    if (loading) {
        return (
            <div className="glass backdrop-blur-xl rounded-xl p-8 border border-primary-200/30 shadow-lg">
                <div className="skeleton h-64 rounded-lg" />
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="glass backdrop-blur-xl rounded-xl p-12 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text-primary mb-2">
                        No User Data
                    </h3>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                        No user spending data found for the selected filters.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 overflow-hidden">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 border-b border-primary-200/30">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 sm:p-2 rounded-lg glow-primary shadow-sm">
                        <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-display font-bold gradient-text-primary">
                            User Spending
                        </h3>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {users.length} user{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                {onExport && (
                    <button
                        onClick={onExport}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md text-primary-600 dark:text-primary-400 w-full sm:w-auto justify-center"
                    >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Export
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[700px]">
                    <thead className="bg-primary-50/30 dark:bg-primary-900/10">
                        <tr>
                            <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left">
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                    User
                                </span>
                            </th>
                            <th
                                className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left cursor-pointer hover:bg-primary-100/30 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('totalCost')}
                            >
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                        Total Cost
                                    </span>
                                    <SortIcon field="totalCost" />
                                </div>
                            </th>
                            <th
                                className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left cursor-pointer hover:bg-primary-100/30 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('totalTokens')}
                            >
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                        Tokens
                                    </span>
                                    <SortIcon field="totalTokens" />
                                </div>
                            </th>
                            <th
                                className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left cursor-pointer hover:bg-primary-100/30 dark:hover:bg-primary-800/20 transition-colors"
                                onClick={() => handleSort('totalRequests')}
                            >
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                        Requests
                                    </span>
                                    <SortIcon field="totalRequests" />
                                </div>
                            </th>
                            <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left">
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                    Avg Cost/Req
                                </span>
                            </th>
                            <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left">
                                <span className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                                    Last Activity
                                </span>
                            </th>
                            <th className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-left w-10 sm:w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-200/30">
                        {paginatedUsers.map((user) => {
                            const isExpanded = expandedRows.has(user.userId);
                            return (
                                <React.Fragment key={user.userId}>
                                    <tr
                                        className="hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs sm:text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    {user.userName || 'Unknown User'}
                                                </span>
                                                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary truncate">
                                                    {user.userEmail}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <span className="text-xs sm:text-sm font-display font-semibold gradient-text-primary">
                                                {formatCurrency(user.totalCost)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <span className="text-xs sm:text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                                {formatNumber(user.totalTokens)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <span className="text-xs sm:text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                                {formatNumber(user.totalRequests)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <span className="text-xs sm:text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                                                {formatCurrency(user.averageCostPerRequest)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                {formatDate(user.lastActivity, 'MMM d, yyyy')}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleRowExpansion(user.userId);
                                                }}
                                                className="p-1 hover:bg-primary-100/30 dark:hover:bg-primary-800/20 rounded-lg transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                                                ) : (
                                                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-primary-50/10 dark:bg-primary-900/5">
                                            <td colSpan={7} className="px-3 sm:px-4 md:px-5 py-3 sm:py-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                                    {/* Services Breakdown */}
                                                    <div>
                                                        <h4 className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 uppercase tracking-wider">
                                                            Services
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {user.services.slice(0, 5).map((service) => (
                                                                <div
                                                                    key={service.service}
                                                                    className="flex items-center justify-between text-xs"
                                                                >
                                                                    <span className="font-body text-light-text-primary dark:text-dark-text-primary">
                                                                        {service.service}
                                                                    </span>
                                                                    <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                                        {formatCurrency(service.cost)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Models Breakdown */}
                                                    <div>
                                                        <h4 className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 uppercase tracking-wider">
                                                            Top Models
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {user.models.slice(0, 5).map((model) => (
                                                                <div
                                                                    key={model.model}
                                                                    className="flex items-center justify-between text-xs"
                                                                >
                                                                    <span className="font-body text-light-text-primary dark:text-dark-text-primary truncate max-w-[120px]">
                                                                        {model.model}
                                                                    </span>
                                                                    <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                                        {formatCurrency(model.cost)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Projects/Workflows */}
                                                    <div>
                                                        <h4 className="text-xs font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 uppercase tracking-wider">
                                                            Projects
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {user.projects.length > 0 ? (
                                                                user.projects.slice(0, 5).map((project) => (
                                                                    <div
                                                                        key={project.projectId}
                                                                        className="flex items-center justify-between text-xs"
                                                                    >
                                                                        <span className="font-body text-light-text-primary dark:text-dark-text-primary truncate max-w-[120px]">
                                                                            {project.projectName || 'Unknown Project'}
                                                                        </span>
                                                                        <span className="font-display font-semibold text-primary-600 dark:text-primary-400">
                                                                            {formatCurrency(project.cost)}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                                                                    No projects
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-t border-primary-200/30">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Show
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-2 py-1 text-xs font-display font-medium glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg focus:ring-2 focus:ring-primary-500/50 text-light-text-primary dark:text-dark-text-primary"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            per page
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 text-light-text-primary dark:text-dark-text-primary"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 text-light-text-primary dark:text-dark-text-primary"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* User Spending Modal */}
            <UserSpendingModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
};

