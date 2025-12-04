import React from "react";
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ShimmerStatsCard: React.FC<{ icon: React.ComponentType<{ className?: string }> }> = ({ icon: Icon }) => {
  return (
    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
      <div className="flex items-center">
        <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-primary-500/20 to-primary-600/20">
          <Icon className="w-6 h-6 text-primary-500/50" />
        </div>
        <div className="flex-1">
          <div className="skeleton h-4 w-24 mb-2 rounded" />
          <div className="skeleton h-8 w-32 rounded" />
        </div>
      </div>
    </div>
  );
};

const ShimmerTokenBreakdownCard: React.FC = () => {
  return (
    <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel card-hover">
      <div className="flex items-center">
        <div className="p-3 mr-4 bg-gradient-to-br rounded-xl from-accent-500/20 to-accent-600/20">
          <ChartBarIcon className="w-6 h-6 text-accent-500/50" />
        </div>
        <div className="flex-1">
          <div className="skeleton h-4 w-28 mb-2 rounded" />
          <div className="skeleton h-8 w-32 mb-2 rounded" />
          <div className="flex justify-between mt-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ShimmerRequestsTableRow: React.FC = () => {
  return (
    <tr className="transition-all duration-300">
      <td className="px-6 py-4">
        <div className="skeleton h-4 w-24 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-full" />
          <div className="skeleton h-4 w-8 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-4 w-20 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-24 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-4 w-20 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="skeleton h-6 w-24 rounded-full" />
      </td>
    </tr>
  );
};

export const RequestsShimmer: React.FC = () => {
  return (
    <div className="p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Header Shimmer */}
      <div className="p-6 mb-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="skeleton h-9 w-32 mb-2 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <div className="skeleton h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Stats Cards Shimmer */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <ShimmerStatsCard icon={ChartBarIcon} />
        <ShimmerStatsCard icon={ChartBarIcon} />
        <ShimmerStatsCard icon={ClockIcon} />
        <ShimmerStatsCard icon={CheckCircleIcon} />
        <ShimmerTokenBreakdownCard />
      </div>

      {/* Filters and Search Shimmer */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel mb-6">
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="skeleton h-11 rounded-xl" />
            </div>
            <div className="flex-shrink-0">
              <div className="skeleton h-11 w-40 rounded-xl" />
            </div>
            <div className="flex-shrink-0">
              <div className="skeleton h-11 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table Shimmer */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-6 py-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200/30">
              <thead className="bg-gradient-to-r rounded-lg border glass border-primary-200/20 from-light-bg-300/50 to-light-bg-400/50 dark:from-dark-bg-300/50 dark:to-dark-bg-400/50">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="skeleton h-4 w-20 rounded" />
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
  );
};

