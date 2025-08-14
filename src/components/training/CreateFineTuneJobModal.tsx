import React, { useState, useEffect } from 'react';
import { XMarkIcon, CogIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { trainingService, TrainingDataset, CreateFineTuneJobData, FineTuneJob } from '../../services/training.service';

interface CreateFineTuneJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataset: TrainingDataset | null;
    onJobCreated: (job: FineTuneJob) => void;
}

const PROVIDERS = {
    'openai': {
        name: 'OpenAI',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        description: 'Best for general-purpose applications',
        costMultiplier: 1.0,
    },
    'aws-bedrock': {
        name: 'AWS Bedrock',
        models: ['anthropic.claude-3-haiku', 'anthropic.claude-3-sonnet', 'amazon.titan-text-express-v1'],
        description: 'Enterprise-grade with AWS integration',
        costMultiplier: 0.8,
    },
    'anthropic': {
        name: 'Anthropic',
        models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
        description: 'Advanced reasoning capabilities',
        costMultiplier: 1.2,
    },
    'cohere': {
        name: 'Cohere',
        models: ['command', 'command-light', 'command-nightly'],
        description: 'Specialized for enterprise applications',
        costMultiplier: 0.9,
    },
};

export const CreateFineTuneJobModal: React.FC<CreateFineTuneJobModalProps> = ({
    isOpen,
    onClose,
    dataset,
    onJobCreated,
}) => {
    const [formData, setFormData] = useState<CreateFineTuneJobData>({
        name: '',
        description: '',
        datasetId: '',
        baseModel: '',
        provider: 'openai',
        hyperparameters: {
            epochs: 3,
            learningRate: 0.001,
            batchSize: 16,
        },
        providerConfig: {},
    });
    const [costEstimate, setCostEstimate] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [estimating, setEstimating] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (isOpen && dataset) {
            setFormData(prev => ({
                ...prev,
                name: `${dataset.name} Fine-tune v${dataset.version}`,
                datasetId: dataset._id,
                description: `Fine-tuning job for ${dataset.name} dataset`,
            }));
        }
    }, [isOpen, dataset]);

    useEffect(() => {
        if (formData.provider && formData.baseModel && formData.datasetId) {
            estimateCost();
        }
    }, [formData.provider, formData.baseModel, formData.datasetId]);

    const estimateCost = async () => {
        if (!formData.provider || !formData.baseModel || !formData.datasetId) return;

        setEstimating(true);
        try {
            const estimate = await trainingService.fineTune.estimateCost(
                formData.provider,
                formData.baseModel,
                formData.datasetId
            );
            setCostEstimate(estimate);
        } catch (error) {
            console.error('Failed to estimate cost:', error);
        } finally {
            setEstimating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dataset) return;

        setLoading(true);
        try {
            const job = await trainingService.fineTune.createFineTuneJob(formData);
            onJobCreated(job);
            onClose();

            // Reset form
            setFormData({
                name: '',
                description: '',
                datasetId: '',
                baseModel: '',
                provider: 'openai',
                hyperparameters: {
                    epochs: 3,
                    learningRate: 0.001,
                    batchSize: 16,
                },
                providerConfig: {},
            });
            setCostEstimate(null);
        } catch (error) {
            console.error('Failed to create fine-tune job:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedProvider = PROVIDERS[formData.provider as keyof typeof PROVIDERS];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <CogIcon className="h-6 w-6 text-purple-500" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Create Fine-Tune Job
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Dataset Info */}
                    {dataset && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-900 mb-2">Dataset: {dataset.name} v{dataset.version}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
                                <div>
                                    <span className="font-medium">Items:</span> {dataset.items.length}
                                </div>
                                <div>
                                    <span className="font-medium">Target:</span> {dataset.targetModel}
                                </div>
                                <div>
                                    <span className="font-medium">Use Case:</span> {dataset.targetUseCase}
                                </div>
                                <div>
                                    <span className="font-medium">PII Items:</span>
                                    <span className={dataset.stats.piiStats.totalWithPII > 0 ? 'text-red-600' : 'text-green-600'}>
                                        {dataset.stats.piiStats.totalWithPII}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Provider and Model Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Provider & Model</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provider *
                                </label>
                                <select
                                    value={formData.provider}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        provider: e.target.value as any,
                                        baseModel: '' // Reset model selection
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    {Object.entries(PROVIDERS).map(([key, provider]) => (
                                        <option key={key} value={key}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-600">{selectedProvider?.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Base Model *
                                </label>
                                <select
                                    value={formData.baseModel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, baseModel: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                >
                                    <option value="">Select model...</option>
                                    {selectedProvider?.models.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cost Estimate */}
                    {costEstimate && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-2">Cost Estimate</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-green-700">Est. Cost:</span>
                                    <span className="ml-2 font-medium text-green-900">
                                        ${costEstimate.estimatedCost.toFixed(3)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-green-700">Duration:</span>
                                    <span className="ml-2 font-medium text-green-900">
                                        {Math.round(costEstimate.estimatedDuration / 60)}min
                                    </span>
                                </div>
                                <div>
                                    <span className="text-green-700">Items:</span>
                                    <span className="ml-2 font-medium text-green-900">
                                        {costEstimate.itemCount}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-green-700">Tokens:</span>
                                    <span className="ml-2 font-medium text-green-900">
                                        {costEstimate.totalTokens.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            {costEstimate.recommendations.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center space-x-1 text-xs text-green-700">
                                        <InformationCircleIcon className="h-4 w-4" />
                                        <span>Recommendations:</span>
                                    </div>
                                    <ul className="mt-1 text-xs text-green-700 space-y-1">
                                        {costEstimate.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                            <li key={idx}>• {rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Advanced Settings Toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                        </button>
                    </div>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-900">Hyperparameters</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Epochs
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.hyperparameters?.epochs || 3}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            hyperparameters: {
                                                ...prev.hyperparameters,
                                                epochs: parseInt(e.target.value)
                                            }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-600">Number of training passes</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Learning Rate
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="0.0001"
                                        max="0.01"
                                        value={formData.hyperparameters?.learningRate || 0.001}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            hyperparameters: {
                                                ...prev.hyperparameters,
                                                learningRate: parseFloat(e.target.value)
                                            }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-600">How fast the model learns</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Batch Size
                                    </label>
                                    <select
                                        value={formData.hyperparameters?.batchSize || 16}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            hyperparameters: {
                                                ...prev.hyperparameters,
                                                batchSize: parseInt(e.target.value)
                                            }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value={8}>8</option>
                                        <option value={16}>16</option>
                                        <option value={32}>32</option>
                                        <option value={64}>64</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-600">Examples processed at once</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !formData.name || !formData.provider || !formData.baseModel}
                        >
                            {loading ? 'Creating Job...' : 'Start Fine-Tuning'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
