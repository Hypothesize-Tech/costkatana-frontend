import React from "react";

export const ModelComparisonTableShimmer: React.FC = () => {
  return (
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
  );
};

