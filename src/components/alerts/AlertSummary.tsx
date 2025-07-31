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
      color: "text-red-600 bg-red-100",
    },
    {
      label: "High",
      count: summary.high,
      icon: ExclamationTriangleIcon,
      color: "text-orange-600 bg-orange-100",
    },
    {
      label: "Medium",
      count: summary.medium,
      icon: InformationCircleIcon,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Low",
      count: summary.low,
      icon: CheckCircleIcon,
      color: "text-blue-600 bg-blue-100",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Alert Summary</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm font-medium text-indigo-600">Unread</p>
          <p className="text-2xl font-bold text-indigo-900">{summary.unread}</p>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">By Severity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {severityCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-lg p-3 ${card.color.split(" ")[1]}`}
            >
              <div className="flex items-center">
                <card.icon
                  className={`h-5 w-5 ${card.color.split(" ")[0]} mr-2`}
                />
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    {card.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {card.count}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Type Breakdown */}
      {Object.keys(summary.byType).length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">By Type</h3>
          <div className="space-y-2">
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {type
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
                <span className="text-sm font-medium text-gray-900">
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
