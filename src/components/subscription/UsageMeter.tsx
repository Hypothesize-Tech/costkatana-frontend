import React from 'react';

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  label,
  used,
  limit,
  unit = '',
  showPercentage = true,
  color = 'primary',
  className = '',
}) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = percentage >= 75 && percentage < 90;
  const isCritical = percentage >= 90;

  const colorClasses = {
    primary: isCritical
      ? 'bg-gradient-to-r from-red-500 to-red-600'
      : isWarning
      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      : 'bg-gradient-to-r from-primary-500 to-primary-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className={`space-y-1.5 sm:space-y-2 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
        <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-semibold text-light-text dark:text-dark-text text-xs sm:text-sm">
            {formatNumber(used)}
            {unit && ` ${unit}`}
          </span>
          {!isUnlimited && (
            <>
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary">/</span>
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs sm:text-sm">
                {formatNumber(limit)}
                {unit && ` ${unit}`}
              </span>
            </>
          )}
          {isUnlimited && (
            <span className="text-primary-500 font-semibold text-xs sm:text-sm">Unlimited</span>
          )}
          {showPercentage && !isUnlimited && (
            <span
              className={`font-semibold text-xs sm:text-sm ${
                isCritical
                  ? 'text-red-500'
                  : isWarning
                  ? 'text-yellow-500'
                  : 'text-primary-500'
              }`}
            >
              ({percentage.toFixed(0)}%)
            </span>
          )}
        </div>
      </div>
      {!isUnlimited && (
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <div
            className={`h-full transition-all duration-500 ease-out ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
          {isWarning && (
            <div className="absolute inset-0 animate-pulse bg-yellow-400/20" />
          )}
          {isCritical && (
            <div className="absolute inset-0 animate-pulse bg-red-400/20" />
          )}
        </div>
      )}
      {isUnlimited && (
        <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-primary-500/20 to-primary-600/20" />
      )}
    </div>
  );
};

