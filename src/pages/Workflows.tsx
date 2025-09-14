import React from 'react';
import WorkflowDashboard from '../components/workflows/WorkflowDashboard';

const Workflows: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <WorkflowDashboard />
            </div>
        </div>
    );
};

export default Workflows;