import React from 'react';
import { CostDebugger as CostDebuggerComponent } from '../components/costDebugger';
import '../components/costDebugger/CostDebugger.css';

const CostDebuggerPage: React.FC = () => {
    return (
        <div className="cost-debugger-page min-h-screen bg-gradient-to-br from-light-bg-100 to-light-bg-200 dark:from-dark-bg-100 dark:to-dark-bg-200">
            <CostDebuggerComponent />
        </div>
    );
};

export default CostDebuggerPage;
