import React from "react";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ShimmerStatsCard: React.FC<{ icon: React.ComponentType<{ className?: string }> }> = ({ icon: Icon }) => {
  return (
    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 md:p-6">
      <div className="flex items-center">
        <div className="p-2 mr-3 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20 sm:p-2.5 md:p-3 sm:mr-3.5 md:mr-4">
          <Icon className="w-5 h-5 text-primary-500/50 sm:w-5.5 md:w-6 sm:h-5.5 md:h-6" />
        </div>
        <div className="flex-1">
          <div className="skeleton h-3.5 w-20 mb-1.5 rounded sm:h-4 sm:w-22 sm:mb-2 md:w-24" />
          <div className="skeleton h-6 w-24 rounded sm:h-7 sm:w-28 md:h-8 md:w-32" />
        </div>
      </div>
    </div>
  );
};

const ShimmerTokenBreakdownCard: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover sm:p-5 md:p-6">
      <div className="flex items-center">
        <div className="p-2 mr-3 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20 sm:p-2.5 md:p-3 sm:mr-3.5 md:mr-4">
          <ChartBarIcon className="w-5 h-5 text-accent-500/50 sm:w-5.5 md:w-6 sm:h-5.5 md:h-6" />
        </div>
        <div className="flex-1">
          <div className="skeleton h-3.5 w-24 mb-1.5 rounded sm:h-4 sm:w-26 sm:mb-2 md:w-28" />
          <div className="skeleton h-6 w-24 mb-1.5 rounded sm:h-7 sm:w-28 sm:mb-2 md:h-8 md:w-32" />
          <div className="flex justify-between mt-1.5 sm:mt-2">
            <div className="skeleton h-2.5 w-16 rounded sm:h-3 sm:w-18 md:w-20" />
            <div className="skeleton h-2.5 w-16 rounded sm:h-3 sm:w-18 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ShimmerRequestsTableRow: React.FC = () => {
  return (
    <tr className="transition-all duration-300">
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-3.5 w-20 rounded sm:h-4 sm:w-22 md:w-24" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-5 w-16 rounded-full sm:h-5.5 sm:w-18 md:h-6 md:w-20" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="skeleton w-3.5 h-3.5 rounded-full sm:w-4 sm:h-4" />
          <div className="skeleton h-3.5 w-6 rounded sm:h-4 sm:w-7 md:w-8" />
        </div>
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-5 w-14 rounded-full sm:h-5.5 sm:w-15 md:h-6 md:w-16" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-5 w-16 rounded-full sm:h-5.5 sm:w-18 md:h-6 md:w-20" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-3.5 w-16 rounded sm:h-4 sm:w-18 md:w-20" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-5 w-14 rounded-full sm:h-5.5 sm:w-15 md:h-6 md:w-16" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-5 w-20 rounded-full sm:h-5.5 sm:w-22 md:h-6 md:w-24" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-3.5 w-16 rounded sm:h-4 sm:w-18 md:w-20" />
      </td>
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
        <div className="skeleton h-5 w-20 rounded-full sm:h-5.5 sm:w-22 md:h-6 md:w-24" />
      </td>
    </tr>
  );
};

export const RequestsShimmer: React.FC = () => {
  return (
    <div className="p-3 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient sm:p-4 md:p-6">
      {/* Header Shimmer */}
      <div className="p-4 mb-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 sm:mb-6 md:p-6 md:mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="skeleton h-7 w-28 mb-2 rounded sm:h-8 sm:w-30 md:h-9 md:w-32" />
            <div className="skeleton h-3.5 w-48 rounded sm:h-4 sm:w-56 md:w-64" />
          </div>
          <div className="flex gap-2 mt-3 sm:gap-2.5 sm:mt-0 md:gap-3">
            <div className="skeleton h-9 w-20 rounded-xl sm:h-9.5 sm:w-22 md:h-10 md:w-24" />
          </div>
        </div>
      </div>

      {/* Stats Cards Shimmer */}
      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 sm:mb-6 md:gap-6 md:mb-8 lg:grid-cols-4">
        <ShimmerStatsCard icon={ChartBarIcon} />
        <ShimmerStatsCard icon={ChartBarIcon} />
        <ShimmerStatsCard icon={ClockIcon} />
        <ShimmerStatsCard icon={CheckCircleIcon} />
        <ShimmerTokenBreakdownCard />
      </div>

      {/* Filters and Search Shimmer */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel mb-4 sm:mb-5 md:mb-6">
        <div className="px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3.5 md:gap-4">
            <div className="flex-1">
              <div className="skeleton h-10 rounded-xl sm:h-10.5 md:h-11" />
            </div>
            <div className="flex-shrink-0">
              <div className="skeleton h-10 w-full rounded-xl sm:h-10.5 sm:w-36 md:h-11 md:w-40" />
            </div>
            <div className="flex-shrink-0">
              <div className="skeleton h-10 w-full rounded-xl sm:h-10.5 sm:w-28 md:h-11 md:w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table Shimmer */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
          <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-primary-200/30">
                <thead className="bg-gradient-to-r rounded-lg border glass border-primary-200/20 from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <th key={i} className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
                        <div className="skeleton h-3.5 w-16 rounded sm:h-4 sm:w-18 md:w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-br divide-y glass from-light-bg-100/50 to-light-bg-200/50 dark:from-dark-bg-100/50 dark:to-dark-bg-200/50 divide-primary-200/20">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <ShimmerRequestsTableRow key={i} />
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
