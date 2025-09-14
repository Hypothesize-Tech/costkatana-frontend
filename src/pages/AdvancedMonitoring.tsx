import React from "react";
import AdvancedCostMonitoring from "../components/dashboard/AdvancedCostMonitoring";

const AdvancedMonitoring: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text-primary">
            Advanced Cost Monitoring & Analytics
          </h1>
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            Real-time cost monitoring, predictive forecasting, and
            performance-cost analysis
          </p>
        </div>

        <div className="glass rounded-xl border border-accent-200/30 shadow-xl backdrop-blur-xl bg-gradient-to-br from-light-bg-200 to-light-bg-300 dark:from-dark-bg-200 dark:to-dark-bg-300">
          <div className="p-6">
            <AdvancedCostMonitoring />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMonitoring;
