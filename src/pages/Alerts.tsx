// src/pages/Alerts.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { alertService } from "../services/alert.service";
import { Alert } from "../types";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { AlertFilter } from "../components/alerts/AlertFilter";
import { AlertList } from "../components/alerts/AlertList";
import { AlertSummary } from "../components/alerts/AlertSummary";
import { Pagination } from "../components/common/Pagination";
import { useNotification } from "../contexts/NotificationContext";

export const Alerts: React.FC = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    read: "all",
  });

  const {
    data: alerts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["alerts", page, filters],
    queryFn: () =>
      alertService.getAlerts({
        page,
        ...filters,
        severity: filters.severity ? (filters.severity as "low" | "medium" | "high" | "critical") : undefined,
        read:
          filters.read === "all"
            ? undefined
            : filters.read === "unread"
              ? false
              : true,
      }),
    keepPreviousData: true,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-alerts-count"],
    queryFn: () => alertService.getUnreadCount(),
    refetchInterval: 60000, // Refetch every minute
  });

  const markAsReadMutation = useMutation({
    mutationFn: alertService.markAsRead,
    onSuccess: () => {
      showNotification("Alert marked as read.", "success");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["unread-alerts-count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: alertService.deleteAlert,
    onSuccess: () => {
      showNotification("Alert deleted.", "success");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["unread-alerts-count"] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) =>
      alertService.snoozeAlert(id, until),
    onSuccess: () => {
      showNotification("Alert snoozed.", "success");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["unread-alerts-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: alertService.markAllAsRead,
    onSuccess: () => {
      showNotification("All alerts marked as read.", "success");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["unread-alerts-count"] });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ type: "", severity: "", read: "all" });
    setPage(1);
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSnooze = (id: string, until: string) => {
    snoozeMutation.mutate({ id, until });
  };

  const summary = {
    total: alerts?.pagination.total || 0,
    unread: unreadCount?.data.count || 0,
    critical: unreadCount?.data.critical || 0,
    high: unreadCount?.data.high || 0,
    medium: unreadCount?.data.medium || 0,
    low: unreadCount?.data.low || 0,
    byType:
      alerts?.data.reduce((acc: Record<string, number>, alert: Alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {}) || {},
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-danger flex items-center justify-center shadow-lg">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold gradient-text-primary">
                Alerts
              </h1>
            </div>
            <p className="my-2 text-sm text-secondary-600 dark:text-secondary-300">
              Manage and review system alerts and notifications.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => markAllAsReadMutation.mutate()}
              className="glass px-4 py-2 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-300 inline-flex items-center gap-2 font-display font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={markAllAsReadMutation.isPending}
            >
              <BellIcon className="w-4 h-4" />
              {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>
        </div>
      </div>

      <AlertSummary summary={summary} />

      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
        <AlertFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : isError || !alerts ? (
          <div className="glass rounded-xl p-6 border border-danger-200/30 dark:border-danger-500/20 shadow-lg backdrop-blur-xl bg-gradient-to-r from-danger-50/30 to-danger-100/30 dark:from-danger-900/20 dark:to-danger-800/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-danger flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-body text-secondary-900 dark:text-white">
                Failed to load alerts. Please try again.
              </span>
            </div>
          </div>
        ) : alerts.data.length === 0 ? (
          <div className="p-8 text-center text-secondary-600 dark:text-secondary-300">No alerts found.</div>
        ) : (
          <>
            <div className="mt-6">
              <AlertList
                alerts={alerts.data}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onSnooze={handleSnooze}
              />
            </div>
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={alerts.pagination.pages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
