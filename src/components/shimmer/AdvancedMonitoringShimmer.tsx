import React from "react";
import {
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export const AdvancedMonitoringShimmer: React.FC<{ activeTab?: 'realtime' | 'performance' | 'tags' }> = ({ activeTab = 'realtime' }) => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 justify-between items-start lg:flex-row lg:items-center">
        <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
          <div className="p-3 sm:p-3.5 md:p-4 rounded-xl shadow-xl bg-gradient-primary/20">
            <ChartBarIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-500/50" />
          </div>
          <div className="w-48 sm:w-56 md:w-64 h-7 sm:h-8 md:h-9 rounded skeleton" />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full lg:w-auto">
          <div className="w-full sm:w-36 md:w-40 h-10 sm:h-11 rounded skeleton" />
          <div className="w-full sm:w-28 md:w-32 h-10 sm:h-11 rounded-lg skeleton" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="p-3 sm:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <nav className="flex flex-wrap gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-28 sm:w-30 md:w-32 h-10 sm:h-11 md:h-12 rounded-xl skeleton" />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'realtime' && (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="w-28 sm:w-32 h-5 sm:h-6 rounded skeleton" />
                  <div className="w-14 sm:w-16 h-5 sm:h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
                      <div className="w-20 sm:w-24 h-4 sm:h-5 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tag Cost Distribution Chart */}
          <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-xl shadow-lg bg-gradient-accent/20">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded skeleton" />
              </div>
              <div className="w-44 sm:w-50 md:w-56 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
            </div>
            <div className="h-48 sm:h-56 md:h-64 rounded-xl skeleton" />
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Cost vs Performance Correlation Chart */}
          <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-2 sm:gap-3 items-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-xl shadow-lg bg-gradient-primary/20">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded skeleton" />
              </div>
              <div className="w-52 sm:w-58 md:w-64 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
            </div>
            <div className="h-48 sm:h-56 md:h-64 rounded-xl skeleton" />
          </div>

          {/* Performance Cards Grid */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="w-36 sm:w-40 h-4 sm:h-5 rounded skeleton" />
                  <div className="w-20 sm:w-24 h-5 sm:h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-20 sm:w-24 h-2.5 sm:h-3 rounded skeleton" />
                      <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Tag Management Section */}
          <div className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-2 sm:gap-3 items-center mb-4 sm:mb-5 md:mb-6">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-xl shadow-lg bg-gradient-primary/20">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded skeleton" />
              </div>
              <div className="w-40 sm:w-44 md:w-48 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
            </div>

            {/* Available Tags */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <div className="mb-2 sm:mb-3 w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="w-20 sm:w-24 h-8 sm:h-9 rounded-full skeleton" />
                ))}
              </div>
            </div>

            {/* Add New Tag */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <div className="mb-2 sm:mb-3 w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
              <div className="flex gap-2 sm:gap-3">
                <div className="w-full sm:w-28 md:w-32 h-9 sm:h-10 rounded-lg skeleton" />
              </div>
            </div>

            {/* Selected Tags Filter */}
            <div>
              <div className="mb-2 sm:mb-3 w-52 sm:w-58 md:w-64 h-3 sm:h-4 rounded skeleton" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-24 sm:w-28 h-8 sm:h-9 rounded-full skeleton" />
                ))}
              </div>
            </div>
          </div>

          {/* Tag Analytics Grid */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="w-28 sm:w-32 h-4 sm:h-5 rounded skeleton" />
                  <div className="w-16 sm:w-20 h-5 sm:h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-28 sm:w-32 h-2.5 sm:h-3 rounded skeleton" />
                      <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

