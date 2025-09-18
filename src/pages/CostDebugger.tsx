import React from 'react';
import { CostDebugger as CostDebuggerComponent } from '../components/costDebugger';
import '../components/costDebugger/CostDebugger.css';

const CostDebuggerPage: React.FC = () => {
    return (
        <div className="cost-debugger-page min-h-screen bg-gradient-light-ambient dark:bg-gradient-dark-ambient">
            <CostDebuggerComponent />
        </div>
    );
};

export default CostDebuggerPage;
