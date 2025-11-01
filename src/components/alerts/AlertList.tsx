// src/components/alerts/AlertList.tsx
import React from "react";
import { Alert } from "../../types";
import { AlertItem } from "./AlertItem";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { BellIcon, CalendarIcon } from "@heroicons/react/24/outline";

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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-xl mb-6 shadow-xl">
          <BellIcon className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-display font-bold gradient-text-primary mb-2">No alerts</h3>
        <p className="text-lg font-body text-secondary-600 dark:text-secondary-300">You're all caught up!</p>
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
    <div className="space-y-8">
      {Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
        <div key={date} className="animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 rounded-full bg-gradient-primary mr-3 shadow-lg"></div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-display font-semibold gradient-text-primary">
                {date === new Date().toLocaleDateString() ? "Today" : date}
              </h3>
            </div>
          </div>
          <div className="space-y-4">
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
