import React from 'react';

import { PromptAnalysis, DeadWeightAnalysis } from '../../types';

interface CostDebuggerPanelProps {
    analysis: PromptAnalysis;
    deadWeight: DeadWeightAnalysis | null;
    isVisible: boolean;
}

export const CostDebuggerPanel: React.FC<CostDebuggerPanelProps> = ({
    analysis,
    deadWeight,
    isVisible
}) => {
    if (!isVisible) return null;

    return (
        <div className="cost-debugger-panel">
            <div className="panel-header">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                        <span className="text-lg">📊</span>
                    </div>
                    <h3 className="font-display font-bold gradient-text">Cost Analysis</h3>
                </div>
            </div>

            <div className="panel-content">
                <div className="analysis-summary">
                    <div className="summary-item">
                        <span className="label">Total Tokens:</span>
                        <span className="value">{analysis?.totalTokens?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Total Cost:</span>
                        <span className="value">${analysis?.totalCost?.toFixed(6) || '0.000000'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Quality Score:</span>
                        <span className="value">{analysis?.qualityMetrics?.overallScore?.toFixed(1) || '0'}/100</span>
                    </div>
                </div>

                {deadWeight && (
                    <div className="dead-weight-panel">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">💀</span>
                            <h4>Dead Weight</h4>
                        </div>
                        <div className="dead-weight-item">
                            <span>Redundant: {deadWeight.redundantInstructions?.length || 0}</span>
                        </div>
                        <div className="dead-weight-item">
                            <span>Verbose: {deadWeight.verbosePhrasing?.length || 0}</span>
                        </div>
                        <div className="dead-weight-item">
                            <span>Duplicates: {deadWeight.duplicateContext?.length || 0}</span>
                        </div>
                        <div className="savings">
                            <span>Potential: ${deadWeight.estimatedSavings?.toFixed(6) || '0.000000'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
