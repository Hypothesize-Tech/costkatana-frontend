import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { trainingService, CreateDatasetData } from '../../services/training.service';

interface CreateDatasetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDatasetCreated: (dataset: any) => void;
}

const POPULAR_USE_CASES = [
    'support-ticket-classifier',
    'content-generator',
    'code-assistant',
    'email-responder',
    'document-summarizer',
    'sentiment-analyzer',
    'chatbot-responses',
    'product-descriptions'
];

const POPULAR_MODELS = [
    'gpt-3.5-turbo',
    'gpt-4',
    'claude-3-haiku',
    'claude-3-sonnet',
    'claude-3-opus',
    'gemini-pro',
    'llama-2-7b',
    'llama-2-13b'
];

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
    isOpen,
    onClose,
    onDatasetCreated
}) => {
    const [formData, setFormData] = useState<CreateDatasetData>({
        name: '',
        description: '',
        targetUseCase: '',
        targetModel: '',
        minScore: 4,
        maxTokens: undefined,
        maxCost: undefined,
        filters: {}
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.targetUseCase || !formData.targetModel) {
            return;
        }

        setIsSubmitting(true);
        try {
            const dataset = await trainingService.datasets.createDataset(formData);
            onDatasetCreated(dataset);
            onClose();

            // Reset form
            setFormData({
                name: '',
                description: '',
                targetUseCase: '',
                targetModel: '',
                minScore: 4,
                maxTokens: undefined,
                maxCost: undefined,
                filters: {}
            });
            setShowAdvanced(false);
        } catch (error) {
            console.error('Failed to create dataset:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof CreateDatasetData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Create Training Dataset
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dataset Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g., Support-Classifier-V1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe what this dataset will be used for..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Use Case *
                                </label>
                                <select
                                    value={formData.targetUseCase}
                                    onChange={(e) => handleInputChange('targetUseCase', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select use case...</option>
                                    {POPULAR_USE_CASES.map(useCase => (
                                        <option key={useCase} value={useCase}>
                                            {useCase.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                    <option value="custom">Custom (enter below)</option>
                                </select>

                                {formData.targetUseCase === 'custom' && (
                                    <input
                                        type="text"
                                        placeholder="Enter custom use case"
                                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => handleInputChange('targetUseCase', e.target.value)}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Model *
                                </label>
                                <select
                                    value={formData.targetModel}
                                    onChange={(e) => handleInputChange('targetModel', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select model...</option>
                                    {POPULAR_MODELS.map(model => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                    <option value="custom">Custom (enter below)</option>
                                </select>

                                {formData.targetModel === 'custom' && (
                                    <input
                                        type="text"
                                        placeholder="Enter custom model name"
                                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => handleInputChange('targetModel', e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quality Criteria */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Quality Criteria</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Minimum Score
                                </label>
                                <select
                                    value={formData.minScore}
                                    onChange={(e) => handleInputChange('minScore', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={4}>4+ Stars (Good)</option>
                                    <option value={5}>5 Stars (Excellent)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Tokens (Optional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxTokens || ''}
                                    onChange={(e) => handleInputChange('maxTokens', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="No limit"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Cost $ (Optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={formData.maxCost || ''}
                                    onChange={(e) => handleInputChange('maxCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    placeholder="No limit"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showAdvanced && (
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Providers (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., OpenAI, Anthropic"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => {
                                            const providers = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                                            handleInputChange('filters', {
                                                ...formData.filters,
                                                providers: providers.length > 0 ? providers : undefined
                                            });
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Features (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., support-bot, content-gen"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => {
                                            const features = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                                            handleInputChange('filters', {
                                                ...formData.filters,
                                                features: features.length > 0 ? features : undefined
                                            });
                                        }}
                                    />
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
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || !formData.name || !formData.targetUseCase || !formData.targetModel}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Dataset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};