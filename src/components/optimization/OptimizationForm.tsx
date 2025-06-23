// src/components/optimization/OptimizationForm.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '../../contexts/NotificationContext';
import { optimizationService } from '@/services/optimization.service';

interface OptimizationFormProps {
    onClose: () => void;
}

const AI_SERVICES = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
    { value: 'aws-bedrock', label: 'AWS Bedrock' },
];

const MODELS = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    google: ['gemini-pro', 'gemini-pro-vision'],
    'aws-bedrock': ['claude-v2', 'claude-instant-v1'],
};

export const OptimizationForm: React.FC<OptimizationFormProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        service: 'openai',
        model: 'gpt-4',
        prompt: '',
        context: '',
        preserveIntent: true,
        suggestAlternatives: true,
        targetReduction: 3,
    });

    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const optimizeMutation = useMutation(
        () => optimizationService.createOptimization({
            service: formData.service,
            model: formData.model,
            prompt: formData.prompt,
            context: formData.context,
            options: {
                preserveIntent: formData.preserveIntent,
                suggestAlternatives: formData.suggestAlternatives,
                targetReduction: formData.targetReduction,
            },
        }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['optimizations']);
                showNotification('Optimization created successfully!', 'success');
                onClose();
            },
            onError: () => {
                showNotification('Failed to create optimization', 'error');
            },
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.prompt.trim()) {
            showNotification('Please enter a prompt to optimize', 'error');
            return;
        }
        optimizeMutation.mutate();
    };

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Optimize Prompt</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            AI Service
                        </label>
                        <select
                            value={formData.service}
                            onChange={(e) => {
                                handleChange('service', e.target.value);
                                handleChange('model', MODELS[e.target.value as keyof typeof MODELS][0]);
                            }}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {AI_SERVICES.map((service) => (
                                <option key={service.value} value={service.value}>
                                    {service.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Model
                        </label>
                        <select
                            value={formData.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {MODELS[formData.service as keyof typeof MODELS].map((model) => (
                                <option key={model} value={model}>
                                    {model}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Prompt to Optimize
                    </label>
                    <textarea
                        value={formData.prompt}
                        onChange={(e) => handleChange('prompt', e.target.value)}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your prompt here..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Context (Optional)
                    </label>
                    <textarea
                        value={formData.context}
                        onChange={(e) => handleChange('context', e.target.value)}
                        rows={2}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Provide additional context about the prompt's purpose..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.preserveIntent}
                            onChange={(e) => handleChange('preserveIntent', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            Preserve original intent (recommended)
                        </span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.suggestAlternatives}
                            onChange={(e) => handleChange('suggestAlternatives', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            Suggest alternative prompts
                        </span>
                    </label>
                </div>

                {formData.suggestAlternatives && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Target Reduction (%)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.targetReduction}
                            onChange={(e) => handleChange('targetReduction', parseInt(e.target.value))}
                            className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={optimizeMutation.isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {optimizeMutation.isLoading ? (
                            <>
                                <LoadingSpinner size="small" className="mr-2" />
                                Optimizing...
                            </>
                        ) : (
                            'Optimize'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};