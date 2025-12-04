import React from "react";

export const ModerationShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="p-8 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="mb-2 w-64 h-9 rounded skeleton" />
              <div className="w-96 h-4 rounded skeleton" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="w-40 h-10 rounded skeleton" />
              <div className="w-32 h-10 rounded-lg skeleton" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center w-12 h-12 bg-gradient-primary/20 rounded-xl">
                    <div className="w-6 h-6 rounded skeleton" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="mb-2 w-32 h-4 rounded skeleton" />
                  <div className="w-24 h-7 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Moderation Breakdown */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Input Moderation */}
          <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center mb-6">
              <div className="mr-2 w-5 h-5 rounded skeleton" />
              <div className="w-64 h-6 rounded skeleton" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                  <div className="w-40 h-4 rounded skeleton" />
                  <div className="w-24 h-4 rounded skeleton" />
                </div>
              ))}

              {/* Top Threat Categories */}
              <div className="pt-4">
                <div className="mb-3 w-48 h-4 rounded skeleton" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="w-32 h-6 rounded-full skeleton" />
                      <div className="w-8 h-4 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Output Moderation */}
          <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center mb-6">
              <div className="mr-2 w-5 h-5 rounded skeleton" />
              <div className="w-64 h-6 rounded skeleton" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-primary-200/20 dark:border-primary-700/20">
                  <div className="w-40 h-4 rounded skeleton" />
                  <div className="w-24 h-4 rounded skeleton" />
                </div>
              ))}

              {/* Block Rate by Model */}
              <div className="pt-4">
                <div className="mb-3 w-48 h-4 rounded skeleton" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="w-32 h-4 rounded skeleton" />
                      <div className="w-16 h-4 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Log */}
        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="px-6 py-4 border-b border-primary-200/30 dark:border-primary-700/30">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 w-40 h-6 rounded skeleton lg:mb-0" />

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="w-40 h-10 rounded skeleton" />
                <div className="w-40 h-10 rounded skeleton" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
              <thead className="bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="w-24 h-4 rounded skeleton" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gradient-to-br divide-y from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20 dark:divide-primary-700/20">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <tr key={row}>
                    <td className="px-6 py-4">
                      <div className="w-32 h-4 rounded skeleton" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded skeleton" />
                        <div className="ml-2 w-24 h-4 rounded skeleton" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 h-6 rounded-full skeleton" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-4 rounded skeleton" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 rounded skeleton" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-48 h-4 rounded skeleton" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-64 h-4 rounded skeleton" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col px-6 py-3 border-t border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-2 w-32 h-4 rounded skeleton sm:mb-0" />
            <div className="flex space-x-2">
              <div className="w-24 h-9 rounded skeleton" />
              <div className="w-20 h-9 rounded skeleton" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

