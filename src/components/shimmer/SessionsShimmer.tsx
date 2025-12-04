import React from "react";

// SessionReplayPage Shimmer
export const SessionReplayPageShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header with Filters */}
        <div className="mb-6 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded skeleton" />
                <div className="w-48 h-9 rounded skeleton" />
              </div>
              <div className="w-64 h-4 rounded skeleton" />
            </div>
            <div className="w-32 h-11 rounded-lg skeleton" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Session List Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
              <div className="p-4 border-b border-primary-200/30">
                <div className="w-24 h-6 rounded skeleton" />
                <div className="mt-1 w-32 h-4 rounded skeleton" />
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="w-full p-4 border-b border-primary-200/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 w-32 h-4 rounded skeleton" />
                        <div className="w-48 h-3 rounded skeleton" />
                      </div>
                      <div className="w-20 h-6 rounded-full skeleton" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="w-16 h-5 rounded-full skeleton" />
                      <div className="w-20 h-5 rounded-full skeleton" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-primary-200/30 flex justify-between items-center">
                <div className="w-20 h-9 rounded-lg skeleton" />
                <div className="w-16 h-4 rounded skeleton" />
                <div className="w-20 h-9 rounded-lg skeleton" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded skeleton" />
                <div className="w-64 h-8 mx-auto mb-2 rounded skeleton" />
                <div className="w-96 h-5 mx-auto rounded skeleton" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sessions (Debug) Shimmer
export const SessionsDebugShimmer: React.FC = () => {
  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Export Button */}
        <div className="flex justify-end mb-6">
          <div className="w-40 h-10 rounded-lg skeleton" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 w-32 h-4 rounded skeleton" />
                  <div className="w-24 h-8 rounded skeleton" />
                </div>
                <div className="w-12 h-12 rounded-xl skeleton" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-6">
          <div className="space-y-4">
            {/* Row 1: Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-11 rounded skeleton" />
              ))}
            </div>

            {/* Row 2: Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full h-11 rounded skeleton" />
              ))}
            </div>

            {/* Row 3: Action Buttons */}
            <div className="flex gap-3">
              <div className="w-32 h-10 rounded-lg skeleton" />
              <div className="w-32 h-10 rounded-lg skeleton" />
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="mb-6 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
          <div className="mb-4 w-48 h-6 rounded skeleton" />
          <div className="h-64 rounded-xl skeleton" />
        </div>

        {/* Sessions Table */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
          <table className="w-full">
            <thead className="glass rounded-lg border border-primary-200/20 bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="w-24 h-4 rounded skeleton" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="border-b border-primary-200/20">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="w-24 h-4 rounded skeleton" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// SessionDetail Shimmer
export const SessionDetailShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Header */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mx-6 mt-6 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg skeleton" />
              <div>
                <div className="mb-2 w-48 h-7 rounded skeleton" />
                <div className="w-64 h-4 rounded skeleton" />
              </div>
            </div>
            <div className="w-32 h-10 rounded-lg skeleton" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 w-24 h-4 rounded skeleton" />
                  <div className="w-32 h-6 rounded skeleton" />
                </div>
                {i > 2 && <div className="w-12 h-12 rounded-xl skeleton" />}
              </div>
            </div>
          ))}
        </div>

        {/* Trace Tree and Timeline */}
        <div className="mb-6">
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6 mb-4">
            <div className="mb-4 w-48 h-6 rounded skeleton" />
            <div className="w-96 h-4 rounded skeleton" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trace Tree */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="h-96 rounded-xl skeleton" />
            </div>

            {/* Timeline */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="h-96 rounded-xl skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SessionsUnified Shimmer (for tab switching)
export const SessionsUnifiedShimmer: React.FC<{ activeTab?: 'replays' | 'debug' }> = ({ activeTab = 'replays' }) => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
          <div className="w-48 h-9 rounded skeleton" />
          <div className="mt-2 w-96 h-4 rounded skeleton" />
        </div>

        {/* Tabs */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-8">
          <nav className="flex space-x-2 p-2">
            <div className="flex-1 w-40 h-12 rounded-lg skeleton" />
            <div className="flex-1 w-40 h-12 rounded-lg skeleton" />
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'replays' ? (
          <SessionReplayPageShimmer />
        ) : (
          <SessionsDebugShimmer />
        )}
      </div>
    </div>
  );
};

