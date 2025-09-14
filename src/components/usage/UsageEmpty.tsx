// src/components/usage/UsageEmpty.tsx
import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface UsageEmptyProps {
  onImport?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export const UsageEmpty: React.FC<UsageEmptyProps> = ({
  onImport,
  hasFilters = false,
  onClearFilters,
}) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-light-text-tertiary dark:text-dark-text-tertiary" />
        <h3 className="mt-2 text-sm font-display font-bold gradient-text-primary">
          No results found
        </h3>
        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Try adjusting your filters or search query
        </p>
        {onClearFilters && (
          <div className="mt-6">
            <button
              onClick={onClearFilters}
              className="btn-primary inline-flex items-center"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <ChartBarIcon className="mx-auto h-12 w-12 text-light-text-tertiary dark:text-dark-text-tertiary" />
      <h3 className="mt-2 text-sm font-display font-bold gradient-text-primary">
        No usage data yet
      </h3>
      <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        Get started by tracking your AI API usage
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="text-sm font-display font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
            Quick Start:
          </h4>
          <ol className="text-sm text-light-text-secondary dark:text-dark-text-secondary space-y-2 text-left inline-block">
            <li>1. Add your API keys in Settings</li>
            <li>2. Install our SDK or browser extension</li>
            <li>3. Make API calls - usage will be tracked automatically</li>
          </ol>
        </div>

        {onImport && (
          <div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
              Or import existing usage data:
            </p>
            <button
              onClick={onImport}
              className="btn-secondary inline-flex items-center"
            >
              Import Usage Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
