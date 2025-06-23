// src/pages/Alerts.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { BellIcon, CogIcon } from '@heroicons/react/24/outline';
import { alertService } from '../services/alert.service';
import { AlertList } from '../components/alerts/AlertList';
import { AlertFilter } from '../components/alerts/AlertFilter';
import { AlertSummary } from '../components/alerts/AlertSummary';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { useNotifications } from '../contexts/NotificationContext';

export const Alerts: React.FC = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        type: '',
        severity: '',
        read: '',
    });
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const { data: alerts, isLoading } = useQuery(
        ['alerts', page, filters],
        () => alertService.getAlerts({
            page,
            limit: 10,
            type: filters.type || undefined,
            severity: filters.severity as any || undefined,
            read: filters.read === 'read' ? true : filters.read === 'unread' ? false : undefined,
        }),
        {
            keepPreviousData: true,
        }
    );

    const { data: unreadCount } = useQuery(
        'unread-alerts-count',
        alertService.getUnreadCount,
        {
            refetchInterval: 30000, // Refresh every 30 seconds
        }
    );

    const markAsReadMutation = useMutation(
        (id: string) => alertService.markAsRead(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('alerts');
                queryClient.invalidateQueries('unread-alerts-count');
            },
        }
    );

    const markAllAsReadMutation = useMutation(
        () => alertService.markAllAsRead(),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('alerts');
                queryClient.invalidateQueries('unread-alerts-count');
                showNotification('All alerts marked as read', 'success');
            },
        }
    );

    const deleteMutation = useMutation(
        (id: string) => alertService.deleteAlert(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('alerts');
                queryClient.invalidateQueries('unread-alerts-count');
                showNotification('Alert deleted', 'success');
            },
        }
    );

    const snoozeMutation = useMutation(
        ({ id, until }: { id: string; until: string }) =>
            alertService.snoozeAlert(id, until),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('alerts');
                showNotification('Alert snoozed', 'success');
            },
        }
    );

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({ type: '', severity: '', read: '' });
        setPage(1);
    };

    const handleMarkAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this alert?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSnooze = (id: string, until: string) => {
        snoozeMutation.mutate({ id, until });
    };

    if (isLoading) return <LoadingSpinner />;

    const summary = {
        total: alerts?.pagination.total || 0,
        unread: unreadCount?.data.count || 0,
        critical: unreadCount?.data.critical || 0,
        high: unreadCount?.data.high || 0,
        medium: unreadCount?.data.medium || 0,
        low: unreadCount?.data.low || 0,
        byType: alerts?.data.reduce((acc, alert) => {
            acc[alert.type] = (acc[alert.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {},
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <BellIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
                            <p className="mt-1 text-gray-600">
                                Stay informed about important events and optimizations
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {unreadCount && unreadCount.data.count > 0 && (
                            <button
                                onClick={() => markAllAsReadMutation.mutate()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Mark all as read
                            </button>
                        )}
                        <button
                            onClick={() => window.location.href = '/settings?tab=notifications'}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <CogIcon className="h-4 w-4 mr-2" />
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Summary and Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <AlertSummary summary={summary} />
                    <AlertFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetFilters}
                    />
                </div>

                {/* Right Column - Alert List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <AlertList
                            alerts={alerts?.data || []}
                            loading={isLoading}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                            onSnooze={handleSnooze}
                        />

                        {alerts && alerts.pagination.pages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={page}
                                    totalPages={alerts.pagination.pages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};