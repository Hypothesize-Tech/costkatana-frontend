import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UsageService } from '@/services/usage.service';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNotifications } from '@/contexts/NotificationContext';
import { calculateCost } from '@/utils/cost';
import { AxiosError } from 'axios';
import { OptimizationWidget } from '../optimization';

interface TrackUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
}

const AI_SERVICES = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
    { value: 'aws-bedrock', label: 'AWS Bedrock' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'mistral', label: 'Mistral AI' },
    { value: 'huggingface', label: 'Hugging Face' },
    { value: 'replicate', label: 'Replicate' },
    { value: 'together', label: 'Together AI' },
    { value: 'perplexity', label: 'Perplexity' },
];

const MODELS = {
    openai: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4-turbo-preview',
        'gpt-4-0125-preview',
        'gpt-4-1106-preview',
        'gpt-4-vision-preview',
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-32k',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-instruct',
        'gpt-3.5-turbo-16k',
        'text-davinci-003',
        'text-davinci-002',
        'code-davinci-002',
        'text-curie-001',
        'text-babbage-001',
        'text-ada-001'
    ],
    anthropic: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-3-5-sonnet-20240620',
        'claude-3-5-haiku-20241022',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
    ],
    google: [
        'gemini-pro',
        'gemini-pro-vision',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.0-pro',
        'gemini-1.0-pro-latest',
        'gemini-1.0-pro-vision-latest',
        'text-bison-001',
        'text-bison-002',
        'text-bison@001',
        'text-bison@002',
        'chat-bison-001',
        'chat-bison-002',
        'chat-bison@001',
        'chat-bison@002',
        'codechat-bison-001',
        'codechat-bison-002',
        'codechat-bison@001',
        'codechat-bison@002',
        'code-bison-001',
        'code-bison-002',
        'code-bison@001',
        'code-bison@002',
        'textembedding-gecko-001',
        'textembedding-gecko-002',
        'textembedding-gecko@001',
        'textembedding-gecko@002'
    ],
    'aws-bedrock': [
        // Anthropic Claude models
        'anthropic.claude-3-opus-20240229-v1:0',
        'anthropic.claude-3-sonnet-20240229-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0',
        'anthropic.claude-3-5-sonnet-20240620-v1:0',
        'anthropic.claude-v2:1',
        'anthropic.claude-v2',
        'anthropic.claude-instant-v1',
        // Amazon Titan models
        'amazon.titan-text-express-v1',
        'amazon.titan-text-lite-v1',
        'amazon.titan-text-premier-v1:0',
        'amazon.titan-embed-text-v1',
        'amazon.titan-embed-text-v2:0',
        'amazon.titan-embed-image-v1',
        'amazon.titan-image-generator-v1',
        'amazon.titan-image-generator-v2:0',
        // Cohere models
        'cohere.command-text-v14',
        'cohere.command-light-text-v14',
        'cohere.command-r-v1:0',
        'cohere.command-r-plus-v1:0',
        'cohere.embed-english-v3',
        'cohere.embed-multilingual-v3',
        // AI21 Labs models
        'ai21.j2-ultra-v1',
        'ai21.j2-mid-v1',
        'ai21.jamba-instruct-v1:0',
        // Meta Llama models
        'meta.llama2-13b-chat-v1',
        'meta.llama2-70b-chat-v1',
        'meta.llama3-8b-instruct-v1:0',
        'meta.llama3-70b-instruct-v1:0',
        'meta.llama3-1-8b-instruct-v1:0',
        'meta.llama3-1-70b-instruct-v1:0',
        'meta.llama3-1-405b-instruct-v1:0',
        // Mistral AI models
        'mistral.mistral-7b-instruct-v0:2',
        'mistral.mixtral-8x7b-instruct-v0:1',
        'mistral.mistral-large-2402-v1:0',
        'mistral.mistral-large-2407-v1:0',
        'mistral.mistral-small-2402-v1:0',
        // Stability AI models
        'stability.stable-diffusion-xl-v1',
        'stability.stable-diffusion-xl-v0',
        'stability.sd3-large-v1:0'
    ],
    azure: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4-turbo-preview',
        'gpt-4-0125-preview',
        'gpt-4-1106-preview',
        'gpt-4-vision-preview',
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-32k',
        'gpt-35-turbo',
        'gpt-35-turbo-16k',
        'gpt-35-turbo-instruct',
        'gpt-35-turbo-0125',
        'gpt-35-turbo-1106',
        'text-davinci-003',
        'text-davinci-002',
        'text-curie-001',
        'text-babbage-001',
        'text-ada-001',
        'text-embedding-ada-002',
        'text-embedding-3-small',
        'text-embedding-3-large'
    ],
    deepseek: [
        'deepseek-chat',
        'deepseek-coder',
        'deepseek-math',
        'deepseek-v2',
        'deepseek-v2.5',
        'deepseek-r1',
        'deepseek-r1-distill-qwen-1.5b',
        'deepseek-r1-distill-qwen-7b',
        'deepseek-r1-distill-qwen-14b',
        'deepseek-r1-distill-qwen-32b',
        'deepseek-r1-distill-llama-8b',
        'deepseek-r1-distill-llama-70b'
    ],
    cohere: [
        'command',
        'command-light',
        'command-nightly',
        'command-light-nightly',
        'command-r',
        'command-r-plus',
        'command-r-08-2024',
        'command-r-plus-08-2024',
        'c4ai-aya-23-8b',
        'c4ai-aya-23-35b',
        'embed-english-v3.0',
        'embed-multilingual-v3.0',
        'embed-english-light-v3.0',
        'embed-multilingual-light-v3.0'
    ],
    mistral: [
        'mistral-tiny',
        'mistral-small',
        'mistral-medium',
        'mistral-large',
        'mistral-large-latest',
        'mistral-small-latest',
        'mistral-7b-instruct',
        'mistral-8x7b-instruct',
        'mistral-8x22b-instruct',
        'codestral-latest',
        'codestral-22b-v0.1',
        'codestral-mamba-latest',
        'open-mistral-7b',
        'open-mixtral-8x7b',
        'open-mixtral-8x22b',
        'open-codestral-mamba'
    ],
    huggingface: [
        'microsoft/DialoGPT-medium',
        'microsoft/DialoGPT-large',
        'facebook/blenderbot-400M-distill',
        'facebook/blenderbot-1B-distill',
        'facebook/blenderbot-3B',
        'google/flan-t5-small',
        'google/flan-t5-base',
        'google/flan-t5-large',
        'google/flan-t5-xl',
        'google/flan-t5-xxl',
        'bigscience/bloom-560m',
        'bigscience/bloom-1b1',
        'bigscience/bloom-1b7',
        'bigscience/bloom-3b',
        'bigscience/bloom-7b1',
        'bigscience/bloomz-560m',
        'bigscience/bloomz-1b1',
        'bigscience/bloomz-1b7',
        'bigscience/bloomz-3b',
        'bigscience/bloomz-7b1',
        'EleutherAI/gpt-j-6b',
        'EleutherAI/gpt-neox-20b',
        'databricks/dolly-v2-3b',
        'databricks/dolly-v2-7b',
        'databricks/dolly-v2-12b',
        'tiiuae/falcon-7b',
        'tiiuae/falcon-7b-instruct',
        'tiiuae/falcon-40b',
        'tiiuae/falcon-40b-instruct',
        'mosaicml/mpt-7b',
        'mosaicml/mpt-7b-instruct',
        'mosaicml/mpt-7b-chat',
        'mosaicml/mpt-30b',
        'mosaicml/mpt-30b-instruct',
        'mosaicml/mpt-30b-chat'
    ],
    replicate: [
        'meta/llama-2-7b-chat',
        'meta/llama-2-13b-chat',
        'meta/llama-2-70b-chat',
        'meta/codellama-7b-instruct',
        'meta/codellama-13b-instruct',
        'meta/codellama-34b-instruct',
        'mistralai/mistral-7b-instruct-v0.1',
        'mistralai/mistral-7b-instruct-v0.2',
        'mistralai/mixtral-8x7b-instruct-v0.1',
        'togethercomputer/redpajama-incite-7b-chat',
        'togethercomputer/redpajama-incite-base-7b',
        'stability-ai/stable-diffusion',
        'stability-ai/stable-diffusion-xl',
        'stability-ai/sdxl',
        'runwayml/stable-diffusion-v1-5',
        'prompthero/openjourney',
        'cjwbw/waifu-diffusion',
        'lambdalabs/text-to-pokemon',
        'tencentarc/gfpgan',
        'xinntao/realesrgan',
        'nightmareai/real-esrgan',
        'sczhou/codeformer'
    ],
    together: [
        'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
        'togethercomputer/RedPajama-INCITE-7B-Chat',
        'togethercomputer/RedPajama-INCITE-Instruct-3B-v1',
        'togethercomputer/RedPajama-INCITE-7B-Instruct',
        'togethercomputer/RedPajama-INCITE-Base-3B-v1',
        'togethercomputer/RedPajama-INCITE-7B-Base',
        'togethercomputer/falcon-7b',
        'togethercomputer/falcon-7b-instruct',
        'togethercomputer/falcon-40b',
        'togethercomputer/falcon-40b-instruct',
        'togethercomputer/GPT-JT-6B-v1',
        'togethercomputer/GPT-JT-Moderation-6B',
        'togethercomputer/GPT-NeoXT-Chat-Base-20B',
        'NousResearch/Nous-Hermes-llama-2-7b',
        'NousResearch/Nous-Hermes-Llama2-13b',
        'NousResearch/Nous-Hermes-2-Yi-34B',
        'WizardLM/WizardLM-70B-V1.0',
        'garage-bAInd/Platypus2-70B-instruct',
        'Austism/chronos-hermes-13b',
        'lmsys/vicuna-7b-v1.5',
        'lmsys/vicuna-13b-v1.5',
        'Open-Orca/Mistral-7B-OpenOrca',
        'teknium/OpenHermes-2-Mistral-7B',
        'teknium/OpenHermes-2.5-Mistral-7B',
        'mistralai/Mistral-7B-Instruct-v0.1',
        'mistralai/Mistral-7B-Instruct-v0.2',
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'meta-llama/Llama-2-7b-chat-hf',
        'meta-llama/Llama-2-13b-chat-hf',
        'meta-llama/Llama-2-70b-chat-hf',
        'meta-llama/Llama-3-8b-chat-hf',
        'meta-llama/Llama-3-70b-chat-hf',
        'codellama/CodeLlama-7b-Instruct-hf',
        'codellama/CodeLlama-13b-Instruct-hf',
        'codellama/CodeLlama-34b-Instruct-hf'
    ],
    perplexity: [
        'llama-3.1-sonar-small-128k-online',
        'llama-3.1-sonar-small-128k-chat',
        'llama-3.1-sonar-large-128k-online',
        'llama-3.1-sonar-large-128k-chat',
        'llama-3.1-8b-instruct',
        'llama-3.1-70b-instruct',
        'mixtral-8x7b-instruct',
        'mistral-7b-instruct',
        'codellama-34b-instruct',
        'codellama-70b-instruct'
    ]
};



export const TrackUsageModal: React.FC<TrackUsageModalProps> = ({
    isOpen,
    onClose,
    projectId
}) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotifications();
    const [formData, setFormData] = useState({
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
        projectId: projectId && projectId !== 'all' ? projectId : undefined
    });
    const [autoCalculate, setAutoCalculate] = useState(true);
    const [showOptimizationWidget, setShowOptimizationWidget] = useState(false);

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
            const newProvider = value;
            const firstModel = MODELS[newProvider as keyof typeof MODELS]?.[0] || '';
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

        // Ensure projectId is included in the submission
        const submissionData = {
            ...dataToSubmit,
            projectId: projectId && projectId !== 'all' ? projectId : undefined
        };

        if (!dataToSubmit.prompt) {
            showNotification('Please enter a prompt', 'error');
            return;
        }
        if (dataToSubmit.totalTokens === 0) {
            showNotification('Please enter token counts or enable auto-calculation', 'error');
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
                                    {MODELS[formData.provider as keyof typeof MODELS]?.map((model) => (
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