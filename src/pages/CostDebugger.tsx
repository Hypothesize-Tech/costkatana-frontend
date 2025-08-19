import React from 'react';
import { CostDebugger as CostDebuggerComponent } from '../components/costDebugger';
import '../components/costDebugger/CostDebugger.css';

const CostDebuggerPage: React.FC = () => {
    return (
        <div className="cost-debugger-page">
            <CostDebuggerComponent />
        </div>
    );
};

export default CostDebuggerPage;
