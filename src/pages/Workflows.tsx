import React from 'react';
import WorkflowDashboard from '../components/workflows/WorkflowDashboard';

const Workflows: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <WorkflowDashboard />
            </div>
        </div>
    );
};

export default Workflows;