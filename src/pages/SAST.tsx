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
        <div className="min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SastDashboard />
            </div>
        </div>
    );
};

export default SAST;
