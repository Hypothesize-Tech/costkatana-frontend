import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  formatCurrency,
  formatPrompt,
  formatRelativeTime,
} from "@/utils/formatters";
import { TopPrompt } from "@/types";

interface RecentActivityProps {
  topPrompts?: TopPrompt[];
  optimizationOpportunities?: number;
  loading?: boolean;
}

export const RecentActivity = ({
  topPrompts,
  optimizationOpportunities,
  loading,
}: RecentActivityProps) => {
  // Defensive fallback for undefined/null/invalid topPrompts
  const safeTopPrompts: TopPrompt[] = Array.isArray(topPrompts)
    ? topPrompts
    : [];
  // Defensive fallback for undefined/null optimizationOpportunities
  const safeOptimizationOpportunities: number =
    typeof optimizationOpportunities === "number"
      ? optimizationOpportunities
      : 0;

  if (loading) {
    return (
      <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
            <span className="text-lg">🕰️</span>
          </div>
          <h3 className="text-xl font-display font-bold gradient-text">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
            <span className="text-lg">🕰️</span>
          </div>
          <h3 className="text-xl font-display font-bold gradient-text">
            Recent Activity
          </h3>
        </div>
        <Link
          to="/usage"
          className="text-sm font-display font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover:scale-110 transition-all duration-300"
        >
          View all
        </Link>
      </div>

      {safeOptimizationOpportunities > 0 && (
        <div className="p-6 mb-6 rounded-xl glass backdrop-blur-xl border border-warning-200/30 animate-fade-in" style={{ background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(254, 228, 64, 0.1))' }}>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-warning p-3 rounded-xl glow-warning">
              <span className="text-lg text-white">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-warning-700 dark:text-warning-300 mb-2">
                Optimization Opportunities
              </h3>
              <p className="font-body text-warning-600 dark:text-warning-400 mb-4">
                You have {safeOptimizationOpportunities} prompts that could be
                optimized to reduce costs.
              </p>
              <Link
                to="/optimizations"
                className="inline-flex items-center text-sm font-display font-semibold text-warning-700 hover:text-warning-800 dark:text-warning-300 dark:hover:text-warning-200 hover:scale-110 transition-all duration-300"
              >
                View opportunities
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {safeTopPrompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🕰️</div>
            <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              No recent activity to display
            </p>
          </div>
        ) : (
          safeTopPrompts.map((prompt, index) => (
            <div
              key={index}
              className="flex gap-6 justify-between items-start p-4 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300 hover:scale-105"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate mb-2">
                  {formatPrompt(prompt.prompt)}
                </p>
                <div className="flex gap-4 items-center text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                  <span>{prompt.totalCalls} calls</span>
                  <span>•</span>
                  <span>
                    {Array.isArray(prompt.services)
                      ? prompt.services.join(", ")
                      : ""}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(prompt.lastUsed)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-display font-bold gradient-text">
                  {formatCurrency(prompt.totalCost)}
                </p>
                <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                  {formatCurrency(prompt.avgCost)}/call
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
