import React from "react";
import { Database } from "lucide-react";

const ShimmerFeatureCard: React.FC = () => {
  return (
    <div className="flex gap-2 items-center p-3 rounded-xl border glass border-primary-200/30 sm:gap-2.5 sm:p-3.5 md:gap-3 md:p-4">
      <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
      <div className="flex-1 min-w-0">
        <div className="mb-1 w-full h-3.5 rounded skeleton sm:w-28 sm:h-4 md:w-32" />
        <div className="w-full h-2.5 rounded skeleton sm:w-40 sm:h-3 md:w-48" />
      </div>
    </div>
  );
};

const ShimmerTabButton: React.FC = () => {
  return (
    <div className="w-28 h-10 rounded skeleton sm:w-32 sm:h-11 md:w-40 md:h-12" />
  );
};

const ShimmerQueryInterface: React.FC = () => {
  return (
    <div className="mx-auto space-y-5 w-full max-w-4xl sm:space-y-6 md:space-y-8">
      {/* Query Input */}
      <div className="relative mb-5 sm:mb-6 md:mb-8">
        <div className="relative">
          <div className="py-3 pr-12 pl-10 w-full h-12 rounded-2xl skeleton sm:py-3.5 sm:pr-14 sm:pl-11 sm:h-14 md:py-4 md:pr-16 md:pl-12 md:h-16" />
          <div className="absolute right-1.5 top-1/2 w-10 h-10 rounded-xl skeleton sm:right-2 sm:w-11 sm:h-11 md:w-12 md:h-12" />
        </div>
      </div>

      {/* Example Queries Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 md:gap-4 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-3.5 md:p-4">
            <div className="flex gap-2 items-center mb-2.5 sm:mb-3">
              <div className="w-3.5 h-3.5 rounded skeleton sm:w-4 sm:h-4" />
              <div className="w-full h-3.5 rounded skeleton sm:w-20 sm:h-4 md:w-24" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-full h-6 rounded skeleton sm:h-7 md:h-8" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShimmerNotebookGallery: React.FC = () => {
  return (
    <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      {/* Tabs */}
      <div className="p-3 border-b border-primary-200/30 sm:p-4 md:p-6">
        <div className="flex gap-2.5 sm:gap-3 md:gap-4">
          <div className="w-full h-9 rounded-lg skeleton sm:w-28 sm:h-9.5 md:w-32 md:h-10" />
          <div className="w-full h-9 rounded-lg skeleton sm:w-28 sm:h-9.5 md:w-32 md:h-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
              <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-start">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col gap-2 items-start mb-2.5 sm:flex-row sm:items-center sm:gap-3 sm:mb-3">
                    <div className="w-full h-5 rounded skeleton sm:w-40 sm:h-5.5 md:w-48 md:h-6" />
                    <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
                  </div>
                  <div className="mb-3 w-full h-3.5 rounded skeleton sm:mb-3.5 md:mb-4 md:h-4" />
                  <div className="flex flex-wrap gap-2.5 items-center sm:gap-3 md:gap-4">
                    <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
                    <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
                  </div>
                </div>
                <div className="flex gap-1.5 items-center shrink-0 sm:gap-2 md:gap-2">
                  <div className="w-8 h-8 rounded-lg skeleton sm:w-9 sm:h-9 md:w-10 md:h-10" />
                  <div className="w-8 h-8 rounded-lg skeleton sm:w-9 sm:h-9 md:w-10 md:h-10" />
                  <div className="w-8 h-8 rounded-lg skeleton sm:w-9 sm:h-9 md:w-10 md:h-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShimmerVectorizationManager: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 justify-between items-start mb-5 sm:flex-row sm:items-center sm:gap-4 sm:mb-6 md:mb-8">
        <div className="flex gap-3 items-center sm:gap-3.5 md:gap-4">
          <div className="w-10 h-10 rounded-2xl skeleton sm:w-11 sm:h-11 md:w-12 md:h-12" />
          <div className="w-full h-7 rounded skeleton sm:w-40 sm:h-7.5 md:w-48 md:h-8" />
        </div>
        <div className="w-9 h-9 rounded-xl skeleton sm:w-9.5 sm:h-9.5 md:w-10 md:h-10" />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 sm:gap-4 sm:mb-6 md:grid-cols-4 md:gap-6 md:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
            <div className="mb-2 w-full h-8 rounded skeleton sm:w-20 sm:h-9 md:w-24 md:h-10" />
            <div className="w-full h-3.5 rounded skeleton sm:w-28 sm:h-4 md:w-32" />
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col gap-2 justify-between mb-2.5 sm:flex-row sm:items-center sm:mb-3">
          <div className="w-full h-3.5 rounded skeleton sm:w-36 sm:h-4 md:w-40" />
          <div className="w-full h-3.5 rounded skeleton sm:w-28 sm:h-4 md:w-32" />
        </div>
        <div className="w-full h-2.5 rounded-full skeleton sm:h-3 md:h-3" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        <div className="w-full h-10 rounded-xl skeleton sm:w-36 sm:h-10.5 md:w-40 md:h-11" />
        <div className="w-full h-10 rounded-xl skeleton sm:w-36 sm:h-10.5 md:w-40 md:h-11" />
        <div className="w-full h-10 rounded-xl skeleton sm:w-32 sm:h-10.5 md:w-36 md:h-11" />
      </div>

      {/* Info Section */}
      <div className="p-4 mt-5 rounded-2xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 sm:mt-6 md:p-6 md:mt-8">
        <div className="flex gap-2 items-center mb-2.5 sm:gap-2 sm:mb-3">
          <div className="w-5 h-5 rounded-lg skeleton sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
          <div className="w-full h-4.5 rounded skeleton sm:w-36 sm:h-5 md:w-40" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="w-full h-2.5 rounded skeleton sm:h-3" />
          <div className="w-full h-2.5 rounded skeleton sm:h-3" />
          <div className="w-3/4 h-2.5 rounded skeleton sm:h-3" />
        </div>
      </div>
    </div>
  );
};

const ShimmerAIInsights: React.FC = () => {
  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-8">
        <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center sm:gap-4">
          <div className="flex gap-3 items-center sm:gap-3.5 md:gap-4">
            <div className="w-10 h-10 rounded-xl skeleton sm:w-11 sm:h-11 md:w-12 md:h-12" />
            <div className="w-full h-8 rounded skeleton sm:w-56 sm:h-8.5 md:w-64 md:h-9" />
          </div>
          <div className="flex flex-wrap gap-2.5 items-center sm:gap-3">
            <div className="w-full h-9 rounded skeleton sm:w-28 sm:h-9.5 md:w-32 md:h-10" />
            <div className="w-full h-9 rounded-xl skeleton sm:w-24 sm:h-9.5 md:w-28 md:h-10" />
          </div>
        </div>
      </div>

      {/* Health Score & Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="w-9 h-9 rounded-xl skeleton sm:w-9.5 sm:h-9.5 md:w-10 md:h-10" />
              <div className="w-11 h-9 rounded skeleton sm:w-11.5 sm:h-9.5 md:w-12 md:h-10" />
            </div>
            <div className="mx-auto w-full h-3.5 rounded skeleton sm:w-20 sm:h-4 md:w-24" />
          </div>
        ))}
      </div>

      {/* Insights Sections */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
            <div className="mb-4 w-full h-5 rounded skeleton sm:w-40 sm:h-5.5 sm:mb-5 md:w-48 md:h-6 md:mb-6" />
            <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="p-3 rounded-lg border glass border-primary-200/30 sm:p-3.5 md:p-4">
                  <div className="flex flex-col gap-2 justify-between items-start mb-2 sm:flex-row sm:items-start">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="mb-2 w-full h-4.5 rounded skeleton sm:w-40 sm:h-5 md:w-48" />
                      <div className="w-full h-3.5 rounded skeleton sm:h-4" />
                    </div>
                    <div className="w-full h-5 rounded-full skeleton shrink-0 sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2.5 sm:mt-3">
                    <div className="w-full h-5 rounded-full skeleton sm:w-18 sm:h-5.5 md:w-20 md:h-6" />
                    <div className="w-full h-5 rounded-full skeleton sm:w-18 sm:h-5.5 md:w-20 md:h-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShimmerTelemetryViewer: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Filters */}
      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
        <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-3.5 sm:mb-5 md:grid-cols-4 md:gap-4 md:mb-6">
          <div className="w-full h-10 rounded skeleton sm:h-10.5 md:h-11" />
          <div className="w-full h-10 rounded skeleton sm:h-10.5 md:h-11" />
          <div className="w-full h-10 rounded skeleton sm:h-10.5 md:h-11" />
          <div className="w-full h-10 rounded skeleton sm:h-10.5 md:h-11" />
        </div>
        <div className="flex flex-col gap-2.5 justify-between items-stretch sm:flex-row sm:items-center sm:gap-3">
          <div className="w-full h-9 rounded-xl skeleton sm:w-28 sm:h-9.5 md:w-32 md:h-10" />
          <div className="w-full h-9 rounded-xl skeleton sm:w-20 sm:h-9.5 md:w-24 md:h-10" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel overflow-x-auto">
        {/* Header Row */}
        <div className="flex gap-2 items-center p-3 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 min-w-max sm:gap-3 sm:p-3.5 md:gap-4 md:p-4">
          <div className="w-5 h-5 rounded skeleton shrink-0 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
          <div className="flex-1 w-28 h-4 rounded skeleton sm:w-30 sm:h-4.5 md:w-32 md:h-5" />
          <div className="w-20 h-4 rounded skeleton shrink-0 sm:w-22 sm:h-4.5 md:w-24 md:h-5" />
          <div className="w-16 h-4 rounded skeleton shrink-0 sm:w-18 sm:h-4.5 md:w-20 md:h-5" />
          <div className="w-16 h-4 rounded skeleton shrink-0 sm:w-18 sm:h-4.5 md:w-20 md:h-5" />
          <div className="w-20 h-4 rounded skeleton shrink-0 sm:w-22 sm:h-4.5 md:w-24 md:h-5" />
          <div className="w-16 h-4 rounded skeleton shrink-0 sm:w-18 sm:h-4.5 md:w-20 md:h-5" />
        </div>

        {/* Data Rows */}
        <div className="p-3 space-y-3 sm:p-3.5 sm:space-y-3.5 md:p-4 md:space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex gap-2 items-center p-3 rounded-lg border glass border-primary-200/30 min-w-max sm:gap-3 sm:p-3.5 md:gap-4 md:p-4">
              <div className="w-5 h-5 rounded skeleton shrink-0 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
              <div className="flex-1 w-40 h-4 rounded skeleton sm:w-44 sm:h-4.5 md:w-48 md:h-5" />
              <div className="w-18 h-5 rounded-full skeleton shrink-0 sm:w-19 sm:h-5.5 md:w-20 md:h-6" />
              <div className="w-14 h-4 rounded skeleton shrink-0 sm:w-15 sm:h-4.5 md:w-16 md:h-5" />
              <div className="w-14 h-4 rounded skeleton shrink-0 sm:w-15 sm:h-4.5 md:w-16 md:h-5" />
              <div className="w-18 h-5 rounded-full skeleton shrink-0 sm:w-19 sm:h-5.5 md:w-20 md:h-6" />
              <div className="w-14 h-7 rounded-lg skeleton shrink-0 sm:w-15 sm:h-7.5 md:w-16 md:h-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShimmerAutoScaling: React.FC = () => {
  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-4 rounded-t-xl border-b bg-gradient-primary/10 border-primary-200/30 sm:p-5 md:p-8">
          <div className="flex flex-col gap-3 items-start mb-2.5 sm:flex-row sm:items-center sm:gap-3.5 sm:mb-3 md:gap-4">
            <div className="w-10 h-10 rounded-xl skeleton sm:w-11 sm:h-11 md:w-12 md:h-12" />
            <div className="w-full h-8 rounded skeleton sm:w-56 sm:h-8.5 md:w-64 md:h-9" />
          </div>
          <div className="w-full h-4 rounded skeleton sm:w-80 sm:h-4.5 md:w-96 md:h-5" />
        </div>
      </div>

      {/* Alerts Section */}
      <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
        <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
        {[1, 2].map((i) => (
          <div key={i} className="p-3 bg-gradient-to-br rounded-lg border glass border-warning-200/30 from-warning-50/30 to-warning-100/30 sm:p-3.5 md:p-4">
            <div className="flex gap-2.5 items-center mb-2 sm:gap-3">
              <div className="w-4 h-4 rounded skeleton sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              <div className="w-full h-4 rounded skeleton sm:w-40 sm:h-4.5 md:w-48 md:h-5" />
            </div>
            <div className="w-full h-3.5 rounded skeleton sm:h-4" />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
            <div className="flex flex-col gap-3 justify-between items-start mb-3 sm:flex-row sm:items-start sm:mb-3.5 md:mb-4">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col gap-2 items-start mb-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="w-full h-5 rounded skeleton sm:w-28 sm:h-5.5 md:w-32 md:h-6" />
                  <div className="w-full h-5 rounded-full skeleton sm:w-18 sm:h-5.5 md:w-20 md:h-6" />
                </div>
                <div className="mb-2 w-full h-3.5 rounded skeleton sm:h-4" />
                <div className="w-3/4 h-3.5 rounded skeleton sm:h-4" />
              </div>
              <div className="flex flex-row gap-2 shrink-0 sm:flex-col sm:gap-2">
                <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
                <div className="w-full h-5 rounded-full skeleton sm:w-20 sm:h-5.5 md:w-24 md:h-6" />
              </div>
            </div>
            <div className="mb-3 space-y-2.5 sm:mb-3.5 sm:space-y-3 md:mb-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-full h-3.5 rounded skeleton sm:h-4" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <div className="w-full h-9 rounded-xl skeleton sm:w-28 sm:h-9.5 md:w-32 md:h-10" />
              <div className="w-full h-9 rounded-xl skeleton sm:w-24 sm:h-9.5 md:w-28 md:h-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CostLakeShimmer: React.FC<{ activeTab?: 'query' | 'notebooks' | 'vectorization' | 'insights' | 'telemetry' | 'optimization' }> = ({ activeTab = 'query' }) => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      {/* Header Shimmer */}
      <div className="mx-3 mt-3 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:mx-4 sm:mt-4 md:mx-6 md:mt-6">
        <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-5 md:px-6 md:py-8">
          <div className="flex flex-col gap-3 items-start mb-3 sm:flex-row sm:items-center sm:gap-3.5 sm:mb-3.5 md:gap-4 md:mb-4">
            <div className="p-2.5 rounded-xl border glass border-primary-200/30 bg-gradient-primary/20 shrink-0 sm:p-2.5 md:p-3">
              <Database className="w-6 h-6 text-primary-500/50 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <div className="mb-1 w-full h-7 rounded skeleton sm:w-28 sm:h-8 md:w-32 md:h-9" />
              <div className="w-full h-3.5 rounded skeleton sm:w-80 sm:h-4 md:w-96" />
            </div>
          </div>

          {/* Key Features Shimmer */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-3 md:gap-4">
            <ShimmerFeatureCard />
            <ShimmerFeatureCard />
            <ShimmerFeatureCard />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Shimmer */}
      <div className="mx-3 mt-3 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:mx-4 sm:mt-4 md:mx-6 md:mt-6 overflow-x-auto">
        <div className="px-3 mx-auto max-w-7xl sm:px-4 md:px-6">
          <nav className="flex space-x-2 min-w-max sm:space-x-4 md:space-x-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerTabButton key={i} />
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content Shimmer */}
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-5 md:px-6 md:py-8">
        {activeTab === 'query' && <ShimmerQueryInterface />}
        {activeTab === 'notebooks' && <ShimmerNotebookGallery />}
        {activeTab === 'vectorization' && <ShimmerVectorizationManager />}
        {activeTab === 'insights' && <ShimmerAIInsights />}
        {activeTab === 'telemetry' && <ShimmerTelemetryViewer />}
        {activeTab === 'optimization' && <ShimmerAutoScaling />}
      </div>
    </div>
  );
};

