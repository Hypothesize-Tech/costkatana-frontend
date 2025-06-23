// src/components/usage/TrackUsageModal.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usageService } from '@/services/usage.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '@/contexts/NotificationContext';
// import { calculateCost } from '@/utils/cost-calculator';

// This is a placeholder for the cost calculation logic.
// In production, import the real calculateCost from '@/utils/cost-calculator' and remove this stub.
interface CostCalculationResult {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCost: number;
}

export const calculateCost = (
    service: string,
    model: string,
    input: string,  
    output: string
): CostCalculationResult => {
    console.log(service, model, input, output);
    // TODO: Replace with actual cost calculation logic.
    // This stub returns zeroed values for now.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
    };
};
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

export const TrackUsageModal: React.FC<TrackUsageModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [formData, setFormData] = useState({
        service: 'openai',
        model: 'gpt-4',
        prompt: '',
        response: '',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        responseTime: 0,
        metadata: {
            project: '',
            tags: '',
        },
    });

    const [autoCalculate, setAutoCalculate] = useState(true);
    const { showNotification } = useNotifications();
    const queryClient = useQueryClient();

    const trackMutation = useMutation(
        (data: typeof formData) => usageService.trackUsage(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('usage');
                queryClient.invalidateQueries('dashboard');
                showNotification('Usage tracked successfully!', 'success');
                onClose();
                resetForm();
            },
            onError: (error: any) => {
                showNotification(
                    error.response?.data?.message || 'Failed to track usage',
                    'error'
                );
            },
        }
    );

    const resetForm = () => {
        setFormData({
            service: 'openai',
            model: 'gpt-4',
            prompt: '',
            response: '',
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0,
            responseTime: 0,
            metadata: {
                project: '',
                tags: '',
            },
        });
    };

    const handleChange = (field: string, value: any) => {
        if (field === 'service') {
            // Reset model when service changes
            const newService = value;
            const firstModel = MODELS[newService]?.[0]?.value || '';
            setFormData({
                ...formData,
                service: newService,
                model: firstModel,
            });
        } else {
            setFormData({ ...formData, [field]: value });
        }

        // Auto-calculate tokens and cost if enabled
        if (autoCalculate && (field === 'prompt' || field === 'response')) {
            const updatedData = { ...formData, [field]: value };
            if (updatedData.prompt || updatedData.response) {
                try {
                    const usage = calculateCost(updatedData.service, updatedData.model, updatedData.prompt, updatedData.response);

                    setFormData({
                        ...updatedData,
                        promptTokens: usage.inputTokens,
                        completionTokens: usage.outputTokens,
                        totalTokens: usage.totalTokens,
                        cost: usage.totalCost,
                    });
                } catch (error) {
                    console.error('Failed to calculate cost:', error);
                }
            }
        }
    };

    const handleMetadataChange = (field: string, value: string) => {
        setFormData({
            ...formData,
            metadata: {
                ...formData.metadata,
                [field]: value,
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.prompt) {
            showNotification('Please enter a prompt', 'error');
            return;
        }

        if (formData.totalTokens === 0) {
            showNotification('Please enter token counts or enable auto-calculation', 'error');
            return;
        }

        trackMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Track API Usage</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Service and Model Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    AI Service
                                </label>
                                <select
                                    value={formData.service}
                                    onChange={(e) => handleChange('service', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    {MODELS[formData.service]?.map((model) => (
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="autoCalculate" className="ml-2 text-sm text-gray-700">
                                Auto-calculate tokens and cost
                            </label>
                        </div>

                        {/* Token Counts */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Prompt Tokens
                                </label>
                                <input
                                    type="number"
                                    value={formData.promptTokens}
                                    onChange={(e) => handleChange('promptTokens', parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                    onChange={(e) => handleChange('completionTokens', parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
                                    step="0.0001"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                onChange={(e) => handleChange('responseTime', parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Optional: Time taken for the API call"
                            />
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Project (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.metadata.project}
                                    onChange={(e) => handleMetadataChange('project', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="e.g., support, production"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={trackMutation.isLoading}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {trackMutation.isLoading ? (
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