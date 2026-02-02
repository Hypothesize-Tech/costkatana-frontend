import React from 'react';
import AgentTraceDashboard from '../components/agentTrace/AgentTraceDashboard';

const AgentTrace: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <AgentTraceDashboard />
            </div>
        </div>
    );
};

export default AgentTrace;
