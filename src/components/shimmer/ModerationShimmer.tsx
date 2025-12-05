import React from "react";

export const ModerationShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        {/* Header */}
        <div className="p-4 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 sm:mb-6 md:p-8 md:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0 mb-4 lg:mb-0">
              <div className="mb-2 w-full h-7 rounded skeleton sm:w-64 sm:h-8 md:h-9" />
              <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
            </div>

            <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto">
              <div className="w-full h-9 rounded skeleton sm:w-40 sm:h-10" />
              <div className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 sm:gap-5 sm:mb-6 md:gap-6 md:mb-8 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center w-10 h-10 bg-gradient-primary/20 rounded-xl sm:w-11 sm:h-11 md:w-12 md:h-12">
                    <div className="w-5 h-5 rounded skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0 sm:ml-4">
                  <div className="mb-2 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                  <div className="w-full h-6 rounded skeleton sm:w-24 sm:h-7" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Moderation Breakdown */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:gap-5 sm:mb-6 md:gap-6 md:mb-8 lg:grid-cols-2">
          {/* Input Moderation */}
          <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
            <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
              <div className="mr-2 w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              <div className="w-full h-5 rounded skeleton sm:w-64 sm:h-6" />
            </div>

            <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                  <div className="w-full h-3 rounded skeleton sm:w-40 sm:h-4" />
                  <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                </div>
              ))}

              {/* Top Threat Categories */}
              <div className="pt-3 sm:pt-3.5 md:pt-4">
                <div className="mb-2.5 w-full h-3 rounded skeleton sm:mb-3 sm:w-48 sm:h-4" />
                <div className="space-y-2.5 sm:space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="w-full h-5 rounded-full skeleton sm:w-32 sm:h-6" />
                      <div className="w-full h-3 rounded skeleton sm:w-8 sm:h-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Output Moderation */}
          <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
            <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
              <div className="mr-2 w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              <div className="w-full h-5 rounded skeleton sm:w-64 sm:h-6" />
            </div>

            <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-primary-200/20 dark:border-primary-700/20 sm:py-3">
                  <div className="w-full h-3 rounded skeleton sm:w-40 sm:h-4" />
                  <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                </div>
              ))}

              {/* Block Rate by Model */}
              <div className="pt-3 sm:pt-3.5 md:pt-4">
                <div className="mb-2.5 w-full h-3 rounded skeleton sm:mb-3 sm:w-48 sm:h-4" />
                <div className="space-y-2.5 sm:space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                      <div className="w-full h-3 rounded skeleton sm:w-16 sm:h-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Log */}
        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="px-4 py-3 border-b border-primary-200/30 dark:border-primary-700/30 sm:px-5 sm:py-3.5 md:px-6 md:py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full h-5 rounded skeleton sm:w-40 sm:h-6 lg:mb-0" />

              <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-3 sm:w-auto">
                <div className="w-full h-9 rounded skeleton sm:w-40 sm:h-10" />
                <div className="w-full h-9 rounded skeleton sm:w-40 sm:h-10" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200/20 dark:divide-primary-700/20">
              <thead className="bg-gradient-to-r from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-3 py-2.5 sm:px-4 sm:py-2.5 md:px-6 md:py-3">
                      <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gradient-to-br divide-y from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20 dark:divide-primary-700/20">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <tr key={row}>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="flex items-center">
                        <div className="w-3.5 h-3.5 rounded skeleton sm:w-4 sm:h-4 shrink-0" />
                        <div className="ml-1.5 w-full h-3 rounded skeleton sm:ml-2 sm:w-24 sm:h-4" />
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-5 rounded-full skeleton sm:w-32 sm:h-6" />
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-3 rounded skeleton sm:w-16 sm:h-4" />
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-3 rounded skeleton sm:w-48 sm:h-4" />
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="w-full h-3 rounded skeleton sm:w-64 sm:h-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-2 px-4 py-2.5 border-t border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:flex-row sm:justify-between sm:items-center sm:gap-0 sm:px-5 sm:py-2.5 md:px-6 md:py-3">
            <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-4 sm:mb-0" />
            <div className="flex space-x-2">
              <div className="w-full h-8 rounded skeleton sm:w-24 sm:h-9" />
              <div className="w-full h-8 rounded skeleton sm:w-20 sm:h-9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

