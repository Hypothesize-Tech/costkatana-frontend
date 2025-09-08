/**
 * SAST (Semantic Abstract Syntax Tree) Page
 * 
 * Main page for accessing all SAST functionality including semantic primitives,
 * ambiguity resolution, cross-lingual support, and evolution comparison tools.
 */

import React from 'react';
import { SastDashboard } from '../components/sast';

const SAST: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SastDashboard />
            </div>
        </div>
    );
};

export default SAST;
