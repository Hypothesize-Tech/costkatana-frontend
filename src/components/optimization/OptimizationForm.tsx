// src/components/optimization/OptimizationForm.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '../../contexts/NotificationContext';
import { optimizationService } from '@/services/optimization.service';
import OptimizationWidget from './OptimizationWidget';
import { getProviders, getModelsForProvider } from '@/utils/cost';
import { AxiosError } from 'axios';

interface OptimizationFormProps {
    onClose: () => void;
}

const getAIServices = () => {
    return getProviders().map(provider => ({
        value: provider.toLowerCase().replace(/\s+/g, '-'),
        label: provider
    }));
};

const getModelsForService = (provider: string) => {
    const normalized = provider.replace(/-/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    return getModelsForProvider(normalized).map(model => model.model);
};

export const OptimizationForm: React.FC<OptimizationFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        service: 'openai',
        model: 'gpt-4',
        prompt: '',
        maxTokens: 2000,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        metadata: {
            userId: '',
            projectId: '',
            environment: 'development',
            version: '1.0.0'
        }
    });

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showWidget, setShowWidget] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();

    const optimizeMutation = useMutation({
        mutationFn: (data: { prompt: string; model: string; service: string; apiKey: string }) =>
            optimizationService.getOptimizationPreview({
                prompt: data.prompt,
                model: data.model,
                service: data.service
            }),
        onSuccess: (_data) => {
            showNotification('Prompt optimized successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['optimizations'] });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showNotification(
                error.response?.data?.message || 'Failed to optimize prompt',
                'error'
            );
        }
    });

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.prompt.trim()) {
            errors.prompt = 'Prompt is required';
        }

        if (!apiKey.trim()) {
            errors.apiKey = 'API key is required';
        }

        if (formData.maxTokens < 1 || formData.maxTokens > 8000) {
            errors.maxTokens = 'Max tokens must be between 1 and 8000';
        }

        if (formData.temperature < 0 || formData.temperature > 2) {
            errors.temperature = 'Temperature must be between 0 and 2';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsOptimizing(true);
        optimizeMutation.mutate({ ...formData, apiKey });
    };

    const handleApplyOptimization = (optimizedPrompt: string, _optimization: any) => {
        setFormData(prev => ({ ...prev, prompt: optimizedPrompt }));
        setShowWidget(false);
    };

    const handleChange = (field: string, value: any) => {
        if (field === 'service') {
            const newService = value as string;
            const newModels = getModelsForService(newService);
            const newModel = newModels[0] || '';
            setFormData(prev => ({ ...prev, service: newService, model: newModel }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Prompt Optimization</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex h-[calc(90vh-theme(spacing.20))]">
                    {/* Form Section */}
                    <div className="overflow-y-auto flex-1 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Provider Selection */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    AI Service Provider
                                </label>
                                <select
                                    value={formData.service}
                                    onChange={(e) => handleChange('service', e.target.value)}
                                    className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {getAIServices().map((service) => (
                                        <option key={service.value} value={service.value}>
                                            {service.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Model Selection */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Model
                                </label>
                                <select
                                    value={formData.model}
                                    onChange={(e) => handleChange('model', e.target.value)}
                                    className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {getModelsForService(formData.service).map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* API Key */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.apiKey ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your API key"
                                />
                                {validationErrors.apiKey && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.apiKey}</p>
                                )}
                            </div>

                            {/* Prompt */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Prompt to Optimize
                                </label>
                                <textarea
                                    value={formData.prompt}
                                    onChange={(e) => handleChange('prompt', e.target.value)}
                                    rows={8}
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.prompt ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter the prompt you want to optimize..."
                                />
                                {validationErrors.prompt && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.prompt}</p>
                                )}
                            </div>

                            {/* Parameters */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Max Tokens ({formData.maxTokens})
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="8000"
                                        value={formData.maxTokens}
                                        onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    {validationErrors.maxTokens && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.maxTokens}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Temperature ({formData.temperature})
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    {validationErrors.temperature && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.temperature}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Top P ({formData.topP})
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={formData.topP}
                                        onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Frequency Penalty ({formData.frequencyPenalty})
                                    </label>
                                    <input
                                        type="range"
                                        min="-2"
                                        max="2"
                                        step="0.1"
                                        value={formData.frequencyPenalty}
                                        onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Metadata</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            User ID
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metadata.userId}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                metadata: { ...prev.metadata, userId: e.target.value }
                                            }))}
                                            className="block px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Optional user identifier"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Project ID
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metadata.projectId}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                metadata: { ...prev.metadata, projectId: e.target.value }
                                            }))}
                                            className="block px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Optional project identifier"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Environment
                                        </label>
                                        <select
                                            value={formData.metadata.environment}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                metadata: { ...prev.metadata, environment: e.target.value }
                                            }))}
                                            className="block px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="development">Development</option>
                                            <option value="staging">Staging</option>
                                            <option value="production">Production</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Version
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metadata.version}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                metadata: { ...prev.metadata, version: e.target.value }
                                            }))}
                                            className="block px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="e.g., 1.0.0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex pt-6 space-x-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isOptimizing || optimizeMutation.isPending}
                                    className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isOptimizing || optimizeMutation.isPending ? (
                                        <div className="flex justify-center items-center">
                                            <LoadingSpinner size="small" />
                                            <span className="ml-2">Optimizing...</span>
                                        </div>
                                    ) : (
                                        'Optimize Prompt'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowWidget(true)}
                                    className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Preview Widget
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Widget Preview Section */}
                    {showWidget && (
                        <div className="p-6 w-1/3 bg-gray-50 border-l border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Widget Preview</h3>
                                <button
                                    onClick={() => setShowWidget(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <OptimizationWidget
                                prompt={formData.prompt}
                                onApplyOptimization={handleApplyOptimization}
                                service={formData.service}
                                model={formData.model}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};