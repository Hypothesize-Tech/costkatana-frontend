import React from "react";

// SessionReplayPage Shimmer
export const SessionReplayPageShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-3 sm:p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Header with Filters */}
        <div className="mb-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:mb-5 sm:p-5 md:mb-6 md:p-6">
          <div className="flex flex-col gap-3 items-start mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4 sm:gap-0">
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col gap-2 items-start mb-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="w-7 h-7 rounded skeleton sm:w-8 sm:h-8 shrink-0" />
                <div className="w-full h-7 rounded skeleton sm:w-48 sm:h-8 md:h-9" />
              </div>
              <div className="w-full h-3 rounded skeleton sm:w-64 sm:h-4" />
            </div>
            <div className="w-full h-10 rounded-lg skeleton sm:w-32 sm:h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          {/* Session List Sidebar */}
          <div className="col-span-1 lg:col-span-3">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
              <div className="p-3 border-b border-primary-200/30 sm:p-3.5 md:p-4">
                <div className="w-full h-5 rounded skeleton sm:w-24 sm:h-6" />
                <div className="mt-1 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="w-full p-3 border-b border-primary-200/20 sm:p-3.5 md:p-4">
                    <div className="flex flex-col gap-2 justify-between items-start mb-2 sm:flex-row sm:items-start sm:gap-0">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="mb-1 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                        <div className="w-full h-2.5 rounded skeleton sm:w-48 sm:h-3" />
                      </div>
                      <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-6" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2 sm:gap-2">
                      <div className="w-full h-4 rounded-full skeleton sm:w-16 sm:h-5" />
                      <div className="w-full h-4 rounded-full skeleton sm:w-20 sm:h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-3 border-t border-primary-200/30 flex flex-col gap-2 justify-between items-stretch sm:flex-row sm:items-center sm:gap-0 sm:p-3.5 md:p-4">
                <div className="w-full h-8 rounded-lg skeleton sm:w-20 sm:h-9" />
                <div className="w-full h-3 rounded skeleton sm:w-16 sm:h-4" />
                <div className="w-full h-8 rounded-lg skeleton sm:w-20 sm:h-9" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-9">
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-5 md:p-6 lg:p-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded skeleton sm:w-14 sm:h-14 sm:mb-3.5 md:w-16 md:h-16 md:mb-4" />
                <div className="w-full h-6 mx-auto mb-2 rounded skeleton sm:w-64 sm:h-7 md:h-8" />
                <div className="w-full h-4 mx-auto rounded skeleton sm:w-96 sm:h-4.5 md:h-5" />
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Export Button */}
        <div className="flex justify-end mb-4 sm:mb-5 md:mb-6">
          <div className="w-full h-9 rounded-lg skeleton sm:w-40 sm:h-10" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 sm:gap-5 sm:mb-6 md:grid-cols-4 md:gap-6 md:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                  <div className="w-full h-7 rounded skeleton sm:w-24 sm:h-8" />
                </div>
                <div className="w-10 h-10 rounded-xl skeleton shrink-0 sm:w-11 sm:h-11 md:w-12 md:h-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 mb-4 sm:p-5 sm:mb-5 md:p-6 md:mb-6">
          <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
            {/* Row 1: Basic Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-4 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-10 rounded skeleton sm:h-10.5 md:h-11" />
              ))}
            </div>

            {/* Row 2: Advanced Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full h-10 rounded skeleton sm:h-10.5 md:h-11" />
              ))}
            </div>

            {/* Row 3: Action Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
              <div className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="mb-4 glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:mb-5 sm:p-5 md:mb-6 md:p-6">
          <div className="mb-3 w-full h-5 rounded skeleton sm:mb-4 sm:w-48 sm:h-6" />
          <div className="h-48 rounded-xl skeleton sm:h-56 md:h-64" />
        </div>

        {/* Sessions Table */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="glass rounded-lg border border-primary-200/20 bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <th key={i} className="px-3 py-2.5 sm:px-4 sm:py-2.5 md:px-6 md:py-3">
                      <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i} className="border-b border-primary-200/20">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <td key={j} className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                        <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mx-3 mt-3 mb-4 sm:mx-4 sm:mt-4 sm:mb-5 md:mx-6 md:mt-6 md:mb-8">
        <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-4.5 md:px-6 md:py-6">
          <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:gap-4">
              <div className="w-9 h-9 rounded-lg skeleton sm:w-10 sm:h-10 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="mb-2 w-full h-6 rounded skeleton sm:w-48 sm:h-7" />
                <div className="w-full h-3 rounded skeleton sm:w-64 sm:h-4" />
              </div>
            </div>
            <div className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 sm:gap-5 sm:mb-6 md:grid-cols-3 lg:grid-cols-5 md:gap-6 md:mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                  <div className="w-full h-5 rounded skeleton sm:w-32 sm:h-6" />
                </div>
                {i > 2 && <div className="w-10 h-10 rounded-xl skeleton shrink-0 sm:w-11 sm:h-11 md:w-12 md:h-12" />}
              </div>
            </div>
          ))}
        </div>

        {/* Trace Tree and Timeline */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 mb-3 sm:p-5 sm:mb-3.5 md:p-6 md:mb-4">
            <div className="mb-3 w-full h-5 rounded skeleton sm:mb-3.5 sm:w-48 sm:h-6 md:mb-4" />
            <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
            {/* Trace Tree */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-5 md:p-6">
              <div className="h-64 rounded-xl skeleton sm:h-80 md:h-96" />
            </div>

            {/* Timeline */}
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-5 md:p-6">
              <div className="h-64 rounded-xl skeleton sm:h-80 md:h-96" />
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
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 mb-4 sm:p-6 sm:mb-6 md:p-8 md:mb-8">
          <div className="w-full h-7 rounded skeleton sm:w-48 sm:h-8 md:h-9" />
          <div className="mt-2 w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
        </div>

        {/* Tabs */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-4 sm:mb-6 md:mb-8">
          <nav className="flex space-x-1.5 p-1.5 sm:space-x-2 sm:p-2 overflow-x-auto">
            <div className="flex-1 w-full h-10 rounded-lg skeleton sm:w-40 sm:h-11 md:h-12 min-w-max" />
            <div className="flex-1 w-full h-10 rounded-lg skeleton sm:w-40 sm:h-11 md:h-12 min-w-max" />
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

