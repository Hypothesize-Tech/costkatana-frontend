import React from 'react';

const ShimmerMetricCard: React.FC = () => {
  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50">
      <div className="text-center">
        <div className="mb-2 w-20 h-10 rounded skeleton mx-auto" />
        <div className="w-24 h-4 rounded skeleton mx-auto" />
      </div>
    </div>
  );
};

const ShimmerCostBreakdownCard: React.FC = () => {
  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div>
            <div className="mb-2 w-32 h-5 rounded skeleton" />
            <div className="w-24 h-4 rounded skeleton" />
          </div>
        </div>
        <div className="text-right">
          <div className="mb-2 w-24 h-6 rounded skeleton" />
          <div className="w-20 h-4 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

const ShimmerInsightCard: React.FC = () => {
  return (
    <div className="glass p-6 rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg skeleton flex-shrink-0" />
        <div className="flex-1">
          <div className="w-full h-4 rounded skeleton mb-2" />
          <div className="w-3/4 h-4 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

const ShimmerFeatureCard: React.FC = () => {
  return (
    <div className="glass rounded-xl border border-primary-200/30 shadow-lg backdrop-blur-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 w-32 h-5 rounded skeleton" />
          <div className="w-24 h-4 rounded skeleton" />
        </div>
        <div className="text-right">
          <div className="mb-2 w-16 h-6 rounded skeleton" />
          <div className="w-20 h-4 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

export const FeedbackAnalyticsShimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Shimmer */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-xl skeleton mr-4" />
          <div className="w-64 h-8 rounded skeleton" />
        </div>

        {/* Key Metrics Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ShimmerMetricCard />
          <ShimmerMetricCard />
          <ShimmerMetricCard />
          <ShimmerMetricCard />
        </div>
      </div>

      {/* Cost Breakdown Shimmer */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton mr-4" />
          <div className="w-48 h-6 rounded skeleton" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShimmerCostBreakdownCard />
          <ShimmerCostBreakdownCard />
        </div>
      </div>

      {/* Insights & Recommendations Shimmer */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton mr-4" />
          <div className="w-56 h-6 rounded skeleton" />
        </div>

        <div className="space-y-4">
          <ShimmerInsightCard />
          <ShimmerInsightCard />
          <ShimmerInsightCard />
        </div>
      </div>

      {/* Feature Performance Shimmer */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton mr-4" />
          <div className="w-40 h-6 rounded skeleton" />
        </div>

        <div className="space-y-4">
          <ShimmerFeatureCard />
          <ShimmerFeatureCard />
          <ShimmerFeatureCard />
        </div>
      </div>

      {/* Behavioral Insights Shimmer */}
      <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl skeleton mr-4" />
          <div className="w-48 h-6 rounded skeleton" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ShimmerMetricCard />
          <ShimmerMetricCard />
          <ShimmerMetricCard />
          <ShimmerMetricCard />
        </div>
      </div>
    </div>
  );
};

