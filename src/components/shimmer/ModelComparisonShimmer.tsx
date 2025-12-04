import React from "react";

export const ModelComparisonShimmer: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40">
                <div className="w-6 h-6 rounded skeleton" />
              </div>
              <div>
                <div className="mb-1 sm:mb-2 w-64 h-8 rounded skeleton sm:w-80 sm:h-10" />
                <div className="w-96 h-4 rounded skeleton sm:w-[500px] sm:h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-2">
          <div className="flex gap-2">
            <div className="flex-1 h-12 rounded-xl skeleton" />
            <div className="flex-1 h-12 rounded-xl skeleton" />
          </div>
        </div>

        {/* Content - Table View (default) */}
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Filters */}
            <div className="p-4 sm:p-6 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <div className="w-full h-11 rounded-xl skeleton" />
                </div>
                <div className="relative">
                  <div className="w-full h-11 rounded-xl skeleton" />
                </div>
                <div className="relative">
                  <div className="w-full h-11 rounded-xl skeleton" />
                </div>
              </div>
              <div className="mt-4 w-48 h-4 rounded skeleton" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 border-b border-primary-200/30 dark:border-primary-700/30">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <th key={i} className="px-4 py-4">
                        <div className="w-24 h-4 rounded skeleton" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                    <tr key={row}>
                      {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                        <td key={col} className="px-4 py-4">
                          <div className="w-20 h-4 rounded skeleton" />
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
    </div>
  );
};

