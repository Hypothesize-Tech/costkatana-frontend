import React from "react";
import AdvancedCostMonitoring from "../components/dashboard/AdvancedCostMonitoring";

const AdvancedMonitoring: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text-primary">
            Advanced Cost Monitoring & Analytics
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-300">
            Real-time cost monitoring, predictive forecasting, and
            performance-cost analysis
          </p>
        </div>

        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="p-6">
            <AdvancedCostMonitoring />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMonitoring;
