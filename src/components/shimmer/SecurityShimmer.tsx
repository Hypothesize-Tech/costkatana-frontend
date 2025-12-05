import React from "react";

export const SecurityShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 mb-4 sm:p-6 sm:mb-6 md:p-8 md:mb-8">
          <div className="mb-3 w-full h-8 rounded skeleton sm:mb-4 sm:w-80 sm:h-10" />
          <div className="mb-4 w-full h-3 rounded skeleton sm:mb-5 md:mb-6 md:w-96 md:h-4" />
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:gap-4 sm:w-auto">
            <div className="w-full h-9 rounded-lg skeleton sm:w-40 sm:h-10" />
            <div className="w-full h-9 rounded-lg skeleton sm:w-40 sm:h-10" />
          </div>
        </div>

        {/* Security Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 sm:gap-5 sm:mb-6 md:gap-6 md:mb-8 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-4 sm:p-5 md:p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                  <div className="w-full h-6 rounded skeleton sm:w-24 sm:h-7" />
                </div>
                <div className="p-2 rounded-xl bg-gradient-primary/20 shrink-0 sm:p-2.5 md:p-3">
                  <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Human Review Queue */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-4 sm:mb-6 md:mb-8">
          <div className="p-4 border-b border-primary-200/30 sm:p-5 md:p-6">
            <div className="w-full h-5 rounded skeleton sm:w-64 sm:h-6" />
          </div>
          <div className="p-4 sm:p-5 md:p-6">
            <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-lg border border-warning-200/30 bg-gradient-to-br from-warning-50/30 to-accent-50/30 dark:from-warning-900/20 dark:to-accent-900/20 p-3 sm:p-3.5 md:p-4">
                  <div className="flex flex-col gap-2 justify-between items-start sm:flex-row sm:items-start sm:gap-0">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2 sm:gap-2">
                        <div className="w-full h-5 rounded-full skeleton sm:w-24 sm:h-6" />
                        <div className="w-full h-4 rounded skeleton sm:w-20 sm:h-5" />
                      </div>
                      <div className="mb-2 w-full h-3 rounded skeleton sm:h-4" />
                      <div className="w-3/4 h-2.5 rounded skeleton sm:h-3" />
                    </div>
                    <div className="ml-0 w-full h-8 rounded-lg skeleton sm:ml-4 sm:w-28 sm:h-9" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:gap-6 sm:mb-6 md:gap-8 md:mb-8 lg:grid-cols-2">
          {/* Threat Distribution */}
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="p-4 border-b border-primary-200/30 sm:p-5 md:p-6">
              <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-6" />
            </div>
            <div className="p-4 sm:p-5 md:p-6">
              <div className="space-y-2.5 sm:space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-full h-5 rounded-full skeleton sm:w-32 sm:h-6" />
                    </div>
                    <div className="w-full h-3 rounded skeleton sm:w-8 sm:h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Containment Actions */}
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="p-4 border-b border-primary-200/30 sm:p-5 md:p-6">
              <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-6" />
            </div>
            <div className="p-4 sm:p-5 md:p-6">
              <div className="space-y-2.5 sm:space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-full h-3 rounded skeleton sm:w-40 sm:h-4" />
                    <div className="w-full h-3 rounded skeleton sm:w-8 sm:h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Risky Patterns */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="p-4 border-b border-primary-200/30 sm:p-5 md:p-6">
            <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-6" />
          </div>
          <div className="p-4 sm:p-5 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-max">
                <thead>
                  <tr className="border-b border-primary-200/30">
                    <th className="text-left py-2 px-2 sm:px-3 md:px-4">
                      <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                    </th>
                    <th className="text-right py-2 px-2 sm:px-3 md:px-4">
                      <div className="w-full h-3 rounded skeleton ml-auto sm:w-16 sm:h-4" />
                    </th>
                    <th className="text-right py-2 px-2 sm:px-3 md:px-4">
                      <div className="w-full h-3 rounded skeleton ml-auto sm:w-32 sm:h-4" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                    <tr key={row} className="border-b border-primary-200/20">
                      <td className="py-2 px-2 sm:px-3 md:px-4">
                        <div className="w-full h-3 rounded skeleton sm:w-64 sm:h-4" />
                      </td>
                      <td className="text-right py-2 px-2 sm:px-3 md:px-4">
                        <div className="w-full h-3 rounded skeleton ml-auto sm:w-8 sm:h-4" />
                      </td>
                      <td className="text-right py-2 px-2 sm:px-3 md:px-4">
                        <div className="w-full h-3 rounded skeleton ml-auto sm:w-16 sm:h-4" />
                      </td>
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

