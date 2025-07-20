import React, { useState, useEffect } from 'react';
import {
    PlayIcon,
    PlusIcon,
    TrashIcon,
    CurrencyDollarIcon,
    StarIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ExperimentationService, ModelComparisonRequest, ModelComparisonResult, ExperimentResult } from '../../services/experimentation.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';

interface ModelConfig {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
}

interface ComparisonMetric {
    key: string;
    label: string;
    format: 'currency' | 'percentage' | 'number' | 'ms' | 'tokens';
    higherIsBetter: boolean;
}

const ModelComparison: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedModels, setSelectedModels] = useState<ModelConfig[]>([]);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>(['accuracy', 'relevance', 'completeness']);
    const [iterations, setIterations] = useState(1);
    const [results, setResults] = useState<ModelComparisonResult[]>([]);
    const [currentExperiment, setCurrentExperiment] = useState<ExperimentResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ModelComparisonResult | null>(null);
    const [sortBy, setSortBy] = useState<string>('cost');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [error, setError] = useState<string | null>(null);
    const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

    const comparisonMetrics: ComparisonMetric[] = [
        { key: 'cost', label: 'Cost', format: 'currency', higherIsBetter: false },
        { key: 'latency', label: 'Latency', format: 'ms', higherIsBetter: false },
        { key: 'tokenCount', label: 'Tokens', format: 'tokens', higherIsBetter: false },
        { key: 'qualityScore', label: 'Quality', format: 'percentage', higherIsBetter: true },
        { key: 'responseTime', label: 'Response Time', format: 'ms', higherIsBetter: false },
        { key: 'throughput', label: 'Throughput', format: 'number', higherIsBetter: true },
        { key: 'reliability', label: 'Reliability', format: 'percentage', higherIsBetter: true },
    ];

    const criteriaOptions = [
        'accuracy', 'relevance', 'completeness', 'coherence', 'creativity',
        'factual_accuracy', 'safety', 'bias_detection', 'language_quality'
    ];

    useEffect(() => {
        loadAvailableModels();
    }, []);

    useEffect(() => {
        if (selectedModels.length > 0 && prompt.trim()) {
            estimateComparisonCost();
        }
    }, [selectedModels, prompt, iterations]);

    const loadAvailableModels = async () => {
        try {
            const response = await ExperimentationService.getAvailableModels();
            setAvailableModels(response.models || []);
        } catch (error) {
            console.error('Error loading available models:', error);
            setError('Failed to load available models');
        }
    };

    const estimateComparisonCost = async () => {
        try {
            const request: ModelComparisonRequest = {
                prompt,
                models: selectedModels,
                evaluationCriteria,
                iterations
            };

            const estimate = await ExperimentationService.estimateExperimentCost({
                type: 'model_comparison',
                parameters: request
            });

            setEstimatedCost(estimate.estimatedCost);
        } catch (error) {
            console.error('Error estimating cost:', error);
        }
    };

    const addModel = () => {
        if (availableModels.length > 0) {
            const firstModel = availableModels[0];
            setSelectedModels([...selectedModels, {
                provider: firstModel.provider,
                model: firstModel.model,
                temperature: 0.7,
                maxTokens: 1000
            }]);
        }
    };

    const removeModel = (index: number) => {
        setSelectedModels(selectedModels.filter((_, i) => i !== index));
    };

    const updateModel = (index: number, field: keyof ModelConfig, value: any) => {
        const updated = [...selectedModels];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedModels(updated);
    };

    const runComparison = async () => {
        if (!prompt.trim() || selectedModels.length === 0) {
            setError('Please provide a prompt and select at least one model');
            return;
        }

        setIsRunning(true);
        setError(null);
        setResults([]);

        try {
            const request: ModelComparisonRequest = {
                prompt,
                models: selectedModels,
                evaluationCriteria,
                iterations
            };

            const experiment = await ExperimentationService.runModelComparison(request);
            setCurrentExperiment(experiment);

            // Poll for results
            const pollResults = async () => {
                try {
                    const results = await ExperimentationService.getModelComparisonResults(experiment.id);
                    setResults(results);

                    if (results.length === selectedModels.length) {
                        setIsRunning(false);
                    } else {
                        setTimeout(pollResults, 2000);
                    }
                } catch (error) {
                    console.error('Error polling results:', error);
                    setIsRunning(false);
                    setError('Failed to fetch results');
                }
            };

            pollResults();
        } catch (error) {
            console.error('Error running comparison:', error);
            setIsRunning(false);
            setError('Failed to run comparison');
        }
    };

    const formatValue = (value: number, format: string): string => {
        switch (format) {
            case 'currency':
                return `$${value.toFixed(4)}`;
            case 'percentage':
                return `${(value * 100).toFixed(1)}%`;
            case 'ms':
                return `${value.toFixed(0)}ms`;
            case 'tokens':
                return `${value.toLocaleString()} tokens`;
            default:
                return value.toFixed(2);
        }
    };

    const sortResults = (results: ModelComparisonResult[]) => {
        return [...results].sort((a, b) => {
            const aValue = getMetricValue(a, sortBy);
            const bValue = getMetricValue(b, sortBy);

            if (sortOrder === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
    };

    const getMetricValue = (result: ModelComparisonResult, metric: string): number => {
        switch (metric) {
            case 'cost':
                return result.metrics.cost;
            case 'latency':
                return result.metrics.latency;
            case 'tokenCount':
                return result.metrics.tokenCount;
            case 'qualityScore':
                return result.metrics.qualityScore;
            case 'responseTime':
                return result.performance.responseTime;
            case 'throughput':
                return result.performance.throughput;
            case 'reliability':
                return result.performance.reliability;
            default:
                return 0;
        }
    };

    const exportResults = async () => {
        if (!currentExperiment) return;

        try {
            const blob = await ExperimentationService.exportExperimentResults(currentExperiment.id, 'json');
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

    const getWinnerBadge = (result: ModelComparisonResult, metric: string) => {
        const metricConfig = comparisonMetrics.find(m => m.key === metric);
        if (!metricConfig) return null;

        const values = results.map(r => getMetricValue(r, metric));
        const bestValue = metricConfig.higherIsBetter ? Math.max(...values) : Math.min(...values);
        const currentValue = getMetricValue(result, metric);

        if (currentValue === bestValue) {
            return (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    <StarIcon className="mr-1 w-3 h-3" />
                    Best
                </span>
            );
        }
        return null;
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
                                <ArrowPathIcon className="mr-2 w-4 h-4 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="mr-2 w-4 h-4" />
                                Run Comparison
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

                {/* Model Selection */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Selected Models ({selectedModels.length})
                        </label>
                        <button
                            onClick={addModel}
                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <PlusIcon className="mr-1 w-4 h-4" />
                            Add Model
                        </button>
                    </div>
                    <div className="overflow-y-auto space-y-3 max-h-64">
                        {selectedModels.map((model, index) => (
                            <div key={index} className="p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="grid flex-1 grid-cols-2 gap-2">
                                        <select
                                            value={`${model.provider}:${model.model}`}
                                            onChange={(e) => {
                                                const [provider, modelName] = e.target.value.split(':');
                                                updateModel(index, 'provider', provider);
                                                updateModel(index, 'model', modelName);
                                            }}
                                            className="px-2 py-1 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {availableModels.map(m => (
                                                <option key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`}>
                                                    {m.provider} - {m.model}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => removeModel(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
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
                    {estimatedCost && (
                        <div className="flex items-center text-sm text-gray-600">
                            <CurrencyDollarIcon className="mr-1 w-4 h-4" />
                            Estimated Cost: ${estimatedCost.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {(isRunning || results.length > 0) && (
                <div className="pt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Results</h3>
                        {results.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-2 py-1 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {comparisonMetrics.map(metric => (
                                        <option key={metric.key} value={metric.key}>
                                            {metric.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Model
                                        </th>
                                        {comparisonMetrics.map(metric => (
                                            <th key={metric.key} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                {metric.label}
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortResults(results).map((result, _index) => (
                                        <tr key={result.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {result.provider}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {result.model}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {comparisonMetrics.map(metric => (
                                                <td key={metric.key} className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-900">
                                                            {formatValue(getMetricValue(result, metric.key), metric.format)}
                                                        </span>
                                                        {getWinnerBadge(result, metric.key)}
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedResult(result);
                                                        setShowResultsModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                        {/* Response */}
                        <div>
                            <h4 className="mb-2 text-sm font-medium text-gray-900">Response</h4>
                            <div className="overflow-y-auto p-4 max-h-64 bg-gray-50 rounded-lg">
                                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {selectedResult.response}
                                </pre>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div>
                            <h4 className="mb-2 text-sm font-medium text-gray-900">Detailed Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h5 className="mb-2 text-sm font-medium text-blue-900">Cost Breakdown</h5>
                                    <div className="space-y-1 text-sm text-blue-800">
                                        <div>Input Tokens: {selectedResult.costBreakdown.inputTokens.toLocaleString()}</div>
                                        <div>Output Tokens: {selectedResult.costBreakdown.outputTokens.toLocaleString()}</div>
                                        <div>Input Cost: ${selectedResult.costBreakdown.inputCost.toFixed(4)}</div>
                                        <div>Output Cost: ${selectedResult.costBreakdown.outputCost.toFixed(4)}</div>
                                        <div className="font-medium">Total: ${selectedResult.costBreakdown.totalCost.toFixed(4)}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h5 className="mb-2 text-sm font-medium text-green-900">Quality Metrics</h5>
                                    <div className="space-y-1 text-sm text-green-800">
                                        <div>Accuracy: {(selectedResult.qualityMetrics.accuracy * 100).toFixed(1)}%</div>
                                        <div>Relevance: {(selectedResult.qualityMetrics.relevance * 100).toFixed(1)}%</div>
                                        <div>Completeness: {(selectedResult.qualityMetrics.completeness * 100).toFixed(1)}%</div>
                                        <div>Coherence: {(selectedResult.qualityMetrics.coherence * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance */}
                        <div>
                            <h4 className="mb-2 text-sm font-medium text-gray-900">Performance</h4>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <div className="grid grid-cols-3 gap-4 text-sm text-yellow-800">
                                    <div>
                                        <div className="font-medium">Response Time</div>
                                        <div>{selectedResult.performance.responseTime}ms</div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Throughput</div>
                                        <div>{selectedResult.performance.throughput} req/s</div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Reliability</div>
                                        <div>{(selectedResult.performance.reliability * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ModelComparison; 