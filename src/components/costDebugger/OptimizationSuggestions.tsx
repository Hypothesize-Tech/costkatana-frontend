import React, { useState } from 'react';
import { PromptAnalysis, DeadWeightAnalysis, AIProvider } from '../../types';

interface OptimizationSuggestionsProps {
    analysis: PromptAnalysis;
    deadWeight: DeadWeightAnalysis | null;
    onCompare: (comparisonData: {
        originalPrompt: string;
        optimizedPrompt: string;
        provider: AIProvider;
        model: string;
    }) => void;
}

export const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({
    analysis,
    deadWeight,
    onCompare
}) => {
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);

    const generateOptimizedPrompt = () => {
        setIsOptimizing(true);

        // Get the original prompt from the user section
        const originalPrompt = analysis.sections.find(section => section.type === 'user')?.content || '';

        // Apply optimizations based on suggestions
        let optimized = originalPrompt;

        // Remove verbose language
        optimized = optimized
            .replace(/I would like to|I want to/gi, '')
            .replace(/please|kindly/gi, '')
            .replace(/very|really|quite/gi, '')
            .replace(/as mentioned before|as I said earlier/gi, '')
            .replace(/detailed and comprehensive/gi, 'comprehensive')
            .replace(/\s+/g, ' ')
            .trim();

        // Remove dead weight if available
        if (deadWeight) {
            deadWeight.redundantInstructions.forEach(phrase => {
                optimized = optimized.replace(new RegExp(phrase, 'gi'), '');
            });
            deadWeight.verbosePhrasing.forEach(phrase => {
                optimized = optimized.replace(new RegExp(phrase, 'gi'), '');
            });
        }

        setOptimizedPrompt(optimized);
        setIsOptimizing(false);
    };

    const handleCompare = () => {
        const originalPrompt = analysis.sections.find(section => section.type === 'user')?.content || '';
        onCompare({
            originalPrompt,
            optimizedPrompt,
            provider: analysis.provider,
            model: analysis.model
        });
    };

    return (
        <div className="optimization-suggestions">
            <div className="suggestions-header">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                        <span className="text-lg">💡</span>
                    </div>
                    <h2 className="font-display font-bold gradient-text">Optimization Suggestions</h2>
                </div>
                <div className="suggestions-summary">
                    <span className="savings-potential">
                        Potential Savings: ${analysis?.optimizationOpportunities?.estimatedSavings?.toFixed(6) || '0.000000'}
                    </span>
                    <span className="confidence">
                        Confidence: {((analysis?.optimizationOpportunities?.confidence || 0) * 100).toFixed(0)}%
                    </span>
                </div>
            </div>

            <div className="suggestions-grid">
                {/* High Impact Suggestions */}
                {analysis?.optimizationOpportunities?.highImpact?.length > 0 && (
                    <div className="suggestion-category high-impact">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🔥</span>
                            <h3>High Impact ({analysis.optimizationOpportunities.highImpact.length})</h3>
                        </div>
                        <ul>
                            {analysis.optimizationOpportunities.highImpact.map((suggestion: string, index: number) => (
                                <li key={index} className="suggestion-item">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Medium Impact Suggestions */}
                {analysis?.optimizationOpportunities?.mediumImpact?.length > 0 && (
                    <div className="suggestion-category medium-impact">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">⚡</span>
                            <h3>Medium Impact ({analysis.optimizationOpportunities.mediumImpact.length})</h3>
                        </div>
                        <ul>
                            {analysis.optimizationOpportunities.mediumImpact.map((suggestion: string, index: number) => (
                                <li key={index} className="suggestion-item">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Low Impact Suggestions */}
                {analysis?.optimizationOpportunities?.lowImpact?.length > 0 && (
                    <div className="suggestion-category low-impact">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">💡</span>
                            <h3>Low Impact ({analysis.optimizationOpportunities.lowImpact.length})</h3>
                        </div>
                        <ul>
                            {analysis.optimizationOpportunities.lowImpact.map((suggestion: string, index: number) => (
                                <li key={index} className="suggestion-item">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Dead Weight Analysis */}
            {deadWeight && (
                <div className="dead-weight-section">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-danger p-2 rounded-lg glow-danger">
                            <span className="text-lg text-white">💀</span>
                        </div>
                        <h3 className="font-display font-bold gradient-text">Dead Weight Analysis</h3>
                    </div>
                    <div className="dead-weight-grid">
                        {deadWeight.redundantInstructions?.length > 0 && (
                            <div className="dead-weight-category">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">🔄</span>
                                    <h4>Redundant Instructions ({deadWeight.redundantInstructions.length})</h4>
                                </div>
                                <ul>
                                    {deadWeight.redundantInstructions.slice(0, 3).map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {deadWeight.verbosePhrasing?.length > 0 && (
                            <div className="dead-weight-category">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">📝</span>
                                    <h4>Verbose Language ({deadWeight.verbosePhrasing.length})</h4>
                                </div>
                                <ul>
                                    {deadWeight.verbosePhrasing.slice(0, 3).map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    onClick={generateOptimizedPrompt}
                    disabled={isOptimizing}
                    className="optimize-btn"
                >
                    {isOptimizing ? '⏳ Optimizing...' : '🚀 Generate Optimized Version'}
                </button>

                {optimizedPrompt && (
                    <>
                        <div className="optimized-preview">
                            <h4>Optimized Prompt:</h4>
                            <textarea
                                value={optimizedPrompt}
                                onChange={(e) => setOptimizedPrompt(e.target.value)}
                                className="optimized-textarea"
                                rows={4}
                                placeholder="Your optimized prompt will appear here..."
                            />
                            <div className="optimization-stats">
                                <span>Original: {analysis.sections.find(s => s.type === 'user')?.content?.length || 0} chars</span>
                                <span>Optimized: {optimizedPrompt.length} chars</span>
                                <span>Saved: {((analysis.sections.find(s => s.type === 'user')?.content?.length || 0) - optimizedPrompt.length)} chars</span>
                            </div>
                        </div>
                        <button onClick={handleCompare} className="compare-btn">
                            ⚖️ Compare Versions
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
