import React from "react";
import { Database } from "lucide-react";

const ShimmerFeatureCard: React.FC = () => {
  return (
    <div className="flex gap-3 items-center p-4 rounded-xl border glass border-primary-200/30">
      <div className="w-5 h-5 rounded skeleton" />
      <div className="flex-1">
        <div className="mb-1 w-32 h-4 rounded skeleton" />
        <div className="w-48 h-3 rounded skeleton" />
      </div>
    </div>
  );
};

const ShimmerTabButton: React.FC = () => {
  return (
    <div className="w-40 h-12 rounded skeleton" />
  );
};

const ShimmerQueryInterface: React.FC = () => {
  return (
    <div className="mx-auto space-y-8 w-full max-w-4xl">
      {/* Query Input */}
      <div className="relative mb-8">
        <div className="relative">
          <div className="py-4 pr-16 pl-12 w-full h-16 rounded-2xl skeleton" />
          <div className="absolute right-2 top-1/2 w-12 h-12 rounded-xl skeleton" />
        </div>
      </div>

      {/* Example Queries Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 rounded-lg border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex gap-2 items-center mb-3">
              <div className="w-4 h-4 rounded skeleton" />
              <div className="w-24 h-4 rounded skeleton" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-full h-8 rounded skeleton" />
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
      <div className="p-6 border-b border-primary-200/30">
        <div className="flex gap-4">
          <div className="w-32 h-10 rounded-lg skeleton" />
          <div className="w-32 h-10 rounded-lg skeleton" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-3 items-center mb-3">
                    <div className="w-48 h-6 rounded skeleton" />
                    <div className="w-24 h-6 rounded-full skeleton" />
                  </div>
                  <div className="mb-4 w-full h-4 rounded skeleton" />
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-6 rounded-full skeleton" />
                    <div className="w-24 h-6 rounded-full skeleton" />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="w-10 h-10 rounded-lg skeleton" />
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
    <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl skeleton" />
          <div className="w-48 h-8 rounded skeleton" />
        </div>
        <div className="w-10 h-10 rounded-xl skeleton" />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
            <div className="mb-2 w-24 h-10 rounded skeleton" />
            <div className="w-32 h-4 rounded skeleton" />
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          <div className="w-40 h-4 rounded skeleton" />
          <div className="w-32 h-4 rounded skeleton" />
        </div>
        <div className="w-full h-3 rounded-full skeleton" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <div className="w-40 h-11 rounded-xl skeleton" />
        <div className="w-40 h-11 rounded-xl skeleton" />
        <div className="w-36 h-11 rounded-xl skeleton" />
      </div>

      {/* Info Section */}
      <div className="p-6 mt-8 rounded-2xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
        <div className="flex gap-2 items-center mb-3">
          <div className="w-6 h-6 rounded-lg skeleton" />
          <div className="w-40 h-5 rounded skeleton" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 rounded skeleton" />
          <div className="w-full h-3 rounded skeleton" />
          <div className="w-3/4 h-3 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

const ShimmerAIInsights: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl skeleton" />
            <div className="w-64 h-9 rounded skeleton" />
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-32 h-10 rounded skeleton" />
            <div className="w-28 h-10 rounded-xl skeleton" />
          </div>
        </div>
      </div>

      {/* Health Score & Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 text-center rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
            <div className="flex justify-between items-center mb-2">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="w-12 h-10 rounded skeleton" />
            </div>
            <div className="mx-auto w-24 h-4 rounded skeleton" />
          </div>
        ))}
      </div>

      {/* Insights Sections */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="mb-6 w-48 h-6 rounded skeleton" />
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="p-4 rounded-lg border glass border-primary-200/30">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="mb-2 w-48 h-5 rounded skeleton" />
                      <div className="w-full h-4 rounded skeleton" />
                    </div>
                    <div className="w-24 h-6 rounded-full skeleton" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="w-20 h-6 rounded-full skeleton" />
                    <div className="w-20 h-6 rounded-full skeleton" />
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <div className="w-full h-11 rounded skeleton" />
          <div className="w-full h-11 rounded skeleton" />
          <div className="w-full h-11 rounded skeleton" />
          <div className="w-full h-11 rounded skeleton" />
        </div>
        <div className="flex justify-between items-center">
          <div className="w-32 h-10 rounded-xl skeleton" />
          <div className="w-24 h-10 rounded-xl skeleton" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        {/* Header Row */}
        <div className="flex gap-4 items-center p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30">
          <div className="w-6 h-6 rounded skeleton" />
          <div className="flex-1 w-32 h-5 rounded skeleton" />
          <div className="w-24 h-5 rounded skeleton" />
          <div className="w-20 h-5 rounded skeleton" />
          <div className="w-20 h-5 rounded skeleton" />
          <div className="w-24 h-5 rounded skeleton" />
          <div className="w-20 h-5 rounded skeleton" />
        </div>

        {/* Data Rows */}
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex gap-4 items-center p-4 rounded-lg border glass border-primary-200/30">
              <div className="w-6 h-6 rounded skeleton" />
              <div className="flex-1 w-48 h-5 rounded skeleton" />
              <div className="w-20 h-6 rounded-full skeleton" />
              <div className="w-16 h-5 rounded skeleton" />
              <div className="w-16 h-5 rounded skeleton" />
              <div className="w-20 h-6 rounded-full skeleton" />
              <div className="w-16 h-8 rounded-lg skeleton" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShimmerAutoScaling: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="p-8 rounded-t-xl border-b bg-gradient-primary/10 border-primary-200/30">
          <div className="flex gap-4 items-center mb-3">
            <div className="w-12 h-12 rounded-xl skeleton" />
            <div className="w-64 h-9 rounded skeleton" />
          </div>
          <div className="w-96 h-5 rounded skeleton" />
        </div>
      </div>

      {/* Alerts Section */}
      <div className="space-y-4">
        <div className="w-32 h-6 rounded skeleton" />
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-gradient-to-br rounded-lg border glass border-warning-200/30 from-warning-50/30 to-warning-100/30">
            <div className="flex gap-3 items-center mb-2">
              <div className="w-5 h-5 rounded skeleton" />
              <div className="w-48 h-5 rounded skeleton" />
            </div>
            <div className="w-full h-4 rounded skeleton" />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-32 h-6 rounded skeleton" />
                  <div className="w-20 h-6 rounded-full skeleton" />
                </div>
                <div className="mb-2 w-full h-4 rounded skeleton" />
                <div className="w-3/4 h-4 rounded skeleton" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-24 h-6 rounded-full skeleton" />
                <div className="w-24 h-6 rounded-full skeleton" />
              </div>
            </div>
            <div className="mb-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-full h-4 rounded skeleton" />
              ))}
            </div>
            <div className="flex gap-3">
              <div className="w-32 h-10 rounded-xl skeleton" />
              <div className="w-28 h-10 rounded-xl skeleton" />
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
      <div className="mx-6 mt-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="flex gap-4 items-center mb-4">
            <div className="p-3 rounded-xl border glass border-primary-200/30 bg-gradient-primary/20">
              <Database className="w-8 h-8 text-primary-500/50" />
            </div>
            <div className="flex-1">
              <div className="mb-1 w-32 h-9 rounded skeleton" />
              <div className="w-96 h-4 rounded skeleton" />
            </div>
          </div>

          {/* Key Features Shimmer */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ShimmerFeatureCard />
            <ShimmerFeatureCard />
            <ShimmerFeatureCard />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Shimmer */}
      <div className="mx-6 mt-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="px-6 mx-auto max-w-7xl">
          <nav className="flex space-x-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerTabButton key={i} />
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content Shimmer */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
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

