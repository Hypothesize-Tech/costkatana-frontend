import React from 'react';
import PredictiveCostDashboard from '../components/intelligence/PredictiveCostDashboard';

const PredictiveIntelligence: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient p-2 sm:p-3 md:p-4">
            <PredictiveCostDashboard />
        </div>
    );
};

export default PredictiveIntelligence;