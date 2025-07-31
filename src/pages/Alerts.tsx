// src/pages/Alerts.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
        severity: (filters.severity as any) || undefined,
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Alerts
          </h1>
          <p className="my-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and review system alerts and notifications.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => markAllAsReadMutation.mutate()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <AlertSummary summary={summary} />

      <div className="mt-8 card p-4">
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
          <div className="p-8 text-center text-red-500">
            Failed to load alerts. Please try again.
          </div>
        ) : alerts.data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No alerts found.</div>
        ) : (
          <>
            <AlertList
              alerts={alerts.data}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onSnooze={handleSnooze}
            />
            <Pagination
              currentPage={page}
              totalPages={alerts.pagination.pages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
