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

  const getBorderColor = () => {
    switch (insight.severity) {
      case "high":
        return "border-danger-200/50 bg-gradient-to-br from-danger-50 to-danger-100/50 glow-danger";
      case "medium":
        return "border-accent-200/50 bg-gradient-to-br from-accent-50 to-accent-100/50";
      default:
        return "border-primary-200/50 bg-gradient-to-br from-primary-50 to-primary-100/50";
    }
  };

  const getGradientIcon = () => {
    switch (insight.severity) {
      case "high":
        return "bg-gradient-danger";
      case "medium":
        return "bg-gradient-accent";
      default:
        return "bg-gradient-primary";
    }
  };

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-xl ${getBorderColor()} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getGradientIcon()} flex items-center justify-center shadow-lg mr-4`}>
          <div className="text-white">
            {getIcon()}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">{insight.title}</h3>
          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3">{insight.description}</p>

          {insight.impact && (
            <div className="mb-3 p-3 rounded-xl glass border border-white/20">
              <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                Impact: <span className="gradient-text-accent font-normal">{insight.impact}</span>
              </p>
            </div>
          )}

          {insight.recommendation && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50/50 to-secondary-50/50 border border-primary-200/30">
              <p className="text-sm font-display font-semibold text-primary-700 dark:text-primary-300 mb-2">💡 Recommendation:</p>
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">{insight.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
