import React from "react";

export const SubscriptionPlansShimmer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4 w-64 h-12 rounded skeleton mx-auto" />
          <div className="mb-8 w-96 h-6 rounded skeleton mx-auto" />

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary relative pt-6">
            <div className="w-24 h-10 rounded-xl skeleton" />
            <div className="w-24 h-10 rounded-xl skeleton" />
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-6 mb-12 pt-8 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card p-8 pt-12 relative transition-all h-full flex flex-col"
            >
              {/* Popular Badge */}
              {i === 2 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="w-32 h-8 rounded-full skeleton" />
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className="mb-2 w-32 h-7 rounded skeleton" />
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="w-24 h-10 rounded skeleton" />
                  <div className="w-12 h-5 rounded skeleton" />
                </div>
                <div className="w-32 h-4 rounded skeleton" />
              </div>

              {/* Limits Summary */}
              <div className="mb-6 space-y-3 text-sm">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="w-20 h-4 rounded skeleton" />
                    <div className="w-24 h-4 rounded skeleton" />
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-8 flex-grow">
                {[1, 2, 3, 4, 5].map((j) => (
                  <li key={j} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded skeleton flex-shrink-0 mt-0.5" />
                    <div className="w-3/4 h-4 rounded skeleton" />
                  </li>
                ))}
              </ul>

              {/* AI Models Access */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-24 h-4 rounded skeleton" />
                  <div className="w-16 h-5 rounded-full skeleton" />
                </div>
                <div className="w-full h-3 rounded skeleton" />
              </div>

              {/* Seats Information */}
              <div className="mb-6 p-3 rounded-lg border skeleton">
                <div className="w-20 h-3 rounded skeleton mb-1" />
                <div className="w-32 h-4 rounded skeleton" />
              </div>

              {/* CTA Button */}
              <div className="w-full h-12 rounded-lg skeleton mt-auto" />
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="card p-8 mb-12">
          <div className="mb-8 w-64 h-9 rounded skeleton mx-auto" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200/20 dark:border-primary-800/20">
                  <th className="text-left py-4 px-6">
                    <div className="w-24 h-5 rounded skeleton" />
                  </th>
                  {[1, 2, 3, 4].map((i) => (
                    <th key={i} className="text-center py-4 px-6">
                      <div className="w-32 h-5 rounded skeleton mx-auto" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-200/10 dark:divide-primary-800/10">
                {/* Section Header */}
                <tr>
                  <td className="py-4 px-6 bg-primary-500/10" colSpan={5}>
                    <div className="w-40 h-5 rounded skeleton" />
                  </td>
                </tr>
                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                  <tr key={row}>
                    <td className="py-4 px-6">
                      <div className="w-32 h-4 rounded skeleton" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-4 px-6">
                        <div className="w-6 h-6 rounded skeleton mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Another Section Header */}
                <tr>
                  <td className="py-4 px-6 bg-primary-500/10" colSpan={5}>
                    <div className="w-48 h-5 rounded skeleton" />
                  </td>
                </tr>
                {/* More Table Rows */}
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    <td className="py-4 px-6">
                      <div className="w-40 h-4 rounded skeleton" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-4 px-6">
                        <div className="w-6 h-6 rounded skeleton mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Another Section Header */}
                <tr>
                  <td className="py-4 px-6 bg-primary-500/10" colSpan={5}>
                    <div className="w-44 h-5 rounded skeleton" />
                  </td>
                </tr>
                {/* More Table Rows */}
                {[1, 2, 3, 4, 5, 6].map((row) => (
                  <tr key={row}>
                    <td className="py-4 px-6">
                      <div className="w-36 h-4 rounded skeleton" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-4 px-6">
                        <div className="w-6 h-6 rounded skeleton mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Another Section Header */}
                <tr>
                  <td className="py-4 px-6 bg-primary-500/10" colSpan={5}>
                    <div className="w-40 h-5 rounded skeleton" />
                  </td>
                </tr>
                {/* More Table Rows */}
                {[1, 2].map((row) => (
                  <tr key={row}>
                    <td className="py-4 px-6">
                      <div className="w-32 h-4 rounded skeleton" />
                    </td>
                    {[1, 2, 3, 4].map((col) => (
                      <td key={col} className="text-center py-4 px-6">
                        <div className="w-24 h-4 rounded skeleton mx-auto" />
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
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="p-6 card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="mb-2 w-32 h-8 rounded skeleton" />
            <div className="flex gap-3 items-center">
              <div className="w-20 h-6 rounded-full skeleton" />
              <div className="w-32 h-4 rounded skeleton" />
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 h-10 rounded skeleton" />
            <div className="mt-1 w-16 h-4 rounded skeleton" />
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-2 border-primary-200/20 dark:border-primary-800/20">
          <div className="flex gap-3 items-center">
            <div className="w-5 h-5 rounded skeleton" />
            <div>
              <div className="mb-1 w-32 h-3 rounded skeleton" />
              <div className="w-40 h-4 rounded skeleton" />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-5 h-5 rounded skeleton" />
            <div>
              <div className="mb-1 w-32 h-3 rounded skeleton" />
              <div className="w-40 h-4 rounded skeleton" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 items-center pt-6 mt-6 border-t border-primary-200/20 dark:border-primary-800/20">
          <div className="flex-1 h-11 rounded-lg skeleton" />
          <div className="w-40 h-11 rounded-lg skeleton" />
        </div>
      </div>

      {/* Usage Meters */}
      <div className="p-6 card">
        <div className="mb-6 w-40 h-7 rounded skeleton" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="w-32 h-5 rounded skeleton" />
                <div className="w-24 h-5 rounded skeleton" />
              </div>
              <div className="w-full h-3 rounded-full skeleton" />
              <div className="flex justify-between items-center">
                <div className="w-32 h-4 rounded skeleton" />
                <div className="w-24 h-4 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="p-6 card">
        <div className="mb-6 w-40 h-7 rounded skeleton" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60"
            >
              <div className="flex gap-3 items-center mb-2">
                <div className="w-5 h-5 rounded skeleton" />
                <div className="w-24 h-3 rounded skeleton" />
              </div>
              <div className="w-32 h-7 rounded skeleton" />
            </div>
          ))}
        </div>

        {/* Feature Breakdown */}
        <div className="mb-6">
          <div className="mb-4 w-48 h-6 rounded skeleton" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 bg-gradient-to-br rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60"
              >
                <div className="flex gap-3 items-center mb-3">
                  <div className="p-2 w-9 h-9 rounded-lg skeleton" />
                  <div className="w-32 h-5 rounded skeleton" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-4 rounded skeleton" />
                    <div className="w-20 h-4 rounded skeleton" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-4 rounded skeleton" />
                    <div className="w-24 h-4 rounded skeleton" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-4 rounded skeleton" />
                    <div className="w-20 h-4 rounded skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Breakdown */}
        <div className="mb-6">
          <div className="mb-4 w-48 h-6 rounded skeleton" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
              >
                <div className="w-32 h-4 rounded skeleton" />
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-4 rounded skeleton" />
                  <div className="w-20 h-4 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Models Breakdown */}
        <div className="mb-6">
          <div className="mb-4 w-48 h-6 rounded skeleton" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
              >
                <div className="w-40 h-4 rounded skeleton" />
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-4 rounded skeleton" />
                  <div className="w-20 h-4 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Breakdown */}
        <div>
          <div className="mb-4 w-48 h-6 rounded skeleton" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-gradient-to-br rounded-lg border shadow-sm backdrop-blur-xl glass border-primary-200/30 from-white/50 to-white/30 dark:from-dark-card/50 dark:to-dark-card/30"
              >
                <div className="w-40 h-4 rounded skeleton" />
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-4 rounded skeleton" />
                  <div className="w-20 h-4 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

