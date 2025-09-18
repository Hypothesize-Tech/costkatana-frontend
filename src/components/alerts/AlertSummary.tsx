// src/components/alerts/AlertSummary.tsx
import React from "react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
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
    <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mr-4 shadow-lg glow-primary">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-display font-bold gradient-text">📊 Alert Summary</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 border border-primary-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <p className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">📋 Total Alerts</p>
          <p className="text-3xl font-display font-bold gradient-text">{summary.total}</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-primary-200/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary-50/50 to-primary-100/50 hover:scale-105">
          <p className="text-sm font-display font-semibold text-primary-600 dark:text-primary-400 mb-2">🔔 Unread</p>
          <p className="text-3xl font-display font-bold text-primary-700 dark:text-primary-300">{summary.unread}</p>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary">By Severity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {severityCards.map((card) => (
            <div
              key={card.label}
              className={`glass rounded-2xl p-4 ${card.bgColor} border border-primary-200/30 backdrop-blur-xl hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl ${card.gradient} flex items-center justify-center mb-3 shadow-lg glow-${card.label.toLowerCase()}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-light-text-muted dark:text-dark-text-muted mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  {card.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type Breakdown */}
      {Object.keys(summary.byType).length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">📋 By Type</h3>
          <div className="space-y-3">
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-200 shadow-sm backdrop-blur-xl">
                <span className="text-sm font-display font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  {type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
                <span className="text-sm font-display font-bold gradient-text">
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
