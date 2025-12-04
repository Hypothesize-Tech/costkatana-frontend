import React from "react";
import { CircleStackIcon } from "@heroicons/react/24/outline";

export const CacheShimmer: React.FC = () => {
  return (
    <div className="p-6 mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
          <div className="flex gap-5 items-center">
            <div className="p-4 rounded-2xl shadow-xl bg-gradient-primary/20 shrink-0">
              <CircleStackIcon className="w-8 h-8 text-primary-500/50" />
            </div>
            <div>
              <div className="mb-2 w-64 h-9 rounded skeleton" />
              <div className="w-96 h-5 rounded skeleton" />
            </div>
          </div>
          <div className="w-32 h-11 rounded-lg skeleton" />
        </div>
      </div>

      {/* Cache Provider Info */}
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center mb-6">
          <div className="p-3.5 rounded-xl shadow-lg bg-gradient-primary/20 mr-4">
            <div className="w-7 h-7 rounded skeleton" />
          </div>
          <div className="w-48 h-7 rounded skeleton" />
        </div>
        <div className="mb-5 w-32 h-6 rounded skeleton" />
        <div className="flex flex-wrap gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-40 h-9 rounded-full skeleton" />
          ))}
        </div>
        <div className="p-5 rounded-xl glass border border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded skeleton" />
            <div className="w-64 h-5 rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-4 items-start">
              <div className="p-3.5 rounded-xl shadow-lg bg-gradient-primary/20 shrink-0">
                <div className="w-7 h-7 rounded skeleton" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2 w-24 h-9 rounded skeleton" />
                <div className="w-32 h-4 rounded skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-4 items-center">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-primary/20 shrink-0">
                <div className="w-6 h-6 rounded skeleton" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 w-32 h-7 rounded skeleton" />
                <div className="w-28 h-4 rounded skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Advanced Cache Metrics */}
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-5">
            <div className="p-3 rounded-xl shadow-lg bg-gradient-primary/20">
              <div className="w-6 h-6 rounded skeleton" />
            </div>
            <div className="w-56 h-6 rounded skeleton" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                <div className="w-40 h-4 rounded skeleton" />
                <div className="w-24 h-6 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Models */}
        <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-3 items-center mb-5">
            <div className="p-3 rounded-xl shadow-lg bg-gradient-success/20">
              <div className="w-6 h-6 rounded skeleton" />
            </div>
            <div className="w-56 h-6 rounded skeleton" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl border glass border-success-200/30 dark:border-success-500/20">
                <div className="w-48 h-4 rounded skeleton" />
                <div className="w-20 h-6 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

