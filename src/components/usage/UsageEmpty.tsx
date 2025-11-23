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
      <div className="py-8 sm:py-12 text-center">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 dark:from-gray-600/30 dark:to-gray-700/30 flex items-center justify-center mb-4">
          <ChartBarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-500 dark:text-secondary-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold font-display gradient-text-primary">
          No results found
        </h3>
        <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
          Try adjusting your filters or search query
        </p>
        {onClearFilters && (
          <div className="mt-6">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 text-center">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#06ec9e]/20 via-emerald-500/20 to-[#009454]/20 dark:from-[#06ec9e]/30 dark:via-emerald-500/30 dark:to-[#009454]/30 flex items-center justify-center mb-4">
        <ChartBarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#06ec9e] dark:text-emerald-400" />
      </div>
      <h3 className="text-base sm:text-lg font-bold font-display gradient-text-primary">
        No usage data yet
      </h3>
      <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
        Get started by tracking your AI API usage
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="mb-3 text-sm font-medium font-display text-secondary-900 dark:text-white">
            Quick Start:
          </h4>
          <ol className="inline-block space-y-2 text-sm text-left text-secondary-600 dark:text-secondary-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06ec9e]"></span>
              Add your API keys in Settings
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06ec9e]"></span>
              Install our SDK or browser extension
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#06ec9e]"></span>
              Make API calls - usage will be tracked automatically
            </li>
          </ol>
        </div>

        {onImport && (
          <div>
            <p className="mb-3 text-sm text-secondary-600 dark:text-secondary-300">
              Or import existing usage data:
            </p>
            <button
              onClick={onImport}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-primary-200/30 dark:border-primary-700/30 bg-white/50 dark:bg-dark-card/50 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400/50 transition-all duration-300 min-h-[44px] [touch-action:manipulation] active:scale-95"
            >
              Import Usage Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
