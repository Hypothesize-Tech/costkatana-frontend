import React from "react";

export const LogsShimmer: React.FC<{ viewMode?: 'table' | 'timeline' | 'json' | 'dashboard' }> = ({ viewMode = 'dashboard' }) => {
  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="card mb-6 shadow-xl">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="mb-1 w-64 h-9 rounded skeleton" />
              <div className="w-96 h-4 rounded skeleton" />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {viewMode === 'dashboard' && (
                <div className="w-40 h-10 rounded-lg skeleton" />
              )}
              <div className="w-40 h-10 rounded-lg skeleton" />
              <div className="w-32 h-10 rounded-lg skeleton" />
              <div className="w-28 h-10 rounded-lg skeleton" />
              <div className="w-32 h-10 rounded-lg skeleton" />
              <div className="w-28 h-10 rounded-lg skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="card shadow-xl">
                <div className="px-6 py-4 border-b border-primary-200/30">
                  <div className="w-32 h-6 rounded skeleton" />
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <div className="mb-2 w-24 h-4 rounded skeleton" />
                      <div className="w-full h-10 rounded skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Logs Content */}
          <div className="flex-1 min-w-0">
            {/* Stats Section */}
            <div className="mb-6">
              <div className="card shadow-xl overflow-hidden">
                <div className="w-full px-6 py-4 flex items-center justify-between">
                  <div className="w-48 h-6 rounded skeleton" />
                  <div className="w-4 h-4 rounded skeleton" />
                </div>
                <div className="px-6 pb-6 border-t border-primary-200/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 rounded-lg border glass border-primary-200/30">
                        <div className="mb-2 w-24 h-4 rounded skeleton" />
                        <div className="w-32 h-8 rounded skeleton" />
                      </div>
                    ))}
                  </div>
                  <div className="h-64 rounded-xl skeleton" />
                </div>
              </div>
            </div>

            {/* View Mode Selector & Log Count */}
            <div className="card shadow-xl mb-4 px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-primary-500/10 rounded-lg p-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-24 h-9 rounded-md skeleton" />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 rounded skeleton" />
                  <div className="w-12 h-4 rounded skeleton" />
                </div>
              </div>
            </div>

            {/* Logs Display */}
            {viewMode === 'dashboard' ? (
              <div className="space-y-6">
                {/* Template Tabs */}
                <div className="card shadow-xl px-6 py-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-32 h-10 rounded-lg skeleton" />
                    ))}
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="card shadow-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-primary-200/30">
                        <div className="flex justify-between items-center">
                          <div className="w-32 h-5 rounded skeleton" />
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded skeleton" />
                            <div className="w-6 h-6 rounded skeleton" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="h-32 rounded-xl skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card shadow-xl overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-primary-200/30 bg-gradient-to-r from-primary-50/50 to-transparent">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12"></div>
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="w-24 h-4 rounded skeleton" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-primary-200/20">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12">
                          <div className="w-6 h-6 rounded skeleton" />
                        </div>
                        <div className="flex-1 grid grid-cols-6 gap-4">
                          <div className="col-span-2">
                            <div className="mb-1 w-32 h-4 rounded skeleton" />
                            <div className="w-24 h-3 rounded skeleton" />
                          </div>
                          {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="w-20 h-4 rounded skeleton" />
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

