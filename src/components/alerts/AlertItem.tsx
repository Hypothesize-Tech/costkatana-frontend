// src/components/alerts/AlertItem.tsx
import React, { useState } from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  BellSlashIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Alert } from "../../types";
import { formatDate, formatCurrency } from "../../utils/formatters";

interface AlertItemProps {
  alert: Alert;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSnooze: (id: string, until: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({
  alert,
  onMarkAsRead,
  onDelete,
  onSnooze,
}) => {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  const getIcon = () => {
    const iconProps = "h-6 w-6";

    switch (alert.severity) {
      case "critical":
        return <XCircleIcon className={`${iconProps} text-danger-500`} />;
      case "high":
        return (
          <ExclamationTriangleIcon className={`${iconProps} text-accent-500`} />
        );
      case "medium":
        return (
          <InformationCircleIcon className={`${iconProps} text-highlight-500`} />
        );
      case "low":
        return <CheckCircleIcon className={`${iconProps} text-success-500`} />;
      default:
        return <BellIcon className={`${iconProps} text-primary-500`} />;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case "critical":
        return "border-danger-200/50 bg-gradient-to-br from-danger-50 to-danger-100/50 glow-danger";
      case "high":
        return "border-accent-200/50 bg-gradient-to-br from-accent-50 to-accent-100/50";
      case "medium":
        return "border-highlight-200/50 bg-gradient-to-br from-highlight-50 to-highlight-100/50";
      case "low":
        return "border-success-200/50 bg-gradient-to-br from-success-50 to-success-100/50";
      default:
        return "border-primary-200/50 bg-gradient-to-br from-primary-50 to-primary-100/50";
    }
  };

  const handleSnooze = (hours: number) => {
    const until = new Date();
    until.setHours(until.getHours() + hours);
    onSnooze(alert._id, until.toISOString());
    setShowSnoozeMenu(false);
  };

  return (
    <div
      className={`p-6 glass rounded-2xl border backdrop-blur-xl ${getSeverityColor()} ${!alert.read ? "ring-2 ring-primary-500 ring-opacity-50 shadow-2xl" : "shadow-lg"
        } transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-xl glass backdrop-blur-xl flex items-center justify-center shadow-lg border border-primary-200/30">
          {getIcon()}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{alert.title}</h3>
          <p className="mt-2 text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{alert.message}</p>

          {/* Metadata */}
          {alert.data && (
            <div className="mt-3 p-3 rounded-xl glass border border-primary-200/30 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {alert.type === "cost_threshold" && alert.data.amount && (
                  <span className="gradient-text-accent">💰 Amount: {formatCurrency(alert.data.amount)}</span>
                )}
                {alert.type === "optimization_available" &&
                  alert.data.savings && (
                    <span className="gradient-text-success">
                      💡 Potential savings: {formatCurrency(alert.data.savings)}
                    </span>
                  )}
                {alert.type === "usage_spike" && alert.data.deviation && (
                  <span className="gradient-text">📊 Deviation: {alert.data.deviation.toFixed(1)}%</span>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
              {formatDate(alert.createdAt, "relative")}
            </span>

            <div className="flex items-center space-x-3">
              {!alert.read && (
                <button
                  onClick={() => onMarkAsRead(alert._id)}
                  className="btn-ghost text-xs px-3 py-1"
                >
                  Mark as read
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                  className="btn-ghost text-xs px-3 py-1 flex items-center"
                >
                  <BellSlashIcon className="h-4 w-4 mr-1" />
                  Snooze
                </button>

                {showSnoozeMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass shadow-2xl py-2 z-20 animate-scale-in border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <button
                      onClick={() => handleSnooze(1)}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 transition-colors duration-200"
                    >
                      ⏰ 1 hour
                    </button>
                    <button
                      onClick={() => handleSnooze(4)}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 transition-colors duration-200"
                    >
                      🕐 4 hours
                    </button>
                    <button
                      onClick={() => handleSnooze(24)}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 transition-colors duration-200"
                    >
                      📅 1 day
                    </button>
                    <button
                      onClick={() => handleSnooze(168)}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 transition-colors duration-200"
                    >
                      📆 1 week
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => onDelete(alert._id)}
                className="p-2 rounded-lg text-danger-500 hover:bg-danger-500/10 transition-all duration-200 hover:scale-110"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
