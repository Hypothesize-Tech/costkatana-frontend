import React from "react";
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
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
        return "border-danger-200/50 dark:border-danger-500/20";
      case "medium":
        return "border-accent-200/50 dark:border-accent-500/20";
      default:
        return "border-primary-200/30 dark:border-primary-500/20";
    }
  };

  const getBackgroundColor = () => {
    switch (insight.severity) {
      case "high":
        return "bg-gradient-light-panel dark:bg-gradient-dark-panel";
      case "medium":
        return "bg-gradient-light-panel dark:bg-gradient-dark-panel";
      default:
        return "bg-gradient-light-panel dark:bg-gradient-dark-panel";
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
    <div className={`group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass ${getBorderColor()} ${getBackgroundColor()} hover:scale-[1.01] hover:shadow-2xl`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getGradientIcon()} flex items-center justify-center shadow-lg glow-primary group-hover:scale-110 transition-transform duration-300 p-2`}>
          <div className="text-white">
            {getIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-display font-bold gradient-text-primary mb-2">{insight.title}</h3>
          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">{insight.description}</p>

          {insight.impact && (
            <div className="mb-4 p-3 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20 shadow-sm backdrop-blur-xl bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 text-accent-600 dark:text-accent-400 shrink-0" />
                <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                  Impact: <span className="gradient-text-accent font-normal">{insight.impact}</span>
                </p>
              </div>
            </div>
          )}

          {insight.recommendation && (
            <div className="p-3 rounded-lg glass bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl">
              <div className="flex items-start gap-2 mb-2">
                <LightBulbIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                <p className="text-sm font-display font-semibold text-primary-700 dark:text-primary-300">Recommendation:</p>
              </div>
              <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary ml-6">{insight.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
