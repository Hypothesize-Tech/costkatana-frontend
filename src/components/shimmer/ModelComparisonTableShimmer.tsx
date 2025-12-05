import React from "react";

export const ModelComparisonTableShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Filters */}
      <div className="p-3 rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-3.5 md:gap-4 md:grid-cols-3">
          <div className="relative">
            <div className="w-full h-10 rounded-xl skeleton sm:h-10.5 md:h-11" />
          </div>
          <div className="relative">
            <div className="w-full h-10 rounded-xl skeleton sm:h-10.5 md:h-11" />
          </div>
          <div className="relative">
            <div className="w-full h-10 rounded-xl skeleton sm:h-10.5 md:h-11" />
          </div>
        </div>
        <div className="mt-3 w-full h-3 rounded skeleton sm:mt-3.5 sm:w-48 sm:h-4 md:mt-4" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl glass bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <table className="w-full min-w-max">
          <thead className="bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 border-b border-primary-200/30 dark:border-primary-700/30">
            <tr>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <th key={i} className="px-3 py-3 sm:px-3.5 sm:py-3.5 md:px-4 md:py-4">
                  <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                  <td key={col} className="px-3 py-3 sm:px-3.5 sm:py-3.5 md:px-4 md:py-4">
                    <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

