import React from "react";
import { CircleStackIcon } from "@heroicons/react/24/outline";

export const CacheShimmer: React.FC = () => {
  return (
    <div className="p-3 mx-auto space-y-4 sm:p-4 sm:space-y-5 md:p-6 md:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 justify-between items-start sm:gap-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex gap-3 items-center sm:gap-4 md:gap-5">
            <div className="p-2 rounded-2xl shadow-xl bg-gradient-primary/20 shrink-0 sm:p-3 md:p-4">
              <CircleStackIcon className="w-6 h-6 text-primary-500/50 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-2 w-full h-7 rounded skeleton sm:w-48 sm:h-8 md:w-64 md:h-9" />
              <div className="w-full h-4 rounded skeleton sm:w-72 sm:h-4 md:w-96 md:h-5" />
            </div>
          </div>
          <div className="w-full h-10 rounded-lg skeleton sm:w-32 sm:h-11" />
        </div>
      </div>

      {/* Cache Provider Info */}
      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 md:p-8">
        <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
          <div className="p-2 rounded-xl shadow-lg bg-gradient-primary/20 mr-3 sm:p-3 md:p-3.5 md:mr-4">
            <div className="w-6 h-6 rounded skeleton sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <div className="w-full h-6 rounded skeleton sm:w-40 sm:h-6 md:w-48 md:h-7" />
        </div>
        <div className="mb-4 w-full h-5 rounded skeleton sm:w-28 sm:h-5 sm:mb-4 md:w-32 md:h-6 md:mb-5" />
        <div className="flex flex-wrap gap-2 mb-4 sm:gap-3 sm:mb-5 md:gap-3 md:mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-8 rounded-full skeleton sm:w-36 sm:h-8 md:w-40 md:h-9" />
          ))}
        </div>
        <div className="p-3 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 sm:p-4 md:p-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded skeleton sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <div className="w-full h-4 rounded skeleton sm:w-56 sm:h-4 md:w-64 md:h-5" />
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
            <div className="flex gap-3 items-start sm:gap-4 md:gap-4">
              <div className="p-2 rounded-xl shadow-lg bg-gradient-primary/20 shrink-0 sm:p-3 md:p-3.5">
                <div className="w-6 h-6 rounded skeleton sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2 w-full h-7 rounded skeleton sm:w-20 sm:h-8 md:w-24 md:h-9" />
                <div className="w-full h-3.5 rounded skeleton sm:w-28 sm:h-4 md:w-32 md:h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
            <div className="flex gap-3 items-center sm:gap-4 md:gap-4">
              <div className="p-2 rounded-xl shadow-lg bg-gradient-primary/20 shrink-0 sm:p-2 md:p-3">
                <div className="w-5 h-5 rounded skeleton sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 w-full h-6 rounded skeleton sm:w-28 sm:h-6.5 md:w-32 md:h-7" />
                <div className="w-full h-3.5 rounded skeleton sm:w-24 sm:h-4 md:w-28 md:h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2">
        {/* Advanced Cache Metrics */}
        <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
          <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-4 md:gap-3 md:mb-5">
            <div className="p-2 rounded-xl shadow-lg bg-gradient-primary/20 sm:p-2 md:p-3">
              <div className="w-5 h-5 rounded skeleton sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-5.5 md:w-56 md:h-6" />
          </div>
          <div className="space-y-3 sm:space-y-4 md:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3 md:p-4">
                <div className="w-full h-3 rounded skeleton sm:w-36 sm:h-4 md:w-40 md:h-4" />
                <div className="w-20 h-5 rounded skeleton sm:w-20 sm:h-5 md:w-24 md:h-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Models */}
        <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
          <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-4 md:gap-3 md:mb-5">
            <div className="p-2 rounded-xl shadow-lg bg-gradient-success/20 sm:p-2 md:p-3">
              <div className="w-5 h-5 rounded skeleton sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-5.5 md:w-56 md:h-6" />
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl border glass border-success-200/30 dark:border-success-500/20 sm:p-3 md:p-4">
                <div className="w-full h-3 rounded skeleton sm:w-40 sm:h-4 md:w-48 md:h-4" />
                <div className="w-16 h-5 rounded skeleton sm:w-18 sm:h-5 md:w-20 md:h-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

