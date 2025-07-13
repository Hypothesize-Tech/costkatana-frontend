import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UsageService } from '@/services/usage.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { calculateCost, getProviders, getModelsForProvider, estimateTokens } from '@/utils/cost';
import { AxiosError } from 'axios';
import { OptimizationWidget } from '../optimization';

interface TrackUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
}

// Get AI services from pricing data
const getAIServices = () => {
    return getProviders().map(provider => ({
        value: provider.toLowerCase().replace(/\s+/g, '-'),
        label: provider
    }));
};

// Get models for a specific provider from pricing data
const getModelsForService = (provider: string) => {
    const normalizedProvider = provider.replace(/-/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return getModelsForProvider(normalizedProvider).map(model => model.model);
};

const calculateUsageFromText = (provider: string, model: string, prompt: string, response: string) => {
    const normalizedProvider = provider.replace(/-/g, ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    const inputTokens = estimateTokens(prompt, normalizedProvider);
    const outputTokens = estimateTokens(response, normalizedProvider);
    const totalTokens = inputTokens + outputTokens;
    const totalCost = calculateCost(inputTokens, outputTokens, normalizedProvider, model);

    return {
        inputTokens,
        outputTokens,
        totalTokens,
        totalCost
    };
};

export const TrackUsageModal: React.FC<TrackUsageModalProps> = ({
    isOpen,
    onClose,
    projectId
}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();

    // Get initial services and models from pricing data
    const aiServices = getAIServices();
    const defaultService = aiServices[0]?.value || 'openai';
    const defaultModels = getModelsForService(defaultService);

    const [formData, setFormData] = useState({
        provider: defaultService,
        model: defaultModels[0] || '',
        prompt: '',
        response: '',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        responseTime: 0,
        metadata: {
            project: '',
            tags: '',
        },
        projectId: projectId && projectId !== 'all' ? projectId : undefined
    });
    const [autoCalculate, setAutoCalculate] = useState(true);
    const [showOptimizationWidget, setShowOptimizationWidget] = useState(false);

    // Function to manually trigger calculation
    const triggerCalculation = () => {
        if (formData.prompt || formData.response) {
            try {
                const usage = calculateUsageFromText(formData.provider, formData.model, formData.prompt, formData.response);
                setFormData(prev => ({
                    ...prev,
                    promptTokens: usage.inputTokens,
                    completionTokens: usage.outputTokens,
                    totalTokens: usage.totalTokens,
                    estimatedCost: usage.totalCost,
                }));
                showNotification('Tokens and cost calculated successfully', 'success');
            } catch (error) {
                console.error('Failed to calculate cost:', error);
                showNotification('Failed to calculate tokens and cost', 'error');
            }
        } else {
            showNotification('Please enter prompt text first', 'error');
        }
    };

    // Update form data when projectId changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            projectId: projectId && projectId !== 'all' ? projectId : undefined
        }));
    }, [projectId]);

    const trackUsageMutation = useMutation({
        mutationFn: (data: any) => UsageService.trackUsage(data),
        onSuccess: () => {
            showNotification('Usage tracked successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['usage'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            showNotification(
                error.response?.data?.message || 'Failed to track usage',
                'error'
            );
        },
    });

    const handleChange = (field: string, value: string | number) => {
        let newFormData = { ...formData, [field]: value };

        if (field === 'provider') {
            const newProvider = value as string;
            const newModels = getModelsForService(newProvider);
            const firstModel = newModels[0] || '';
            newFormData = { ...newFormData, model: firstModel };
        }

        if (autoCalculate && (field === 'prompt' || field === 'response' || field === 'provider' || field === 'model')) {
            const { provider, model, prompt, response } = newFormData;
            if (prompt || response) {
                try {
                    const usage = calculateUsageFromText(provider, model, prompt, response);
                    newFormData = {
                        ...newFormData,
                        promptTokens: usage.inputTokens,
                        completionTokens: usage.outputTokens,
                        totalTokens: usage.totalTokens,
                        estimatedCost: usage.totalCost,
                    };
                } catch (error) {
                    console.error('Failed to calculate cost:', error);
                }
            }
        }

        // Update totalTokens when promptTokens or completionTokens change
        if (field === 'promptTokens' || field === 'completionTokens') {
            const promptTokens = field === 'promptTokens' ? (value as number) : newFormData.promptTokens;
            const completionTokens = field === 'completionTokens' ? (value as number) : newFormData.completionTokens;
            newFormData = {
                ...newFormData,
                totalTokens: promptTokens + completionTokens,
            };
        }

        setFormData(newFormData);
    };

    const handleOptimizationApply = (optimizedPrompt: string, _optimization: any) => {
        setFormData({ ...formData, prompt: optimizedPrompt });
        setShowOptimizationWidget(false);
        showNotification('Prompt optimized successfully', 'success');
    };

    const handleMetadataChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            metadata: { ...prev.metadata, [field]: value },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { response, ...dataToSubmit } = formData;

        // Normalize provider name for submission
        const normalizedProvider = formData.provider.replace(/-/g, ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        // Ensure projectId is included in the submission
        let submissionData = {
            ...dataToSubmit,
            provider: normalizedProvider,
            projectId: projectId && projectId !== 'all' ? projectId : undefined
        };

        if (!dataToSubmit.prompt) {
            showNotification('Please enter a prompt', 'error');
            return;
        }

        // If auto-calculate is enabled and we have prompt/response text but no tokens, calculate them now
        if (autoCalculate && dataToSubmit.totalTokens === 0 && dataToSubmit.prompt) {
            try {
                const usage = calculateUsageFromText(dataToSubmit.provider, dataToSubmit.model, dataToSubmit.prompt, formData.response || '');
                submissionData = {
                    ...submissionData,
                    promptTokens: usage.inputTokens,
                    completionTokens: usage.outputTokens,
                    totalTokens: usage.totalTokens,
                    estimatedCost: usage.totalCost,
                };
            } catch (error) {
                console.error('Failed to calculate cost during submission:', error);
            }
        }

        // Check if we still have no tokens after calculation attempt
        if (submissionData.totalTokens === 0 && (!autoCalculate || !submissionData.prompt)) {
            showNotification('Please enter token counts or enable auto-calculation with valid prompt text', 'error');
            return;
        }

        trackUsageMutation.mutate(submissionData);
    };

    if (!isOpen) return null;

    return (
        <div className="overflow-y-auto fixed inset-0 z-50">
            <div className="flex justify-center items-center p-4 min-h-screen">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 px-6 py-4 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Track API Usage</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Service and Model Selection */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    AI Service
                                </label>
                                <select
                                    value={formData.provider}
                                    onChange={(e) => handleChange('provider', e.target.value)}
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    {aiServices.map((service) => (
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
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    {getModelsForService(formData.provider).map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Prompt and Response */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Prompt
                                </label>
                                {formData.prompt && (
                                    <button
                                        type="button"
                                        onClick={() => setShowOptimizationWidget(!showOptimizationWidget)}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        {showOptimizationWidget ? 'Hide' : 'Optimize'} Prompt
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={formData.prompt}
                                onChange={(e) => handleChange('prompt', e.target.value)}
                                rows={3}
                                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter the prompt you sent to the AI..."
                                required
                            />
                        </div>

                        {/* Optimization Widget */}
                        {showOptimizationWidget && formData.prompt && (
                            <div className="p-4 mt-4 bg-gray-50 rounded-lg">
                                <OptimizationWidget
                                    prompt={formData.prompt}
                                    model={formData.model}
                                    service={formData.provider}
                                    onApplyOptimization={handleOptimizationApply}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Response (Optional)
                            </label>
                            <textarea
                                value={formData.response}
                                onChange={(e) => handleChange('response', e.target.value)}
                                rows={3}
                                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter the AI's response..."
                            />
                        </div>

                        {/* Auto-calculate Toggle */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="autoCalculate"
                                    checked={autoCalculate}
                                    onChange={(e) => {
                                        setAutoCalculate(e.target.checked);
                                        // If turning on auto-calculate, trigger calculation immediately
                                        if (e.target.checked && (formData.prompt || formData.response)) {
                                            setTimeout(triggerCalculation, 100);
                                        }
                                    }}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="autoCalculate" className="ml-2 text-sm text-gray-700">
                                    Auto-calculate tokens and cost
                                </label>
                            </div>
                            {!autoCalculate && (
                                <button
                                    type="button"
                                    onClick={triggerCalculation}
                                    className="px-3 py-1 text-sm text-indigo-600 rounded-md border border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Calculate Now
                                </button>
                            )}
                        </div>

                        {/* Token Counts */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Prompt Tokens
                                </label>
                                <input
                                    type="number"
                                    value={formData.promptTokens}
                                    onChange={(e) =>
                                        handleChange('promptTokens', parseInt(e.target.value) || 0)
                                    }
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={autoCalculate}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Completion Tokens
                                </label>
                                <input
                                    type="number"
                                    value={formData.completionTokens}
                                    onChange={(e) =>
                                        handleChange(
                                            'completionTokens',
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={autoCalculate}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Total Tokens
                                </label>
                                <input
                                    type="number"
                                    value={formData.totalTokens}
                                    className="block mt-1 w-full bg-gray-50 rounded-md border-gray-300 shadow-sm sm:text-sm"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.estimatedCost}
                                    onChange={(e) =>
                                        handleChange(
                                            'estimatedCost',
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    step="0.0001"
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    disabled={autoCalculate}
                                    required
                                />
                            </div>
                        </div>

                        {/* Response Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Response Time (ms)
                            </label>
                            <input
                                type="number"
                                value={formData.responseTime}
                                onChange={(e) =>
                                    handleChange('responseTime', parseInt(e.target.value) || 0)
                                }
                                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Optional: Time taken for the API call"
                            />
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Project (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.metadata.project}
                                    onChange={(e) => handleMetadataChange('project', e.target.value)}
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="e.g., Customer Support Bot"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tags (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.metadata.tags}
                                    onChange={(e) => handleMetadataChange('tags', e.target.value)}
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="e.g., support, production"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={trackUsageMutation.isLoading}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {trackUsageMutation.isLoading ? (
                                    <>
                                        <LoadingSpinner size="small" className="mr-2" />
                                        Tracking...
                                    </>
                                ) : (
                                    'Track Usage'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};