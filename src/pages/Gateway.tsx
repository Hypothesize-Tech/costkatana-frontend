import React from 'react';
import GatewayDashboard from '../components/gateway/GatewayDashboard';

const Gateway: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gateway Analytics</h1>
          <p className="mt-2 text-gray-600">
            Monitor and analyze your AI requests routed through the CostKATANA Gateway
          </p>
        </div>

        <GatewayDashboard />
      </div>
    </div>
  );
};

export default Gateway;