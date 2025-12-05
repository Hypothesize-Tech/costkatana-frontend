// src/components/alerts/AlertSummary.tsx
import React from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface AlertSummaryProps {
  summary: {
    total: number;
    unread: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  };
}

export const AlertSummary: React.FC<AlertSummaryProps> = ({ summary }) => {
  const severityCards = [
    {
      label: "Critical",
      count: summary.critical,
      icon: XCircleIcon,
      gradient: "bg-gradient-danger",
      textColor: "text-white",
      bgColor: "bg-gradient-to-br from-danger-50 to-danger-100",
    },
    {
      label: "High",
      count: summary.high,
      icon: ExclamationTriangleIcon,
      gradient: "bg-gradient-accent",
      textColor: "text-white",
      bgColor: "bg-gradient-to-br from-accent-50 to-accent-100",
    },
    {
      label: "Medium",
      count: summary.medium,
      icon: InformationCircleIcon,
      gradient: "bg-gradient-to-br from-highlight-500 to-highlight-600",
      textColor: "text-white",
      bgColor: "bg-gradient-to-br from-highlight-50 to-highlight-100",
    },
    {
      label: "Low",
      count: summary.low,
      icon: CheckCircleIcon,
      gradient: "bg-gradient-success",
      textColor: "text-white",
      bgColor: "bg-gradient-to-br from-success-50 to-success-100",
    },
  ];

  return (
    <div className="glass rounded-xl p-4 sm:p-6 md:p-8 border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
          <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">Alert Summary</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="glass rounded-xl p-4 sm:p-6 border border-primary-200/30 dark:border-primary-500/20 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <ClipboardDocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-display font-semibold text-secondary-600 dark:text-secondary-300 truncate">Total Alerts</p>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">{summary.total}</p>
        </div>
        <div className="glass rounded-xl p-4 sm:p-6 border border-primary-200/30 dark:border-primary-500/20 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 hover:scale-105">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-display font-semibold text-primary-600 dark:text-primary-400 truncate">Unread</p>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-primary-700 dark:text-primary-300">{summary.unread}</p>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-display font-semibold gradient-text-secondary">By Severity</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {severityCards.map((card) => (
            <div
              key={card.label}
              className={`glass rounded-xl p-3 sm:p-4 border border-primary-200/30 dark:border-primary-500/20 backdrop-blur-xl hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.gradient} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                  <card.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <p className="text-[10px] sm:text-xs font-display font-bold uppercase tracking-wider text-secondary-600 dark:text-secondary-300 mb-1">
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-display font-bold text-secondary-900 dark:text-white">
                  {card.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type Breakdown */}
      {Object.keys(summary.byType).length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <ClipboardDocumentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-display font-semibold gradient-text-secondary">By Type</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2.5 sm:p-3 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-200 shadow-sm backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <span className="text-xs sm:text-sm font-display font-medium text-secondary-900 dark:text-white truncate pr-2">
                  {type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
                <span className="text-xs sm:text-sm font-display font-bold gradient-text-primary flex-shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
