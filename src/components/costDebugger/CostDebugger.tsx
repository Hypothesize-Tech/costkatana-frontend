import React, { useState, useCallback } from 'react';
import { AIProvider, PromptAnalysis, DeadWeightAnalysis, PromptComparison } from '../../types';
import { CostDebuggerPanel } from './CostDebuggerPanel';
import { CostMetrics } from './CostMetrics';
import { ProviderComparison } from './ProviderComparison';
import { OptimizationSuggestions } from './OptimizationSuggestions';
import { PromptAnalyzer } from './PromptAnalyzer';
import { costDebuggerService } from '../../services/costDebugger.service';

export const CostDebugger: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'analyzer' | 'suggestions' | 'comparison' | 'metrics'>('analyzer');
    const [currentAnalysis, setCurrentAnalysis] = useState<PromptAnalysis | null>(null);
    const [deadWeightAnalysis, setDeadWeightAnalysis] = useState<DeadWeightAnalysis | null>(null);
    const [promptComparison, setPromptComparison] = useState<PromptComparison | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handlePromptAnalysis = useCallback(async (promptData: {
        prompt: string;
        provider: AIProvider;
        model: string;
        systemMessage?: string;
        conversationHistory?: Array<{ role: string; content: string }>;
        toolCalls?: Array<{ name: string; arguments: string }>;
        metadata?: Record<string, any>;
    }) => {
        setIsAnalyzing(true);
        try {
            const analysisResponse = await costDebuggerService.analyzePrompt(promptData);

            if (analysisResponse.success) {
                setCurrentAnalysis(analysisResponse.data);

                // Also get dead weight analysis
                const deadWeightResponse = await costDebuggerService.detectDeadWeight({
                    prompt: promptData.prompt,
                    provider: promptData.provider,
                    model: promptData.model
                });

                if (deadWeightResponse.success) {
                    setDeadWeightAnalysis(deadWeightResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to analyze prompt:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const handlePromptComparison = useCallback(async (comparisonData: {
        originalPrompt: string;
        optimizedPrompt: string;
        provider: AIProvider;
        model: string;
    }) => {
        try {
            const comparisonResponse = await costDebuggerService.comparePromptVersions(comparisonData);

            if (comparisonResponse.success) {
                setPromptComparison(comparisonResponse.data);
                setActiveTab('comparison');
            }
        } catch (error) {
            console.error('Failed to compare prompts:', error);
        }
    }, []);

    const tabs = [
        { id: 'analyzer', label: 'Prompt Analyzer', icon: '🔍' },
        { id: 'suggestions', label: 'Optimizations', icon: '💡' },
        { id: 'comparison', label: 'A/B Compare', icon: '⚖️' },
        { id: 'metrics', label: 'Cost Metrics', icon: '📊' }
    ];

    return (
        <div className="cost-debugger">
            {/* Header */}
            <div className="cost-debugger-header">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                        <h1 className="cost-debugger-title">
                            Cost Debugger
                        </h1>
                        <span className="cost-debugger-subtitle">DevTools for AI Prompts</span>
                    </div>
                </div>
                <div className="cost-debugger-status">
                    {isAnalyzing && <span className="analyzing-indicator">🔍 Analyzing...</span>}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="cost-debugger-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`cost-debugger-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="cost-debugger-content">
                {activeTab === 'analyzer' && (
                    <PromptAnalyzer
                        onAnalyze={handlePromptAnalysis}
                        analysis={currentAnalysis}
                        deadWeight={deadWeightAnalysis}
                        isAnalyzing={isAnalyzing}
                    />
                )}

                {activeTab === 'suggestions' && currentAnalysis && (
                    <OptimizationSuggestions
                        analysis={currentAnalysis}
                        deadWeight={deadWeightAnalysis}
                        onCompare={handlePromptComparison}
                    />
                )}

                {activeTab === 'comparison' && promptComparison && (
                    <ProviderComparison
                        comparison={promptComparison}
                        onBack={() => setActiveTab('suggestions')}
                    />
                )}

                {activeTab === 'metrics' && currentAnalysis && (
                    <CostMetrics
                        analysis={currentAnalysis}
                        onBack={() => setActiveTab('analyzer')}
                    />
                )}
            </div>

            {/* Cost Debugger Panel (Right Sidebar) */}
            {currentAnalysis && (
                <CostDebuggerPanel
                    analysis={currentAnalysis}
                    deadWeight={deadWeightAnalysis}
                    isVisible={true}
                />
            )}
        </div>
    );
};
