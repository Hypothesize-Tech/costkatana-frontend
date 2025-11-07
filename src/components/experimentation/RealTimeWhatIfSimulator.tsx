import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ExperimentationService } from '../../services/experimentation.service';
import { AWS_BEDROCK_PRICING } from '../../utils/pricing';
import { Beaker, AlertTriangle, Sparkles, Lightbulb, DollarSign, BarChart3, Target, Zap, Settings } from 'lucide-react';

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
        { value: 'real_time_analysis', label: 'Complete Analysis', description: 'Full optimization suite', icon: 'target' },
        { value: 'prompt_optimization', label: 'Prompt Optimization', description: 'Optimize prompt structure', icon: 'sparkles' },
        { value: 'context_trimming', label: 'Context Trimming', description: 'Smart context reduction', icon: 'scissors' },
        { value: 'model_comparison', label: 'Model Comparison', description: 'Compare across models', icon: 'bolt' },
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
                    <Beaker className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-display font-bold gradient-text-primary mb-4 flex items-center justify-center gap-3">
                    <Sparkles className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                    Real-Time What-If Cost Simulator
                </h1>
                <p className="font-body text-light-text-secondary dark:text-dark-text-secondary max-w-4xl mx-auto text-lg leading-relaxed">
                    See instant cost optimizations for your prompts using AWS Bedrock models. Compare models, trim context, optimize structure - all in real-time with confidence scores.
                </p>
                <div className="glass p-4 rounded-xl border border-primary-200/30 bg-primary-500/5 dark:bg-primary-900/20 mt-6 max-w-3xl mx-auto backdrop-blur-xl flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <div className="font-body text-primary-700 dark:text-primary-300">
                        <span className="font-display font-bold">Bedrock Focus:</span> All models shown have verified pricing data and are available through AWS Bedrock
                    </div>
                </div>
            </div>

            {/* Input Section */}
            <div className="glass p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-fade-in">
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
                        <div className="glass p-6 shadow-lg backdrop-blur-xl border border-primary-200/30 space-y-4">
                            <h4 className="text-sm font-display font-bold gradient-text-primary flex items-center">
                                <div className="bg-gradient-primary p-2 rounded-lg glow-primary shadow-lg mr-3">
                                    <Settings className="w-5 h-5 text-white" />
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
                            className="btn btn-primary w-full py-4 font-display font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl glow-primary flex items-center justify-center gap-2"
                        >
                            {isSimulating ? (
                                <>
                                    <div className="spinner mr-3"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-5 w-5" />
                                    Run Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 glass p-4 shadow-2xl backdrop-blur-xl border border-danger-200/30 dark:border-danger-500/30 animate-scale-in">
                        <div className="flex items-center">
                            <div className="bg-gradient-danger p-2 rounded-lg glow-danger shadow-lg mr-3">
                                <AlertTriangle className="h-5 w-5 text-white" />
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
                    <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-fade-in">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-primary p-3 rounded-xl glow-primary shadow-lg mr-4">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-display font-bold gradient-text">Current Cost Analysis</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass p-6 rounded-xl border border-primary-200/30 text-center shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex items-center justify-center mb-2">
                                    <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                                </div>
                                <div className="text-2xl font-display font-bold text-secondary-900 dark:text-white">{formatCost(results.currentCost.totalCost)}</div>
                                <div className="text-sm text-secondary-600 dark:text-secondary-300 font-body">Total Cost</div>
                            </div>
                            <div className="glass p-6 rounded-xl border border-primary-200/30 text-center shadow-lg bg-gradient-light-panel dark:bg-gradient-dark-panel">
                                <div className="flex items-center justify-center mb-2">
                                    <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                                </div>
                                <div className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">{formatTokens(results.currentCost.totalTokens)}</div>
                                <div className="text-sm text-secondary-600 dark:text-secondary-300 font-body">Total Tokens</div>
                            </div>
                            <div className="glass p-6 rounded-xl border border-success-200/30 text-center shadow-lg bg-gradient-success/10 dark:bg-gradient-success/20">
                                <div className="flex items-center justify-center mb-2">
                                    <DollarSign className="h-5 w-5 text-success-600 dark:text-success-400" />
                                </div>
                                <div className="text-2xl font-display font-bold text-success-600 dark:text-success-400">{results.potentialSavings.toFixed(1)}%</div>
                                <div className="text-sm text-secondary-600 dark:text-secondary-300 font-body">Max Savings</div>
                            </div>
                            <div className="glass p-6 rounded-xl border border-primary-200/30 text-center shadow-lg bg-gradient-primary/10 dark:bg-gradient-primary/20">
                                <div className="flex items-center justify-center mb-2">
                                    <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">{results.confidence}%</div>
                                <div className="text-sm text-secondary-600 dark:text-secondary-300 font-body">Confidence</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Recommendations */}
                    {results.recommendations.length > 0 && (
                        <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-fade-in">
                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                Top Recommendations
                            </h3>
                            <div className="space-y-3">
                                {results.recommendations.map((rec, index) => (
                                    <div key={index} className="glass p-6 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300">
                                        <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(rec.priority)}`}></div>
                                        <div className="flex-1">
                                            <div className="font-medium text-secondary-900 dark:text-white">{rec.title}</div>
                                            <div className="text-sm text-secondary-600 dark:text-secondary-300 mt-1">{rec.action}</div>
                                            <div className="flex items-center space-x-4 mt-2 text-xs">
                                                <span className="text-success-600 dark:text-success-400 font-medium">
                                                    Save {rec.savings.percentage.toFixed(1)}%
                                                </span>
                                                <span className={`px-2 py-1 rounded-full border ${getRiskColor(rec.risk)}`}>
                                                    {rec.risk} risk
                                                </span>
                                                <span className="text-secondary-500 dark:text-secondary-400">{rec.implementation} to implement</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Optimization Options */}
                    {results.optimizedOptions.length > 0 && (
                        <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 animate-fade-in">
                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                Optimization Options
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {results.optimizedOptions.map((option, index) => (
                                    <div key={index} className="glass p-6 rounded-xl border border-primary-200/30 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-secondary-900 dark:text-white">{option.description}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getRiskColor(option.risk)}`}>
                                                {option.risk}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-secondary-600 dark:text-secondary-300">Savings:</span>
                                                <span className="text-success-600 dark:text-success-400 font-medium">{option.savings.percentage.toFixed(1)}%</span>
                                            </div>

                                            {option.savings.cost && (
                                                <div className="flex justify-between">
                                                    <span className="text-secondary-600 dark:text-secondary-300">New Cost:</span>
                                                    <span className="font-medium text-secondary-900 dark:text-white">{formatCost(option.savings.cost)}</span>
                                                </div>
                                            )}

                                            {option.model && (
                                                <div className="flex justify-between">
                                                    <span className="text-secondary-600 dark:text-secondary-300">Model:</span>
                                                    <span className="font-medium text-secondary-900 dark:text-white">{option.model}</span>
                                                </div>
                                            )}

                                            {option.qualityImpact && (
                                                <div className="flex justify-between">
                                                    <span className="text-secondary-600 dark:text-secondary-300">Quality Impact:</span>
                                                    <span className={`font-medium ${option.qualityImpact === 'minimal' ? 'text-success-600 dark:text-success-400' :
                                                        option.qualityImpact === 'low' ? 'text-warning-600 dark:text-warning-400' : 'text-danger-600 dark:text-danger-400'
                                                        }`}>
                                                        {option.qualityImpact}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between">
                                                <span className="text-secondary-600 dark:text-secondary-300">Implementation:</span>
                                                <span className={`font-medium ${option.implementation === 'easy' ? 'text-success-600 dark:text-success-400' :
                                                    option.implementation === 'moderate' ? 'text-warning-600 dark:text-warning-400' : 'text-danger-600 dark:text-danger-400'
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
                <div className="glass p-12 rounded-xl border-2 border-dashed border-primary-200/30 text-center shadow-lg backdrop-blur-xl">
                    <div className="bg-gradient-primary p-4 rounded-2xl shadow-2xl glow-primary w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Target className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Ready to Optimize Your Costs?</h3>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary font-body mb-4">
                        Enter your prompt above and see instant cost analysis with actionable optimization recommendations.
                    </p>
                    <div className="text-sm text-light-text-muted dark:text-dark-text-muted font-body flex items-center justify-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            See savings up to 95%
                        </span>
                        <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Instant results
                        </span>
                        <span className="flex items-center gap-1">
                            <Lightbulb className="h-4 w-4" />
                            AI-powered recommendations
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeWhatIfSimulator;