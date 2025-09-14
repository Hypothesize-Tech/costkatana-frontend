import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ExperimentationService } from '../../services/experimentation.service';
import { AWS_BEDROCK_PRICING } from '../../utils/pricing';
import { BeakerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1000);
    const [trimPercentage, setTrimPercentage] = useState(30);
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
                    temperature,
                    maxTokens,
                    trimPercentage: simulationType === 'context_trimming' ? trimPercentage : undefined,
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
    }, [prompt, currentModel, simulationType, temperature, maxTokens, trimPercentage, autoSimulate, runSimulation]);

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
        <div className="max-w-7xl mx-auto p-6 space-y-8 light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient relative overflow-hidden">
            {/* Ambient glow effects */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-pulse"></div>

            {/* Header */}
            <div className="text-center mb-12 relative z-10">
                <div className="bg-gradient-primary p-4 rounded-2xl shadow-2xl glow-primary w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <BeakerIcon className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                    🚀 Real-Time What-If Cost Simulator
                </h1>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary max-w-4xl mx-auto text-lg leading-relaxed">
                    See instant cost optimizations for your prompts using AWS Bedrock models. Compare models, trim context, optimize structure - all in real-time with confidence scores.
                </p>
                <div className="glass p-4 rounded-xl border border-primary-200/30 bg-primary-500/5 mt-6 max-w-3xl mx-auto backdrop-blur-xl">
                    <div className="font-body text-primary-700 dark:text-primary-300">
                        💡 <span className="font-display font-bold">Bedrock Focus:</span> All models shown have verified pricing data and are available through AWS Bedrock
                    </div>
                </div>
            </div>

            {/* Input Section */}
            <div className="card p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Prompt Input */}
                    <div className="lg:col-span-2">
                        <label className="label mb-3">
                            Your Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Paste your prompt here to see instant cost analysis and optimization suggestions..."
                            className="input h-40 resize-none"
                            rows={6}
                        />
                        <div className="mt-3 glass p-3 rounded-xl border border-primary-200/30">
                            <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                <span className="font-display font-semibold">Length:</span> {prompt.length} characters
                                <span className="mx-2">•</span>
                                <span className="font-display font-semibold gradient-text">~{Math.ceil(prompt.length / 4)}</span> tokens
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-6">
                        {/* Model Selection */}
                        <div>
                            <label className="label mb-3">
                                Current Model
                            </label>
                            <select
                                value={currentModel}
                                onChange={(e) => setCurrentModel(e.target.value)}
                                className="input text-sm"
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
                            <div className="mt-2 glass p-2 rounded-lg border border-primary-200/30">
                                <div className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                                    {(() => {
                                        const displayInfo = getModelDisplayInfo(currentModel);
                                        return (
                                            <>
                                                <span className="font-display font-semibold text-primary-600">{displayInfo.name}</span>
                                                <span className="mx-2">•</span>
                                                Input→Output tokens pricing
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Simulation Type */}
                        <div>
                            <label className="label mb-3">
                                Analysis Type
                            </label>
                            <select
                                value={simulationType}
                                onChange={(e) => setSimulationType(e.target.value as 'real_time_analysis' | 'prompt_optimization' | 'context_trimming' | 'model_comparison')}
                                className="input"
                            >
                                {simulationTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <div className="mt-2 glass p-2 rounded-lg border border-accent-200/30 bg-accent-500/5">
                                <div className="text-xs font-body text-accent-700 dark:text-accent-300">
                                    {simulationTypes.find(t => t.value === simulationType)?.description}
                                </div>
                            </div>
                        </div>

                        {/* Advanced Parameters */}
                        <div className="card p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 space-y-4">
                            <h4 className="text-sm font-display font-bold gradient-text flex items-center">
                                <div className="bg-gradient-primary p-2 rounded-lg glow-primary shadow-lg mr-3">
                                    <span className="text-white text-lg">🎛️</span>
                                </div>
                                Advanced Parameters
                            </h4>

                            {/* Temperature */}
                            <div>
                                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                    Temperature: <span className="gradient-text">{temperature}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-primary-200/30 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs font-body text-light-text-muted dark:text-dark-text-muted mt-2">
                                    <span>Conservative</span>
                                    <span>Creative</span>
                                </div>
                            </div>

                            {/* Max Tokens */}
                            <div>
                                <label className="block text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                                    Max Tokens: <span className="gradient-text">{maxTokens.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="4000"
                                    step="100"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                    className="w-full h-2 bg-primary-200/30 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs font-body text-light-text-muted dark:text-dark-text-muted mt-2">
                                    <span>100</span>
                                    <span>4,000</span>
                                </div>
                            </div>

                            {/* Context Trim Percentage (only for context trimming) */}
                            {simulationType === 'context_trimming' && (
                                <div className="glass p-4 rounded-xl border border-accent-200/30 bg-accent-500/5">
                                    <label className="block text-sm font-display font-semibold text-accent-700 dark:text-accent-300 mb-2">
                                        Trim Percentage: <span className="gradient-text">{trimPercentage}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="80"
                                        step="5"
                                        value={trimPercentage}
                                        onChange={(e) => setTrimPercentage(parseInt(e.target.value))}
                                        className="w-full h-2 bg-accent-200/30 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs font-body text-accent-600 dark:text-accent-400 mt-2">
                                        <span>10%</span>
                                        <span>80%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auto-simulate toggle */}
                        <div className="glass p-4 rounded-xl border border-success-200/30 bg-success-500/5">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="auto-simulate"
                                    checked={autoSimulate}
                                    onChange={(e) => setAutoSimulate(e.target.checked)}
                                    className="w-4 h-4 text-success-600 rounded border-success-300 focus:ring-success-500"
                                />
                                <label htmlFor="auto-simulate" className="ml-3 text-sm font-display font-semibold text-success-700 dark:text-success-300">
                                    Auto-simulate on changes
                                </label>
                            </div>
                        </div>

                        {/* Simulate Button */}
                        <button
                            onClick={runSimulation}
                            disabled={isSimulating || !prompt.trim() || !currentModel}
                            className="btn-primary w-full py-4 font-display font-bold text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl glow-primary"
                        >
                            {isSimulating ? (
                                <>
                                    <div className="spinner mr-3"></div>
                                    Analyzing...
                                </>
                            ) : (
                                '🚀 Run Analysis'
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 card p-4 shadow-2xl backdrop-blur-xl border border-danger-200/30 animate-scale-in">
                        <div className="flex items-center">
                            <div className="bg-gradient-danger p-2 rounded-lg glow-danger shadow-lg mr-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-body text-danger-700 dark:text-danger-300">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {results && (
                <div className="space-y-6">
                    {/* Current Cost Overview */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-primary p-3 rounded-xl glow-primary shadow-lg mr-4">
                                <span className="text-white text-2xl">📊</span>
                            </div>
                            <h3 className="text-2xl font-display font-bold gradient-text">Current Cost Analysis</h3>
                        </div>
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