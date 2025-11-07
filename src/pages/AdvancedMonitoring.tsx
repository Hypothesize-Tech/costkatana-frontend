import React from "react";
import AdvancedCostMonitoring from "../components/dashboard/AdvancedCostMonitoring";

const AdvancedMonitoring: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold gradient-text-primary mb-2">
            Advanced Cost Monitoring & Analytics
          </h1>
          <p className="text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
            Real-time cost monitoring, predictive forecasting, and
            performance-cost analysis
          </p>
        </div>

        <div className="rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="p-6">
            <AdvancedCostMonitoring />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMonitoring;
