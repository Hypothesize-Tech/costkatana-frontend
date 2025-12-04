import React from "react";
import {
  ChartBarIcon,
  ClockIcon,
  RocketLaunchIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export const AdvancedMonitoringShimmer: React.FC<{ activeTab?: 'realtime' | 'performance' | 'tags' }> = ({ activeTab = 'realtime' }) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
        <div className="flex gap-4 items-center">
          <div className="p-4 rounded-xl shadow-xl bg-gradient-primary/20">
            <ChartBarIcon className="w-8 h-8 text-primary-500/50" />
          </div>
          <div className="w-64 h-9 rounded skeleton" />
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          <div className="w-40 h-11 rounded skeleton" />
          <div className="w-32 h-11 rounded-lg skeleton" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <nav className="flex flex-wrap gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-32 h-12 rounded-xl skeleton" />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-32 h-6 rounded skeleton" />
                  <div className="w-16 h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-32 h-4 rounded skeleton" />
                      <div className="w-24 h-5 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tag Cost Distribution Chart */}
          <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-accent/20">
                <div className="w-6 h-6 rounded skeleton" />
              </div>
              <div className="w-56 h-6 rounded skeleton" />
            </div>
            <div className="h-64 rounded-xl skeleton" />
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Cost vs Performance Correlation Chart */}
          <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-3 items-center mb-4">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-primary/20">
                <div className="w-6 h-6 rounded skeleton" />
              </div>
              <div className="w-64 h-6 rounded skeleton" />
            </div>
            <div className="h-64 rounded-xl skeleton" />
          </div>

          {/* Performance Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-40 h-5 rounded skeleton" />
                  <div className="w-24 h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-24 h-3 rounded skeleton" />
                      <div className="w-20 h-4 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Tag Management Section */}
          <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-primary/20">
                <div className="w-6 h-6 rounded skeleton" />
              </div>
              <div className="w-48 h-6 rounded skeleton" />
            </div>

            {/* Available Tags */}
            <div className="mb-6">
              <div className="mb-3 w-32 h-4 rounded skeleton" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="w-24 h-9 rounded-full skeleton" />
                ))}
              </div>
            </div>

            {/* Add New Tag */}
            <div className="mb-6">
              <div className="mb-3 w-32 h-4 rounded skeleton" />
              <div className="flex gap-3">
                <div className="w-32 h-10 rounded-lg skeleton" />
              </div>
            </div>

            {/* Selected Tags Filter */}
            <div>
              <div className="mb-3 w-64 h-4 rounded skeleton" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="w-28 h-9 rounded-full skeleton" />
                ))}
              </div>
            </div>
          </div>

          {/* Tag Analytics Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-32 h-5 rounded skeleton" />
                  <div className="w-20 h-6 rounded-full skeleton" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-32 h-3 rounded skeleton" />
                      <div className="w-24 h-4 rounded skeleton" />
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

