import React from "react";

export const SubscriptionPlansShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-6 px-3 sm:py-8 sm:px-4 md:py-10 md:px-4 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="mb-3 w-full h-9 rounded skeleton mx-auto sm:mb-4 sm:w-64 sm:h-10 md:h-11 lg:h-12" />
          <div className="mb-4 w-full h-4 rounded skeleton mx-auto sm:mb-6 sm:w-96 sm:h-5 md:mb-8 md:h-6" />

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary relative pt-4 sm:gap-3 sm:pt-5 md:gap-4 md:pt-6">
            <div className="w-full h-8 rounded-xl skeleton sm:w-20 sm:h-9 md:w-24 md:h-10" />
            <div className="w-full h-8 rounded-xl skeleton sm:w-20 sm:h-9 md:w-24 md:h-10" />
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 pt-4 sm:grid-cols-2 sm:gap-5 sm:mb-8 sm:pt-6 md:gap-6 md:mb-10 md:pt-8 lg:grid-cols-4 lg:mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card p-4 pt-8 relative transition-all h-full flex flex-col sm:p-6 sm:pt-10 md:p-8 md:pt-12"
            >
              {/* Popular Badge */}
              {i === 2 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 sm:-top-3.5 md:-top-4">
                  <div className="w-full h-6 rounded-full skeleton sm:w-28 sm:h-7 md:w-32 md:h-8" />
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-4 sm:mb-5 md:mb-6">
                <div className="mb-2 w-full h-6 rounded skeleton sm:w-32 sm:h-6.5 md:h-7" />
                <div className="flex items-baseline gap-1.5 mb-2 sm:gap-2">
                  <div className="w-full h-8 rounded skeleton sm:w-24 sm:h-9 md:h-10" />
                  <div className="w-full h-4 rounded skeleton sm:w-12 sm:h-4.5 md:h-5" />
                </div>
                <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-3.5 md:h-4" />
              </div>

              {/* Limits Summary */}
              <div className="mb-4 space-y-2 text-sm sm:mb-5 sm:space-y-2.5 md:mb-6 md:space-y-3">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:h-4" />
                    <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-3.5 md:h-4" />
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-4 flex-grow sm:space-y-2 sm:mb-6 md:mb-8">
                {[1, 2, 3, 4, 5].map((j) => (
                  <li key={j} className="flex items-start gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 rounded skeleton flex-shrink-0 mt-0.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                    <div className="w-3/4 h-3 rounded skeleton sm:h-3.5 md:h-4" />
                  </li>
                ))}
              </ul>

              {/* AI Models Access */}
              <div className="mb-4 sm:mb-5 md:mb-6">
                <div className="flex flex-wrap items-center gap-1.5 mb-2 sm:gap-2">
                  <div className="w-full h-3 rounded skeleton sm:w-24 sm:h-3.5 md:h-4" />
                  <div className="w-full h-4 rounded-full skeleton sm:w-16 sm:h-4.5 md:h-5" />
                </div>
                <div className="w-full h-2.5 rounded skeleton sm:h-3" />
              </div>

              {/* Seats Information */}
              <div className="mb-4 p-2.5 rounded-lg border skeleton sm:mb-5 sm:p-3 md:mb-6">
                <div className="w-full h-2.5 rounded skeleton mb-1 sm:w-20 sm:h-3" />
                <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-3.5 md:h-4" />
              </div>

              {/* CTA Button */}
              <div className="w-full h-10 rounded-lg skeleton mt-auto sm:h-11 md:h-12" />
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="card p-4 mb-6 sm:p-6 sm:mb-8 md:p-8 md:mb-10 lg:mb-12">
          <div className="mb-4 w-full h-7 rounded skeleton mx-auto sm:mb-6 sm:w-64 sm:h-8 md:mb-8 md:h-9" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-primary-200/20 dark:border-primary-800/20">
                  <th className="text-left py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                    <div className="w-full h-4 rounded skeleton sm:w-20 sm:h-4.5 md:w-24 md:h-5" />
                  </th>
                  {[1, 2, 3, 4].map((i) => (
                    <th key={i} className="text-center py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                      <div className="w-full h-4 rounded skeleton mx-auto sm:w-28 sm:h-4.5 md:w-32 md:h-5" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
                {/* Section Header */}
                <tr>
                  <td className="py-2 px-3 bg-primary-500/10 sm:py-3 sm:px-4 md:py-4 md:px-6" colSpan={5}>
                    <div className="w-full h-4 rounded skeleton sm:w-40 sm:h-4.5 md:h-5" />
                  </td>
                </tr>
                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                  <tr key={row}>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                      <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-3.5 md:w-32 md:h-4" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                        <div className="w-5 h-5 rounded skeleton mx-auto sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Another Section Header */}
                <tr>
                  <td className="py-2 px-3 bg-primary-500/10 sm:py-3 sm:px-4 md:py-4 md:px-6" colSpan={5}>
                    <div className="w-full h-4 rounded skeleton sm:w-44 sm:h-4.5 md:w-48 md:h-5" />
                  </td>
                </tr>
                {/* More Table Rows */}
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                      <div className="w-full h-3 rounded skeleton sm:w-36 sm:h-3.5 md:w-40 md:h-4" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                        <div className="w-5 h-5 rounded skeleton mx-auto sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Another Section Header */}
                <tr>
                  <td className="py-2 px-3 bg-primary-500/10 sm:py-3 sm:px-4 md:py-4 md:px-6" colSpan={5}>
                    <div className="w-full h-4 rounded skeleton sm:w-40 sm:h-4.5 md:w-44 md:h-5" />
                  </td>
                </tr>
                {/* More Table Rows */}
                {[1, 2, 3, 4, 5, 6].map((row) => (
                  <tr key={row}>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                      <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-3.5 md:w-36 md:h-4" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                        <div className="w-5 h-5 rounded skeleton mx-auto sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Another Section Header */}
                <tr>
                  <td className="py-2 px-3 bg-primary-500/10 sm:py-3 sm:px-4 md:py-4 md:px-6" colSpan={5}>
                    <div className="w-full h-4 rounded skeleton sm:w-36 sm:h-4.5 md:w-40 md:h-5" />
                  </td>
                </tr>
                {/* More Table Rows */}
                {[1, 2].map((row) => (
                  <tr key={row}>
                    <td className="py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                      <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-3.5 md:w-32 md:h-4" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6">
                        <div className="w-full h-3 rounded skeleton mx-auto sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subscription Dashboard Shimmer Component
export const SubscriptionDashboardShimmer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Current Plan Card */}
      <div className="p-4 card sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-start sm:mb-5 md:mb-6 sm:gap-0">
          <div className="flex-1 min-w-0 w-full">
            <div className="mb-2 w-full h-7 rounded skeleton sm:w-32 sm:h-7.5 md:h-8" />
            <div className="flex flex-wrap gap-2 items-center sm:gap-3">
              <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-5.5 md:h-6" />
              <div className="w-full h-3 rounded skeleton sm:w-32 sm:h-3.5 md:h-4" />
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
            <div className="w-full h-9 rounded skeleton sm:w-24 sm:h-9.5 md:h-10" />
            <div className="mt-1 w-full h-3 rounded skeleton sm:w-16 sm:h-3.5 md:h-4" />
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 gap-3 pt-3 border-t sm:grid-cols-2 sm:gap-4 sm:pt-4 md:border-primary-200/20 dark:border-primary-800/20">
          <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
            <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="mb-1 w-full h-2.5 rounded skeleton sm:w-32 sm:h-3" />
              <div className="w-full h-3 rounded skeleton sm:w-40 sm:h-3.5 md:h-4" />
            </div>
          </div>
          <div className="flex gap-2 items-center sm:gap-2.5 md:gap-3">
            <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="mb-1 w-full h-2.5 rounded skeleton sm:w-32 sm:h-3" />
              <div className="w-full h-3 rounded skeleton sm:w-40 sm:h-3.5 md:h-4" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 items-stretch pt-4 mt-4 border-t sm:flex-row sm:items-center sm:gap-3 sm:pt-5 sm:mt-5 md:pt-6 md:mt-6 border-primary-200/20 dark:border-primary-800/20">
          <div className="flex-1 h-10 rounded-lg skeleton sm:h-10.5 md:h-11" />
          <div className="w-full h-10 rounded-lg skeleton sm:w-40 sm:h-10.5 md:h-11" />
        </div>
      </div>

      {/* Usage Meters */}
      <div className="p-4 card sm:p-5 md:p-6">
        <div className="mb-4 w-full h-6 rounded skeleton sm:mb-5 sm:w-40 sm:h-6.5 md:mb-6 md:h-7" />
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <div className="w-full h-4 rounded skeleton sm:w-28 sm:h-4.5 md:w-32 md:h-5" />
                <div className="w-full h-4 rounded skeleton sm:w-20 sm:h-4.5 md:w-24 md:h-5" />
              </div>
              <div className="w-full h-2.5 rounded-full skeleton sm:h-3" />
              <div className="flex justify-between items-center">
                <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-3.5 md:w-32 md:h-4" />
                <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="p-4 card sm:p-5 md:p-6">
        <div className="mb-4 w-full h-6 rounded skeleton sm:mb-5 sm:w-40 sm:h-6.5 md:mb-6 md:h-7" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-3.5 sm:mb-5 md:grid-cols-4 md:gap-4 md:mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 sm:p-3.5 md:p-4"
            >
              <div className="flex gap-2 items-center mb-1.5 sm:gap-2.5 sm:mb-2 md:gap-3">
                <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 shrink-0" />
                <div className="w-full h-2.5 rounded skeleton sm:w-20 sm:h-3 md:w-24" />
              </div>
              <div className="w-full h-6 rounded skeleton sm:w-28 sm:h-6.5 md:w-32 md:h-7" />
            </div>
          ))}
        </div>

        {/* Feature Breakdown */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="mb-3 w-full h-5 rounded skeleton sm:mb-3.5 sm:w-44 sm:h-5.5 md:mb-4 md:w-48 md:h-6" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 md:gap-4 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-3 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 sm:p-3.5 md:p-4"
              >
                <div className="flex gap-2 items-center mb-2 sm:gap-2.5 sm:mb-2.5 md:gap-3 md:mb-3">
                  <div className="p-1.5 w-8 h-8 rounded-lg skeleton sm:p-2 sm:w-8.5 sm:h-8.5 md:w-9 md:h-9 shrink-0" />
                  <div className="w-full h-4 rounded skeleton sm:w-28 sm:h-4.5 md:w-32 md:h-5" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-full h-3 rounded skeleton sm:w-14 sm:h-3.5 md:w-16 md:h-4" />
                    <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                    <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                    <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Breakdown */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="mb-3 w-full h-5 rounded skeleton sm:mb-3.5 sm:w-44 sm:h-5.5 md:mb-4 md:w-48 md:h-6" />
          <div className="space-y-1.5 sm:space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 justify-between items-start p-2.5 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3"
              >
                <div className="w-full h-3 rounded skeleton sm:w-28 sm:h-3.5 md:w-32 md:h-4" />
                <div className="flex gap-2 items-center w-full sm:gap-3 sm:w-auto md:gap-4">
                  <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                  <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Models Breakdown */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="mb-3 w-full h-5 rounded skeleton sm:mb-3.5 sm:w-44 sm:h-5.5 md:mb-4 md:w-48 md:h-6" />
          <div className="space-y-1.5 sm:space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 justify-between items-start p-2.5 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3"
              >
                <div className="w-full h-3 rounded skeleton sm:w-36 sm:h-3.5 md:w-40 md:h-4" />
                <div className="flex gap-2 items-center w-full sm:gap-3 sm:w-auto md:gap-4">
                  <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                  <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Breakdown */}
        <div>
          <div className="mb-3 w-full h-5 rounded skeleton sm:mb-3.5 sm:w-44 sm:h-5.5 md:mb-4 md:w-48 md:h-6" />
          <div className="space-y-1.5 sm:space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 justify-between items-start p-2.5 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30 sm:flex-row sm:items-center sm:gap-0 sm:p-3"
              >
                <div className="w-full h-3 rounded skeleton sm:w-36 sm:h-3.5 md:w-40 md:h-4" />
                <div className="flex gap-2 items-center w-full sm:gap-3 sm:w-auto md:gap-4">
                  <div className="w-full h-3 rounded skeleton sm:w-20 sm:h-3.5 md:w-24 md:h-4" />
                  <div className="w-full h-3 rounded skeleton sm:w-18 sm:h-3.5 md:w-20 md:h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

