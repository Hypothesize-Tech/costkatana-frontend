import React from 'react';
import AdvancedCostMonitoring from '../components/dashboard/AdvancedCostMonitoring';

const AdvancedMonitoring: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Advanced Cost Monitoring & Analytics
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Real-time cost monitoring, predictive forecasting, and performance-cost analysis
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                    <div className="p-6">
                        <AdvancedCostMonitoring />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedMonitoring; 