import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ExperimentationService } from '../../services/experimentation.service';
import { AWS_BEDROCK_PRICING } from '../../utils/pricing';

interface OptimizationOption {
    type: string;
    description: string;
    savings: {
        cost?: number;
        percentage: number;
        tokens?: number;
    };
    risk: 'low' | 'medium' | 'high';
    implementation: 'easy' | 'moderate' | 'complex';
    model?: string;
    qualityImpact?: string;
}

interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    title: string;
    savings: {
        cost?: number;
        percentage: number;
    };
    implementation: string;
    risk: string;
    action: string;
}

interface SimulationResult {
    currentCost: {
        model: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        inputCost: number;
        outputCost: number;
        totalCost: number;
        provider: string;
    };
    optimizedOptions: OptimizationOption[];
    recommendations: Recommendation[];
    potentialSavings: number;
    confidence: number;
}

const RealTimeWhatIfSimulator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [simulationType, setSimulationType] = useState<'real_time_analysis' | 'prompt_optimization' | 'context_trimming' | 'model_comparison'>('real_time_analysis');
    const [isSimulating, setIsSimulating] = useState(false);
    const [results, setResults] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [autoSimulate, setAutoSimulate] = useState(false);
    const debounceTimeout = useRef<number>();

    // Get available Bedrock models from pricing data
    const availableModels = useMemo(() => {
        return AWS_BEDROCK_PRICING
            .filter(model =>
                // Only include text and multimodal models that are suitable for general use
                (model.category === 'text' || model.category === 'multimodal') &&
                // Only include models with pricing data
                model.inputPrice > 0 && model.outputPrice > 0 &&
                // Prefer latest models and popular ones
                (model.isLatest || model.model.includes('claude') || model.model.includes('llama') || model.model.includes('nova'))
            )
            .sort((a, b) => {
                // Sort by price (ascending) for better user experience
                const aCost = a.inputPrice + a.outputPrice;
                const bCost = b.inputPrice + b.outputPrice;
                return aCost - bCost;
            })
            .map(model => model.model);
    }, []);

    // Log available models for debugging
    useEffect(() => {
        console.log('🚀 Available Bedrock models for simulator:', availableModels);
    }, [availableModels]);

    // Initialize current model with the first available Bedrock model  
    const [currentModel, setCurrentModel] = useState(() =>
        availableModels.length > 0 ? availableModels[0] : 'amazon-nova-micro'
    );

    // Update current model if it's not in the available models list
    useEffect(() => {
        if (availableModels.length > 0 && !availableModels.includes(currentModel)) {
            setCurrentModel(availableModels[0]);
        }
    }, [availableModels, currentModel]);

    const simulationTypes = [
        { value: 'real_time_analysis', label: '🎯 Complete Analysis', description: 'Full optimization suite' },
        { value: 'prompt_optimization', label: '🔥 Prompt Optimization', description: 'Optimize prompt structure' },
        { value: 'context_trimming', label: '✂️ Context Trimming', description: 'Smart context reduction' },
        { value: 'model_comparison', label: '⚡ Model Comparison', description: 'Compare across models' },
    ];

    const runSimulation = useCallback(async () => {
        if (!prompt.trim() || !currentModel) {
            setError('Please enter a prompt and select a model');
            return;
        }

        setIsSimulating(true);
        setError(null);

        try {
            const simulationRequest = {
                prompt: prompt.trim(),
                currentModel,
                simulationType,
                options: {
                    alternativeModels: availableModels.filter(m => m !== currentModel).slice(0, 4),
                    optimizationGoals: ['cost', 'speed', 'quality'] as ('cost' | 'speed' | 'quality')[],
                }
            };

            const result = await ExperimentationService.runRealTimeSimulation(simulationRequest);
            setResults(result);
        } catch (err: unknown) {
            console.error('Simulation error:', err);
            const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to run simulation';
            setError(errorMessage);
        } finally {
            setIsSimulating(false);
        }
    }, [prompt, currentModel, simulationType, availableModels]);

    // Auto-simulate when prompt changes (debounced)
    useEffect(() => {
        if (autoSimulate && prompt.trim() && currentModel) {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            debounceTimeout.current = window.setTimeout(() => {
                runSimulation();
            }, 1500); // 1.5 second debounce
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [prompt, currentModel, simulationType, autoSimulate, runSimulation]);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const formatCost = (cost: number) => {
        return cost < 0.001 ? `$${(cost * 1000).toFixed(4)}k` : `$${cost.toFixed(4)}`;
    };

    const formatTokens = (tokens: number) => {
        return tokens > 1000 ? `${(tokens / 1000).toFixed(1)}k` : tokens.toString();
    };

    // Get model display info including pricing
    const getModelDisplayInfo = useCallback((modelId: string) => {
        const modelData = AWS_BEDROCK_PRICING.find(m => m.model === modelId);
        if (!modelData) return { name: modelId, pricing: '' };

        const inputPrice = modelData.inputPrice < 1 ?
            `$${(modelData.inputPrice * 1000).toFixed(1)}k` :
            `$${modelData.inputPrice.toFixed(2)}/1M`;

        const outputPrice = modelData.outputPrice < 1 ?
            `$${(modelData.outputPrice * 1000).toFixed(1)}k` :
            `$${modelData.outputPrice.toFixed(2)}/1M`;

        // Create friendly name
        const friendlyName = modelId
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Amazon ', '')
            .replace('Claude ', 'Claude ')
            .replace('Llama ', 'Llama ');

        return {
            name: friendlyName,
            pricing: `(${inputPrice}→${outputPrice})`
        };
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    🚀 Real-Time What-If Cost Simulator
                </h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    See instant cost optimizations for your prompts using AWS Bedrock models. Compare models, trim context, optimize structure - all in real-time with confidence scores.
                </p>
                <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
                    💡 <strong>Bedrock Focus:</strong> All models shown have verified pricing data and are available through AWS Bedrock
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Prompt Input */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Paste your prompt here to see instant cost analysis and optimization suggestions..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={6}
                        />
                        <div className="mt-2 text-sm text-gray-500">
                            Length: {prompt.length} characters (~{Math.ceil(prompt.length / 4)} tokens)
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Model Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Model
                            </label>
                            <select
                                value={currentModel}
                                onChange={(e) => setCurrentModel(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {availableModels.map(model => {
                                    const displayInfo = getModelDisplayInfo(model);
                                    return (
                                        <option key={model} value={model}>
                                            {displayInfo.name} {displayInfo.pricing}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="mt-1 text-xs text-gray-500">
                                {(() => {
                                    const displayInfo = getModelDisplayInfo(currentModel);
                                    return `${displayInfo.name} • Input→Output tokens pricing`;
                                })()}
                            </div>
                        </div>

                        {/* Simulation Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Analysis Type
                            </label>
                            <select
                                value={simulationType}
                                onChange={(e) => setSimulationType(e.target.value as 'real_time_analysis' | 'prompt_optimization' | 'context_trimming' | 'model_comparison')}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {simulationTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <div className="mt-1 text-xs text-gray-500">
                                {simulationTypes.find(t => t.value === simulationType)?.description}
                            </div>
                        </div>

                        {/* Auto-simulate toggle */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="auto-simulate"
                                checked={autoSimulate}
                                onChange={(e) => setAutoSimulate(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="auto-simulate" className="ml-2 text-sm text-gray-700">
                                Auto-simulate on changes
                            </label>
                        </div>

                        {/* Simulate Button */}
                        <button
                            onClick={runSimulation}
                            disabled={isSimulating || !prompt.trim() || !currentModel}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSimulating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Analyzing...
                                </>
                            ) : (
                                '🚀 Run Analysis'
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {results && (
                <div className="space-y-6">
                    {/* Current Cost Overview */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Current Cost Analysis</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{formatCost(results.currentCost.totalCost)}</div>
                                <div className="text-sm text-gray-600">Total Cost</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{formatTokens(results.currentCost.totalTokens)}</div>
                                <div className="text-sm text-gray-600">Total Tokens</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{results.potentialSavings.toFixed(1)}%</div>
                                <div className="text-sm text-gray-600">Max Savings</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{results.confidence}%</div>
                                <div className="text-sm text-gray-600">Confidence</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Recommendations */}
                    {results.recommendations.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Top Recommendations</h3>
                            <div className="space-y-3">
                                {results.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(rec.priority)}`}></div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{rec.title}</div>
                                            <div className="text-sm text-gray-600 mt-1">{rec.action}</div>
                                            <div className="flex items-center space-x-4 mt-2 text-xs">
                                                <span className="text-green-600 font-medium">
                                                    Save {rec.savings.percentage.toFixed(1)}%
                                                </span>
                                                <span className={`px-2 py-1 rounded-full border ${getRiskColor(rec.risk)}`}>
                                                    {rec.risk} risk
                                                </span>
                                                <span className="text-gray-500">{rec.implementation} to implement</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Optimization Options */}
                    {results.optimizedOptions.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Optimization Options</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.optimizedOptions.map((option, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{option.description}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getRiskColor(option.risk)}`}>
                                                {option.risk}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Savings:</span>
                                                <span className="text-green-600 font-medium">{option.savings.percentage.toFixed(1)}%</span>
                                            </div>

                                            {option.savings.cost && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">New Cost:</span>
                                                    <span className="font-medium">{formatCost(option.savings.cost)}</span>
                                                </div>
                                            )}

                                            {option.model && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Model:</span>
                                                    <span className="font-medium">{option.model}</span>
                                                </div>
                                            )}

                                            {option.qualityImpact && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Quality Impact:</span>
                                                    <span className={`font-medium ${option.qualityImpact === 'minimal' ? 'text-green-600' :
                                                        option.qualityImpact === 'low' ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {option.qualityImpact}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Implementation:</span>
                                                <span className={`font-medium ${option.implementation === 'easy' ? 'text-green-600' :
                                                    option.implementation === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {option.implementation}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No results state */}
            {!results && !isSimulating && !error && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Optimize Your Costs?</h3>
                    <p className="text-gray-600 mb-4">
                        Enter your prompt above and see instant cost analysis with actionable optimization recommendations.
                    </p>
                    <div className="text-sm text-gray-500">
                        ✨ See savings up to 95% • 🚀 Instant results • 💡 AI-powered recommendations
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeWhatIfSimulator;