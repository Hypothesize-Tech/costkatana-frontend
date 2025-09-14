import React from 'react';
import GatewayDashboard from '../components/gateway/GatewayDashboard';

const Gateway: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text-primary">Gateway Analytics</h1>
          <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
            Monitor and analyze your AI requests routed through the CostKATANA Gateway
          </p>
        </div>

        <GatewayDashboard />
      </div>
    </div>
  );
};

export default Gateway;