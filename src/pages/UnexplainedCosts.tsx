import React from 'react';
import { UnexplainedCostDashboard } from '../components/unexplainedCost';

const UnexplainedCosts: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <UnexplainedCostDashboard />
      </div>
    </div>
  );
};

export default UnexplainedCosts;



