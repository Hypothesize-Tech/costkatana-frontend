import React, { useState, useEffect } from 'react';
import {
    FiChevronRight,
    FiChevronLeft,
    FiCheck,
    FiAlertCircle,
    FiDollarSign,
    FiSettings,
    FiZap,
    FiTrendingUp
} from 'react-icons/fi';
import { optimizationService } from '../../services/optimization.service';
import { intelligenceService } from '../../services/intelligence.service';
import { ProactiveTip } from './ProactiveTip';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface WizardStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface CostAuditWizardProps {
    projectId?: string;
}

const wizardSteps: WizardStep[] = [
    {
        id: 'analyze',
        title: 'Analyze Usage',
        description: 'We\'ll analyze your recent AI usage patterns',
        icon: <FiTrendingUp />
    },
    {
        id: 'identify',
        title: 'Identify Opportunities',
        description: 'Find potential areas for cost optimization',
        icon: <FiAlertCircle />
    },
    {
        id: 'configure',
        title: 'Configure Optimizations',
        description: 'Select and configure optimization strategies',
        icon: <FiSettings />
    },
    {
        id: 'review',
        title: 'Review & Apply',
        description: 'Review recommendations and apply changes',
        icon: <FiCheck />
    }
];

export const CostAuditWizard: React.FC<CostAuditWizardProps> = ({ projectId }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [selectedOptimizations, setSelectedOptimizations] = useState<Set<string>>(new Set());
    const [potentialSavings, setPotentialSavings] = useState(0);

    useEffect(() => {
        if (currentStep === 0) {
            analyzeUsage();
        }
    }, [currentStep, projectId]);

    const analyzeUsage = async () => {
        setLoading(true);
        try {
            // Get recent usage data - use instance method instead of static
            const usageService = new (await import('../../services/usage.service')).UsageService();
            const usageResponse = await usageService.getUsage({
                limit: 100,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
                endDate: new Date().toISOString(),
                projectId: projectId && projectId !== 'all' ? projectId : undefined
            });

            const usageData = usageResponse.usage || [];

            // Get optimization suggestions
            const suggestions = await optimizationService.getOptimizations({});

            // Get personalized tips
            const tips = await intelligenceService.getPersonalizedTips(10);
            console.log('Tips data structure:', tips);

            // Calculate statistics with proper null/zero checks
            const totalCost = usageData.length > 0
                ? usageData.reduce((sum: number, usage: any) => sum + (usage.cost || 0), 0)
                : 0;

            const totalTokens = usageData.length > 0
                ? usageData.reduce((sum: number, usage: any) => sum + (usage.totalTokens || 0), 0)
                : 0;

            const avgTokens = usageData.length > 0
                ? totalTokens / usageData.length
                : 0;

            const modelUsage = usageData.reduce((acc: any, usage: any) => {
                if (usage.model) {
                    acc[usage.model] = (acc[usage.model] || 0) + 1;
                }
                return acc;
            }, {});

            const analysisResult = {
                totalCost,
                avgTokens,
                totalTokens,
                modelUsage,
                usageCount: usageData.length,
                suggestions: suggestions.data || [],
                tips: Array.isArray(tips) ? tips : []
            };

            setAnalysisResults(analysisResult);

            // Generate recommendations based on analysis
            generateRecommendations(analysisResult);
        } catch (error) {
            console.error('Error analyzing usage:', error);
            // Set default values when there's an error
            const defaultResult = {
                totalCost: 0,
                avgTokens: 0,
                totalTokens: 0,
                modelUsage: {},
                usageCount: 0,
                suggestions: [],
                tips: []
            };
            setAnalysisResults(defaultResult);
            generateRecommendations(defaultResult);
        } finally {
            setLoading(false);
        }
    };

    const generateRecommendations = (analysis: any) => {
        const recs = [];

        // Convert existing suggestions to recommendations
        if (Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0) {
            const unappliedSuggestions = analysis.suggestions.filter((s: any) => !s.applied);

            if (unappliedSuggestions.length > 0) {
                // Group suggestions by type
                const promptOptimizations = unappliedSuggestions.filter((s: any) => s.category === 'prompt_reduction');
                const modelOptimizations = unappliedSuggestions.filter((s: any) => s.category === 'model_selection');

                if (promptOptimizations.length > 0) {
                    const totalSavings = promptOptimizations.reduce((sum: number, s: any) => sum + (s.costSaved || 0), 0);
                    recs.push({
                        id: 'apply-prompt-optimizations',
                        title: 'Apply Prompt Optimizations',
                        description: `You have ${promptOptimizations.length} prompt optimization${promptOptimizations.length > 1 ? 's' : ''} available that can reduce your costs.`,
                        savings: totalSavings,
                        type: 'prompt',
                        config: { enablePromptOptimization: true },
                        suggestions: promptOptimizations
                    });
                }

                if (modelOptimizations.length > 0) {
                    const totalSavings = modelOptimizations.reduce((sum: number, s: any) => sum + (s.costSaved || 0), 0);
                    recs.push({
                        id: 'apply-model-optimizations',
                        title: 'Apply Model Optimizations',
                        description: `You have ${modelOptimizations.length} model optimization${modelOptimizations.length > 1 ? 's' : ''} available.`,
                        savings: totalSavings,
                        type: 'model',
                        config: { enableModelOptimization: true },
                        suggestions: modelOptimizations
                    });
                }

                // If we have multiple types, add a comprehensive option
                if (unappliedSuggestions.length > 2) {
                    const totalSavings = unappliedSuggestions.reduce((sum: number, s: any) => sum + (s.costSaved || 0), 0);
                    recs.push({
                        id: 'apply-all-optimizations',
                        title: 'Apply All Available Optimizations',
                        description: `Apply all ${unappliedSuggestions.length} optimization suggestions for maximum savings.`,
                        savings: totalSavings,
                        type: 'comprehensive',
                        config: {
                            enableCaching: true,
                            enableBatching: true,
                            enableModelOptimization: true,
                            promptCompression: { enabled: true },
                            contextTrimming: { enabled: true },
                            requestFusion: { enabled: true }
                        },
                        suggestions: unappliedSuggestions
                    });
                }
            }
        }

        // Fallback recommendations based on usage patterns
        if (recs.length === 0) {
            // High token usage recommendation
            if (analysis.avgTokens > 2000) {
                recs.push({
                    id: 'enable-context-trimming',
                    title: 'Enable Context Trimming',
                    description: 'Your average token usage is high. Enable context trimming to reduce tokens by up to 50%.',
                    savings: analysis.totalCost * 0.3,
                    type: 'optimization',
                    config: { contextTrimming: { enabled: true } }
                });
            }

            // Expensive model usage
            const expensiveModels = ['gpt-4', 'claude-2', 'claude-3-opus'];
            const hasExpensiveModels = Object.keys(analysis.modelUsage).some(model =>
                expensiveModels.some(expensive => model.includes(expensive))
            );

            if (hasExpensiveModels) {
                recs.push({
                    id: 'model-switching',
                    title: 'Switch to Cheaper Models',
                    description: 'You\'re using expensive models. Consider switching to cheaper alternatives for simple tasks.',
                    savings: analysis.totalCost * 0.4,
                    type: 'model',
                    config: { enableModelOptimization: true }
                });
            }

            // If no specific recommendations, suggest general optimization
            if (recs.length === 0 && analysis.usageCount > 0) {
                recs.push({
                    id: 'enable-general-optimizations',
                    title: 'Enable General Optimizations',
                    description: 'Start optimizing your AI usage with our built-in optimization features.',
                    savings: analysis.totalCost * 0.2,
                    type: 'general',
                    config: {
                        enableCaching: true,
                        enableBatching: true,
                        promptCompression: { enabled: true }
                    }
                });
            }
        }

        setRecommendations(recs);
        calculatePotentialSavings(recs);
    };

    const calculatePotentialSavings = (recs: any[]) => {
        const selected = Array.from(selectedOptimizations);
        const savings = recs
            .filter(rec => selected.includes(rec.id))
            .reduce((sum, rec) => sum + rec.savings, 0);
        setPotentialSavings(savings);
    };

    const toggleOptimization = (id: string) => {
        const newSelected = new Set(selectedOptimizations);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOptimizations(newSelected);
        calculatePotentialSavings(recommendations);
    };

    const applyOptimizations = async () => {
        setLoading(true);
        try {
            const selected = recommendations.filter(rec => selectedOptimizations.has(rec.id));

            for (const optimization of selected) {
                // Apply configuration changes
                await optimizationService.updateOptimizationConfig(optimization.config);

                // Track success
                if (optimization.id.includes('enable-')) {
                    await intelligenceService.trackTipInteraction(optimization.id, 'success');
                }
            }

            // Navigate to optimization page to see results
            window.location.href = '/optimizations';
        } catch (error) {
            console.error('Error applying optimizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Analyze
                return (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex flex-col justify-center items-center py-12">
                                <LoadingSpinner size="large" />
                                <p className="mt-4 text-gray-600">Analyzing your usage patterns...</p>
                            </div>
                        ) : analysisResults ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                        <div className="text-sm text-gray-600">Total Cost (30 days)</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ${(analysisResults.totalCost || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                        <div className="text-sm text-gray-600">Average Tokens</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {isNaN(analysisResults.avgTokens) || !analysisResults.avgTokens
                                                ? '0'
                                                : Math.round(analysisResults.avgTokens).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                                        <div className="text-sm text-gray-600">API Calls</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {(analysisResults.usageCount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {analysisResults.usageCount === 0 ? (
                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <h4 className="mb-2 font-medium text-yellow-900">No Usage Data Found</h4>
                                        <p className="text-sm text-yellow-700">
                                            We couldn't find any AI usage data in the last 30 days. To get optimization
                                            recommendations, start using the AI Cost Tracker to track your API calls,
                                            or upload your existing usage data.
                                        </p>
                                        <div className="mt-3">
                                            <a
                                                href="/usage"
                                                className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                                            >
                                                Go to Usage Tracking →
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="mb-2 font-medium text-blue-900">Analysis Complete</h4>
                                        <p className="text-sm text-blue-700">
                                            We've analyzed your usage patterns and identified several opportunities
                                            to reduce costs. Click "Next" to see our recommendations.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                );

            case 1: // Identify
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Optimization Opportunities Found
                        </h3>

                        {Array.isArray(analysisResults?.tips) && analysisResults.tips.length > 0 ? (
                            analysisResults.tips.slice(0, 3).map((tipData: any, index: number) => (
                                <ProactiveTip
                                    key={index}
                                    tipData={tipData}
                                    position="inline"
                                />
                            ))
                        ) : Array.isArray(analysisResults?.suggestions) && analysisResults.suggestions.length > 0 ? (
                            analysisResults.suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                                <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <FiZap className="w-5 h-5 text-blue-600 mt-0.5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-blue-900">
                                                Optimization Available
                                            </h4>
                                            <p className="mt-1 text-sm text-blue-700">
                                                {suggestion.applied ? 'Applied: ' : 'Available: '}
                                                Save ${(suggestion.costSaved || 0).toFixed(2)}
                                                ({(suggestion.improvementPercentage || 0).toFixed(1)}% improvement)
                                            </p>
                                            <div className="mt-2 text-xs text-blue-600">
                                                {suggestion.service} • {suggestion.model} • {suggestion.category}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                    No optimization opportunities found. Start using AI services to get personalized recommendations.
                                </p>
                            </div>
                        )}

                        <div className="p-4 mt-6 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-2">
                                <FiDollarSign className="text-green-600" />
                                <span className="font-medium text-green-900">
                                    Potential Monthly Savings: ${(() => {
                                        if (Array.isArray(analysisResults?.suggestions) && analysisResults.suggestions.length > 0) {
                                            const totalSavings = analysisResults.suggestions
                                                .filter((s: any) => !s.applied)
                                                .reduce((sum: number, s: any) => sum + (s.costSaved || 0), 0);
                                            return totalSavings.toFixed(2);
                                        }
                                        return potentialSavings.toFixed(2);
                                    })()}
                                </span>
                            </div>
                            {Array.isArray(analysisResults?.suggestions) && analysisResults.suggestions.filter((s: any) => !s.applied).length > 0 && (
                                <p className="mt-1 text-sm text-green-700">
                                    From {analysisResults.suggestions.filter((s: any) => !s.applied).length} available optimization{analysisResults.suggestions.filter((s: any) => !s.applied).length > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case 2: // Configure
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Select Optimizations to Apply
                        </h3>

                        {recommendations.map((rec) => (
                            <div
                                key={rec.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedOptimizations.has(rec.id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => toggleOptimization(rec.id)}
                            >
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptimizations.has(rec.id)}
                                        onChange={() => { }}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                                        <p className="mt-1 text-sm text-gray-600">{rec.description}</p>
                                        <div className="flex items-center mt-2 space-x-1 text-green-600">
                                            <FiTrendingUp size={16} />
                                            <span className="text-sm font-medium">
                                                Save ${rec.savings.toFixed(2)}/month
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-4 mt-6 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600">Total Estimated Savings</div>
                            <div className="text-2xl font-bold text-green-600">
                                ${potentialSavings.toFixed(2)}/month
                            </div>
                        </div>
                    </div>
                );

            case 3: // Review
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Review Your Selections
                        </h3>

                        <div className="space-y-3">
                            {recommendations
                                .filter(rec => selectedOptimizations.has(rec.id))
                                .map((rec) => (
                                    <div key={rec.id} className="flex items-center space-x-2">
                                        <FiCheck className="text-green-500" />
                                        <span className="text-gray-700">{rec.title}</span>
                                    </div>
                                ))}
                        </div>

                        <div className="p-6 text-center bg-green-50 rounded-lg border border-green-200">
                            <FiZap className="mx-auto mb-3 text-green-600" size={32} />
                            <h4 className="mb-2 text-lg font-semibold text-green-900">
                                Ready to Optimize!
                            </h4>
                            <p className="mb-4 text-sm text-green-700">
                                You'll save approximately ${potentialSavings.toFixed(2)} per month
                                with these optimizations.
                            </p>
                            <button
                                onClick={applyOptimizations}
                                disabled={loading}
                                className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? 'Applying...' : 'Apply Optimizations'}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    {wizardSteps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex-1 ${index < wizardSteps.length - 1 ? 'pr-4' : ''}`}
                        >
                            <div className="relative">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStep
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    {index < currentStep ? (
                                        <FiCheck size={20} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                {index < wizardSteps.length - 1 && (
                                    <div
                                        className={`absolute top-5 left-10 w-full h-0.5 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                            <div className="mt-2">
                                <div className="text-sm font-medium text-gray-900">
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[400px]">
                {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0 || loading}
                    className="flex items-center px-4 py-2 space-x-2 text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiChevronLeft />
                    <span>Previous</span>
                </button>

                {currentStep < wizardSteps.length - 1 && (
                    <button
                        onClick={() => setCurrentStep(Math.min(wizardSteps.length - 1, currentStep + 1))}
                        disabled={loading || (currentStep === 0 && !analysisResults)}
                        className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Next</span>
                        <FiChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
}; 