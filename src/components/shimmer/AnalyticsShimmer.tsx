import React from 'react';

const ShimmerSummaryCard: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg skeleton" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 w-20 h-3 rounded skeleton" />
          <div className="w-24 h-6 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

const ShimmerChart: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 p-6">
      <div className="mb-4 w-40 h-6 rounded skeleton" />
      <div className="h-64 rounded-lg skeleton" />
    </div>
  );
};

const ShimmerBudgetUtilization: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="flex-1">
          <div className="mb-2 w-40 h-5 rounded skeleton" />
          <div className="w-32 h-3 rounded skeleton" />
        </div>
        <div className="w-32 h-5 rounded skeleton" />
      </div>
      <div className="w-full h-3 rounded-full skeleton" />
    </div>
  );
};

const ShimmerInsights: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="w-48 h-6 rounded skeleton" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass backdrop-blur-sm rounded-lg p-3.5 border border-primary-200/30">
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full skeleton mt-1" />
              <div className="flex-1">
                <div className="w-full h-4 rounded skeleton mb-2" />
                <div className="w-3/4 h-4 rounded skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalyticsShimmer: React.FC = () => {
  return (
    <div className="px-5 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen">
      {/* Header Shimmer */}
      <div className="mb-6">
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div>
                <div className="mb-2 w-48 h-7 rounded skeleton" />
                <div className="w-64 h-3 rounded skeleton" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-9 rounded-lg skeleton" />
              <div className="w-10 h-9 rounded-lg skeleton" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-primary-200/30">
            <div className="flex items-center gap-2 glass rounded-lg p-2 border border-primary-200/30">
              <div className="w-6 h-6 rounded-lg skeleton" />
              <div className="w-32 h-8 rounded skeleton" />
              <div className="w-28 h-8 rounded skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Shimmer */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <ShimmerSummaryCard />
        <ShimmerSummaryCard />
        <ShimmerSummaryCard />
        <ShimmerSummaryCard />
      </div>

      {/* Budget Utilization Shimmer (optional) */}
      <ShimmerBudgetUtilization />

      {/* Charts Shimmer */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
        <ShimmerChart />
        <ShimmerChart />
      </div>

      {/* Model Comparison Shimmer */}
      <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 mb-6 p-6">
        <div className="mb-4 w-40 h-6 rounded skeleton" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200/30">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="w-24 h-4 rounded skeleton" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b border-primary-200/20">
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} className="px-4 py-3">
                      <div className="w-20 h-4 rounded skeleton" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Analytics Shimmer */}
      <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 mb-6 p-6">
        <div className="mb-4 w-40 h-6 rounded skeleton" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-primary-200/30">
              <div className="mb-2 w-32 h-4 rounded skeleton" />
              <div className="w-24 h-6 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Analytics Shimmer */}
      <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 mb-6 p-6">
        <div className="mb-4 w-40 h-6 rounded skeleton" />
        <div className="h-48 rounded-lg skeleton" />
      </div>

      {/* Insights Shimmer */}
      <ShimmerInsights />
    </div>
  );
};

