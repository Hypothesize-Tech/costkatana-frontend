// src/components/alerts/AlertList.tsx
import React from "react";
import { Alert } from "../../types";
import { AlertItem } from "./AlertItem";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface AlertListProps {
  alerts: Alert[];
  loading?: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string, until: string) => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  loading = false,
  onMarkAsRead,
  onDelete,
  onSnooze,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts</h3>
        <p className="text-sm text-gray-500">You're all caught up!</p>
      </div>
    );
  }

  const groupedAlerts = alerts.reduce(
    (groups, alert) => {
      const date = new Date(alert.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(alert);
      return groups;
    },
    {} as Record<string, Alert[]>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            {date === new Date().toLocaleDateString() ? "Today" : date}
          </h3>
          <div className="space-y-3">
            {dateAlerts.map((alert) => (
              <AlertItem
                key={alert._id}
                alert={alert}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onSnooze={onSnooze}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
