import React from "react";

export const ModelComparisonShimmer: React.FC = () => {
  return (
    <div className="p-3 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:p-4 md:p-6">
      <div className="mx-auto space-y-4 max-w-7xl sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:gap-3 md:gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#06ec9e] via-emerald-500 to-[#009454] shadow-lg shadow-[#06ec9e]/30 dark:shadow-[#06ec9e]/40 shrink-0 sm:p-2.5 md:p-3">
                <div className="w-5 h-5 rounded skeleton sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="mb-1 w-full h-7 rounded skeleton sm:mb-2 sm:w-64 sm:h-8 md:w-80 md:h-10" />
                <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4 md:w-[500px] md:h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-1.5 sm:p-2">
          <div className="flex gap-1.5 sm:gap-2">
            <div className="flex-1 h-10 rounded-xl skeleton sm:h-11 md:h-12" />
            <div className="flex-1 h-10 rounded-xl skeleton sm:h-11 md:h-12" />
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

