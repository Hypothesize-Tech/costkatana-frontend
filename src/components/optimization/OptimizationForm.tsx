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
        // Meta Llama models
        'meta.llama2-13b-chat-v1',
        'meta.llama2-70b-chat-v1',
        'meta.llama3-8b-instruct-v1:0',
        'meta.llama3-70b-instruct-v1:0',
        'meta.llama3-1-8b-instruct-v1:0',
        'meta.llama3-1-70b-instruct-v1:0',
        'meta.llama3-1-405b-instruct-v1:0',
        // AI21 Labs models
        'ai21.j2-ultra-v1',
        'ai21.j2-mid-v1',
        'ai21.jamba-instruct-v1:0',
        // Mistral AI models
        'mistral.mistral-7b-instruct-v0:2',
        'mistral.mixtral-8x7b-instruct-v0:1',
        'mistral.mistral-large-2402-v1:0',
        'mistral.mistral-large-2407-v1:0',
        'mistral.mistral-small-2402-v1:0',
        // Stability AI models
        'stability.stable-diffusion-xl-v1',
        'stability.stable-diffusion-xl-v0',
        'stability.sd3-large-v1:0',
        'stability.stable-image-ultra-v1:0',
        'stability.stable-image-core-v1:0'
    ],
    azure: [
        'gpt-4',
        'gpt-4-32k',
        'gpt-4-turbo',
        'gpt-4-turbo-2024-04-09',
        'gpt-4-vision-preview',
        'gpt-4o',
        'gpt-4o-mini',
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
        'open-mistral-7b',
        'open-mixtral-8x7b',
        'open-mixtral-8x22b',
        'mistral-7b-instruct',
        'mixtral-8x7b-instruct',
        'mixtral-8x22b-instruct',
        'codestral-latest',
        'codestral-2405',
        'codestral-mamba-latest',
        'mistral-embed'
    ],
    huggingface: [
        // Meta Llama models
        'meta-llama/Llama-2-7b-chat-hf',
        'meta-llama/Llama-2-13b-chat-hf',
        'meta-llama/Llama-2-70b-chat-hf',
        'meta-llama/Meta-Llama-3-8B-Instruct',
        'meta-llama/Meta-Llama-3-70B-Instruct',
        'meta-llama/Meta-Llama-3.1-8B-Instruct',
        'meta-llama/Meta-Llama-3.1-70B-Instruct',
        'meta-llama/Meta-Llama-3.1-405B-Instruct',
        // Microsoft models
        'microsoft/DialoGPT-medium',
        'microsoft/DialoGPT-large',
        'microsoft/phi-2',
        'microsoft/Phi-3-mini-4k-instruct',
        'microsoft/Phi-3-small-8k-instruct',
        'microsoft/Phi-3-medium-4k-instruct',
        // Facebook/Meta models
        'facebook/blenderbot-400M-distill',
        'facebook/blenderbot-1B-distill',
        'facebook/blenderbot-3B',
        'facebook/opt-1.3b',
        'facebook/opt-2.7b',
        'facebook/opt-6.7b',
        'facebook/opt-13b',
        'facebook/opt-30b',
        // Google models
        'google/flan-t5-small',
        'google/flan-t5-base',
        'google/flan-t5-large',
        'google/flan-t5-xl',
        'google/flan-t5-xxl',
        'google/flan-ul2',
        'google/gemma-2b',
        'google/gemma-7b',
        'google/gemma-2b-it',
        'google/gemma-7b-it',
        // Mistral models
        'mistralai/Mistral-7B-v0.1',
        'mistralai/Mistral-7B-Instruct-v0.1',
        'mistralai/Mistral-7B-Instruct-v0.2',
        'mistralai/Mixtral-8x7B-v0.1',
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'mistralai/Mixtral-8x22B-v0.1',
        'mistralai/Mixtral-8x22B-Instruct-v0.1',
        // Other popular models
        'bigscience/bloom-560m',
        'bigscience/bloom-1b1',
        'bigscience/bloom-3b',
        'bigscience/bloom-7b1',
        'bigscience/bloomz-560m',
        'bigscience/bloomz-1b1',
        'bigscience/bloomz-3b',
        'bigscience/bloomz-7b1',
        'EleutherAI/gpt-j-6b',
        'EleutherAI/gpt-neox-20b',
        'databricks/dolly-v2-3b',
        'databricks/dolly-v2-7b',
        'databricks/dolly-v2-12b',
        'tiiuae/falcon-7b',
        'tiiuae/falcon-40b',
        'tiiuae/falcon-7b-instruct',
        'tiiuae/falcon-40b-instruct'
    ],
    replicate: [
        // Meta Llama models
        'meta/llama-2-7b-chat',
        'meta/llama-2-13b-chat',
        'meta/llama-2-70b-chat',
        'meta/meta-llama-3-8b-instruct',
        'meta/meta-llama-3-70b-instruct',
        'meta/meta-llama-3.1-8b-instruct',
        'meta/meta-llama-3.1-70b-instruct',
        'meta/meta-llama-3.1-405b-instruct',
        // Mistral models
        'mistralai/mistral-7b-instruct-v0.1',
        'mistralai/mistral-7b-instruct-v0.2',
        'mistralai/mixtral-8x7b-instruct-v0.1',
        'mistralai/mixtral-8x22b-instruct-v0.1',
        // Other models
        'togethercomputer/RedPajama-INCITE-7B-Chat',
        'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
        'replicate/flan-t5-xl',
        'replicate/vicuna-13b',
        'stability-ai/stable-diffusion',
        'stability-ai/sdxl',
        'anthropic/claude-2',
        'anthropic/claude-instant-1',
        'google/flan-t5-xxl',
        'huggingface/CodeBERTa-small-v1',
        'salesforce/blip',
        'salesforce/instructblip-vicuna-7b',
        'microsoft/git-large-coco'
    ],
    together: [
        // Meta Llama models
        'meta-llama/Llama-2-7b-chat-hf',
        'meta-llama/Llama-2-13b-chat-hf',
        'meta-llama/Llama-2-70b-chat-hf',
        'meta-llama/Meta-Llama-3-8B-Instruct',
        'meta-llama/Meta-Llama-3-70B-Instruct',
        'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
        // Mistral models
        'mistralai/Mistral-7B-Instruct-v0.1',
        'mistralai/Mistral-7B-Instruct-v0.2',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'mistralai/Mixtral-8x22B-Instruct-v0.1',
        // Nous Research models
        'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
        'NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT',
        'NousResearch/Nous-Hermes-Llama2-13b',
        'NousResearch/Nous-Hermes-llama-2-7b',
        // Other models
        'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
        'togethercomputer/RedPajama-INCITE-7B-Chat',
        'togethercomputer/Llama-2-7B-32K-Instruct',
        'teknium/OpenHermes-2-Mistral-7B',
        'teknium/OpenHermes-2.5-Mistral-7B',
        'Qwen/Qwen1.5-0.5B-Chat',
        'Qwen/Qwen1.5-1.8B-Chat',
        'Qwen/Qwen1.5-4B-Chat',
        'Qwen/Qwen1.5-7B-Chat',
        'Qwen/Qwen1.5-14B-Chat',
        'Qwen/Qwen1.5-32B-Chat',
        'Qwen/Qwen1.5-72B-Chat',
        'Qwen/Qwen1.5-110B-Chat',
        'zero-one-ai/Yi-34B-Chat',
        'zero-one-ai/Yi-6B-Chat',
        'upstage/SOLAR-10.7B-Instruct-v1.0',
        'garage-bAInd/Platypus2-70B-instruct',
        'cognitivecomputations/dolphin-2.5-mixtral-8x7b'
    ],
    perplexity: [
        'llama-3-sonar-small-32k-chat',
        'llama-3-sonar-small-32k-online',
        'llama-3-sonar-large-32k-chat',
        'llama-3-sonar-large-32k-online',
        'llama-3.1-sonar-small-128k-chat',
        'llama-3.1-sonar-small-128k-online',
        'llama-3.1-sonar-large-128k-chat',
        'llama-3.1-sonar-large-128k-online',
        'llama-3.1-sonar-huge-128k-online',
        'llama-3-8b-instruct',
        'llama-3-70b-instruct',
        'llama-3.1-8b-instruct',
        'llama-3.1-70b-instruct',
        'mixtral-8x7b-instruct',
        'mixtral-8x22b-instruct'
    ],
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
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Optimize Prompt</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            AI Service
                        </label>
                        <select
                            value={formData.service}
                            onChange={(e) => {
                                const newService = e.target.value;
                                const newModel = MODELS[newService as keyof typeof MODELS][0];
                                setFormData(currentData => ({
                                    ...currentData,
                                    service: newService,
                                    model: newModel,
                                }));
                            }}
                            className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            className="block py-2 pr-10 pl-3 mt-1 w-full text-base rounded-md border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        className="block px-3 py-2 mt-1 w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Provide additional context about the prompt's purpose..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.preserveIntent}
                            onChange={(e) => handleChange('preserveIntent', e.target.checked)}
                            className="text-indigo-600 rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                            className="text-indigo-600 rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
                            className="block px-3 py-2 mt-1 w-32 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                )}

                <div className="flex justify-end pt-4 space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={optimizeMutation.isLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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