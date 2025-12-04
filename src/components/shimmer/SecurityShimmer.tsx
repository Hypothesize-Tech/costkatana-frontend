import React from "react";

export const SecurityShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
          <div className="mb-4 w-80 h-10 rounded skeleton" />
          <div className="mb-6 w-96 h-4 rounded skeleton" />
          <div className="flex gap-4">
            <div className="w-40 h-10 rounded-lg skeleton" />
            <div className="w-40 h-10 rounded-lg skeleton" />
          </div>
        </div>

        {/* Security Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="mb-2 w-32 h-4 rounded skeleton" />
                  <div className="w-24 h-7 rounded skeleton" />
                </div>
                <div className="p-3 rounded-xl bg-gradient-primary/20">
                  <div className="w-5 h-5 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Human Review Queue */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel mb-8">
          <div className="p-6 border-b border-primary-200/30">
            <div className="w-64 h-6 rounded skeleton" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-lg border border-warning-200/30 bg-gradient-to-br from-warning-50/30 to-accent-50/30 dark:from-warning-900/20 dark:to-accent-900/20 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-24 h-6 rounded-full skeleton" />
                        <div className="w-20 h-5 rounded skeleton" />
                      </div>
                      <div className="mb-2 w-full h-4 rounded skeleton" />
                      <div className="w-3/4 h-3 rounded skeleton" />
                    </div>
                    <div className="ml-4 w-28 h-9 rounded-lg skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
          {/* Threat Distribution */}
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="p-6 border-b border-primary-200/30">
              <div className="w-48 h-6 rounded skeleton" />
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-6 rounded-full skeleton" />
                    </div>
                    <div className="w-8 h-4 rounded skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Containment Actions */}
          <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="p-6 border-b border-primary-200/30">
              <div className="w-48 h-6 rounded skeleton" />
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="w-40 h-4 rounded skeleton" />
                    <div className="w-8 h-4 rounded skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Risky Patterns */}
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="p-6 border-b border-primary-200/30">
            <div className="w-48 h-6 rounded skeleton" />
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-200/30">
                    <th className="text-left py-2">
                      <div className="w-24 h-4 rounded skeleton" />
                    </th>
                    <th className="text-right py-2">
                      <div className="w-16 h-4 rounded skeleton ml-auto" />
                    </th>
                    <th className="text-right py-2">
                      <div className="w-32 h-4 rounded skeleton ml-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                    <tr key={row} className="border-b border-primary-200/20">
                      <td className="py-2">
                        <div className="w-64 h-4 rounded skeleton" />
                      </td>
                      <td className="text-right py-2">
                        <div className="w-8 h-4 rounded skeleton ml-auto" />
                      </td>
                      <td className="text-right py-2">
                        <div className="w-16 h-4 rounded skeleton ml-auto" />
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

