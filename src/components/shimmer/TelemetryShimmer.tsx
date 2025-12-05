import React from "react";
import {
  SparklesIcon,
} from "@heroicons/react/24/outline";

const ShimmerTabButton: React.FC = () => {
  return (
    <div className="w-full sm:w-28 md:w-32 h-10 rounded-lg skeleton" />
  );
};

// Overview Tab Shimmer Components
const ShimmerPerformanceOverviewCard: React.FC = () => {
  return (
    <div className="p-4 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="mb-2 w-14 md:w-16 h-3 md:h-4 rounded skeleton" />
          <div className="w-20 md:w-24 h-8 md:h-10 rounded skeleton" />
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg skeleton" />
      </div>
      <div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" />
    </div>
  );
};

const ShimmerCostAnalytics: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
        </div>
        <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-7 md:w-12 md:h-8 rounded-md skeleton" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-48 md:h-64 rounded-xl skeleton" />
    </div>
  );
};

const ShimmerErrorMonitor: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-28 md:w-32 h-5 md:h-6 rounded skeleton" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 md:p-4 rounded-lg border glass border-primary-200/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <div className="mb-2 w-full sm:w-48 h-3 md:h-4 rounded skeleton" />
                <div className="w-28 md:w-32 h-3 rounded skeleton" />
              </div>
              <div className="w-14 md:w-16 h-5 md:h-6 rounded-full skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShimmerTopOperations: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-success-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
        </div>
        <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-7 md:w-12 md:h-8 rounded-md skeleton" />
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-primary-200/30">
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" /></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-primary-200/20">
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-32 md:w-40 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ShimmerTopErrors: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-28 md:w-32 h-5 md:h-6 rounded skeleton" />
        </div>
        <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-7 md:w-12 md:h-8 rounded-md skeleton" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg border glass border-primary-200/30">
            <div className="flex-1 w-full sm:w-auto">
              <div className="mb-1 w-full sm:w-48 h-3 md:h-4 rounded skeleton" />
              <div className="w-28 md:w-32 h-3 rounded skeleton" />
            </div>
            <div className="w-14 md:w-16 h-5 md:h-6 rounded-full skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
};

const ShimmerTelemetryExplorer: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
        </div>
        <div className="w-20 md:w-24 h-9 md:h-10 rounded-xl skeleton" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-11 rounded skeleton" />
        ))}
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-primary-200/30">
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" /></th>
              <th className="px-3 md:px-4 py-2 md:py-3"><div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" /></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="border-b border-primary-200/20">
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-5 md:h-6 rounded-full skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" /></td>
                <td className="px-3 md:px-4 py-2 md:py-3"><div className="w-24 md:w-28 h-3 md:h-4 rounded skeleton" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 md:mt-6">
        <div className="w-40 md:w-48 h-3 md:h-4 rounded skeleton" />
      </div>
    </div>
  );
};

// AI Insights Tab Shimmer Components
const ShimmerAICard: React.FC = () => {
  return (
    <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex gap-2 items-center mb-4">
        <div className="flex justify-center items-center w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-primary/20">
          <SparklesIcon className="w-3 h-3 md:w-4 md:h-4 text-primary-500/50" />
        </div>
        <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" />
            <div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" />
          </div>
        ))}
        <div className="w-full h-2 rounded-full skeleton" />
      </div>
    </div>
  );
};

const ShimmerProcessingTypeCard: React.FC = () => {
  return (
    <div className="p-3 bg-gradient-to-r rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1 w-full sm:w-auto">
          <div className="mb-1 w-full sm:w-32 h-4 md:h-5 rounded skeleton" />
          <div className="w-32 md:w-40 h-3 rounded skeleton" />
        </div>
        <div className="w-14 md:w-16 h-3 md:h-4 rounded skeleton" />
      </div>
    </div>
  );
};

const ShimmerRecommendationCard: React.FC = () => {
  return (
    <div className="p-3 md:p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-xl glass border-primary-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="w-28 md:w-32 h-4 md:h-5 rounded skeleton" />
          <div className="w-16 md:w-20 h-5 md:h-6 rounded-full skeleton" />
        </div>
        <div className="w-20 md:w-24 h-5 md:h-6 rounded-full skeleton" />
      </div>
      <div className="mb-3 w-full h-3 md:h-4 rounded skeleton" />
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="w-32 md:w-40 h-3 rounded skeleton" />
        <div className="w-20 md:w-24 h-4 md:h-5 rounded-full skeleton" />
      </div>
    </div>
  );
};

const ShimmerInsightCard: React.FC = () => {
  return (
    <div className="p-3 bg-gradient-to-r rounded-lg border-l-4 shadow-lg backdrop-blur-xl glass border-primary-500 dark:border-primary-400 from-primary-50/30 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-between items-start">
        <div className="flex-1 w-full sm:w-auto">
          <div className="mb-1 w-full sm:w-40 h-4 md:h-5 rounded skeleton" />
          <div className="w-full h-3 md:h-4 rounded skeleton" />
        </div>
        <div className="w-16 md:w-20 h-3 md:h-4 rounded skeleton" />
      </div>
    </div>
  );
};

// Explorer Tab Shimmer Components
const ShimmerSpanExplorer: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="mb-2 w-20 md:w-24 h-3 md:h-4 rounded skeleton" />
                <div className="w-16 md:w-20 h-8 md:h-10 rounded skeleton" />
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl skeleton" />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="p-4 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex gap-2 md:gap-3 items-center mb-4">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
          <div className="w-28 md:w-32 h-4 md:h-5 rounded skeleton" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <div className="w-full h-11 pl-10 md:pl-12 rounded skeleton" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-32 h-11 rounded skeleton" />
            <div className="w-full sm:w-32 h-11 rounded skeleton" />
          </div>
        </div>
      </div>

      {/* Spans List */}
      <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-primary-200/30">
          <div className="flex gap-2 md:gap-3 items-center">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
            <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
          </div>
        </div>
        <div className="divide-y divide-primary-200/20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 w-full sm:w-48 h-4 md:h-5 rounded skeleton" />
                    <div className="flex flex-wrap gap-2">
                      <div className="w-16 md:w-20 h-4 md:h-5 rounded-full skeleton" />
                      <div className="w-14 md:w-16 h-4 md:h-5 rounded skeleton" />
                      <div className="w-16 md:w-20 h-4 md:h-5 rounded-full skeleton" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-20 h-5 md:h-6 rounded-full skeleton" />
                  <div className="w-full sm:w-16 h-5 md:h-6 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Traces Tab Shimmer Components
const ShimmerTraceViewer: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-28 md:w-32 h-5 md:h-6 rounded skeleton" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-grow w-full h-11 rounded skeleton" />
          <div className="w-full sm:w-32 h-11 rounded-xl skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex gap-2 md:gap-3 items-center mb-4">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
            <div className="w-32 md:w-40 h-4 md:h-5 rounded skeleton" />
          </div>
          <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto glass rounded-xl p-3 md:p-4 border border-primary-200/30 shadow-lg backdrop-blur-xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 md:p-4 mb-3 md:mb-4 rounded-lg border glass border-primary-200/30">
                <div className="flex gap-2 items-center mb-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded skeleton" />
                  <div className="w-full sm:w-48 h-3 md:h-4 rounded skeleton" />
                </div>
                <div className="ml-5 md:ml-6 space-y-2">
                  <div className="w-full h-3 rounded skeleton" />
                  <div className="w-3/4 h-3 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-2 md:gap-3 items-center mb-4">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
            <div className="w-28 md:w-32 h-4 md:h-5 rounded skeleton" />
          </div>
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg border glass border-primary-200/30">
                <div className="mb-2 w-20 md:w-24 h-3 md:h-4 rounded skeleton" />
                <div className="w-full h-3 md:h-4 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShimmerServiceDependencyGraph: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-secondary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div className="flex gap-2 md:gap-3 items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
          <div className="w-40 md:w-48 h-5 md:h-6 rounded skeleton" />
        </div>
        <div className="w-full sm:w-28 h-9 md:h-10 rounded-xl skeleton" />
      </div>
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl skeleton" />
    </div>
  );
};

// Configuration Tab Shimmer Components
const ShimmerTelemetryConfiguration: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 w-full sm:w-64 h-6 md:h-8 rounded skeleton" />
            <div className="w-full h-3 md:h-4 rounded skeleton" />
          </div>
          <div className="w-full sm:w-32 h-10 md:h-11 rounded-xl skeleton" />
        </div>
      </div>

      {/* Config Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="p-4 md:p-6 border-b border-primary-200/20">
              <div className="flex gap-3 md:gap-4 justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="mb-2 w-28 md:w-32 h-5 md:h-6 rounded skeleton" />
                  <div className="w-16 md:w-20 h-5 md:h-6 rounded-full skeleton" />
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="w-28 md:w-32 h-3 md:h-4 rounded skeleton" />
                  <div className="w-20 md:w-24 h-3 md:h-4 rounded skeleton" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TelemetryShimmer: React.FC<{ activeTab?: 'overview' | 'ai-insights' | 'explorer' | 'traces' | 'configuration' }> = ({ activeTab = 'overview' }) => {
  return (
    <div className="p-3 md:p-4 lg:p-6 min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Header Shimmer */}
      <header className="mb-4 md:mb-6">
        <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex gap-2 md:gap-3 items-center mb-2">
            <div className="flex justify-center items-center w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg bg-gradient-primary/20">
              <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-primary-500/50" />
            </div>
            <div className="w-full sm:w-56 md:w-64 h-7 md:h-9 rounded skeleton" />
          </div>
          <div className="mb-3 md:mb-4 w-full sm:w-80 md:w-96 h-3 md:h-4 rounded skeleton" />
          <div className="w-full sm:w-32 h-9 md:h-10 rounded-xl skeleton" />
        </div>
      </header>

      {/* Navigation Tabs Shimmer */}
      <div className="mb-4 md:mb-6">
        <nav className="flex flex-wrap gap-2 p-2 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          {[1, 2, 3, 4, 5].map((i) => (
            <ShimmerTabButton key={i} />
          ))}
        </nav>
      </div>

      {/* Tab Content Shimmer */}
      {activeTab === 'overview' && (
        <div className="space-y-4 md:space-y-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full sm:w-48 h-6 md:h-8 rounded skeleton" />
            <div className="w-full sm:w-28 h-10 md:h-11 rounded-xl skeleton" />
          </div>

          {/* Performance Overview */}
          <div className="p-4 md:p-6 lg:p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <div className="flex gap-2 md:gap-3 items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl skeleton" />
                <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
              </div>
              <div className="p-1 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-7 md:w-12 md:h-8 rounded-md skeleton" />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ShimmerPerformanceOverviewCard key={i} />
              ))}
            </div>
          </div>

          {/* Enhanced Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 md:p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="mb-2 w-24 md:w-28 h-3 md:h-4 rounded skeleton" />
                    <div className="mb-1 w-20 md:w-24 h-6 md:h-8 rounded skeleton" />
                    <div className="w-16 md:w-20 h-3 rounded skeleton" />
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg skeleton" />
                </div>
              </div>
            ))}
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            <ShimmerCostAnalytics />
            <ShimmerErrorMonitor />
          </div>

          {/* Top Lists Grid */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            <ShimmerTopOperations />
            <ShimmerTopErrors />
          </div>

          {/* Telemetry Explorer */}
          <ShimmerTelemetryExplorer />
        </div>
      )}

      {activeTab === 'ai-insights' && (
        <div className="space-y-4 md:space-y-6">
          {/* Header with refresh button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full sm:w-64 h-6 md:h-8 rounded skeleton" />
            <div className="w-full sm:w-40 h-10 md:h-11 rounded-xl skeleton" />
          </div>

          {/* AI Enrichment Stats Grid */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            <ShimmerAICard />
            <div className="p-4 md:p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
              <div className="mb-4 w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ShimmerProcessingTypeCard key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations Shimmer */}
          <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-primary-200/20 dark:border-primary-500/10">
              <div className="flex gap-2 items-center">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg skeleton" />
                <div className="w-40 md:w-48 h-5 md:h-6 rounded skeleton" />
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {[1, 2, 3].map((i) => (
                  <ShimmerRecommendationCard key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Insights Shimmer */}
          <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-primary-200/20 dark:border-primary-500/10">
              <div className="w-32 md:w-40 h-5 md:h-6 rounded skeleton" />
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <ShimmerInsightCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'explorer' && <ShimmerSpanExplorer />}

      {activeTab === 'traces' && (
        <div className="space-y-4 md:space-y-6">
          <ShimmerTraceViewer />
          <ShimmerServiceDependencyGraph />
        </div>
      )}

      {activeTab === 'configuration' && <ShimmerTelemetryConfiguration />}
    </div>
  );
};
