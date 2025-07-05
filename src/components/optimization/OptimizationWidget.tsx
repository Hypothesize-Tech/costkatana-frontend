import React, { useState } from 'react';
import { optimizationService } from '../../services/optimization.service';
import { intelligenceService } from '../../services/intelligence.service';
import './OptimizationWidget.css';
import { Switch } from '../common/Switch';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { QualityScore } from '../intelligence';

interface OptimizationWidgetProps {
    prompt: string;
    model: string;
    service: string;
    conversationHistory?: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>;
    onApplyOptimization?: (optimizedPrompt: string, optimization: any) => void;
}

interface OptimizationSuggestion {
    type: string;
    optimizedPrompt?: string;
    estimatedSavings: number;
    confidence: number;
    explanation: string;
    compressionDetails?: {
        technique: string;
        compressionRatio: number;
    };
    contextTrimDetails?: {
        technique: string;
        originalMessages: number;
        trimmedMessages: number;
    };
}

const OptimizationWidget: React.FC<OptimizationWidgetProps> = ({
    prompt,
    model,
    service,
    conversationHistory,
    onApplyOptimization
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<OptimizationSuggestion | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [qualityComparison, setQualityComparison] = useState<any>(null);
    const [showQualityScore, setShowQualityScore] = useState(false);

    // Optimization toggles
    const [enableCompression, setEnableCompression] = useState(true);
    const [enableContextTrimming, setEnableContextTrimming] = useState(true);
    const [enableRequestFusion, setEnableRequestFusion] = useState(true);

    const handleOptimize = async () => {
        setIsLoading(true);
        try {
            const result = await optimizationService.getOptimizationPreview({
                prompt,
                model,
                service,
                conversationHistory,
                enableCompression,
                enableContextTrimming,
                enableRequestFusion
            });

            setSuggestions(result.suggestions);
            if (result.suggestions.length > 0) {
                setSelectedSuggestion(result.suggestions[0]);
            }
            setShowPreview(true);
        } catch (error) {
            console.error('Error getting optimization preview:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyOptimization = async () => {
        if (!selectedSuggestion) return;

        setIsLoading(true);
        try {
            const optimization = await optimizationService.createOptimization({
                prompt,
                model,
                service,
                conversationHistory,
                enableCompression,
                enableContextTrimming,
                enableRequestFusion
            });

            // Compare quality if we have optimized prompt
            if (selectedSuggestion.optimizedPrompt) {
                try {
                    const comparison = await intelligenceService.compareQuality(
                        prompt,
                        prompt, // Using original prompt as placeholder for response
                        selectedSuggestion.optimizedPrompt,
                        {
                            amount: (selectedSuggestion.estimatedSavings / 100) * 10, // Estimated amount based on percentage
                            percentage: selectedSuggestion.estimatedSavings
                        }
                    );
                    setQualityComparison(comparison);
                    setShowQualityScore(true);
                } catch (error) {
                    console.error('Error comparing quality:', error);
                }
            }

            if (onApplyOptimization && selectedSuggestion.optimizedPrompt) {
                onApplyOptimization(selectedSuggestion.optimizedPrompt, optimization);
            }
        } catch (error) {
            console.error('Error applying optimization:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getOptimizationIcon = (type: string) => {
        switch (type) {
            case 'compression':
                return '🗜️';
            case 'context_trimming':
                return '✂️';
            case 'request_fusion':
                return '🔗';
            case 'prompt':
                return '✏️';
            default:
                return '💡';
        }
    };

    const formatSavings = (savings: number) => {
        return `${savings.toFixed(1)}%`;
    };

    return (
        <div className="optimization-widget">
            <div className="widget-header">
                <h3>Prompt Optimization</h3>
                <p className="subtitle">Reduce token usage and costs with AI-powered optimizations</p>
            </div>

            <div className="optimization-controls">
                <div className="control-item">
                    <div className="control-label">
                        <span className="icon">🗜️</span>
                        <span>Prompt Compression</span>
                        <span className="info-icon" title="Compress JSON and repetitive data">ℹ️</span>
                    </div>
                    <Switch
                        checked={enableCompression}
                        onChange={setEnableCompression}
                    />
                </div>

                <div className="control-item">
                    <div className="control-label">
                        <span className="icon">✂️</span>
                        <span>Context Trimming</span>
                        <span className="info-icon" title="Remove or summarize irrelevant conversation history">ℹ️</span>
                    </div>
                    <Switch
                        checked={enableContextTrimming}
                        onChange={setEnableContextTrimming}
                        disabled={!conversationHistory || conversationHistory.length === 0}
                    />
                </div>

                <div className="control-item">
                    <div className="control-label">
                        <span className="icon">🔗</span>
                        <span>Request Fusion</span>
                        <span className="info-icon" title="Merge multiple related requests">ℹ️</span>
                    </div>
                    <Switch
                        checked={enableRequestFusion}
                        onChange={setEnableRequestFusion}
                    />
                </div>
            </div>

            <button
                className="optimize-button"
                onClick={handleOptimize}
                disabled={isLoading || (!enableCompression && !enableContextTrimming && !enableRequestFusion)}
            >
                {isLoading ? <LoadingSpinner size="small" /> : 'Analyze Optimization Potential'}
            </button>

            {showPreview && suggestions.length > 0 && !showQualityScore && (
                <div className="optimization-preview">
                    <div className="preview-header">
                        <h4>Optimization Suggestions</h4>
                        <button className="close-button" onClick={() => setShowPreview(false)}>×</button>
                    </div>

                    <div className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`suggestion-item ${selectedSuggestion === suggestion ? 'selected' : ''}`}
                                onClick={() => setSelectedSuggestion(suggestion)}
                            >
                                <div className="suggestion-header">
                                    <span className="type-icon">{getOptimizationIcon(suggestion.type)}</span>
                                    <span className="type-name">{suggestion.type.replace('_', ' ')}</span>
                                    <span className="savings-badge">{formatSavings(suggestion.estimatedSavings)} savings</span>
                                </div>

                                <p className="suggestion-explanation">{suggestion.explanation}</p>

                                {suggestion.compressionDetails && (
                                    <div className="detail-info">
                                        <span>Compression ratio: {(suggestion.compressionDetails.compressionRatio * 100).toFixed(1)}%</span>
                                    </div>
                                )}

                                {suggestion.contextTrimDetails && (
                                    <div className="detail-info">
                                        <span>Messages: {suggestion.contextTrimDetails.originalMessages} → {suggestion.contextTrimDetails.trimmedMessages}</span>
                                    </div>
                                )}

                                <div className="confidence-bar">
                                    <div
                                        className="confidence-fill"
                                        style={{ width: `${suggestion.confidence * 100}%` }}
                                    />
                                    <span className="confidence-label">Confidence: {(suggestion.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedSuggestion && selectedSuggestion.optimizedPrompt && (
                        <div className="preview-section">
                            <h5>Optimized Prompt Preview</h5>
                            <div className="prompt-comparison">
                                <div className="original-prompt">
                                    <h6>Original</h6>
                                    <pre>{prompt}</pre>
                                </div>
                                <div className="arrow">→</div>
                                <div className="optimized-prompt">
                                    <h6>Optimized</h6>
                                    <pre>{selectedSuggestion.optimizedPrompt}</pre>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="apply-button"
                                    onClick={handleApplyOptimization}
                                    disabled={isLoading}
                                >
                                    Apply Optimization
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={() => setShowPreview(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showQualityScore && qualityComparison && (
                <div className="quality-score-section">
                    <div className="preview-header">
                        <h4>Optimization Applied Successfully!</h4>
                        <button className="close-button" onClick={() => {
                            setShowQualityScore(false);
                            setShowPreview(false);
                        }}>×</button>
                    </div>

                    <QualityScore
                        qualityData={{
                            originalScore: qualityComparison.comparison.originalScore,
                            optimizedScore: qualityComparison.comparison.optimizedScore,
                            qualityRetention: qualityComparison.comparison.qualityRetention,
                            recommendation: qualityComparison.comparison.recommendation,
                            costSavings: qualityComparison.comparison.costSavings,
                            scoreId: qualityComparison.scoreId
                        }}
                        showDetails={true}
                        showFeedback={true}
                    />

                    <div className="action-buttons" style={{ marginTop: '1rem' }}>
                        <button
                            className="apply-button"
                            onClick={() => {
                                setShowQualityScore(false);
                                setShowPreview(false);
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {showPreview && suggestions.length === 0 && !isLoading && (
                <div className="no-suggestions">
                    <p>No optimization opportunities found for this prompt.</p>
                </div>
            )}
        </div>
    );
};

export default OptimizationWidget; 