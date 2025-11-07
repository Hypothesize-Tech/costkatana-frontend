import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/helpers";
import {
  formatCurrency,
  formatNumber,
  formatPercentageChange,
} from "@/utils/formatters";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  change?: {
    value: number;
    percentage: number;
    trend: "up" | "down" | "stable";
  };
  className?: string;
  format?: "currency" | "number" | "percentage";
  loading?: boolean;
}

export const StatsCard = ({
  title,
  value,
  change,
  format = "number",
  icon: Icon,
  loading = false,
  className,
}: StatsCardProps) => {
  const formatValue = () => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return formatNumber(value);
    }
  };

  const isPositive = change?.trend === "up";
  const isNegative = change?.trend === "down";

  return (
    <div className={`group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl hover:border-primary-300/50 dark:hover:border-primary-400/30 animate-fade-in ${className || ""}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <dt className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
            {title}
          </dt>
          <dd>
            {loading ? (
              <div className="w-32 h-10 skeleton" />
            ) : (
              <div className="flex flex-wrap gap-3 items-baseline">
                <span className="text-3xl font-display font-bold gradient-text-primary">
                  {formatValue()}
                </span>
                {change && change.trend !== "stable" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-display font-semibold px-3 py-1.5 rounded-full border",
                      isPositive && format === "currency"
                        ? "text-danger-700 dark:text-danger-300 bg-gradient-to-r from-danger-500/20 to-danger-600/20 border-danger-300/30 dark:border-danger-500/20"
                        : "text-success-700 dark:text-success-300 bg-gradient-to-r from-success-500/20 to-success-600/20 border-success-300/30 dark:border-success-500/20",
                      isNegative && format === "currency"
                        ? "text-success-700 dark:text-success-300 bg-gradient-to-r from-success-500/20 to-success-600/20 border-success-300/30 dark:border-success-500/20"
                        : "text-danger-700 dark:text-danger-300 bg-gradient-to-r from-danger-500/20 to-danger-600/20 border-danger-300/30 dark:border-danger-500/20",
                      !format || format === "number"
                        ? isPositive
                          ? "text-success-700 dark:text-success-300 bg-gradient-to-r from-success-500/20 to-success-600/20 border-success-300/30 dark:border-success-500/20"
                          : "text-danger-700 dark:text-danger-300 bg-gradient-to-r from-danger-500/20 to-danger-600/20 border-danger-300/30 dark:border-danger-500/20"
                        : "",
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpIcon className="flex-shrink-0 w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="flex-shrink-0 w-4 h-4" />
                    )}
                    <span className="sr-only">
                      {isPositive ? "Increased" : "Decreased"} by
                    </span>
                    {formatPercentageChange(change.percentage)}
                  </span>
                )}
              </div>
            )}
          </dd>
        </div>
        {Icon && (
          <div className="ml-6 shrink-0">
            <div className="p-3.5 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
