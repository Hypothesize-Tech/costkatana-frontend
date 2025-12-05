import React from 'react';
import { UnexplainedCostDashboard } from '../components/unexplainedCost';

const UnexplainedCosts: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <UnexplainedCostDashboard />
      </div>
    </div>
  );
};

export default UnexplainedCosts;



