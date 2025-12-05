import React from "react";

export const LogsShimmer: React.FC<{ viewMode?: 'table' | 'timeline' | 'json' | 'dashboard' }> = ({ viewMode = 'dashboard' }) => {
  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="card mb-4 shadow-xl sm:mb-5 md:mb-6">
        <div className="px-3 py-4 sm:px-4 sm:py-4.5 md:px-6 md:py-5">
          <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1 min-w-0 w-full">
              <div className="mb-1 w-full h-7 rounded skeleton sm:w-64 sm:h-8 md:h-9" />
              <div className="w-full h-3 rounded skeleton sm:w-96 sm:h-4" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:gap-3">
              {viewMode === 'dashboard' && (
                <div className="w-full h-9 rounded-lg skeleton sm:w-40 sm:h-10" />
              )}
              <div className="w-full h-9 rounded-lg skeleton sm:w-40 sm:h-10" />
              <div className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
              <div className="w-full h-9 rounded-lg skeleton sm:w-28 sm:h-10" />
              <div className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
              <div className="w-full h-9 rounded-lg skeleton sm:w-28 sm:h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-6">
              <div className="card shadow-xl">
                <div className="px-4 py-3 border-b border-primary-200/30 sm:px-5 sm:py-3.5 md:px-6 md:py-4">
                  <div className="w-full h-5 rounded skeleton sm:w-32 sm:h-6" />
                </div>
                <div className="p-4 space-y-3 sm:p-5 sm:space-y-3.5 md:p-6 md:space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <div className="mb-2 w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                      <div className="w-full h-9 rounded skeleton sm:h-10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Logs Content */}
          <div className="flex-1 min-w-0">
            {/* Stats Section */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <div className="card shadow-xl overflow-hidden">
                <div className="w-full px-4 py-3 flex items-center justify-between sm:px-5 sm:py-3.5 md:px-6 md:py-4">
                  <div className="w-full h-5 rounded skeleton sm:w-48 sm:h-6" />
                  <div className="w-4 h-4 rounded skeleton shrink-0" />
                </div>
                <div className="px-4 pb-4 border-t border-primary-200/30 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
                  <div className="grid grid-cols-1 gap-3 sm:gap-3.5 md:grid-cols-2 md:gap-4 lg:grid-cols-4 mb-4 sm:mb-5 md:mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
                        <div className="mb-2 w-full h-3 rounded skeleton sm:w-24 sm:h-4" />
                        <div className="w-full h-7 rounded skeleton sm:w-32 sm:h-8" />
                      </div>
                    ))}
                  </div>
                  <div className="h-48 rounded-xl skeleton sm:h-56 md:h-64" />
                </div>
              </div>
            </div>

            {/* View Mode Selector & Log Count */}
            <div className="card shadow-xl mb-3 px-4 py-3 sm:mb-3.5 sm:px-5 sm:py-3.5 md:mb-4 md:px-6 md:py-4">
              <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-primary-500/10 rounded-lg p-1 w-full sm:gap-2 sm:w-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-8 rounded-md skeleton sm:w-24 sm:h-9" />
                  ))}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-full h-3 rounded skeleton sm:w-8 sm:h-4" />
                  <div className="w-full h-3 rounded skeleton sm:w-12 sm:h-4" />
                </div>
              </div>
            </div>

            {/* Logs Display */}
            {viewMode === 'dashboard' ? (
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Template Tabs */}
                <div className="card shadow-xl px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full h-9 rounded-lg skeleton sm:w-32 sm:h-10" />
                    ))}
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="card shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-primary-200/30 sm:px-5 sm:py-3.5 md:px-6 md:py-4">
                        <div className="flex justify-between items-center">
                          <div className="w-full h-4 rounded skeleton sm:w-32 sm:h-5" />
                          <div className="flex gap-1.5 shrink-0 sm:gap-2">
                            <div className="w-5 h-5 rounded skeleton sm:w-6 sm:h-6" />
                            <div className="w-5 h-5 rounded skeleton sm:w-6 sm:h-6" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 md:p-6">
                        <div className="h-24 rounded-xl skeleton sm:h-28 md:h-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card shadow-xl overflow-hidden">
                {/* Table Header */}
                <div className="px-4 py-3 border-b border-primary-200/30 bg-gradient-to-r from-primary-50/50 to-transparent sm:px-5 sm:py-3.5 md:px-6 md:py-4">
                  <div className="flex items-center overflow-x-auto">
                    <div className="flex-shrink-0 w-10 sm:w-12"></div>
                    <div className="flex-1 grid grid-cols-3 gap-2 min-w-max sm:grid-cols-6 sm:gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="w-20 h-3 rounded skeleton sm:w-24 sm:h-4" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-primary-200/20">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className="px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4">
                      <div className="flex items-center overflow-x-auto">
                        <div className="flex-shrink-0 w-10 sm:w-12">
                          <div className="w-5 h-5 rounded skeleton sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-2 min-w-max sm:grid-cols-6 sm:gap-4">
                          <div className="col-span-1 sm:col-span-2">
                            <div className="mb-1 w-full h-3 rounded skeleton sm:w-32 sm:h-4" />
                            <div className="w-full h-2.5 rounded skeleton sm:w-24 sm:h-3" />
                          </div>
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="w-full h-3 rounded skeleton sm:w-20 sm:h-4" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

