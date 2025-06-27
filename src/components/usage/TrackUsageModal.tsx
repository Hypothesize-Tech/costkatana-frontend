import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { calculateCost } from '@/utils/cost';
import { AxiosError } from 'axios';

interface TrackUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AI_SERVICES = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
    { value: 'aws-bedrock', label: 'AWS Bedrock' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'cohere', label: 'Cohere' },
];

const MODELS: Record<string, Array<{ value: string; label: string }>> = {
    openai: [
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-4-32k', label: 'GPT-4 32K' },
    ],
    anthropic: [
        { value: 'claude-3-opus', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
        { value: 'claude-2.1', label: 'Claude 2.1' },
    ],
    google: [
        { value: 'gemini-pro', label: 'Gemini Pro' },
        { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
        { value: 'palm-2', label: 'PaLM 2' },
    ],
    'aws-bedrock': [
        { value: 'claude-v2', label: 'Claude v2' },
        { value: 'claude-instant-v1', label: 'Claude Instant v1' },
        { value: 'titan-express', label: 'Titan Express' },
        { value: 'titan-lite', label: 'Titan Lite' },
    ],
    azure: [
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-35-turbo', label: 'GPT-3.5 Turbo' },
    ],
    cohere: [
        { value: 'command', label: 'Command' },
        { value: 'command-light', label: 'Command Light' },
    ],
};

const initialFormData = {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
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
};

export const TrackUsageModal: React.FC<TrackUsageModalProps> = ({
    isOpen,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();
    const [formData, setFormData] = useState(initialFormData);
    const [autoCalculate, setAutoCalculate] = useState(true);

    const trackUsageMutation = useMutation({
        mutationFn: usageService.trackUsage,
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
            const newProvider = value;
            const firstModel = MODELS[newProvider]?.[0]?.value || '';
            newFormData = { ...newFormData, model: firstModel };
        }

        if (autoCalculate && (field === 'prompt' || field === 'response' || field === 'provider' || field === 'model')) {
            const { provider, model, prompt, response } = newFormData;
            if (prompt || response) {
                try {
                    const usage = calculateCost(provider, model, prompt, response);
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
        setFormData(newFormData);
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
        if (!dataToSubmit.prompt) {
            showNotification('Please enter a prompt', 'error');
            return;
        }
        if (dataToSubmit.totalTokens === 0) {
            showNotification('Please enter token counts or enable auto-calculation', 'error');
            return;
        }
        trackUsageMutation.mutate(dataToSubmit);
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
                                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    {MODELS[formData.provider]?.map((model) => (
                                        <option key={model.value} value={model.value}>
                                            {model.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Prompt and Response */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Prompt
                            </label>
                            <textarea
                                value={formData.prompt}
                                onChange={(e) => handleChange('prompt', e.target.value)}
                                rows={3}
                                className="block mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Enter the prompt you sent to the AI..."
                                required
                            />
                        </div>

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
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="autoCalculate"
                                checked={autoCalculate}
                                onChange={(e) => setAutoCalculate(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="autoCalculate" className="ml-2 text-sm text-gray-700">
                                Auto-calculate tokens and cost
                            </label>
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