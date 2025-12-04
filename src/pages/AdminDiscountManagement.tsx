import React, { useState, useEffect } from 'react';
import {
    TagIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ClipboardDocumentIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import {
    AdminDiscountService,
    Discount,
    DiscountFilters,
    DiscountUsageStats,
    CreateDiscountData,
} from '../services/adminDiscount.service';

export const AdminDiscountManagement: React.FC = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDiscounts, setSelectedDiscounts] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<DiscountFilters>({
        page: 1,
        limit: 20,
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);

    // Form states
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [usageStats, setUsageStats] = useState<DiscountUsageStats | null>(null);
    const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
    const [formData, setFormData] = useState<CreateDiscountData>({
        code: '',
        type: 'percentage',
        amount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxUses: -1,
        applicablePlans: [],
        isActive: true,
    });

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { showNotification } = useNotification();

    const fetchDiscounts = async () => {
        try {
            setRefreshing(true);
            const response = await AdminDiscountService.getDiscounts({
                ...filters,
                search: searchTerm || undefined,
            });
            setDiscounts(response.discounts);
            setPagination(response.pagination);
        } catch (error: any) {
            console.error('Error fetching discounts:', error);
            showNotification(
                error.response?.data?.message || 'Failed to load discounts',
                'error'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, [filters.page, filters.limit, filters.isActive, filters.type, filters.plan]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== undefined) {
                setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleCreateDiscount = async () => {
        try {
            await AdminDiscountService.createDiscount(formData);
            showNotification('Discount created successfully', 'success');
            setIsCreateModalOpen(false);
            resetForm();
            fetchDiscounts();
        } catch (error: any) {
            showNotification(
                error.response?.data?.message || 'Failed to create discount',
                'error'
            );
        }
    };

    const handleUpdateDiscount = async () => {
        if (!editingDiscount) return;

        try {
            await AdminDiscountService.updateDiscount(editingDiscount._id, formData);
            showNotification('Discount updated successfully', 'success');
            setIsEditModalOpen(false);
            setEditingDiscount(null);
            resetForm();
            fetchDiscounts();
        } catch (error: any) {
            showNotification(
                error.response?.data?.message || 'Failed to update discount',
                'error'
            );
        }
    };

    const handleDeleteDiscount = async (id: string) => {
        try {
            await AdminDiscountService.deleteDiscount(id);
            showNotification('Discount deleted successfully', 'success');
            setIsDeleteModalOpen(false);
            fetchDiscounts();
        } catch (error: any) {
            showNotification(
                error.response?.data?.message || 'Failed to delete discount',
                'error'
            );
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedDiscounts.size === 0) return;

        try {
            const ids = Array.from(selectedDiscounts);
            let message = '';

            switch (bulkAction) {
                case 'activate':
                    await AdminDiscountService.bulkActivate(ids);
                    message = 'Discounts activated successfully';
                    break;
                case 'deactivate':
                    await AdminDiscountService.bulkDeactivate(ids);
                    message = 'Discounts deactivated successfully';
                    break;
                case 'delete':
                    await AdminDiscountService.bulkDelete(ids);
                    message = 'Discounts deleted successfully';
                    break;
            }

            showNotification(message, 'success');
            setIsBulkActionModalOpen(false);
            setBulkAction(null);
            setSelectedDiscounts(new Set());
            fetchDiscounts();
        } catch (error: any) {
            showNotification(
                error.response?.data?.message || 'Failed to perform bulk action',
                'error'
            );
        }
    };

    const handleViewUsage = async (id: string) => {
        try {
            const stats = await AdminDiscountService.getDiscountUsage(id);
            setUsageStats(stats);
            setIsUsageModalOpen(true);
        } catch (error: any) {
            showNotification(
                error.response?.data?.message || 'Failed to load usage statistics',
                'error'
            );
        }
    };

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            type: discount.type,
            amount: discount.amount,
            validFrom: new Date(discount.validFrom).toISOString().split('T')[0],
            validUntil: new Date(discount.validUntil).toISOString().split('T')[0],
            maxUses: discount.maxUses,
            applicablePlans: discount.applicablePlans,
            minAmount: discount.minAmount,
            userId: discount.userId,
            isActive: discount.isActive,
            description: discount.description,
        });
        setIsEditModalOpen(true);
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        showNotification('Discount code copied to clipboard', 'success');
    };

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            amount: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            maxUses: -1,
            applicablePlans: [],
            isActive: true,
        });
    };

    const toggleSelectAll = () => {
        if (selectedDiscounts.size === discounts.length) {
            setSelectedDiscounts(new Set());
        } else {
            setSelectedDiscounts(new Set(discounts.map((d) => d._id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedDiscounts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedDiscounts(newSelected);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, code }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient flex justify-center items-center p-6">
                <div className="text-center glass backdrop-blur-xl rounded-2xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-8">
                    <LoadingSpinner />
                    <p className="mt-4 text-base font-display font-semibold gradient-text-primary">
                        Loading discount management...
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
                            <TagIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold gradient-text-primary">
                                Discount Management
                            </h1>
                            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                Create and manage discount codes for subscriptions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md text-primary-600 dark:text-primary-400"
                        >
                            <FunnelIcon className="w-4 h-4" />
                            Filters
                        </button>
                        <button
                            onClick={fetchDiscounts}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold glass bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-primary-200/30 rounded-lg hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-all duration-300 shadow-sm hover:shadow-md text-primary-600 dark:text-primary-400 disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setIsCreateModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold text-white bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl glow-primary hover:scale-105"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Create Discount
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
                                    Search
                                </label>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by code..."
                                        className="input pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
                                    Status
                                </label>
                                <select
                                    value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                                            page: 1,
                                        }))
                                    }
                                    className="input"
                                >
                                    <option value="">All</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
                                    Type
                                </label>
                                <select
                                    value={filters.type || ''}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            type: (e.target.value === 'percentage' || e.target.value === 'fixed')
                                                ? e.target.value
                                                : undefined,
                                            page: 1,
                                        }))
                                    }
                                    className="input"
                                >
                                    <option value="">All</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-light-text-primary dark:text-dark-text-primary">
                                    Plan
                                </label>
                                <select
                                    value={filters.plan || ''}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            plan: e.target.value || undefined,
                                            page: 1,
                                        }))
                                    }
                                    className="input"
                                >
                                    <option value="">All Plans</option>
                                    <option value="plus">Plus</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedDiscounts.size > 0 && (
                    <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 flex items-center justify-between">
                        <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            {selectedDiscounts.size} discount(s) selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setBulkAction('activate');
                                    setIsBulkActionModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-success-600 bg-success-50 dark:bg-success-900/20 rounded-lg hover:bg-success-100 dark:hover:bg-success-900/30 transition-colors"
                            >
                                Activate
                            </button>
                            <button
                                onClick={() => {
                                    setBulkAction('deactivate');
                                    setIsBulkActionModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-warning-600 bg-warning-50 dark:bg-warning-900/20 rounded-lg hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors"
                            >
                                Deactivate
                            </button>
                            <button
                                onClick={() => {
                                    setBulkAction('delete');
                                    setIsBulkActionModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-danger-600 bg-danger-50 dark:bg-danger-900/20 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/30 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* Discounts Table */}
                <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-primary-50/50 to-success-50/50 dark:from-primary-950/30 dark:to-success-950/30 border-b border-primary-200/30">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedDiscounts.size === discounts.length && discounts.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Valid Until
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Uses
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-200/20 dark:divide-primary-800/20">
                                {discounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
                                            No discounts found
                                        </td>
                                    </tr>
                                ) : (
                                    discounts.map((discount) => (
                                        <tr
                                            key={discount._id}
                                            className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDiscounts.has(discount._id)}
                                                    onChange={() => toggleSelect(discount._id)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                        {discount.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopyCode(discount.code)}
                                                        className="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded transition-colors"
                                                        title="Copy code"
                                                    >
                                                        <ClipboardDocumentIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize">
                                                    {discount.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-light-text-primary dark:text-dark-text-primary">
                                                {discount.type === 'percentage' ? (
                                                    <span className="font-semibold">{discount.amount}%</span>
                                                ) : (
                                                    <span className="font-semibold">${discount.amount.toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {discount.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                        <XCircleIcon className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                {new Date(discount.validUntil).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                                                        {discount.usageStats?.totalUses || discount.currentUses}
                                                    </span>
                                                    {discount.maxUses !== -1 && (
                                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                            / {discount.maxUses}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewUsage(discount._id)}
                                                        className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded transition-colors"
                                                        title="View usage"
                                                    >
                                                        <ChartBarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(discount)}
                                                        className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingDiscount(discount);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="px-4 py-3 border-t border-primary-200/30 dark:border-primary-800/30 flex items-center justify-between">
                            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} discounts
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1.5 text-sm font-medium glass rounded-lg border border-primary-200/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1.5 text-sm font-medium glass rounded-lg border border-primary-200/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Discount Modal */}
            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingDiscount(null);
                    resetForm();
                }}
                title={isEditModalOpen ? 'Edit Discount' : 'Create Discount'}
                size="2xl"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setIsEditModalOpen(false);
                                setEditingDiscount(null);
                                resetForm();
                            }}
                            className="px-4 py-2 text-sm font-medium glass rounded-lg border border-primary-200/30 hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={isEditModalOpen ? handleUpdateDiscount : handleCreateDiscount}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {isEditModalOpen ? 'Update' : 'Create'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            Discount Code *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                                }
                                className="input flex-1 font-mono"
                                placeholder="DISCOUNT123"
                                required
                            />
                            <button
                                onClick={generateCode}
                                className="px-3 py-2 text-sm font-medium glass rounded-lg border border-primary-200/30 hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        type: e.target.value as 'percentage' | 'fixed',
                                    }))
                                }
                                className="input"
                                required
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Amount *
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
                                }
                                className="input"
                                min="0"
                                max={formData.type === 'percentage' ? 100 : undefined}
                                step={formData.type === 'percentage' ? 1 : 0.01}
                                required
                            />
                            {formData.type === 'percentage' && (
                                <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    Enter a value between 0 and 100
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Valid From *
                            </label>
                            <input
                                type="date"
                                value={formData.validFrom}
                                onChange={(e) => setFormData((prev) => ({ ...prev, validFrom: e.target.value }))}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Valid Until *
                            </label>
                            <input
                                type="date"
                                value={formData.validUntil}
                                onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Max Uses
                            </label>
                            <input
                                type="number"
                                value={formData.maxUses === -1 ? '' : formData.maxUses}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        maxUses: e.target.value === '' ? -1 : parseInt(e.target.value) || -1,
                                    }))
                                }
                                className="input"
                                min="-1"
                                placeholder="-1 for unlimited"
                            />
                            <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                -1 for unlimited
                            </p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Min Amount
                            </label>
                            <input
                                type="number"
                                value={formData.minAmount || ''}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        minAmount: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined,
                                    }))
                                }
                                className="input"
                                min="0"
                                step="0.01"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            Applicable Plans
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['plus', 'pro', 'enterprise'].map((plan) => (
                                <label key={plan} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.applicablePlans?.includes(plan as any)}
                                        onChange={(e) => {
                                            const plans = formData.applicablePlans || [];
                                            if (e.target.checked) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    applicablePlans: [...plans, plan as any],
                                                }));
                                            } else {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    applicablePlans: plans.filter((p) => p !== plan),
                                                }));
                                            }
                                        }}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-light-text-primary dark:text-dark-text-primary capitalize">
                                        {plan}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            Leave empty to apply to all plans
                        </p>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            Description
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            className="input"
                            rows={3}
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                                Active
                            </span>
                        </label>
                    </div>
                </div>
            </Modal>

            {/* Usage Statistics Modal */}
            <Modal
                isOpen={isUsageModalOpen}
                onClose={() => {
                    setIsUsageModalOpen(false);
                    setUsageStats(null);
                }}
                title="Discount Usage Statistics"
                size="3xl"
            >
                {usageStats ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass rounded-lg p-4 border border-primary-200/30">
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Uses
                                </div>
                                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {usageStats.totalUses}
                                </div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary-200/30">
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Unique Users
                                </div>
                                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
                                    {usageStats.uniqueUsers}
                                </div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary-200/30">
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Total Discount
                                </div>
                                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
                                    ${usageStats.totalDiscountAmount.toFixed(2)}
                                </div>
                            </div>
                            <div className="glass rounded-lg p-4 border border-primary-200/30">
                                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Average Discount
                                </div>
                                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">
                                    ${usageStats.averageDiscountAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {Object.keys(usageStats.usageByPlan).length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-light-text-primary dark:text-dark-text-primary">
                                    Usage by Plan
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(usageStats.usageByPlan).map(([plan, count]) => (
                                        <div
                                            key={plan}
                                            className="flex items-center justify-between glass rounded-lg p-3 border border-primary-200/30"
                                        >
                                            <span className="capitalize text-light-text-primary dark:text-dark-text-primary">
                                                {plan}
                                            </span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {usageStats.recentUsers.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-light-text-primary dark:text-dark-text-primary">
                                    Recent Users
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {usageStats.recentUsers.map((user, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between glass rounded-lg p-3 border border-primary-200/30"
                                        >
                                            <div>
                                                <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                                    {user.userEmail}
                                                </div>
                                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                    {new Date(user.appliedAt).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                    ${user.discountAmount.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                                                    {user.plan}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <LoadingSpinner />
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setEditingDiscount(null);
                }}
                title="Delete Discount"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setEditingDiscount(null);
                            }}
                            className="px-4 py-2 text-sm font-medium glass rounded-lg border border-primary-200/30 hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => editingDiscount && handleDeleteDiscount(editingDiscount._id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <p className="text-light-text-primary dark:text-dark-text-primary">
                    Are you sure you want to delete the discount code{' '}
                    <span className="font-mono font-semibold">{editingDiscount?.code}</span>? This action cannot be
                    undone.
                </p>
            </Modal>

            {/* Bulk Action Confirmation Modal */}
            <Modal
                isOpen={isBulkActionModalOpen}
                onClose={() => {
                    setIsBulkActionModalOpen(false);
                    setBulkAction(null);
                }}
                title={`${bulkAction === 'activate' ? 'Activate' : bulkAction === 'deactivate' ? 'Deactivate' : 'Delete'} Discounts`}
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsBulkActionModalOpen(false);
                                setBulkAction(null);
                            }}
                            className="px-4 py-2 text-sm font-medium glass rounded-lg border border-primary-200/30 hover:bg-primary-500/10 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkAction}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${bulkAction === 'delete'
                                    ? 'bg-danger-600 hover:bg-danger-700'
                                    : 'bg-primary-600 hover:bg-primary-700'
                                }`}
                        >
                            {bulkAction === 'activate'
                                ? 'Activate'
                                : bulkAction === 'deactivate'
                                    ? 'Deactivate'
                                    : 'Delete'}
                        </button>
                    </div>
                }
            >
                <p className="text-light-text-primary dark:text-dark-text-primary">
                    Are you sure you want to {bulkAction} {selectedDiscounts.size} discount(s)?{' '}
                    {bulkAction === 'delete' && 'This action cannot be undone.'}
                </p>
            </Modal>
        </div>
    );
};

