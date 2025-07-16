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
            const models = await ExperimentationService.getAvailableModels();
            setAvailableModels(models);
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
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <StarIcon className="h-3 w-3 mr-1" />
                    Best
                </span>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Model Comparison</h2>
                <div className="flex space-x-2">
                    {results.length > 0 && (
                        <button
                            onClick={exportResults}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
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
                                Running...
                            </>
                        ) : (
                            <>
                                <PlayIcon className="h-4 w-4 mr-2" />
                                Run Comparison
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-sm text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Prompt Input */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Prompt
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter the prompt you want to test across different models..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Model
                        </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedModels.map((model, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <select
                                            value={`${model.provider}:${model.model}`}
                                            onChange={(e) => {
                                                const [provider, modelName] = e.target.value.split(':');
                                                updateModel(index, 'provider', provider);
                                                updateModel(index, 'model', modelName);
                                            }}
                                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Temperature</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={model.temperature}
                                            onChange={(e) => updateModel(index, 'temperature', parseFloat(e.target.value))}
                                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Max Tokens</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="4000"
                                            value={model.maxTokens}
                                            onChange={(e) => updateModel(index, 'maxTokens', parseInt(e.target.value))}
                                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Evaluation Criteria */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evaluation Criteria
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
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
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                    {criterion.replace('_', ' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="lg:col-span-2 flex items-center space-x-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Iterations
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={iterations}
                            onChange={(e) => setIterations(parseInt(e.target.value))}
                            className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {estimatedCost && (
                        <div className="flex items-center text-sm text-gray-600">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            Estimated Cost: ${estimatedCost.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {(isRunning || results.length > 0) && (
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Results</h3>
                        {results.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                            <span className="ml-2 text-gray-600">Running comparison...</span>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Model
                                        </th>
                                        {comparisonMetrics.map(metric => (
                                            <th key={metric.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {metric.label}
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Response</h4>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                    {selectedResult.response}
                                </pre>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Detailed Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h5 className="text-sm font-medium text-blue-900 mb-2">Cost Breakdown</h5>
                                    <div className="space-y-1 text-sm text-blue-800">
                                        <div>Input Tokens: {selectedResult.costBreakdown.inputTokens.toLocaleString()}</div>
                                        <div>Output Tokens: {selectedResult.costBreakdown.outputTokens.toLocaleString()}</div>
                                        <div>Input Cost: ${selectedResult.costBreakdown.inputCost.toFixed(4)}</div>
                                        <div>Output Cost: ${selectedResult.costBreakdown.outputCost.toFixed(4)}</div>
                                        <div className="font-medium">Total: ${selectedResult.costBreakdown.totalCost.toFixed(4)}</div>
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h5 className="text-sm font-medium text-green-900 mb-2">Quality Metrics</h5>
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
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Performance</h4>
                            <div className="bg-yellow-50 rounded-lg p-4">
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