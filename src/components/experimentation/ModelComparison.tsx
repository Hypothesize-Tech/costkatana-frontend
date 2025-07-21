import React, { useState, useEffect } from 'react';
import {
    PlayIcon,
    PlusIcon,
    TrashIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ExperimentationService } from '../../services/experimentation.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';

interface ModelConfig {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
}

interface AvailableModel {
    provider: string;
    model: string;
    modelName?: string;
    modelId?: string;
    pricing: {
        input: number;
        output: number;
        unit: string;
    };
    capabilities: string[];
    contextWindow: number;
    category?: string;
    isLatest?: boolean;
    notes?: string;
}

interface ComparisonResult {
    model: string;
    provider: string;
    actualUsage?: {
        totalCalls: number;
        avgCost: number;
        avgTokens: number;
        avgResponseTime: number;
        errorRate: number;
        totalCost: number;
    };
    noUsageData?: boolean;
    estimatedCostPer1K?: number;
    recommendation: string;
    analysis?: {
        strengths: string[];
        considerations: string[];
    };
    pricing?: {
        inputCost: number;
        outputCost: number;
        contextWindow: number;
    };
}

const ModelComparison: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([]);
    const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
    const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>(['accuracy', 'relevance', 'completeness']);
    const [iterations, setIterations] = useState(1);
    const [results, setResults] = useState<ComparisonResult[]>([]);
    const [currentExperiment, setCurrentExperiment] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ComparisonResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
    const [realTimeMode, setRealTimeMode] = useState(false);
    const [progressData, setProgressData] = useState<any>(null);
    const [comparisonMode, setComparisonMode] = useState<'quality' | 'cost' | 'speed' | 'comprehensive'>('comprehensive');
    const [executeOnBedrock, setExecuteOnBedrock] = useState(true);

    const criteriaOptions = [
        'accuracy', 'relevance', 'completeness', 'coherence', 'creativity',
        'factual_accuracy', 'safety', 'bias_detection', 'language_quality'
    ];

    useEffect(() => {
        loadAvailableModels();
    }, []);

    // Trigger cost estimation when models or prompt change
    useEffect(() => {
        if (selectedModels.length > 0 && prompt.trim()) {
            console.log('Triggering cost estimation due to changes...');
            estimateComparisonCost();
        }
    }, [selectedModels, prompt, iterations]);

    useEffect(() => {
        if (selectedModels.length > 0 && prompt.trim()) {
            estimateComparisonCost();
        }
    }, [selectedModels, prompt, iterations]);

    const loadAvailableModels = async () => {
        try {
            const response = await ExperimentationService.getAvailableModels();
            console.log('Available models response:', response); // Debug log
            
            // Normalize the response data structure
            const normalizedModels = (Array.isArray(response) ? response : []).map((model: any) => ({
                provider: model.provider || 'Unknown',
                model: model.model || model.modelId || model.modelName || '',
                modelName: model.modelName || model.model || '',
                pricing: {
                    input: model.pricing?.input || 0,
                    output: model.pricing?.output || 0,
                    unit: model.pricing?.unit || 'Per 1M tokens'
                },
                capabilities: model.capabilities || ['text'],
                contextWindow: model.contextWindow || 8192,
                category: model.category || 'general',
                isLatest: model.isLatest !== false,
                notes: model.notes || ''
            }));
            
            console.log('Normalized models:', normalizedModels);
            console.log('Sample model pricing:', normalizedModels[0]?.pricing);
            setAvailableModels(normalizedModels);
            
            if (normalizedModels.length === 0) {
                setError('No models available. Please check if the backend pricing data is configured.');
            } else {
                setError(null); // Clear any previous errors
                // Trigger initial cost estimation if we have selected models
                if (selectedModels.length > 0) {
                    setTimeout(estimateComparisonCost, 200);
                }
            }
        } catch (error: any) {
            console.error('Error loading available models:', error);
            setError('Failed to load available models: ' + (error.message || 'Unknown error'));
            
            // Fallback to some default models for testing
            setAvailableModels([
                {
                    provider: 'Amazon',
                    model: 'amazon.nova-micro-v1:0',
                    modelName: 'Nova Micro',
                    pricing: { input: 0.035, output: 0.14, unit: 'Per 1M tokens' },
                    capabilities: ['text'],
                    contextWindow: 128000,
                    category: 'general',
                    isLatest: true,
                    notes: 'Fallback model'
                }
            ]);
        }
    };

    const estimateComparisonCost = async () => {
        try {
            // Calculate cost estimate based on prompt length and selected models
            if (!prompt.trim() || selectedModels.length === 0) {
                setEstimatedCost(0);
                return;
            }

            const promptTokens = Math.ceil(prompt.length / 4); // Rough token estimate
            const outputTokens = 500; // Estimated response length
            let totalCost = 0;

            selectedModels.forEach(selectedModel => {
                const modelPricing = getModelPricing(selectedModel.provider, selectedModel.model);
                if (modelPricing) {
                    const inputCost = (promptTokens / 1000000) * modelPricing.input;
                    const outputCost = (outputTokens / 1000000) * modelPricing.output;
                    totalCost += (inputCost + outputCost) * iterations;
                }
            });

            setEstimatedCost(totalCost);

            // Also try backend estimation as fallback
            try {
                const estimate = await ExperimentationService.estimateExperimentCost({
                    type: 'model_comparison',
                    parameters: {
                        prompt,
                        models: selectedModels,
                        iterations
                    }
                });

                if (estimate.estimatedCost > 0) {
                    setEstimatedCost(estimate.estimatedCost);
                }
            } catch (backendError) {
                console.log('Backend cost estimation unavailable, using frontend calculation:', totalCost);
            }

        } catch (error) {
            console.error('Error estimating cost:', error);
            setEstimatedCost(0);
        }
    };

    const addModel = () => {
        console.log('addModel called. Available models:', availableModels.length, 'Selected models:', selectedModels.length);
        
        if (availableModels.length === 0) {
            setError('No models available to add. Please wait for models to load.');
            return;
        }

        // Find a model that hasn't been selected yet
        const usedModels = new Set(selectedModels.map(m => `${m.provider}:${m.model}`));
        console.log('Used models:', Array.from(usedModels));
        
        const availableModel = availableModels.find(m => !usedModels.has(`${m.provider}:${m.model}`));
        console.log('Found available model:', availableModel);
        
        if (availableModel) {
            const newModel = {
                provider: availableModel.provider,
                model: availableModel.model,
                temperature: 0.7,
                maxTokens: 1000
            };
            console.log('Adding new model:', newModel);
            
            setSelectedModels([...selectedModels, newModel]);
            setError(null); // Clear any previous errors
            
            // Trigger cost recalculation with new model
            setTimeout(estimateComparisonCost, 100);
        } else {
            const message = availableModels.length === selectedModels.length 
                ? 'All available models have been selected.' 
                : 'No more models available to add.';
            setError(message);
        }
    };

    const removeModel = (index: number) => {
        setSelectedModels(selectedModels.filter((_, i) => i !== index));
    };

    const updateModel = (index: number, field: keyof ModelConfig, value: any) => {
        console.log('updateModel called:', { index, field, value });
        const updated = [...selectedModels];
        updated[index] = { ...updated[index], [field]: value };
        console.log('Updated model:', updated[index]);
        setSelectedModels(updated);
        
        // Trigger cost recalculation when models change
        setTimeout(() => {
            console.log('Recalculating cost after model update...');
            estimateComparisonCost();
        }, 100);
    };

    const runComparison = async () => {
        if (!prompt.trim() || selectedModels.length === 0) {
            setError('Please provide a prompt and select at least one model');
            return;
        }

        // Check for duplicate models
        const modelKeys = selectedModels.map(m => `${m.provider}:${m.model}`);
        const uniqueModelKeys = new Set(modelKeys);
        if (modelKeys.length !== uniqueModelKeys.size) {
            setError('You have selected duplicate models. Please remove duplicates before running the comparison.');
            return;
        }

        setIsRunning(true);
        setError(null);
        setResults([]);
        setProgressData(null);

        try {
            if (realTimeMode) {
                await runRealTimeComparison();
            } else {
                await runStaticComparison();
            }
        } catch (error: any) {
            console.error('Error running comparison:', error);
            setIsRunning(false);
            setError('Failed to run comparison: ' + (error.message || 'Unknown error'));
        }
    };

    const runStaticComparison = async () => {
        const request = {
            prompt,
            models: selectedModels,
            evaluationCriteria,
            iterations
        };

        console.log('Sending comparison request:', request);

        const experiment = await ExperimentationService.runModelComparison(request);
        console.log('Received experiment result:', experiment);
        
        setCurrentExperiment(experiment);

        // Extract results from the experiment
        if (experiment.results && experiment.results.modelComparisons) {
            setResults(experiment.results.modelComparisons);
            console.log('Model comparison results:', experiment.results.modelComparisons);
        } else {
            setError('No comparison results returned from the experiment');
        }

        setIsRunning(false);
    };

    const runRealTimeComparison = async () => {
        const request = {
            prompt,
            models: selectedModels,
            evaluationCriteria,
            iterations,
            executeOnBedrock,
            comparisonMode
        };

        try {
            // Start the real-time comparison
            const response = await ExperimentationService.startRealTimeComparison(request);
            const { sessionId } = response.data;

            // Connect to SSE for progress updates
            connectToProgressStream(sessionId);

        } catch (error: any) {
            console.error('Error starting real-time comparison:', error);
            setError('Failed to start real-time comparison: ' + (error.message || 'Unknown error'));
            setIsRunning(false);
        }
    };

    const connectToProgressStream = (sessionId: string) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const eventSource = new EventSource(`${API_URL}/api/experimentation/comparison-progress/${sessionId}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('SSE Progress:', data);

                switch (data.type) {
                    case 'connection':
                        setProgressData({ 
                            stage: 'connected', 
                            progress: 0, 
                            message: 'Connected to comparison stream' 
                        });
                        break;
                    
                    case 'progress':
                        setProgressData(data);
                        
                        if (data.stage === 'completed' && data.results) {
                            setResults(data.results);
                            setIsRunning(false);
                        } else if (data.stage === 'failed') {
                            setError(data.error || 'Comparison failed');
                            setIsRunning(false);
                        }
                        break;
                    
                    case 'close':
                        eventSource.close();
                        if (!progressData || progressData.stage !== 'completed') {
                            setIsRunning(false);
                        }
                        break;
                    
                    case 'heartbeat':
                        // Keep connection alive
                        break;
                }
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            setError('Lost connection to comparison stream');
            setIsRunning(false);
            eventSource.close();
        };

        // Clean up on unmount
        return () => {
            eventSource.close();
        };
    };



    const exportResults = async () => {
        if (!currentExperiment || !results.length) return;

        try {
            const dataToExport = {
                experiment: currentExperiment,
                results: results,
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `model-comparison-${currentExperiment.id}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting results:', error);
            setError('Failed to export results');
        }
    };

    const getModelPricing = (provider: string, model: string) => {
        const modelData = availableModels.find(m => m.provider === provider && m.model === model);
        if (modelData?.pricing && modelData.pricing.input && modelData.pricing.output) {
            return modelData.pricing;
        }
        
        // Fallback pricing data for common AWS Bedrock models
        const fallbackPricing: Record<string, { input: number; output: number; unit: string }> = {
            'amazon.nova-micro-v1:0': { input: 0.035, output: 0.14, unit: 'Per 1M tokens' },
            'amazon.nova-lite-v1:0': { input: 0.06, output: 0.24, unit: 'Per 1M tokens' },
            'amazon.nova-pro-v1:0': { input: 0.80, output: 3.20, unit: 'Per 1M tokens' },
            'amazon.titan-text-lite-v1': { input: 0.30, output: 0.40, unit: 'Per 1M tokens' },
            'amazon.titan-text-express-v1': { input: 0.80, output: 1.60, unit: 'Per 1M tokens' },
            'anthropic.claude-3-5-sonnet-20240620-v1:0': { input: 3.00, output: 15.00, unit: 'Per 1M tokens' },
            'anthropic.claude-3-5-haiku-20241022-v1:0': { input: 1.00, output: 5.00, unit: 'Per 1M tokens' },
            'anthropic.claude-3-haiku-20240307-v1:0': { input: 0.25, output: 1.25, unit: 'Per 1M tokens' },
            'anthropic.claude-3-sonnet-20240229-v1:0': { input: 3.00, output: 15.00, unit: 'Per 1M tokens' },
            'meta.llama3-2-1b-instruct-v1:0': { input: 0.10, output: 0.10, unit: 'Per 1M tokens' },
            'meta.llama3-2-3b-instruct-v1:0': { input: 0.15, output: 0.15, unit: 'Per 1M tokens' },
            'meta.llama3-1-8b-instruct-v1:0': { input: 0.22, output: 0.22, unit: 'Per 1M tokens' },
            'meta.llama3-1-70b-instruct-v1:0': { input: 0.99, output: 0.99, unit: 'Per 1M tokens' },
            'cohere.command-r-v1:0': { input: 0.50, output: 1.50, unit: 'Per 1M tokens' },
            'cohere.command-r-plus-v1:0': { input: 3.00, output: 15.00, unit: 'Per 1M tokens' }
        };
        
        const modelKey = `${provider.toLowerCase()}:${model}` in fallbackPricing ? 
            `${provider.toLowerCase()}:${model}` : model;
            
        return fallbackPricing[modelKey] || fallbackPricing[model] || null;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Model Comparison</h2>
                <div className="flex space-x-2">
                    {results.length > 0 && (
                        <button
                            onClick={exportResults}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <DocumentArrowDownIcon className="mr-2 w-4 h-4" />
                            Export Results
                        </button>
                    )}
                    <button
                        onClick={runComparison}
                        disabled={isRunning || !prompt.trim() || selectedModels.length === 0}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                                            {isRunning ? (
                        <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                            {realTimeMode ? 'Executing Models...' : 'Running...'}
                        </>
                    ) : (
                        <>
                            <PlayIcon className="h-4 w-4 mr-2" />
                            {realTimeMode ? 'Run Real-time Comparison' : 'Run Comparison'}
                        </>
                    )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="mr-2 w-5 h-5 text-red-400" />
                        <span className="text-sm text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Configuration Section */}
            <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                {/* Prompt Input */}
                <div className="lg:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Test Prompt
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter the prompt you want to test across different models..."
                        className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                    />
                </div>

                {/* Real-time Comparison Settings */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={realTimeMode}
                                    onChange={(e) => setRealTimeMode(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm font-medium">🚀 Real-time Bedrock Execution</span>
                                <span className="text-xs text-gray-500">(Actually runs models for authentic comparison)</span>
                            </label>
                        </div>

                        {realTimeMode && (
                            <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={executeOnBedrock}
                                            onChange={(e) => setExecuteOnBedrock(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Execute on AWS Bedrock</span>
                                    </label>
                                    
                                    <select
                                        value={comparisonMode}
                                        onChange={(e) => setComparisonMode(e.target.value as any)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="comprehensive">🎯 Comprehensive Analysis</option>
                                        <option value="quality">🏆 Quality Focus</option>
                                        <option value="cost">💰 Cost Focus</option>
                                        <option value="speed">⚡ Speed Focus</option>
                                    </select>
                                </div>
                                
                                <div className="text-xs text-orange-600">
                                    ⚠️ Real-time mode will take longer but provides authentic model responses and AI-driven evaluation
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress indicator for real-time mode */}
                    {isRunning && realTimeMode && progressData && (
                        <div className="bg-blue-50 p-4 rounded-lg mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm font-medium text-blue-800">{progressData.message}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressData.progress || 0}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                {progressData.stage} - {progressData.progress || 0}%
                                {progressData.currentModel && ` (${progressData.currentModel})`}
                            </div>
                        </div>
                    )}
                </div>

                {/* Model Selection */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Selected Models ({selectedModels.length})
                        </label>
                        <button
                            onClick={addModel}
                            disabled={selectedModels.length >= availableModels.length}
                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="mr-1 w-4 h-4" />
                            Add Model
                        </button>
                    </div>
                    <div className="overflow-y-auto space-y-3 max-h-64">
                        {selectedModels.map((model, index) => (
                            <div key={index} className="p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <select
                                            value={`${model.provider}:${model.model}`}
                                            onChange={(e) => {
                                                const parts = e.target.value.split(':');
                                                if (parts.length >= 2) {
                                                    const provider = parts[0];
                                                    const modelName = parts.slice(1).join(':'); // Handle model names with colons
                                                    console.log('Dropdown changed:', { provider, modelName, fullValue: e.target.value });
                                                    updateModel(index, 'provider', provider);
                                                    updateModel(index, 'model', modelName);
                                                } else {
                                                    console.error('Invalid dropdown value format:', e.target.value);
                                                }
                                            }}
                                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {availableModels.map(m => (
                                                <option key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`}>
                                                    {m.provider} - {m.modelName || m.model}
                                                </option>
                                            ))}
                                        </select>
                                        {/* Show duplicate warning */}
                                        {selectedModels.filter(m => m.provider === model.provider && m.model === model.model).length > 1 && (
                                            <div className="text-xs text-amber-600 mt-1 flex items-center">
                                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                                Duplicate model selected
                                            </div>
                                        )}
                                        {(() => {
                                            const pricing = getModelPricing(model.provider, model.model);
                                            return pricing && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Input: ${pricing.input.toFixed(2)}/1M • Output: ${pricing.output.toFixed(2)}/1M
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <button
                                        onClick={() => removeModel(index)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                        title="Remove this model"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block mb-1 text-xs text-gray-600">Temperature</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={model.temperature}
                                            onChange={(e) => updateModel(index, 'temperature', parseFloat(e.target.value))}
                                            className="px-2 py-1 w-full text-sm rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs text-gray-600">Max Tokens</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="4000"
                                            value={model.maxTokens}
                                            onChange={(e) => updateModel(index, 'maxTokens', parseInt(e.target.value))}
                                            className="px-2 py-1 w-full text-sm rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {selectedModels.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No models selected. Click "Add Model" to get started.
                            </div>
                        )}
                    </div>
                </div>

                {/* Evaluation Criteria */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Evaluation Criteria
                    </label>
                    <div className="overflow-y-auto space-y-2 max-h-64">
                        {criteriaOptions.map(criterion => (
                            <label key={criterion} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={evaluationCriteria.includes(criterion)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setEvaluationCriteria([...evaluationCriteria, criterion]);
                                        } else {
                                            setEvaluationCriteria(evaluationCriteria.filter(c => c !== criterion));
                                        }
                                    }}
                                    className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                    {criterion.replace('_', ' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="flex items-center space-x-6 lg:col-span-2">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Iterations
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={iterations}
                            onChange={(e) => setIterations(parseInt(e.target.value))}
                            className="px-2 py-1 w-20 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {estimatedCost !== null && (
                        <div className="flex items-center text-sm text-gray-600">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            Estimated Cost: ${estimatedCost < 0.001 ? estimatedCost.toFixed(6) : estimatedCost.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {(isRunning || results.length > 0) && (
                <div className="pt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Results</h3>
                        {currentExperiment && (
                            <div className="text-sm text-gray-500">
                                Experiment ID: {currentExperiment.id}
                            </div>
                        )}
                    </div>

                    {isRunning && (
                        <div className="flex justify-center items-center py-8">
                            <LoadingSpinner />
                            <span className="ml-2 text-gray-600">Running comparison...</span>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">
                                                {result.provider} - {result.model}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">{result.recommendation}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedResult(result);
                                                setShowResultsModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </div>

                                    {result.actualUsage ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50 rounded-lg p-3">
                                                <div className="text-sm font-medium text-blue-900">Total Calls</div>
                                                <div className="text-lg font-bold text-blue-700">
                                                    {result.actualUsage.totalCalls.toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-3">
                                                <div className="text-sm font-medium text-green-900">Avg Cost</div>
                                                <div className="text-lg font-bold text-green-700">
                                                    ${result.actualUsage.avgCost.toFixed(4)}
                                                </div>
                                            </div>
                                            <div className="bg-yellow-50 rounded-lg p-3">
                                                <div className="text-sm font-medium text-yellow-900">Avg Response Time</div>
                                                <div className="text-lg font-bold text-yellow-700">
                                                    {result.actualUsage.avgResponseTime.toFixed(0)}ms
                                                </div>
                                            </div>
                                            <div className="bg-red-50 rounded-lg p-3">
                                                <div className="text-sm font-medium text-red-900">Error Rate</div>
                                                <div className="text-lg font-bold text-red-700">
                                                    {result.actualUsage.errorRate.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Pricing Information */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <div className="text-sm font-medium text-blue-900">Input Cost</div>
                                                    <div className="text-sm font-bold text-blue-700">
                                                        ${(() => {
                                                            const pricing = result.pricing?.inputCost ? 
                                                                { input: result.pricing.inputCost * 1000000, output: result.pricing.outputCost || 0 } :
                                                                getModelPricing(result.provider, result.model);
                                                            return pricing?.input ? pricing.input.toFixed(2) : 'N/A';
                                                        })()}/1M tokens
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-3">
                                                    <div className="text-sm font-medium text-green-900">Output Cost</div>
                                                    <div className="text-sm font-bold text-green-700">
                                                        ${(() => {
                                                            const pricing = result.pricing?.outputCost ? 
                                                                { input: result.pricing.inputCost || 0, output: result.pricing.outputCost * 1000000 } :
                                                                getModelPricing(result.provider, result.model);
                                                            return pricing?.output ? pricing.output.toFixed(2) : 'N/A';
                                                        })()}/1M tokens
                                                    </div>
                                                </div>
                                                <div className="bg-yellow-50 rounded-lg p-3">
                                                    <div className="text-sm font-medium text-yellow-900">Est. Cost/1K</div>
                                                    <div className="text-sm font-bold text-yellow-700">
                                                        ${result.estimatedCostPer1K?.toFixed(4) || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <div className="text-sm font-medium text-purple-900">Context Window</div>
                                                    <div className="text-sm font-bold text-purple-700">
                                                        {result.pricing?.contextWindow?.toLocaleString() || 'N/A'} tokens
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Analysis Strengths and Considerations */}
                                            {result.analysis && (result.analysis.strengths?.length > 0 || result.analysis.considerations?.length > 0) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {result.analysis.strengths?.length > 0 && (
                                                        <div className="bg-green-50 rounded-lg p-3">
                                                            <div className="text-sm font-medium text-green-900 mb-2">Strengths</div>
                                                            <ul className="text-xs text-green-800 space-y-1">
                                                                {result.analysis.strengths.map((strength: string, i: number) => (
                                                                    <li key={i}>• {strength}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {result.analysis.considerations?.length > 0 && (
                                                        <div className="bg-amber-50 rounded-lg p-3">
                                                            <div className="text-sm font-medium text-amber-900 mb-2">Considerations</div>
                                                            <ul className="text-xs text-amber-800 space-y-1">
                                                                {result.analysis.considerations.map((consideration: string, i: number) => (
                                                                    <li key={i}>• {consideration}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {currentExperiment && currentExperiment.results && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Overall Analysis</h4>
                                    <p className="text-sm text-blue-800 mb-2">{currentExperiment.results.recommendation}</p>
                                    
                                    {currentExperiment.results.costComparison && (
                                        <div className="text-sm text-blue-800 mb-2">
                                            <strong>Cost Comparison:</strong> {currentExperiment.results.costComparison}
                                        </div>
                                    )}
                                    
                                    {currentExperiment.results.useCaseAnalysis && (
                                        <div className="text-sm text-blue-800 mb-2">
                                            <strong>Use Case Analysis:</strong> {currentExperiment.results.useCaseAnalysis}
                                        </div>
                                    )}
                                    
                                    <div className="mt-2 text-xs text-blue-600">
                                        Confidence: {((currentExperiment.metadata.confidence || 0) * 100).toFixed(1)}% • 
                                        Based on {currentExperiment.results.basedOnActualUsage || 0} models with usage data
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Results Detail Modal */}
            {showResultsModal && selectedResult && (
                <Modal
                    isOpen={showResultsModal}
                    onClose={() => setShowResultsModal(false)}
                    title={`${selectedResult.provider} - ${selectedResult.model}`}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendation</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-800">{selectedResult.recommendation}</p>
                            </div>
                        </div>

                        {selectedResult.actualUsage ? (
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-blue-900 mb-2">Call Statistics</div>
                                        <div className="space-y-1 text-sm text-blue-800">
                                            <div>Total Calls: {selectedResult.actualUsage.totalCalls.toLocaleString()}</div>
                                            <div>Total Cost: ${selectedResult.actualUsage.totalCost.toFixed(2)}</div>
                                            <div>Avg Cost: ${selectedResult.actualUsage.avgCost.toFixed(4)}</div>
                                            <div>Avg Tokens: {selectedResult.actualUsage.avgTokens.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="text-sm font-medium text-green-900 mb-2">Performance</div>
                                        <div className="space-y-1 text-sm text-green-800">
                                            <div>Avg Response Time: {selectedResult.actualUsage.avgResponseTime.toFixed(0)}ms</div>
                                            <div>Error Rate: {selectedResult.actualUsage.errorRate.toFixed(2)}%</div>
                                            <div>Success Rate: {(100 - selectedResult.actualUsage.errorRate).toFixed(2)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Pricing Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-sm font-medium text-blue-900 mb-2">Token Costs</div>
                                            <div className="space-y-1 text-sm text-blue-800">
                                                <div>Input: ${(() => {
                                                    const pricing = selectedResult.pricing?.inputCost ? 
                                                        { input: selectedResult.pricing.inputCost * 1000000, output: selectedResult.pricing.outputCost || 0 } :
                                                        getModelPricing(selectedResult.provider, selectedResult.model);
                                                    return pricing?.input ? pricing.input.toFixed(2) : 'N/A';
                                                })()}/1M tokens</div>
                                                <div>Output: ${(() => {
                                                    const pricing = selectedResult.pricing?.outputCost ? 
                                                        { input: selectedResult.pricing.inputCost || 0, output: selectedResult.pricing.outputCost * 1000000 } :
                                                        getModelPricing(selectedResult.provider, selectedResult.model);
                                                    return pricing?.output ? pricing.output.toFixed(2) : 'N/A';
                                                })()}/1M tokens</div>
                                                <div className="font-medium">Est. Cost per 1K: ${(() => {
                                                    if (selectedResult.estimatedCostPer1K) return selectedResult.estimatedCostPer1K.toFixed(4);
                                                    const pricing = getModelPricing(selectedResult.provider, selectedResult.model);
                                                    if (pricing) {
                                                        // Calculate estimated cost per 1K tokens (assume 50% input, 50% output)
                                                        const cost1K = (pricing.input * 0.5 + pricing.output * 0.5) / 1000;
                                                        return cost1K.toFixed(4);
                                                    }
                                                    return 'N/A';
                                                })()}</div>
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="text-sm font-medium text-purple-900 mb-2">Model Specs</div>
                                            <div className="space-y-1 text-sm text-purple-800">
                                                <div>Context Window: {selectedResult.pricing?.contextWindow?.toLocaleString() || 'N/A'} tokens</div>
                                                <div>Provider: {selectedResult.provider}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedResult.analysis && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedResult.analysis.strengths?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
                                                <div className="bg-green-50 rounded-lg p-4">
                                                    <ul className="text-sm text-green-800 space-y-2">
                                                        {selectedResult.analysis.strengths.map((strength: string, i: number) => (
                                                            <li key={i} className="flex items-start">
                                                                <span className="text-green-600 mr-2">✓</span>
                                                                <span>{strength}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {selectedResult.analysis.considerations?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Considerations</h4>
                                                <div className="bg-amber-50 rounded-lg p-4">
                                                    <ul className="text-sm text-amber-800 space-y-2">
                                                        {selectedResult.analysis.considerations.map((consideration: string, i: number) => (
                                                            <li key={i} className="flex items-start">
                                                                <span className="text-amber-600 mr-2">⚠</span>
                                                                <span>{consideration}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedResult.estimatedCostPer1K === 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>No pricing data available</strong> - This model may not be included in our pricing database. 
                                            Please check with the provider for current pricing information.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ModelComparison; 