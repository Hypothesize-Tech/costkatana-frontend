import React from 'react';
import { InferenceScalingDashboard } from '../components/inferenceScaling/InferenceScalingDashboard';

const InferenceScaling: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <InferenceScalingDashboard />
        </div>
    );
};

export default InferenceScaling; 