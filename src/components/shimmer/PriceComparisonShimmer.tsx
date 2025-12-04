import React from "react";

export const PriceComparisonShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Modern Header with Gradient */}
      <div className="p-8 mx-6 mt-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 justify-between items-start md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-4 w-80 h-10 rounded skeleton" />
              <div className="w-96 h-6 rounded skeleton" />
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-40 h-10 rounded-lg skeleton" />
              <div className="w-28 h-10 rounded-xl skeleton" />
              <div className="w-24 h-10 rounded-xl skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Comparison Form */}
      <div className="px-6 mx-auto mt-8 mb-8 max-w-7xl">
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="mb-8 text-center">
            <div className="mb-4 w-64 h-9 rounded skeleton mx-auto" />
            <div className="w-96 h-6 rounded skeleton mx-auto" />
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <div className="flex gap-2 items-center mb-3">
                <div className="w-4 h-4 rounded skeleton" />
                <div className="w-32 h-5 rounded skeleton" />
              </div>
              <div className="w-full h-12 rounded-lg skeleton" />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
              <div>
                <div className="flex gap-2 items-center mb-3">
                  <div className="w-4 h-4 rounded skeleton" />
                  <div className="w-36 h-5 rounded skeleton" />
                </div>
                <div className="w-full h-12 rounded-lg skeleton" />
              </div>

              <div>
                <div className="flex gap-2 items-center mb-3">
                  <div className="w-4 h-4 rounded skeleton" />
                  <div className="w-24 h-5 rounded skeleton" />
                </div>
                <div className="w-full h-12 rounded-lg skeleton" />
              </div>
            </div>

            <div className="w-full h-14 rounded-xl skeleton" />
          </div>
        </div>
      </div>

      {/* Modern Models Overview */}
      <div className="px-6 mx-auto mb-8 max-w-7xl">
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex flex-col gap-6 justify-between items-start pb-6 mb-8 border-b md:flex-row md:items-center border-primary-200/50 dark:border-primary-700/50">
            <div className="w-48 h-7 rounded skeleton" />
            <div className="w-40 h-7 rounded-lg skeleton" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((provider) => (
              <div
                key={provider}
                className="overflow-hidden rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 border-secondary-200/50 dark:border-secondary-700/50 bg-secondary-50/30 dark:bg-secondary-900/20"
              >
                <div className="flex flex-col gap-4 justify-between items-start p-6 bg-gradient-to-r border-b from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 md:flex-row md:items-center border-primary-200/30 dark:border-primary-700/30">
                  <div className="flex-1">
                    <div className="mb-1 w-32 h-7 rounded skeleton" />
                    <div className="w-48 h-4 rounded skeleton" />
                  </div>
                  <div className="w-32 h-10 rounded-xl skeleton" />
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((model) => (
                    <div
                      key={model}
                      className="p-6 rounded-xl border backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex gap-2 items-center mb-2">
                            <div className="w-32 h-6 rounded skeleton" />
                            <div className="w-16 h-5 rounded-full skeleton" />
                          </div>
                          <div className="w-24 h-6 rounded-full skeleton" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="grid grid-cols-2 gap-4 p-4 mb-4 rounded-xl border bg-secondary-50/50 dark:bg-secondary-900/20 border-secondary-200/50 dark:border-secondary-700/50">
                          <div className="text-center">
                            <div className="mb-1 w-12 h-3 rounded skeleton mx-auto" />
                            <div className="w-20 h-5 rounded skeleton mx-auto" />
                          </div>
                          <div className="text-center">
                            <div className="mb-1 w-12 h-3 rounded skeleton mx-auto" />
                            <div className="w-20 h-5 rounded skeleton mx-auto" />
                          </div>
                        </div>

                        <div className="flex gap-4 justify-between items-center">
                          <div className="w-24 h-4 rounded skeleton" />
                          <div className="flex flex-wrap gap-2">
                            <div className="w-16 h-6 rounded-lg skeleton" />
                            <div className="w-20 h-6 rounded-lg skeleton" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

