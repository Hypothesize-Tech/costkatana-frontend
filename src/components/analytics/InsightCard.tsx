// src/components/analytics/InsightCard.tsx
import React from "react";
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface InsightCardProps {
  insight: {
    type: "cost_spike" | "usage_pattern" | "optimization" | "anomaly" | "trend";
    title: string;
    description: string;
    impact?: string;
    recommendation?: string;
    severity?: "low" | "medium" | "high";
  };
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getIcon = () => {
    switch (insight.type) {
      case "cost_spike":
        return <ExclamationTriangleIcon className="h-6 w-6" />;
      case "usage_pattern":
        return <ArrowTrendingUpIcon className="h-6 w-6" />;
      case "optimization":
        return <LightBulbIcon className="h-6 w-6" />;
      default:
        return <InformationCircleIcon className="h-6 w-6" />;
    }
  };

  const getIconColor = () => {
    switch (insight.severity) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  const getBorderColor = () => {
    switch (insight.severity) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBorderColor()}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${getIconColor()}`}>{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{insight.description}</p>

          {insight.impact && (
            <p className="mt-2 text-sm font-medium text-gray-700">
              Impact: <span className="font-normal">{insight.impact}</span>
            </p>
          )}

          {insight.recommendation && (
            <div className="mt-3 text-sm">
              <p className="font-medium text-gray-700">Recommendation:</p>
              <p className="text-gray-600">{insight.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
