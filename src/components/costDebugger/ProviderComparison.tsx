import React from 'react';
import { PromptComparison } from '../../types';

interface ProviderComparisonProps {
    comparison: PromptComparison;
    onBack: () => void;
}

export const ProviderComparison: React.FC<ProviderComparisonProps> = ({ comparison, onBack }) => {
    const { originalAnalysis, optimizedAnalysis, improvements } = comparison;

    return (
        <div className="provider-comparison">
            <div className="comparison-header">
                <button onClick={onBack} className="back-btn">← Back to Suggestions</button>
                <h2>⚖️ Prompt Comparison Results</h2>
            </div>

            {/* Summary Cards */}
            <div className="comparison-summary">
                <div className="summary-card savings">
                    <h3>💰 Cost Savings</h3>
                    <div className="metric-large">${improvements.costSaved.toFixed(6)}</div>
                    <div className="metric-small">{improvements.savingsPercentage.toFixed(1)}% reduction</div>
                </div>

                <div className="summary-card tokens">
                    <h3>🎯 Token Efficiency</h3>
                    <div className="metric-large">{improvements.tokensSaved}</div>
                    <div className="metric-small">tokens saved</div>
                </div>

                <div className="summary-card quality">
                    <h3>📈 Quality Impact</h3>
                    <div className="metric-large">+{improvements.qualityImpact}</div>
                    <div className="metric-small">quality score improvement</div>
                </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="comparison-grid">
                <div className="comparison-column original">
                    <h3>📝 Original Prompt</h3>
                    <div className="prompt-metrics">
                        <span>Tokens: {originalAnalysis.totalTokens.toLocaleString()}</span>
                        <span>Cost: ${originalAnalysis.totalCost.toFixed(6)}</span>
                        <span>Quality: {originalAnalysis.qualityMetrics.overallScore}/100</span>
                    </div>
                    <div className="prompt-content">
                        {originalAnalysis.sections.find(s => s.type === 'user')?.content || 'No content available'}
                    </div>

                    <div className="breakdown">
                        <h4>Token Breakdown</h4>
                        <div className="breakdown-item">
                            <span>System: {originalAnalysis.tokenAttribution.systemPrompt.tokens}</span>
                            <span>${originalAnalysis.tokenAttribution.systemPrompt.cost.toFixed(6)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>User: {originalAnalysis.tokenAttribution.userMessage.tokens}</span>
                            <span>${originalAnalysis.tokenAttribution.userMessage.cost.toFixed(6)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>History: {originalAnalysis.tokenAttribution.conversationHistory.tokens}</span>
                            <span>${originalAnalysis.tokenAttribution.conversationHistory.cost.toFixed(6)}</span>
                        </div>
                    </div>
                </div>

                <div className="comparison-arrow">
                    <div className="arrow">→</div>
                    <div className="improvement-badge">
                        -{improvements.savingsPercentage.toFixed(0)}%
                    </div>
                </div>

                <div className="comparison-column optimized">
                    <h3>✨ Optimized Prompt</h3>
                    <div className="prompt-metrics">
                        <span>Tokens: {optimizedAnalysis.totalTokens.toLocaleString()}</span>
                        <span>Cost: ${optimizedAnalysis.totalCost.toFixed(6)}</span>
                        <span>Quality: {optimizedAnalysis.qualityMetrics.overallScore}/100</span>
                    </div>
                    <div className="prompt-content">
                        {optimizedAnalysis.sections.find(s => s.type === 'user')?.content || 'No content available'}
                    </div>

                    <div className="breakdown">
                        <h4>Token Breakdown</h4>
                        <div className="breakdown-item">
                            <span>System: {optimizedAnalysis.tokenAttribution.systemPrompt.tokens}</span>
                            <span>${optimizedAnalysis.tokenAttribution.systemPrompt.cost.toFixed(6)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>User: {optimizedAnalysis.tokenAttribution.userMessage.tokens}</span>
                            <span>${optimizedAnalysis.tokenAttribution.userMessage.cost.toFixed(6)}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>History: {optimizedAnalysis.tokenAttribution.conversationHistory.tokens}</span>
                            <span>${optimizedAnalysis.tokenAttribution.conversationHistory.cost.toFixed(6)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Comparison */}
            <div className="quality-comparison">
                <h3>📊 Quality Metrics Comparison</h3>
                <div className="quality-grid">
                    <div className="quality-metric">
                        <span className="label">Instruction Clarity</span>
                        <div className="progress-comparison">
                            <div className="progress original">
                                <div className="fill" style={{ width: `${originalAnalysis.qualityMetrics.instructionClarity}%` }}></div>
                                <span>{originalAnalysis.qualityMetrics.instructionClarity}</span>
                            </div>
                            <div className="progress optimized">
                                <div className="fill" style={{ width: `${optimizedAnalysis.qualityMetrics.instructionClarity}%` }}></div>
                                <span>{optimizedAnalysis.qualityMetrics.instructionClarity}</span>
                            </div>
                        </div>
                    </div>

                    <div className="quality-metric">
                        <span className="label">Context Relevance</span>
                        <div className="progress-comparison">
                            <div className="progress original">
                                <div className="fill" style={{ width: `${originalAnalysis.qualityMetrics.contextRelevance}%` }}></div>
                                <span>{originalAnalysis.qualityMetrics.contextRelevance}</span>
                            </div>
                            <div className="progress optimized">
                                <div className="fill" style={{ width: `${optimizedAnalysis.qualityMetrics.contextRelevance}%` }}></div>
                                <span>{optimizedAnalysis.qualityMetrics.contextRelevance}</span>
                            </div>
                        </div>
                    </div>

                    <div className="quality-metric">
                        <span className="label">Example Efficiency</span>
                        <div className="progress-comparison">
                            <div className="progress original">
                                <div className="fill" style={{ width: `${originalAnalysis.qualityMetrics.exampleEfficiency}%` }}></div>
                                <span>{originalAnalysis.qualityMetrics.exampleEfficiency}</span>
                            </div>
                            <div className="progress optimized">
                                <div className="fill" style={{ width: `${optimizedAnalysis.qualityMetrics.exampleEfficiency}%` }}></div>
                                <span>{optimizedAnalysis.qualityMetrics.exampleEfficiency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
