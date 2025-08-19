import React from 'react';

import { PromptAnalysis } from '../../types';

interface CostMetricsProps {
    analysis: PromptAnalysis;
    onBack: () => void;
}

export const CostMetrics: React.FC<CostMetricsProps> = ({
    analysis,
    onBack
}) => {
    const { tokenAttribution, pricingInfo } = analysis || {};

    const calculatePercentage = (tokens: number) => {
        if (!analysis?.totalTokens) return '0.0';
        return ((tokens / analysis.totalTokens) * 100).toFixed(1);
    };

    return (
        <div className="cost-metrics">
            <div className="metrics-header">
                <button onClick={onBack} className="back-btn">← Back</button>
                <h2>📊 Cost Metrics</h2>
            </div>

            <div className="metrics-overview">
                <div className="overview-cards">
                    <div className="metric-card total">
                        <h3>Total Cost</h3>
                        <div className="metric-value">${analysis?.totalCost?.toFixed(6) || '0.000000'}</div>
                        <div className="metric-subtitle">{analysis?.totalTokens?.toLocaleString() || '0'} tokens</div>
                    </div>

                    <div className="metric-card efficiency">
                        <h3>Cost per Token</h3>
                        <div className="metric-value">${pricingInfo?.costPerToken?.toFixed(8) || '0.00000000'}</div>
                        <div className="metric-subtitle">Average rate</div>
                    </div>

                    <div className="metric-card model">
                        <h3>Model</h3>
                        <div className="metric-value">{pricingInfo?.modelName || 'Unknown'}</div>
                        <div className="metric-subtitle">{pricingInfo?.provider || 'Unknown'}</div>
                    </div>
                </div>
            </div>

            <div className="cost-breakdown">
                <h3>Cost Breakdown by Component</h3>
                <div className="breakdown-grid">
                    <div className="breakdown-item system">
                        <div className="breakdown-header">
                            <span className="breakdown-label">🔧 System Prompt</span>
                            <span className="breakdown-percentage">{calculatePercentage(tokenAttribution?.systemPrompt?.tokens || 0)}%</span>
                        </div>
                        <div className="breakdown-details">
                            <span className="tokens">{(tokenAttribution?.systemPrompt?.tokens || 0).toLocaleString()} tokens</span>
                            <span className="cost">${(tokenAttribution?.systemPrompt?.cost || 0).toFixed(6)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill system-fill"
                                style={{ width: `${calculatePercentage(tokenAttribution?.systemPrompt?.tokens || 0)}%` }}
                            />
                        </div>
                    </div>

                    <div className="breakdown-item user">
                        <div className="breakdown-header">
                            <span className="breakdown-label">👤 User Message</span>
                            <span className="breakdown-percentage">{calculatePercentage(tokenAttribution?.userMessage?.tokens || 0)}%</span>
                        </div>
                        <div className="breakdown-details">
                            <span className="tokens">{(tokenAttribution?.userMessage?.tokens || 0).toLocaleString()} tokens</span>
                            <span className="cost">${(tokenAttribution?.userMessage?.cost || 0).toFixed(6)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill user-fill"
                                style={{ width: `${calculatePercentage(tokenAttribution?.userMessage?.tokens || 0)}%` }}
                            />
                        </div>
                    </div>

                    <div className="breakdown-item history">
                        <div className="breakdown-header">
                            <span className="breakdown-label">💬 Conversation History</span>
                            <span className="breakdown-percentage">{calculatePercentage(tokenAttribution?.conversationHistory?.tokens || 0)}%</span>
                        </div>
                        <div className="breakdown-details">
                            <span className="tokens">{(tokenAttribution?.conversationHistory?.tokens || 0).toLocaleString()} tokens</span>
                            <span className="cost">${(tokenAttribution?.conversationHistory?.cost || 0).toFixed(6)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill history-fill"
                                style={{ width: `${calculatePercentage(tokenAttribution?.conversationHistory?.tokens || 0)}%` }}
                            />
                        </div>
                    </div>

                    <div className="breakdown-item tools">
                        <div className="breakdown-header">
                            <span className="breakdown-label">🔨 Tool Calls</span>
                            <span className="breakdown-percentage">{calculatePercentage(tokenAttribution?.toolCalls?.tokens || 0)}%</span>
                        </div>
                        <div className="breakdown-details">
                            <span className="tokens">{(tokenAttribution?.toolCalls?.tokens || 0).toLocaleString()} tokens</span>
                            <span className="cost">${(tokenAttribution?.toolCalls?.cost || 0).toFixed(6)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill tools-fill"
                                style={{ width: `${calculatePercentage(tokenAttribution?.toolCalls?.tokens || 0)}%` }}
                            />
                        </div>
                    </div>

                    <div className="breakdown-item metadata">
                        <div className="breakdown-header">
                            <span className="breakdown-label">📋 Metadata</span>
                            <span className="breakdown-percentage">{calculatePercentage(tokenAttribution?.metadata?.tokens || 0)}%</span>
                        </div>
                        <div className="breakdown-details">
                            <span className="tokens">{(tokenAttribution?.metadata?.tokens || 0).toLocaleString()} tokens</span>
                            <span className="cost">${(tokenAttribution?.metadata?.cost || 0).toFixed(6)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill metadata-fill"
                                style={{ width: `${calculatePercentage(tokenAttribution?.metadata?.tokens || 0)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="quality-metrics">
                <h3>Quality Metrics</h3>
                <div className="quality-grid">
                    <div className="quality-item">
                        <span className="quality-label">Instruction Clarity</span>
                        <div className="quality-bar">
                            <div
                                className="quality-fill"
                                style={{ width: `${analysis?.qualityMetrics?.instructionClarity || 0}%` }}
                            />
                        </div>
                        <span className="quality-score">{(analysis?.qualityMetrics?.instructionClarity || 0).toFixed(1)}/100</span>
                    </div>

                    <div className="quality-item">
                        <span className="quality-label">Context Relevance</span>
                        <div className="quality-bar">
                            <div
                                className="quality-fill"
                                style={{ width: `${analysis?.qualityMetrics?.contextRelevance || 0}%` }}
                            />
                        </div>
                        <span className="quality-score">{(analysis?.qualityMetrics?.contextRelevance || 0).toFixed(1)}/100</span>
                    </div>

                    <div className="quality-item">
                        <span className="quality-label">Example Efficiency</span>
                        <div className="quality-bar">
                            <div
                                className="quality-fill"
                                style={{ width: `${analysis?.qualityMetrics?.exampleEfficiency || 0}%` }}
                            />
                        </div>
                        <span className="quality-score">{(analysis?.qualityMetrics?.exampleEfficiency || 0).toFixed(1)}/100</span>
                    </div>

                    <div className="quality-item overall">
                        <span className="quality-label">Overall Score</span>
                        <div className="quality-bar">
                            <div
                                className="quality-fill overall-fill"
                                style={{ width: `${analysis?.qualityMetrics?.overallScore || 0}%` }}
                            />
                        </div>
                        <span className="quality-score">{(analysis?.qualityMetrics?.overallScore || 0).toFixed(1)}/100</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
