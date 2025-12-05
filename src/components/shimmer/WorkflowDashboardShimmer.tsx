import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export const WorkflowDashboardShimmer: React.FC<{ activeTab?: 'overview' | 'executions' | 'analytics' | 'traces' }> = ({ activeTab = 'overview' }) => {
  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 md:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
            <div className="p-2.5 md:p-3 rounded-xl bg-gradient-primary/20 flex-shrink-0">
              <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 text-primary-500/50" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1 md:mb-2 w-full sm:w-56 md:w-64 h-6 md:h-7 rounded skeleton" />
              <div className="w-full sm:w-80 md:w-96 h-3 md:h-4 rounded skeleton" />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="w-full sm:w-40 h-10 md:h-11 rounded-xl skeleton" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="border-b border-primary-200/30 dark:border-primary-700/30">
          <nav className="flex flex-wrap px-3 md:px-4 lg:px-6 gap-2 md:gap-3 lg:gap-4 lg:space-x-8 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full sm:w-20 md:w-24 h-10 md:h-11 rounded skeleton flex-shrink-0" />
            ))}
          </nav>
        </div>

        <div className="p-3 md:p-4 lg:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              {/* Overview Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="flex items-center">
                      <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded skeleton flex-shrink-0" />
                      <div className="ml-2 md:ml-3 lg:ml-4 min-w-0 flex-1">
                        <div className="mb-2 w-20 md:w-24 h-3 rounded skeleton" />
                        <div className="w-14 md:w-16 h-6 md:h-7 rounded skeleton" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Workflow Distribution */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 lg:grid-cols-2">
                {/* Cost Analysis by Workflow Type */}
                <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="mb-3 md:mb-4 w-full sm:w-48 md:w-56 h-4 md:h-5 rounded skeleton" />
                  <div className="space-y-3 md:space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="relative">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-1">
                          <div className="w-full sm:w-32 h-3 md:h-4 rounded skeleton" />
                          <div className="w-full sm:w-24 h-3 md:h-4 rounded skeleton" />
                        </div>
                        <div className="w-full h-2.5 rounded-full skeleton" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Cost Trend */}
                <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="mb-3 md:mb-4 w-full sm:w-40 md:w-48 h-4 md:h-5 rounded skeleton" />
                  <div className="space-y-3 md:space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="relative">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-1">
                          <div className="w-full sm:w-24 h-3 md:h-4 rounded skeleton" />
                          <div className="w-full sm:w-20 h-3 md:h-4 rounded skeleton" />
                        </div>
                        <div className="w-full h-2.5 rounded-full skeleton" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Workflow Activity */}
              <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="mb-3 md:mb-4 w-full sm:w-48 md:w-56 h-4 md:h-5 rounded skeleton" />
                <div className="overflow-x-auto -mx-3 sm:mx-0 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20">
                  <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20" style={{ minWidth: '700px' }}>
                    <thead className="glass rounded-lg border border-primary-200/20 dark:border-primary-700/20 bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                      <tr>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <th key={i} className="px-3 md:px-4 lg:px-6 py-2 md:py-3">
                            <div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="glass bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-y divide-primary-200/20 dark:divide-primary-700/20">
                      {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row}>
                          {[1, 2, 3, 4, 5, 6].map((col) => (
                            <td key={col} className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                              <div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Metrics Summary */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 lg:grid-cols-3">
                {/* Hourly Throughput */}
                <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="mb-3 md:mb-4 w-full sm:w-36 md:w-40 h-4 md:h-5 rounded skeleton" />
                  <div className="h-32 md:h-36 lg:h-40 rounded-md glass bg-light-bg-200 dark:bg-dark-bg-200 p-2 md:p-3">
                    <div className="h-full flex items-end gap-1 md:gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div className="w-full rounded-md skeleton" style={{ height: `${Math.random() * 60 + 20}px` }} />
                          <div className="mt-1 w-3 md:w-4 h-2 md:h-3 rounded skeleton" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 w-full sm:w-40 md:w-48 h-3 rounded skeleton" />
                </div>

                {/* Latency Metrics */}
                <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="mb-3 md:mb-4 w-full sm:w-36 md:w-40 h-4 md:h-5 rounded skeleton" />
                  <div className="space-y-3 md:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative pt-1">
                        <div className="flex flex-col sm:flex-row mb-2 items-start sm:items-center justify-between gap-2">
                          <div className="w-10 md:w-12 h-5 md:h-6 rounded-full skeleton" />
                          <div className="w-full sm:w-20 h-3 md:h-4 rounded skeleton" />
                        </div>
                        <div className="overflow-hidden h-2 mb-3 md:mb-4 rounded skeleton" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Usage */}
                <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                  <div className="mb-3 md:mb-4 w-full sm:w-40 md:w-48 h-4 md:h-5 rounded skeleton" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="relative">
                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-1">
                          <div className="w-full sm:w-32 h-3 md:h-4 rounded skeleton" />
                          <div className="w-full sm:w-24 h-3 md:h-4 rounded skeleton" />
                        </div>
                        <div className="w-full h-2.5 rounded-full skeleton" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="mb-3 md:mb-4 w-full sm:w-48 md:w-56 h-4 md:h-5 rounded skeleton" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start p-2 md:p-3 rounded-lg glass border border-primary-200/30 dark:border-primary-500/20">
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded skeleton flex-shrink-0" />
                      <div className="flex-1 ml-2 md:ml-3 min-w-0">
                        <div className="mb-2 w-full h-3 md:h-4 rounded skeleton" />
                        <div className="w-full sm:w-40 md:w-48 h-3 rounded skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'executions' && (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              <div className="w-full sm:w-56 md:w-64 h-5 md:h-6 rounded skeleton" />

              <div className="overflow-x-auto -mx-3 sm:mx-0 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl">
                <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20" style={{ minWidth: '800px' }}>
                  <thead className="glass bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                    <tr>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <th key={i} className="px-3 md:px-4 lg:px-6 py-2 md:py-3">
                          <div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="glass bg-gradient-to-br from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-y divide-primary-200/20 dark:divide-primary-700/20">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                      <tr key={row}>
                        {[1, 2, 3, 4, 5, 6].map((col) => (
                          <td key={col} className="px-3 md:px-4 lg:px-6 py-3 md:py-4">
                            {col === 1 ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 md:w-5 md:h-5 rounded skeleton flex-shrink-0" />
                                <div className="ml-2 md:ml-3 min-w-0">
                                  <div className="w-full sm:w-28 md:w-32 h-3 md:h-4 rounded skeleton mb-1" />
                                  <div className="w-full sm:w-20 md:w-24 h-3 rounded skeleton" />
                                </div>
                              </div>
                            ) : col === 2 ? (
                              <div className="w-16 md:w-20 h-5 md:h-6 rounded-full skeleton" />
                            ) : col === 6 ? (
                              <div className="w-20 md:w-24 h-8 md:h-9 rounded skeleton" />
                            ) : (
                              <div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              <div className="w-full sm:w-56 md:w-64 h-5 md:h-6 rounded skeleton" />

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 md:p-4 lg:p-6 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                    <div className="mb-3 md:mb-4 w-full sm:w-36 md:w-40 h-4 md:h-5 rounded skeleton" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="flex flex-col sm:flex-row justify-between gap-2">
                          <div className="w-full sm:w-24 h-3 md:h-4 rounded skeleton" />
                          <div className="w-full sm:w-20 h-3 md:h-4 rounded skeleton" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              <div className="w-full sm:w-40 md:w-48 h-5 md:h-6 rounded skeleton" />

              {/* Selected Execution Details */}
              <div className="glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 md:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="w-full sm:w-56 md:w-64 h-5 md:h-6 rounded skeleton" />
                  <div className="w-full sm:w-24 h-8 md:h-9 rounded skeleton" />
                </div>

                {/* Execution Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4 lg:mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-2 md:p-3 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-200 dark:bg-dark-bg-200">
                      <div className="mb-2 w-14 md:w-16 h-3 rounded skeleton" />
                      <div className="w-20 md:w-24 h-4 md:h-5 rounded skeleton" />
                    </div>
                  ))}
                </div>

                {/* Step-by-Step Trace */}
                <div className="space-y-3 md:space-y-4">
                  <div className="w-full sm:w-36 md:w-40 h-4 md:h-5 rounded skeleton" />
                  <div className="space-y-2 md:space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 p-3 md:p-4 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-0 mb-2">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full skeleton flex-shrink-0" />
                            <div className="w-full sm:w-28 md:w-32 h-3 md:h-4 rounded skeleton" />
                          </div>
                          <div className="w-full sm:w-20 h-5 md:h-6 rounded-full skeleton" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j}>
                              <div className="w-14 md:w-16 h-3 rounded skeleton mb-1" />
                              <div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

