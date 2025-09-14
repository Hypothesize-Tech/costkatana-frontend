import React from 'react';
import PredictiveCostDashboard from '../components/intelligence/PredictiveCostDashboard';

const PredictiveIntelligence: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 p-6">
            <PredictiveCostDashboard />
        </div>
    );
};

export default PredictiveIntelligence;