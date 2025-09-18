import React from 'react';
import GatewayDashboard from '../components/gateway/GatewayDashboard';

const Gateway: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text-primary">Gateway Analytics</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-300">
            Monitor and analyze your AI requests routed through the CostKATANA Gateway
          </p>
        </div>

        <GatewayDashboard />
      </div>
    </div>
  );
};

export default Gateway;