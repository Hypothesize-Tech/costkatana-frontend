import React from 'react';

const ShimmerSummaryCard: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg skeleton flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 sm:mb-2 w-16 sm:w-20 h-2.5 sm:h-3 rounded skeleton" />
          <div className="w-20 sm:w-24 h-5 sm:h-6 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

const ShimmerChart: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 p-4 sm:p-5 md:p-6">
      <div className="mb-3 sm:mb-4 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
      <div className="h-48 sm:h-56 md:h-64 rounded-lg skeleton" />
    </div>
  );
};

const ShimmerBudgetUtilization: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl p-4 sm:p-4.5 md:p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 mb-4 sm:mb-5 md:mb-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 sm:mb-2 w-32 sm:w-36 md:w-40 h-4 sm:h-4.5 md:h-5 rounded skeleton" />
          <div className="w-28 sm:w-30 md:w-32 h-2.5 sm:h-3 rounded skeleton" />
        </div>
        <div className="w-28 sm:w-30 md:w-32 h-4 sm:h-4.5 md:h-5 rounded skeleton flex-shrink-0" />
      </div>
      <div className="w-full h-2.5 sm:h-3 rounded-full skeleton" />
    </div>
  );
};

const ShimmerInsights: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl rounded-xl p-4 sm:p-4.5 md:p-5 border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 mb-4 sm:mb-5 md:mb-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton flex-shrink-0" />
        <div className="w-40 sm:w-44 md:w-48 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
      </div>
      <div className="space-y-2 sm:space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass backdrop-blur-sm rounded-lg p-3 sm:p-3.5 border border-primary-200/30">
            <div className="flex items-start gap-2 sm:gap-2.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full skeleton mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="w-full h-3 sm:h-4 rounded skeleton mb-1.5 sm:mb-2" />
                <div className="w-3/4 h-3 sm:h-4 rounded skeleton" />
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
    <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen">
      {/* Header Shimmer */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-xl bg-gradient-to-br from-white/90 to-white/80 dark:from-dark-card/90 dark:to-dark-card/80 p-4 sm:p-4.5 md:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl skeleton flex-shrink-0" />
              <div>
                <div className="mb-1.5 sm:mb-2 w-40 sm:w-44 md:w-48 h-6 sm:h-6.5 md:h-7 rounded skeleton" />
                <div className="w-56 sm:w-60 md:w-64 h-2.5 sm:h-3 rounded skeleton" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-24 h-8 sm:h-9 rounded-lg skeleton" />
              <div className="w-9 h-8 sm:w-10 sm:h-9 rounded-lg skeleton" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-primary-200/30">
            <div className="flex items-center gap-1.5 sm:gap-2 glass rounded-lg p-1.5 sm:p-2 border border-primary-200/30">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg skeleton" />
              <div className="w-28 sm:w-32 h-7 sm:h-8 rounded skeleton" />
              <div className="w-24 sm:w-28 h-7 sm:h-8 rounded skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Shimmer */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <ShimmerSummaryCard />
        <ShimmerSummaryCard />
        <ShimmerSummaryCard />
        <ShimmerSummaryCard />
      </div>

      {/* Budget Utilization Shimmer (optional) */}
      <ShimmerBudgetUtilization />

      {/* Charts Shimmer */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 mb-4 sm:mb-5 md:mb-6 lg:grid-cols-2">
        <ShimmerChart />
        <ShimmerChart />
      </div>

      {/* Model Comparison Shimmer */}
      <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 mb-4 sm:mb-5 md:mb-6 p-4 sm:p-5 md:p-6">
        <div className="mb-3 sm:mb-4 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-primary-200/30">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="w-20 sm:w-24 h-3 sm:h-4 rounded skeleton" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b border-primary-200/20">
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} className="px-3 sm:px-4 py-2.5 sm:py-3">
                      <div className="w-16 sm:w-20 h-3 sm:h-4 rounded skeleton" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Analytics Shimmer */}
      <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 mb-4 sm:mb-5 md:mb-6 p-4 sm:p-5 md:p-6">
        <div className="mb-3 sm:mb-4 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 sm:p-4 rounded-lg border border-primary-200/30">
              <div className="mb-1.5 sm:mb-2 w-28 sm:w-32 h-3 sm:h-4 rounded skeleton" />
              <div className="w-20 sm:w-24 h-5 sm:h-6 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Analytics Shimmer */}
      <div className="glass backdrop-blur-xl rounded-xl border border-primary-200/30 shadow-lg bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 mb-4 sm:mb-5 md:mb-6 p-4 sm:p-5 md:p-6">
        <div className="mb-3 sm:mb-4 w-32 sm:w-36 md:w-40 h-5 sm:h-5.5 md:h-6 rounded skeleton" />
        <div className="h-40 sm:h-44 md:h-48 rounded-lg skeleton" />
      </div>

      {/* Insights Shimmer */}
      <ShimmerInsights />
    </div>
  );
};

