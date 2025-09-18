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
        models: [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-4',
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-instruct',
            'text-davinci-003',
            'text-davinci-002',
            'text-curie-001',
            'text-babbage-001',
            'text-ada-001',
            'davinci-002',
            'babbage-002',
            'dall-e-3',
            'dall-e-2',
            'whisper-1',
            'tts-1',
            'tts-1-hd',
            'text-embedding-3-large',
            'text-embedding-3-small',
            'text-embedding-ada-002'
        ],
        description: 'Best for general-purpose applications',
        costMultiplier: 1.0,
    },
    'aws-bedrock': {
        name: 'AWS Bedrock',
        models: [
            'anthropic.claude-3-5-sonnet-20241022-v2:0',
            'anthropic.claude-3-5-sonnet-20240620-v1:0',
            'anthropic.claude-3-5-haiku-20241022-v1:0',
            'anthropic.claude-3-opus-20240229-v1:0',
            'anthropic.claude-3-sonnet-20240229-v1:0',
            'anthropic.claude-3-haiku-20240307-v1:0',
            'anthropic.claude-v2:1',
            'anthropic.claude-v2',
            'anthropic.claude-instant-v1',
            'amazon.titan-text-premier-v1:0',
            'amazon.titan-text-express-v1',
            'amazon.titan-text-lite-v1',
            'amazon.titan-embed-text-v1',
            'amazon.titan-embed-text-v2:0',
            'amazon.titan-image-generator-v1',
            'amazon.titan-image-generator-v2:0',
            'meta.llama3-2-1b-instruct-v1:0',
            'meta.llama3-2-3b-instruct-v1:0',
            'meta.llama3-2-11b-instruct-v1:0',
            'meta.llama3-2-90b-instruct-v1:0',
            'meta.llama3-1-8b-instruct-v1:0',
            'meta.llama3-1-70b-instruct-v1:0',
            'meta.llama3-1-405b-instruct-v1:0',
            'meta.llama2-13b-chat-v1',
            'meta.llama2-70b-chat-v1',
            'mistral.mistral-7b-instruct-v0:2',
            'mistral.mixtral-8x7b-instruct-v0:1',
            'mistral.mistral-large-2402-v1:0',
            'mistral.mistral-large-2407-v1:0',
            'mistral.mistral-small-2402-v1:0',
            'cohere.command-text-v14',
            'cohere.command-light-text-v14',
            'cohere.command-r-v1:0',
            'cohere.command-r-plus-v1:0',
            'cohere.embed-english-v3',
            'cohere.embed-multilingual-v3',
            'ai21.j2-mid-v1',
            'ai21.j2-ultra-v1',
            'ai21.jamba-instruct-v1:0',
            'stability.stable-diffusion-xl-v1',
            'stability.sd3-large-v1:0'
        ],
        description: 'Enterprise-grade with AWS integration',
        costMultiplier: 0.8,
    },
    'anthropic': {
        name: 'Anthropic',
        models: [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-sonnet-20240620',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0',
            'claude-instant-1.2'
        ],
        description: 'Advanced reasoning capabilities',
        costMultiplier: 1.2,
    },
    'google': {
        name: 'Google AI',
        models: [
            'gemini-2.0-flash-exp',
            'gemini-1.5-pro-002',
            'gemini-1.5-pro-001',
            'gemini-1.5-pro',
            'gemini-1.5-flash-002',
            'gemini-1.5-flash-001',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-pro',
            'gemini-pro-vision',
            'gemma-3n',
            'gemma-3',
            'gemma-2',
            'gemma',
            'shieldgemma-2',
            'paligemma',
            'codegemma',
            'txgemma',
            'medgemma',
            'medsiglip',
            't5gemma',
            'text-embedding-004',
            'multimodal-embeddings',
            'imagen-4-generation',
            'imagen-4-fast-generation',
            'imagen-4-ultra-generation',
            'imagen-3-generation',
            'imagen-3-editing-customization',
            'imagen-3-fast-generation',
            'imagen-captioning-vqa',
            'veo-2',
            'veo-3',
            'veo-3-fast',
            'virtual-try-on',
            'veo-3-preview',
            'veo-3-fast-preview',
            'gemini-1.0-pro',
            'gemini-1.0-pro-vision'
        ],
        description: 'Google\'s advanced AI models',
        costMultiplier: 0.9,
    },
    'cohere': {
        name: 'Cohere',
        models: [
            'command-a-03-2025',
            'command-r7b-12-2024',
            'command-a-reasoning-08-2025',
            'command-a-vision-07-2025',
            'command-r-plus-04-2024',
            'command-r-08-2024',
            'command-r-03-2024',
            'command',
            'command-nightly',
            'command-light',
            'command-light-nightly',
            'embed-english-v3.0',
            'embed-multilingual-v3.0',
            'embed-english-light-v3.0',
            'embed-multilingual-light-v3.0',
            'rerank-english-v3.0',
            'rerank-multilingual-v3.0'
        ],
        description: 'Specialized for enterprise applications',
        costMultiplier: 0.9,
    },
    'huggingface': {
        name: 'HuggingFace',
        models: [
            'meta-llama/Llama-2-7b-chat-hf',
            'meta-llama/Llama-2-13b-chat-hf',
            'meta-llama/Llama-2-70b-chat-hf',
            'meta-llama/Meta-Llama-3-8B-Instruct',
            'meta-llama/Meta-Llama-3-70B-Instruct',
            'microsoft/DialoGPT-medium',
            'microsoft/DialoGPT-large',
            'google/flan-t5-base',
            'google/flan-t5-large',
            'google/flan-t5-xl',
            'google/flan-t5-xxl',
            'bigscience/bloom-560m',
            'bigscience/bloom-1b1',
            'bigscience/bloom-3b',
            'bigscience/bloom-7b1',
            'EleutherAI/gpt-j-6b',
            'EleutherAI/gpt-neox-20b'
        ],
        description: 'Open source models',
        costMultiplier: 0.3,
    },
    'ollama': {
        name: 'Ollama',
        models: [
            'llama2',
            'llama2:7b',
            'llama2:13b',
            'llama2:70b',
            'llama3',
            'llama3:8b',
            'llama3:70b',
            'codellama',
            'codellama:7b',
            'codellama:13b',
            'codellama:34b',
            'mistral',
            'mistral:7b',
            'mixtral',
            'mixtral:8x7b',
            'gemma',
            'gemma:2b',
            'gemma:7b',
            'phi',
            'phi3',
            'qwen',
            'qwen:4b',
            'qwen:7b',
            'qwen:14b',
            'deepseek-coder',
            'deepseek-coder:6.7b',
            'deepseek-coder:33b',
            'vicuna',
            'orca-mini'
        ],
        description: 'Local models via Ollama',
        costMultiplier: 0.0,
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

        try {
            const estimate = await trainingService.fineTune.estimateCost(
                formData.provider,
                formData.baseModel,
                formData.datasetId
            );
            setCostEstimate(estimate);
        } catch (error) {
            console.error('Failed to estimate cost:', error);
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-primary-200/30 backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel">
                {/* Header */}
                <div className="glass flex items-center justify-between p-8 border-b border-primary-200/30 backdrop-blur-xl rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                            <CogIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-display font-bold gradient-text-secondary">
                            Create Fine-Tune Job
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon-secondary"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Dataset Info */}
                    {dataset && (
                        <div className="glass rounded-xl p-6 border border-highlight-200/30 shadow-lg backdrop-blur-xl">
                            <h3 className="font-display font-bold gradient-text-highlight mb-4">Dataset: {dataset.name} v{dataset.version}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-medium gradient-text-secondary">Items:</span>
                                    <span className="badge-primary">{dataset.items.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-medium gradient-text-secondary">Target:</span>
                                    <span className="font-mono text-light-text-primary dark:text-dark-text-primary text-xs">{dataset.targetModel}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-medium gradient-text-secondary">Use Case:</span>
                                    <span className="badge-secondary">{dataset.targetUseCase}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-medium gradient-text-secondary">PII Items:</span>
                                    <span className={`badge-${dataset.stats.piiStats.totalWithPII > 0 ? 'danger' : 'success'}`}>
                                        {dataset.stats.piiStats.totalWithPII}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm">ℹ️</span>
                            </div>
                            <h3 className="text-xl font-display font-bold gradient-text-primary">Basic Information</h3>
                        </div>

                        <div>
                            <label className="form-label">
                                Job Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Provider and Model Selection */}
                    <div className="glass rounded-xl p-6 border border-success-200/30 shadow-lg backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-success flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm">🤖</span>
                            </div>
                            <h3 className="text-xl font-display font-bold gradient-text-success">Provider & Model</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">
                                    Provider *
                                </label>
                                <select
                                    value={formData.provider}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        provider: e.target.value as any,
                                        baseModel: '' // Reset model selection
                                    }))}
                                    className="select"
                                    required
                                >
                                    {Object.entries(PROVIDERS).map(([key, provider]) => (
                                        <option key={key} value={key}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">{selectedProvider?.description}</p>
                            </div>

                            <div>
                                <label className="form-label">
                                    Base Model *
                                </label>
                                <select
                                    value={formData.baseModel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, baseModel: e.target.value }))}
                                    className="select"
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
                        <div className="glass rounded-xl p-6 border border-accent-200/30 shadow-lg backdrop-blur-xl">
                            <h4 className="font-display font-bold gradient-text-accent mb-4">Cost Estimate</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-body text-accent-700 dark:text-accent-300 mb-1">Est. Cost</div>
                                    <div className="text-lg font-display font-bold gradient-text-accent">
                                        ${costEstimate.estimatedCost.toFixed(3)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-body text-accent-700 dark:text-accent-300 mb-1">Duration</div>
                                    <div className="text-lg font-display font-bold gradient-text-accent">
                                        {Math.round(costEstimate.estimatedDuration / 60)}min
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-body text-accent-700 dark:text-accent-300 mb-1">Items</div>
                                    <div className="text-lg font-display font-bold gradient-text-accent">
                                        {costEstimate.itemCount}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-body text-accent-700 dark:text-accent-300 mb-1">Tokens</div>
                                    <div className="text-lg font-display font-bold gradient-text-accent">
                                        {costEstimate.totalTokens.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            {costEstimate.recommendations.length > 0 && (
                                <div className="mt-4 p-3 glass rounded-lg border border-highlight-200/30">
                                    <div className="flex items-center gap-2 text-sm gradient-text-highlight mb-2">
                                        <InformationCircleIcon className="h-4 w-4" />
                                        <span className="font-display font-medium">Recommendations:</span>
                                    </div>
                                    <ul className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary space-y-1">
                                        {costEstimate.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-highlight-500 mt-0.5">•</span>
                                                <span>{rec}</span>
                                            </li>
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
                            className="btn-secondary text-sm inline-flex items-center gap-2"
                        >
                            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
                        </button>
                    </div>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                        <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm">⚙️</span>
                                </div>
                                <h3 className="text-xl font-display font-bold gradient-text-secondary">Hyperparameters</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="form-label">
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
                                        className="input"
                                    />
                                    <p className="mt-2 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">Number of training passes</p>
                                </div>

                                <div>
                                    <label className="form-label">
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
                                        className="input"
                                    />
                                    <p className="mt-2 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">How fast the model learns</p>
                                </div>

                                <div>
                                    <label className="form-label">
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
                                        className="select"
                                    >
                                        <option value={8}>8</option>
                                        <option value={16}>16</option>
                                        <option value={32}>32</option>
                                        <option value={64}>64</option>
                                    </select>
                                    <p className="mt-2 text-xs font-body text-light-text-tertiary dark:text-dark-text-tertiary">Examples processed at once</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="glass rounded-xl p-6 border border-indigo-200/30 shadow-lg backdrop-blur-xl">
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || !formData.name || !formData.provider || !formData.baseModel}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Creating Job...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-white text-sm">🚀</span>
                                        Start Fine-Tuning
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
