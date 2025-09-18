import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";
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
    <div className={`glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 hover:scale-105 transition-all duration-300 ${className || ""}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <dt className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
            {title}
          </dt>
          <dd>
            {loading ? (
              <div className="w-32 h-10 skeleton" />
            ) : (
              <div className="flex gap-3 items-baseline">
                <span className="text-3xl font-display font-bold gradient-text">
                  {formatValue()}
                </span>
                {change && change.trend !== "stable" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-sm font-display font-bold px-2 py-1 rounded-lg",
                      isPositive && format === "currency"
                        ? "text-danger-600 bg-danger-100/50"
                        : "text-success-600 bg-success-100/50",
                      isNegative && format === "currency"
                        ? "text-success-600 bg-success-100/50"
                        : "text-danger-600 bg-danger-100/50",
                      !format || format === "number"
                        ? isPositive
                          ? "text-success-600 bg-success-100/50"
                          : "text-danger-600 bg-danger-100/50"
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
          <div className="ml-6">
            <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
