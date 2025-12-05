import React from "react";
import AdvancedCostMonitoring from "../components/dashboard/AdvancedCostMonitoring";

const AdvancedMonitoring: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
        <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel mb-4 sm:mb-6 md:mb-8 animate-fade-in sm:p-6 md:p-8">
          <h1 className="text-xl font-display font-bold gradient-text-primary mb-2 sm:text-2xl md:text-3xl">
            Advanced Cost Monitoring & Analytics
          </h1>
          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-base">
            Real-time cost monitoring, predictive forecasting, and
            performance-cost analysis
          </p>
        </div>

        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="p-3 sm:p-4 md:p-6">
            <AdvancedCostMonitoring />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMonitoring;
