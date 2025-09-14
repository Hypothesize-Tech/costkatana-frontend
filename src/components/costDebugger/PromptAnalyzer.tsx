import React, { useState, useEffect } from 'react';
import { AIProvider, PromptAnalysis, DeadWeightAnalysis } from '../../types';

interface PromptAnalyzerProps {
    onAnalyze: (promptData: {
        prompt: string;
        provider: AIProvider;
        model: string;
        systemMessage?: string;
        conversationHistory?: Array<{ role: string; content: string }>;
        toolCalls?: Array<{ name: string; arguments: string }>;
        metadata?: Record<string, any>;
    }) => void;
    analysis: PromptAnalysis | null;
    deadWeight: DeadWeightAnalysis | null;
    isAnalyzing: boolean;
}

const PROVIDER_MODELS: Record<AIProvider, string[]> = {
    [AIProvider.OpenAI]: [
        // GPT-5 Models (Latest)
        'gpt-5',
        'gpt-5-mini',
        'gpt-5-nano',
        'gpt-5-chat-latest',
        // GPT-4.1 Series (Latest)
        'gpt-4.1-2025-04-14',
        'gpt-4.1-mini-2025-04-14',
        'gpt-4.1-nano-2025-04-14',
        'gpt-4.5-preview-2025-02-27',
        // GPT-4o Series
        'gpt-4o-2024-08-06',
        'gpt-4o-audio-preview-2024-12-17',
        'gpt-4o-realtime-preview-2025-06-03',
        'gpt-4o-mini-2024-07-18',
        'gpt-4o-mini-audio-preview-2024-12-17',
        'gpt-4o-mini-realtime-preview-2024-12-17',
        // O-Series (Reasoning)
        'o1-2024-12-17',
        'o1-pro-2025-03-19',
        'o3-pro-2025-06-10',
        'o3-2025-04-16',
        'o3-deep-research-2025-06-26',
        'o4-mini-2025-04-16',
        'o4-mini-deep-research-2025-06-26',
        'o3-mini-2025-01-31',
        'o1-mini-2024-09-12',
        // Specialized Models
        'codex-mini-latest',
        'gpt-4o-mini-search-preview-2025-03-11',
        'gpt-4o-search-preview-2025-03-11',
        'computer-use-preview-2025-03-11',
        // Embeddings
        'text-embedding-3-small',
        'text-embedding-3-large',
        'text-embedding-ada-002',
        // GPT-3.5 Series
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-instruct'
    ],
    [AIProvider.Anthropic]: [
        // Claude 4 Series (Latest)
        'claude-opus-4-1-20250805',
        'claude-opus-4-20250514',
        'claude-sonnet-4-20250514',
        // Claude 3.7 Series
        'claude-3-7-sonnet-20250219',
        // Claude 3.5 Series
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        // Claude 3 Series
        'claude-3-haiku-20240307'
    ],
    [AIProvider.AWSBedrock]: [
        // AI21 Labs
        'ai21.jamba-1-5-large-v1:0',
        'ai21.jamba-1-5-mini-v1:0',
        'ai21.jamba-instruct-v1:0',
        // Amazon Nova Models
        'amazon.nova-micro-v1:0',
        'amazon.nova-lite-v1:0',
        'amazon.nova-pro-v1:0',
        'amazon.nova-premier-v1:0',
        'amazon.nova-canvas-v1:0',
        'amazon.nova-reel-v1:0',
        'amazon.nova-sonic-v1:0',
        // Amazon Titan Models
        'amazon.titan-text-express-v1',
        'amazon.titan-text-lite-v1',
        'amazon.titan-embed-text-v2:0',
        // Anthropic on Bedrock
        'anthropic.claude-opus-4-1-20250805-v1:0',
        'anthropic.claude-opus-4-20250514-v1:0',
        'anthropic.claude-sonnet-4-20250514-v1:0',
        'anthropic.claude-3-7-sonnet-20250219-v1:0',
        'anthropic.claude-3-5-sonnet-20241022-v1:0',
        'anthropic.claude-3-5-haiku-20241022-v1:0',
        'anthropic.claude-3-opus-20240229-v1:0',
        'anthropic.claude-3-sonnet-20240229-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0',
        // Meta Llama Models
        'meta.llama3-70b-instruct-v1:0',
        'meta.llama3-8b-instruct-v1:0',
        'meta.llama3-2-11b-instruct-v1:0',
        'meta.llama3-2-90b-instruct-v1:0',
        'meta.llama4-scout-17b-instruct-v1:0',
        'meta.llama4-maverick-17b-instruct-v1:0',
        // Mistral AI on Bedrock
        'mistral.mistral-7b-instruct-v0:2',
        'mistral.mixtral-8x7b-instruct-v0:1',
        'mistral.mistral-large-2402-v1:0',
        'mistral.mistral-small-2402-v1:0',
        'mistral.pixtral-large-2502-v1:0',
        // Cohere on Bedrock
        'cohere.command-r-plus-v1:0',
        'cohere.command-r-v1:0',
        'cohere.embed-english-v3',
        'cohere.embed-multilingual-v3',
        // DeepSeek Models
        'deepseek.r1-v1:0',
        // Stability AI on Bedrock
        'stability.stable-diffusion-xl-v1:0',
        // TwelveLabs Models
        'twelvelabs.pegasus-1-2-v1:0',
        'twelvelabs.marengo-embed-2-7-v1:0'
    ],
    [AIProvider.Google]: [
        // Gemini 2.5 Models (Latest)
        'gemini-2.5-pro',
        'gemini-2.5-pro-large-context',
        'gemini-2.5-flash',
        'gemini-2.5-flash-audio',
        'gemini-2.5-flash-lite-preview',
        'gemini-2.5-flash-lite-audio-preview',
        'gemini-2.5-flash-native-audio',
        'gemini-2.5-flash-native-audio-output',
        'gemini-2.5-flash-preview-tts',
        'gemini-2.5-pro-preview-tts',
        // Gemini 2.0 Models
        'gemini-2.0-flash',
        'gemini-2.0-flash-audio',
        'gemini-2.0-flash-lite',
        // Gemini 1.5 Models
        'gemini-1.5-flash',
        'gemini-1.5-flash-large-context',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash-8b-large-context',
        'gemini-1.5-pro',
        'gemini-1.5-pro-large-context',
        // Gemma Models (Open Source)
        'gemma-3n',
        'gemma-3',
        'gemma-2',
        'gemma',
        // Specialized Gemma Models
        'shieldgemma-2',
        'paligemma',
        'codegemma',
        'txgemma',
        'medgemma',
        'medsiglip',
        't5gemma',
        // Embeddings Models
        'text-embedding-004',
        'multimodal-embeddings',
        // Imagen Models (Image Generation)
        'imagen-4-generation',
        'imagen-4-fast-generation',
        'imagen-4-ultra-generation',
        'imagen-3-generation',
        'imagen-3-editing-customization',
        'imagen-3-fast-generation',
        'imagen-captioning-vqa',
        // Veo Models (Video Generation)
        'veo-2',
        'veo-3',
        'veo-3-fast',
        // Preview Models
        'virtual-try-on',
        'veo-3-preview',
        'veo-3-fast-preview',
        // Legacy Models
        'gemini-1.0-pro',
        'gemini-1.0-pro-vision'
    ],
    [AIProvider.Cohere]: [
        // Latest Command Models
        'command-a-03-2025',
        'command-r7b-12-2024',
        'command-a-reasoning-08-2025',
        'command-a-vision-07-2025',
        'command-r-plus-04-2024',
        'command-r-08-2024',
        'command-r-03-2024',
        // Legacy Command Models
        'command',
        'command-nightly',
        'command-light',
        'command-light-nightly',
        // Rerank Models
        'rerank-v3.5',
        'rerank-english-v3.0',
        'rerank-multilingual-v3.0',
        // Embedding Models
        'embed-v4.0',
        'embed-english-v3.0',
        'embed-english-light-v3.0',
        'embed-multilingual-v3.0',
        'embed-multilingual-light-v3.0',
        // Aya Models
        'c4ai-aya-expanse-8b',
        'c4ai-aya-expanse-32b',
        'c4ai-aya-vision-8b',
        'c4ai-aya-vision-32b'
    ],
    [AIProvider.Gemini]: [
        // Gemini models (duplicate of Google for backward compatibility)
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro'
    ],
    [AIProvider.DeepSeek]: [
        // Standard Models
        'deepseek-chat',
        'deepseek-chat-cached',
        'deepseek-reasoner',
        'deepseek-reasoner-cached',
        // Off-Peak Models (50-75% discount)
        'deepseek-chat-offpeak',
        'deepseek-chat-cached-offpeak',
        'deepseek-reasoner-offpeak',
        'deepseek-reasoner-cached-offpeak'
    ],
    [AIProvider.Groq]: [
        // Groq models (fast inference platform)
        'llama3-8b-8192',
        'llama3-70b-8192',
        'llama-3.1-8b-instant',
        'llama-3.1-70b-versatile',
        'llama-3.2-1b-preview',
        'llama-3.2-3b-preview',
        'mixtral-8x7b-32768',
        'gemma-7b-it',
        'gemma2-9b-it'
    ],
    [AIProvider.HuggingFace]: [
        // Open Source Models on HuggingFace
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
    [AIProvider.Ollama]: [
        // Local Models via Ollama
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
        'orca-mini',
        'wizard-coder'
    ],
    [AIProvider.Replicate]: [
        // Meta Llama models on Replicate
        'meta/llama-2-7b-chat',
        'meta/llama-2-13b-chat',
        'meta/llama-2-70b-chat',
        'meta/llama-3-8b-instruct',
        'meta/llama-3-70b-instruct',
        'meta/llama-3.1-8b-instruct',
        'meta/llama-3.1-70b-instruct',
        'meta/llama-3.1-405b-instruct',
        // Mistral models on Replicate
        'mistralai/mistral-7b-instruct-v0.2',
        'mistralai/mixtral-8x7b-instruct-v0.1',
        // Other popular models on Replicate
        'stability-ai/stable-diffusion-xl-base-1.0',
        'stability-ai/sdxl-turbo',
        'black-forest-labs/flux-schnell',
        'black-forest-labs/flux-dev',
        'anthropic/claude-3-sonnet',
        'anthropic/claude-3-haiku'
    ],
    [AIProvider.Azure]: [
        // Azure OpenAI models
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-35-turbo',
        'gpt-35-turbo-16k',
        'text-embedding-ada-002',
        'text-embedding-3-small',
        'text-embedding-3-large'
    ],
    [AIProvider.MistralAI]: [
        // Premier Models
        'mistral-medium-2508',
        'mistral-medium-latest',
        'magistral-medium-2507',
        'magistral-medium-latest',
        'codestral-2508',
        'codestral-latest',
        'voxtral-mini-2507',
        'voxtral-mini-latest',
        'devstral-medium-2507',
        'devstral-medium-latest',
        'mistral-ocr-2505',
        'mistral-ocr-latest',
        'mistral-large-2411',
        'mistral-large-latest',
        'pixtral-large-2411',
        'pixtral-large-latest',
        'mistral-small-2407',
        'mistral-embed',
        'codestral-embed-2505',
        'mistral-moderation-2411',
        'mistral-moderation-latest',
        // Open Models
        'magistral-small-2507',
        'magistral-small-latest',
        'voxtral-small-2507',
        'voxtral-small-latest',
        'voxtral-mini-2507',
        'voxtral-mini-latest',
        'mistral-small-2506',
        'mistral-small-latest',
        'magistral-small-2506',
        'devstral-small-2507',
        'devstral-small-latest',
        'mistral-small-2503',
        'mistral-small-2501',
        'devstral-small-2505',
        'pixtral-12b-2409',
        'pixtral-12b',
        'open-mistral-nemo-2407',
        'open-mistral-nemo',
        'mistral-nemo',
        'open-mistral-7b',
        'open-mixtral-8x7b',
        'open-mixtral-8x22b'
    ],
    [AIProvider.Meta]: [
        // Llama 4 Series
        'llama-4-scout',
        'llama-4-maverick',
        'llama-4-behemoth-preview'
    ],
    [AIProvider.xAI]: [
        // Grok Models
        'grok-4-0709',
        'grok-3',
        'grok-3-mini',
        'grok-3-fast',
        'grok-3-mini-fast',
        'grok-2-1212us-east-1',
        'grok-2-vision-1212us-east-1',
        'grok-2-1212eu-west-1',
        'grok-2-vision-1212eu-west-1',
        'grok-2-image-1212'
    ]
};

export const PromptAnalyzer: React.FC<PromptAnalyzerProps> = ({
    onAnalyze,
    analysis,
    deadWeight,
    isAnalyzing
}) => {
    const [prompt, setPrompt] = useState('');
    const [provider, setProvider] = useState<AIProvider>(AIProvider.OpenAI);
    const [model, setModel] = useState('gpt-4');
    const [systemMessage, setSystemMessage] = useState('');
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
    const [toolCalls, setToolCalls] = useState<Array<{ name: string; arguments: string }>>([]);
    const [metadata, setMetadata] = useState<Record<string, any>>({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [realTimeTokens, setRealTimeTokens] = useState(0);
    const [realTimeCost, setRealTimeCost] = useState(0);

    // Update model when provider changes
    useEffect(() => {
        const models = PROVIDER_MODELS[provider];
        if (models && models.length > 0) {
            // Only update if current model is not in the new provider's models
            if (!models.includes(model)) {
                setModel(models[0]);
            }
        }
    }, [provider]);

    // Real-time token/cost estimation
    useEffect(() => {
        if (prompt.trim()) {
            // Simple estimation: ~4 characters per token
            const estimatedTokens = Math.ceil(prompt.length / 4);
            setRealTimeTokens(estimatedTokens);

            // Rough cost estimation (this would be more accurate with real pricing)
            const estimatedCost = estimatedTokens * 0.000002; // Rough estimate
            setRealTimeCost(estimatedCost);
        } else {
            setRealTimeTokens(0);
            setRealTimeCost(0);
        }
    }, [prompt]);

    const handleAnalyze = () => {
        if (prompt.trim()) {
            onAnalyze({
                prompt,
                provider,
                model,
                systemMessage: systemMessage.trim() || undefined,
                conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                metadata: Object.keys(metadata).length > 0 ? { ...metadata, timestamp: new Date().toISOString() } : { timestamp: new Date().toISOString() }
            });
        }
    };

    const addConversationMessage = () => {
        setConversationHistory([...conversationHistory, { role: 'user', content: '' }]);
    };

    const updateConversationMessage = (index: number, field: 'role' | 'content', value: string) => {
        const updated = [...conversationHistory];
        updated[index] = { ...updated[index], [field]: value };
        setConversationHistory(updated);
    };

    const removeConversationMessage = (index: number) => {
        setConversationHistory(conversationHistory.filter((_, i) => i !== index));
    };

    const addToolCall = () => {
        setToolCalls([...toolCalls, { name: '', arguments: '' }]);
    };

    const updateToolCall = (index: number, field: 'name' | 'arguments', value: string) => {
        const updated = [...toolCalls];
        updated[index] = { ...updated[index], [field]: value };
        setToolCalls(updated);
    };

    const removeToolCall = (index: number) => {
        setToolCalls(toolCalls.filter((_, i) => i !== index));
    };

    const addMetadataField = () => {
        const key = `field_${Object.keys(metadata).length + 1}`;
        setMetadata({ ...metadata, [key]: '' });
    };

    const updateMetadataField = (oldKey: string, newKey: string, value: string) => {
        const updated = { ...metadata };
        if (oldKey !== newKey) {
            delete updated[oldKey];
        }
        updated[newKey] = value;
        setMetadata(updated);
    };

    const removeMetadataField = (key: string) => {
        const updated = { ...metadata };
        delete updated[key];
        setMetadata(updated);
    };

    const clearAll = () => {
        setPrompt('');
        setSystemMessage('');
        setConversationHistory([]);
        setToolCalls([]);
        setMetadata({});
        setRealTimeTokens(0);
        setRealTimeCost(0);
    };

    return (
        <div className="prompt-analyzer">
            <div className="analyzer-header">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold gradient-text">Prompt Analyzer</h2>
                        <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">Analyze your AI prompts for cost optimization opportunities</p>
                    </div>
                </div>
            </div>

            <div className="input-section">
                <label className="input-label">
                    <span className="text-lg">💬</span>
                    Your Prompt
                </label>
                <textarea
                    className="prompt-textarea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your AI prompt here..."
                    rows={6}
                />
            </div>

            <div className="provider-selection">
                <div className="selection-group">
                    <label className="input-label">
                        <span className="text-lg">🏢</span>
                        Provider
                    </label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as AIProvider)}
                        className="provider-select"
                    >
                        {Object.values(AIProvider).map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div className="selection-group">
                    <label className="input-label">
                        <span className="text-lg">📋</span>
                        Model
                    </label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="model-select"
                    >
                        {PROVIDER_MODELS[provider]?.map((m: string) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="advanced-toggle">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="toggle-button"
                >
                    {showAdvanced ? '▼' : '▶'} Advanced Options
                </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
                <div className="advanced-options">
                    {/* System Message */}
                    <div className="input-section">
                        <label className="input-label">
                            <span className="text-lg">⚙️</span>
                            System Message (Optional)
                        </label>
                        <textarea
                            className="system-textarea"
                            value={systemMessage}
                            onChange={(e) => setSystemMessage(e.target.value)}
                            placeholder="Define the AI's role or behavior..."
                            rows={3}
                        />
                    </div>

                    {/* Conversation History */}
                    <div className="input-section">
                        <div className="history-header">
                            <label className="input-label">
                                <span className="text-lg">💬</span>
                                Conversation History (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={addConversationMessage}
                                className="add-message-btn"
                            >
                                + Add Message
                            </button>
                        </div>

                        {conversationHistory.map((message, index) => (
                            <div key={index} className="conversation-message">
                                <select
                                    value={message.role}
                                    onChange={(e) => updateConversationMessage(index, 'role', e.target.value)}
                                    className="role-select"
                                >
                                    <option value="user">User</option>
                                    <option value="assistant">Assistant</option>
                                    <option value="system">System</option>
                                </select>

                                <textarea
                                    value={message.content}
                                    onChange={(e) => updateConversationMessage(index, 'content', e.target.value)}
                                    placeholder={`${message.role} message...`}
                                    className="message-textarea"
                                    rows={2}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeConversationMessage(index)}
                                    className="remove-message-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Tool Calls */}
                    <div className="input-section">
                        <div className="history-header">
                            <label className="input-label">
                                <span className="text-lg">🔧</span>
                                Tool Calls (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={addToolCall}
                                className="add-message-btn"
                            >
                                + Add Tool Call
                            </button>
                        </div>

                        {toolCalls.map((toolCall, index) => (
                            <div key={index} className="conversation-message">
                                <input
                                    type="text"
                                    value={toolCall.name}
                                    onChange={(e) => updateToolCall(index, 'name', e.target.value)}
                                    placeholder="Tool name (e.g., search_web)"
                                    className="w-32 flex-shrink-0 px-3 py-2 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                />

                                <textarea
                                    value={toolCall.arguments}
                                    onChange={(e) => updateToolCall(index, 'arguments', e.target.value)}
                                    placeholder='Tool arguments (JSON format, e.g., {"query": "search term"})'
                                    className="flex-1 min-h-[60px] resize-y px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                                    rows={2}
                                />

                                <button
                                    type="button"
                                    onClick={() => removeToolCall(index)}
                                    className="remove-message-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Metadata */}
                    <div className="input-section">
                        <div className="history-header">
                            <label className="input-label">
                                <span className="text-lg">📋</span>
                                Metadata (Optional)
                            </label>
                            <button
                                type="button"
                                onClick={addMetadataField}
                                className="add-message-btn"
                            >
                                + Add Field
                            </button>
                        </div>

                        {Object.entries(metadata).map(([key, value]) => (
                            <div key={key} className="conversation-message">
                                <input
                                    type="text"
                                    value={key}
                                    onChange={(e) => updateMetadataField(key, e.target.value, value as string)}
                                    placeholder="Field name"
                                    className="w-32 flex-shrink-0 px-3 py-2 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                />

                                <input
                                    type="text"
                                    value={value as string}
                                    onChange={(e) => updateMetadataField(key, key, e.target.value)}
                                    placeholder="Field value"
                                    className="flex-1 px-3 py-2 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeMetadataField(key)}
                                    className="remove-message-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    onClick={handleAnalyze}
                    disabled={!prompt.trim() || isAnalyzing}
                    className="analyze-btn"
                >
                    {isAnalyzing ? '🔍 Analyzing...' : '🚀 Analyze Prompt'}
                </button>

                <button
                    onClick={clearAll}
                    type="button"
                    className="clear-btn"
                >
                    🗑️ Clear All
                </button>
            </div>

            {/* Quick Results */}
            {realTimeTokens > 0 && (
                <div className="quick-results">
                    <div className="result-item">
                        <span className="label">Estimated Tokens:</span>
                        <span className="value">{realTimeTokens.toLocaleString()}</span>
                    </div>
                    <div className="result-item">
                        <span className="label">Estimated Cost:</span>
                        <span className="value">${realTimeCost.toFixed(6)}</span>
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="analysis-results">
                    <h3>📊 Analysis Results</h3>
                    <div className="results-grid">
                        <div className="result-card">
                            <h4>Token Breakdown</h4>
                            <p>Total: {analysis.totalTokens?.toLocaleString() || '0'} tokens</p>
                            <p>Cost: ${analysis.totalCost?.toFixed(6) || '0.000000'}</p>
                        </div>

                        <div className="result-card">
                            <h4>Quality Score</h4>
                            <p>Overall: {analysis.qualityMetrics?.overallScore?.toFixed(1) || '0'}/100</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Dead Weight Summary */}
            {deadWeight && (
                <div className="dead-weight-summary">
                    <h3>💀 Dead Weight Detected</h3>
                    <p>Potential savings: ${deadWeight.estimatedSavings?.toFixed(6) || '0.000000'}</p>
                </div>
            )}
        </div>
    );
};
