import { Link } from "react-router-dom";
import { ArrowRightIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
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
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-display gradient-text-primary">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.01] hover:shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-display gradient-text-primary">
            Recent Activity
          </h3>
        </div>
        <Link
          to="/usage"
          className="inline-flex items-center gap-2 text-sm font-display font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 hover:scale-110 transition-all duration-300"
        >
          View all
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {safeOptimizationOpportunities > 0 && (
        <div className="p-6 mb-6 rounded-xl glass backdrop-blur-xl border border-warning-200/30 dark:border-warning-500/20 bg-gradient-to-br from-warning-50/50 to-warning-100/30 dark:from-warning-900/10 dark:to-warning-800/10 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg bg-gradient-warning glow-warning">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold gradient-text-warning mb-2">
                Optimization Opportunities
              </h3>
              <p className="text-base font-body text-light-text-secondary dark:text-dark-text-secondary mb-4">
                You have {safeOptimizationOpportunities} prompts that could be
                optimized to reduce costs.
              </p>
              <Link
                to="/optimizations"
                className="inline-flex items-center gap-2 text-sm font-display font-semibold gradient-text-warning hover:scale-110 transition-all duration-300"
              >
                View opportunities
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {safeTopPrompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-primary/10">
              <ClockIcon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
            </div>
            <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              No recent activity to display
            </p>
          </div>
        ) : (
          safeTopPrompts.map((prompt, index) => (
            <div
              key={index}
              className="group/item flex gap-6 justify-between items-start p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate mb-2">
                  {formatPrompt(prompt.prompt)}
                </p>
                <div className="flex flex-wrap gap-3 items-center text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
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
              <div className="text-right shrink-0">
                <p className="text-lg font-display font-bold gradient-text-primary">
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
