import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const AgentCardShimmer: React.FC = () => {
  return (
    <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div className="space-y-2">
            <div className="w-32 sm:w-40 h-5 skeleton rounded" />
            <div className="w-24 sm:w-32 h-4 skeleton rounded" />
          </div>
        </div>
        <div className="w-20 h-8 skeleton rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-16 h-3 skeleton rounded" />
            <div className="w-20 h-5 skeleton rounded" />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="w-24 h-9 skeleton rounded-lg" />
        <div className="w-24 h-9 skeleton rounded-lg" />
        <div className="w-24 h-9 skeleton rounded-lg" />
      </div>
    </div>
  );
};

export const AgentListShimmer: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <AgentCardShimmer key={i} />
      ))}
    </div>
  );
};

export const AgentDetailShimmer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl skeleton" />
            <div className="space-y-3">
              <div className="w-48 h-7 skeleton rounded" />
              <div className="w-32 h-5 skeleton rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-10 skeleton rounded-lg" />
            <div className="w-24 h-10 skeleton rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-20 h-4 skeleton rounded" />
              <div className="w-28 h-6 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
        <div className="flex gap-2 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-28 h-10 skeleton rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="w-full h-20 skeleton rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AgentGovernanceShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-primary-500/50" />
            </div>
            <div className="space-y-2">
              <div className="w-48 sm:w-64 h-7 skeleton rounded" />
              <div className="w-64 sm:w-96 h-4 skeleton rounded" />
            </div>
          </div>
          <div className="w-32 h-10 skeleton rounded-lg" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="space-y-3">
                <div className="w-24 h-4 skeleton rounded" />
                <div className="w-32 h-8 skeleton rounded" />
                <div className="w-20 h-3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Agents List */}
        <AgentListShimmer />
      </div>
    </div>
  );
};

