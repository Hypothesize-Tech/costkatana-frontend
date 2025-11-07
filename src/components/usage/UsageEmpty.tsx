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
      <div className="py-12 text-center">
        <ChartBarIcon className="mx-auto w-12 h-12 text-secondary-500 dark:text-secondary-400" />
        <h3 className="mt-2 text-sm font-bold font-display gradient-text-primary">
          No results found
        </h3>
        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
          Try adjusting your filters or search query
        </p>
        {onClearFilters && (
          <div className="mt-6">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-12 text-center">
      <ChartBarIcon className="mx-auto w-12 h-12 text-secondary-500 dark:text-secondary-400" />
      <h3 className="mt-2 text-sm font-bold font-display gradient-text-primary">
        No usage data yet
      </h3>
      <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
        Get started by tracking your AI API usage
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium font-display text-secondary-900 dark:text-white">
            Quick Start:
          </h4>
          <ol className="inline-block space-y-2 text-sm text-left text-secondary-600 dark:text-secondary-300">
            <li>1. Add your API keys in Settings</li>
            <li>2. Install our SDK or browser extension</li>
            <li>3. Make API calls - usage will be tracked automatically</li>
          </ol>
        </div>

        {onImport && (
          <div>
            <p className="mb-3 text-sm text-secondary-600 dark:text-secondary-300">
              Or import existing usage data:
            </p>
            <button
              onClick={onImport}
              className="inline-flex items-center btn btn-secondary"
            >
              Import Usage Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
