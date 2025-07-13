

export interface ModelPricing {
    provider: string;
    model: string;
    inputPrice: number;  // per 1K tokens
    outputPrice: number; // per 1K tokens
    contextWindow?: number;
    capabilities?: string[];
    category?: string;
    isLatest?: boolean;
}

// Fresh pricing data updated July 2025 - All prices per 1K tokens
export const PRICING_DATA: ModelPricing[] = [
    // OpenAI Models - June 2025 Pricing
    {
        provider: 'OpenAI',
        model: 'gpt-4.1-2025-04-14',
        inputPrice: 2.00,
        outputPrice: 8.00,
        contextWindow: 128000,
        capabilities: ['text', 'analysis', 'reasoning'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4.1-mini-2025-04-14',
        inputPrice: 0.40,
        outputPrice: 1.60,
        contextWindow: 128000,
        capabilities: ['text', 'analysis'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4.1-nano-2025-04-14',
        inputPrice: 0.10,
        outputPrice: 0.40,
        contextWindow: 128000,
        capabilities: ['text'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4.5-preview-2025-02-27',
        inputPrice: 75.00,
        outputPrice: 150.00,
        contextWindow: 128000,
        capabilities: ['text', 'analysis', 'reasoning'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-2024-08-06',
        inputPrice: 2.50,
        outputPrice: 10.00,
        contextWindow: 128000,
        capabilities: ['text', 'multimodal', 'vision', 'analysis'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-audio-preview-2024-12-17',
        inputPrice: 2.50,
        outputPrice: 10.00,
        contextWindow: 128000,
        capabilities: ['text', 'audio', 'analysis'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-realtime-preview-2025-06-03',
        inputPrice: 5.00,
        outputPrice: 20.00,
        contextWindow: 128000,
        capabilities: ['text', 'realtime', 'analysis'],
        category: 'realtime',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-mini-2024-07-18',
        inputPrice: 0.15,
        outputPrice: 0.60,
        contextWindow: 128000,
        capabilities: ['text', 'multimodal', 'vision', 'analysis'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-mini-audio-preview-2024-12-17',
        inputPrice: 0.15,
        outputPrice: 0.60,
        contextWindow: 128000,
        capabilities: ['text', 'audio', 'analysis'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-mini-realtime-preview-2024-12-17',
        inputPrice: 0.60,
        outputPrice: 2.40,
        contextWindow: 128000,
        capabilities: ['text', 'realtime', 'analysis'],
        category: 'realtime',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o1-2024-12-17',
        inputPrice: 15.00,
        outputPrice: 60.00,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'analysis'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o1-pro-2025-03-19',
        inputPrice: 150.00,
        outputPrice: 600.00,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'analysis'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o3-pro-2025-06-10',
        inputPrice: 20.00,
        outputPrice: 80.00,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'analysis'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o3-2025-04-16',
        inputPrice: 2.00,
        outputPrice: 8.00,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'analysis'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o3-deep-research-2025-06-26',
        inputPrice: 10.00,
        outputPrice: 40.00,
        contextWindow: 128000,
        capabilities: ['text', 'research', 'analysis'],
        category: 'research',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o4-mini-2025-04-16',
        inputPrice: 1.10,
        outputPrice: 4.40,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o4-mini-deep-research-2025-06-26',
        inputPrice: 2.00,
        outputPrice: 8.00,
        contextWindow: 128000,
        capabilities: ['text', 'research', 'analysis'],
        category: 'research',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'o3-mini-2025-01-31',
        inputPrice: 1.10,
        outputPrice: 4.40,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning'],
        category: 'reasoning',
        isLatest: false
    },
    {
        provider: 'OpenAI',
        model: 'o1-mini-2024-09-12',
        inputPrice: 1.10,
        outputPrice: 4.40,
        contextWindow: 128000,
        capabilities: ['text', 'reasoning'],
        category: 'reasoning',
        isLatest: false
    },
    {
        provider: 'OpenAI',
        model: 'codex-mini-latest',
        inputPrice: 1.50,
        outputPrice: 6.00,
        contextWindow: 128000,
        capabilities: ['code', 'analysis'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-mini-search-preview-2025-03-11',
        inputPrice: 0.15,
        outputPrice: 0.60,
        contextWindow: 128000,
        capabilities: ['text', 'search'],
        category: 'search',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-4o-search-preview-2025-03-11',
        inputPrice: 2.50,
        outputPrice: 10.00,
        contextWindow: 128000,
        capabilities: ['text', 'search'],
        category: 'search',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'computer-use-preview-2025-03-11',
        inputPrice: 3.00,
        outputPrice: 12.00,
        contextWindow: 128000,
        capabilities: ['text', 'computer-use'],
        category: 'computer-use',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'text-embedding-3-small',
        inputPrice: 0.02,
        outputPrice: 0.02,
        contextWindow: 8191,
        capabilities: ['embedding'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'text-embedding-3-large',
        inputPrice: 0.13,
        outputPrice: 0.13,
        contextWindow: 8191,
        capabilities: ['embedding'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'text-embedding-ada-002',
        inputPrice: 0.10,
        outputPrice: 0.10,
        contextWindow: 8191,
        capabilities: ['embedding'],
        category: 'embedding',
        isLatest: false
    },
    {
        provider: 'OpenAI',
        model: 'gpt-3.5-turbo-0125',
        inputPrice: 0.50,
        outputPrice: 1.50,
        contextWindow: 16385,
        capabilities: ['text', 'analysis'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'OpenAI',
        model: 'gpt-3.5-turbo-1106',
        inputPrice: 1.00,
        outputPrice: 2.00,
        contextWindow: 16385,
        capabilities: ['text', 'analysis'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'OpenAI',
        model: 'gpt-3.5-turbo-instruct',
        inputPrice: 1.50,
        outputPrice: 2.00,
        contextWindow: 4096,
        capabilities: ['text', 'analysis'],
        category: 'text',
        isLatest: false
    },

    // Cohere Models - July 2025 Pricing
    {
        provider: 'Cohere',
        model: 'command-a',
        inputPrice: 2.50, // $2.50/1M tokens = $0.0025/1K tokens
        outputPrice: 10.00, // $10.00/1M tokens = $0.01/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'agentic-ai', 'multilingual', 'human-evaluations'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'command-r-plus',
        inputPrice: 2.50, // $2.50/1M tokens = $0.0025/1K tokens
        outputPrice: 10.00, // $10.00/1M tokens = $0.01/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'enterprise', 'scalable', 'real-world-use-cases'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'command-r',
        inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        outputPrice: 0.60, // $0.60/1M tokens = $0.0006/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'rag', 'long-context', 'external-apis', 'tools'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'command-r-fine-tuned',
        inputPrice: 0.30, // $0.30/1M tokens = $0.0003/1K tokens
        outputPrice: 1.20, // $1.20/1M tokens = $0.0012/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'fine-tuned', 'custom'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'command-r7b',
        inputPrice: 0.0375, // $0.0375/1M tokens = $0.0000375/1K tokens
        outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'speed', 'efficiency', 'quality'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'rerank-3.5',
        inputPrice: 2.00, // $2.00/1K searches
        outputPrice: 2.00, // Same for rerank models
        contextWindow: 4096,
        capabilities: ['rerank', 'semantic-search', 'search-quality-boost'],
        category: 'rerank',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'embed-4',
        inputPrice: 0.12, // $0.12/1M tokens = $0.00012/1K tokens
        outputPrice: 0.12, // Same for embedding models
        contextWindow: 8192,
        capabilities: ['embedding', 'multimodal', 'semantic-search', 'rag'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'Cohere',
        model: 'embed-4-image',
        inputPrice: 0.47, // $0.47/1M image tokens = $0.00047/1K tokens
        outputPrice: 0.47, // Same for image embedding models
        contextWindow: 8192,
        capabilities: ['embedding', 'image', 'multimodal'],
        category: 'embedding',
        isLatest: true
    },

    // xAI Grok Models - July 2025 Pricing
    {
        provider: 'xAI',
        model: 'grok-4-0709',
        inputPrice: 3.00, // $3.00/1M tokens = $0.003/1K tokens
        outputPrice: 15.00, // $15.00/1M tokens = $0.015/1K tokens
        contextWindow: 256000,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'xAI',
        model: 'grok-3',
        inputPrice: 3.00, // $3.00/1M tokens = $0.003/1K tokens
        outputPrice: 15.00, // $15.00/1M tokens = $0.015/1K tokens
        contextWindow: 131072,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'xAI',
        model: 'grok-3-mini',
        inputPrice: 0.30, // $0.30/1M tokens = $0.0003/1K tokens
        outputPrice: 0.50, // $0.50/1M tokens = $0.0005/1K tokens
        contextWindow: 131072,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'xAI',
        model: 'grok-3-fast',
        inputPrice: 5.00, // $5.00/1M tokens = $0.005/1K tokens
        outputPrice: 25.00, // $25.00/1M tokens = $0.025/1K tokens
        contextWindow: 131072,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs', 'fast-inference'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'xAI',
        model: 'grok-3-mini-fast',
        inputPrice: 0.60, // $0.60/1M tokens = $0.0006/1K tokens
        outputPrice: 4.00, // $4.00/1M tokens = $0.004/1K tokens
        contextWindow: 131072,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs', 'fast-inference'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'xAI',
        model: 'grok-2-1212us-east-1',
        inputPrice: 2.00, // $2.00/1M tokens = $0.002/1K tokens
        outputPrice: 10.00, // $10.00/1M tokens = $0.01/1K tokens
        contextWindow: 131072,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs'],
        category: 'reasoning',
        isLatest: false
    },
    {
        provider: 'xAI',
        model: 'grok-2-vision-1212us-east-1',
        inputPrice: 2.00, // $2.00/1M tokens = $0.002/1K tokens
        outputPrice: 10.00, // $10.00/1M tokens = $0.01/1K tokens
        contextWindow: 32768,
        capabilities: ['text', 'vision', 'multimodal', 'reasoning'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'xAI',
        model: 'grok-2-1212eu-west-1',
        inputPrice: 2.00, // $2.00/1M tokens = $0.002/1K tokens
        outputPrice: 10.00, // $10.00/1M tokens = $0.01/1K tokens
        contextWindow: 131072,
        capabilities: ['text', 'vision', 'reasoning', 'function-calling', 'structured-outputs'],
        category: 'reasoning',
        isLatest: false
    },
    {
        provider: 'xAI',
        model: 'grok-2-vision-1212eu-west-1',
        inputPrice: 2.00, // $2.00/1M tokens = $0.002/1K tokens
        outputPrice: 10.00, // $10.00/1M tokens = $0.01/1K tokens
        contextWindow: 32768,
        capabilities: ['text', 'vision', 'multimodal', 'reasoning'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'xAI',
        model: 'grok-2-image-1212',
        inputPrice: 0.07, // $0.07 per image output
        outputPrice: 0.07, // Same for image generation models
        contextWindow: 4096,
        capabilities: ['text', 'image-generation'],
        category: 'image-generation',
        isLatest: true
    },

    // DeepSeek Models - July 2025 Pricing (Standard UTC 00:30-16:30)
    {
        provider: 'DeepSeek',
        model: 'deepseek-chat',
        inputPrice: 0.27, // $0.27/1M tokens = $0.00027/1K tokens
        outputPrice: 1.10, // $1.10/1M tokens = $0.0011/1K tokens
        contextWindow: 64000,
        capabilities: ['text', 'json', 'function-calling', 'chat-prefix', 'fim'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'DeepSeek',
        model: 'deepseek-chat-cached',
        inputPrice: 0.07, // $0.07/1M tokens cache hit = $0.00007/1K tokens
        outputPrice: 1.10, // $1.10/1M tokens = $0.0011/1K tokens
        contextWindow: 64000,
        capabilities: ['text', 'json', 'function-calling', 'chat-prefix', 'fim', 'context-caching'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'DeepSeek',
        model: 'deepseek-reasoner',
        inputPrice: 0.55, // $0.55/1M tokens = $0.00055/1K tokens
        outputPrice: 2.19, // $2.19/1M tokens = $0.00219/1K tokens
        contextWindow: 64000,
        capabilities: ['text', 'reasoning', 'cot', 'json', 'function-calling', 'chat-prefix'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'DeepSeek',
        model: 'deepseek-reasoner-cached',
        inputPrice: 0.14, // $0.14/1M tokens cache hit = $0.00014/1K tokens
        outputPrice: 2.19, // $2.19/1M tokens = $0.00219/1K tokens
        contextWindow: 64000,
        capabilities: ['text', 'reasoning', 'cot', 'json', 'function-calling', 'chat-prefix', 'context-caching'],
        category: 'reasoning',
        isLatest: true
    },
    // DeepSeek Off-Peak Pricing (UTC 16:30-00:30) - 50% discount for deepseek-chat, 75% discount for deepseek-reasoner
    {
        provider: 'DeepSeek',
        model: 'deepseek-chat-offpeak',
        inputPrice: 0.135, // 50% off standard price
        outputPrice: 0.55, // 50% off standard price
        contextWindow: 64000,
        capabilities: ['text', 'json', 'function-calling', 'chat-prefix', 'fim', 'off-peak-pricing'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'DeepSeek',
        model: 'deepseek-chat-cached-offpeak',
        inputPrice: 0.035, // 50% off cached price
        outputPrice: 0.55, // 50% off standard price
        contextWindow: 64000,
        capabilities: ['text', 'json', 'function-calling', 'chat-prefix', 'fim', 'context-caching', 'off-peak-pricing'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'DeepSeek',
        model: 'deepseek-reasoner-offpeak',
        inputPrice: 0.135, // 75% off standard price
        outputPrice: 0.55, // 75% off standard price
        contextWindow: 64000,
        capabilities: ['text', 'reasoning', 'cot', 'json', 'function-calling', 'chat-prefix', 'off-peak-pricing'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'DeepSeek',
        model: 'deepseek-reasoner-cached-offpeak',
        inputPrice: 0.035, // 75% off cached price
        outputPrice: 0.55, // 75% off standard price
        contextWindow: 64000,
        capabilities: ['text', 'reasoning', 'cot', 'json', 'function-calling', 'chat-prefix', 'context-caching', 'off-peak-pricing'],
        category: 'reasoning',
        isLatest: true
    },

    // Mistral AI Models - July 2025 Pricing (Premier Models)
    {
        provider: 'Mistral AI',
        model: 'mistral-medium-latest',
        inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
        outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'analysis', 'reasoning', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'magistral-medium-latest',
        inputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        outputPrice: 5.0, // $5/1M tokens = $0.005/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'thinking', 'domain-specific', 'multilingual'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'codestral-latest',
        inputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
        outputPrice: 0.9, // $0.9/1M tokens = $0.0009/1K tokens
        contextWindow: 128000,
        capabilities: ['code', 'programming', 'multilingual'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'devstral-medium-2507',
        inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
        outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        contextWindow: 128000,
        capabilities: ['code', 'agents', 'programming', 'advanced-coding'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-saba-latest',
        inputPrice: 0.2, // $0.2/1M tokens = $0.0002/1K tokens
        outputPrice: 0.6, // $0.6/1M tokens = $0.0006/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'custom-trained', 'geography-specific'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-large-latest',
        inputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'complex-tasks', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'pixtral-large-latest',
        inputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
        contextWindow: 128000,
        capabilities: ['vision', 'multimodal', 'reasoning', 'image-analysis'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'ministral-8b-latest',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'on-device', 'edge-computing'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'ministral-3b-latest',
        inputPrice: 0.04, // $0.04/1M tokens = $0.00004/1K tokens
        outputPrice: 0.04, // $0.04/1M tokens = $0.00004/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'edge', 'efficient'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'codestral-embed-2505',
        inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        outputPrice: 0.15, // Same for embedding models
        contextWindow: 8192,
        capabilities: ['embedding', 'code', 'representation'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-embed',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.1, // Same for embedding models
        contextWindow: 8192,
        capabilities: ['embedding', 'text', 'representation'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-moderation-latest',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.1, // Same for moderation models
        contextWindow: 8192,
        capabilities: ['moderation', 'classification', 'content-filtering'],
        category: 'moderation',
        isLatest: true
    },

    // Mistral AI Open Models
    {
        provider: 'Mistral AI',
        model: 'mistral-small-latest',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'multimodal', 'multilingual', 'apache-2.0'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'magistral-small-latest',
        inputPrice: 0.5, // $0.5/1M tokens = $0.0005/1K tokens
        outputPrice: 1.5, // $1.5/1M tokens = $0.0015/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'thinking', 'domain-specific', 'multilingual'],
        category: 'reasoning',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'devstral-small-2507',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
        contextWindow: 128000,
        capabilities: ['code', 'agents', 'open-source'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'pixtral-12b',
        inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        contextWindow: 128000,
        capabilities: ['vision', 'multimodal', 'small-model'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-nemo',
        inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        contextWindow: 128000,
        capabilities: ['code', 'text', 'specialized'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'open-mistral-7b',
        inputPrice: 0.25, // $0.25/1M tokens = $0.00025/1K tokens
        outputPrice: 0.25, // $0.25/1M tokens = $0.00025/1K tokens
        contextWindow: 32768,
        capabilities: ['text', 'fast-deployment', 'customizable'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'open-mixtral-8x7b',
        inputPrice: 0.7, // $0.7/1M tokens = $0.0007/1K tokens
        outputPrice: 0.7, // $0.7/1M tokens = $0.0007/1K tokens
        contextWindow: 32768,
        capabilities: ['text', 'mixture-of-experts', 'sparse'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'open-mixtral-8x22b',
        inputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
        contextWindow: 65536,
        capabilities: ['text', 'mixture-of-experts', 'high-performance'],
        category: 'text',
        isLatest: true
    },

    // Google Gemini Models - July 2025 Pricing (updated)
    // All prices per 1K tokens (converted from per 1M tokens in USD)
    // Note: For models with tiered pricing, we use the lower context window price as default.
    {
        provider: 'Google AI',
        model: 'gemini-2.5-pro',
        inputPrice: 0.00125, // $1.25 / 1M tokens = $0.00125 / 1K tokens
        outputPrice: 0.01,   // $10.00 / 1M tokens = $0.01 / 1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'code', 'reasoning', 'multimodal'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-pro-large-context',
        inputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
        outputPrice: 0.015, // $15.00 / 1M tokens = $0.015 / 1K tokens
        contextWindow: 200001, // >200k tokens
        capabilities: ['text', 'code', 'reasoning', 'multimodal'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash',
        inputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
        outputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['text', 'image', 'video', 'audio', 'multimodal'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash-audio',
        inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
        outputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'multimodal'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash-lite-preview',
        inputPrice: 0.0001, // $0.10 / 1M tokens = $0.0001 / 1K tokens
        outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['text', 'image', 'video', 'multimodal'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash-lite-audio-preview',
        inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
        outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'multimodal'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash-native-audio',
        inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
        outputPrice: 0.002, // $2.00 / 1M tokens = $0.002 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'multimodal'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash-native-audio-output',
        inputPrice: 0.003, // $3.00 / 1M tokens = $0.003 / 1K tokens
        outputPrice: 0.012, // $12.00 / 1M tokens = $0.012 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'multimodal'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-flash-preview-tts',
        inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
        outputPrice: 0.01, // $10.00 / 1M tokens = $0.01 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'tts'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.5-pro-preview-tts',
        inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
        outputPrice: 0.02, // $20.00 / 1M tokens = $0.02 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'tts'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.0-flash',
        inputPrice: 0.0001, // $0.10 / 1M tokens = $0.0001 / 1K tokens
        outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['text', 'image', 'video', 'multimodal'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.0-flash-audio',
        inputPrice: 0.0007, // $0.70 / 1M tokens = $0.0007 / 1K tokens
        outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['audio', 'multimodal'],
        category: 'audio',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-2.0-flash-lite',
        inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
        outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
        contextWindow: 1000000,
        capabilities: ['text', 'multimodal'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-1.5-flash',
        inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
        outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'image', 'video', 'multimodal'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-1.5-flash-large-context',
        inputPrice: 0.00015, // $0.15 / 1M tokens = $0.00015 / 1K tokens
        outputPrice: 0.0006, // $0.60 / 1M tokens = $0.0006 / 1K tokens
        contextWindow: 128001, // >128k tokens
        capabilities: ['text', 'image', 'video', 'multimodal'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-1.5-flash-8b',
        inputPrice: 0.0000375, // $0.0375 / 1M tokens = $0.0000375 / 1K tokens
        outputPrice: 0.00015, // $0.15 / 1M tokens = $0.00015 / 1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'image', 'video', 'multimodal'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-1.5-flash-8b-large-context',
        inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
        outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
        contextWindow: 128001,
        capabilities: ['text', 'image', 'video', 'multimodal'],
        category: 'multimodal',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-1.5-pro',
        inputPrice: 0.00125, // $1.25 / 1M tokens = $0.00125 / 1K tokens
        outputPrice: 0.005, // $5.00 / 1M tokens = $0.005 / 1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'code', 'reasoning', 'multimodal'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Google AI',
        model: 'gemini-1.5-pro-large-context',
        inputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
        outputPrice: 0.01, // $10.00 / 1M tokens = $0.01 / 1K tokens
        contextWindow: 128001,
        capabilities: ['text', 'code', 'reasoning', 'multimodal'],
        category: 'text',
        isLatest: false
    },

    // Anthropic Models - June 2025 Pricing (updated)
    {
        provider: 'Anthropic',
        model: 'claude-opus-4-20250514',
        inputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
        outputPrice: 7.5, // $75/MTok = $0.0075/token = $7.5/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual', 'extended-thinking'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-opus-4-0',
        inputPrice: 1.5,
        outputPrice: 7.5,
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual', 'extended-thinking'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-sonnet-4-20250514',
        inputPrice: 0.3, // $3/MTok = $0.0003/token = $0.3/1K tokens
        outputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual', 'extended-thinking'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-sonnet-4-0',
        inputPrice: 0.3,
        outputPrice: 1.5,
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual', 'extended-thinking'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-7-sonnet-20250219',
        inputPrice: 0.3, // $3/MTok = $0.0003/token = $0.3/1K tokens
        outputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual', 'extended-thinking'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-7-sonnet-latest',
        inputPrice: 0.3,
        outputPrice: 1.5,
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual', 'extended-thinking'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet-20241022',
        inputPrice: 0.3, // $3/MTok = $0.0003/token = $0.3/1K tokens
        outputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet-latest',
        inputPrice: 0.3,
        outputPrice: 1.5,
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet-20240620',
        inputPrice: 0.3,
        outputPrice: 1.5,
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-5-haiku-20241022',
        inputPrice: 0.08, // $0.80/MTok = $0.00008/token = $0.08/1K tokens
        outputPrice: 0.4, // $4/MTok = $0.0004/token = $0.4/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-5-haiku-latest',
        inputPrice: 0.08,
        outputPrice: 0.4,
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-opus-20240229',
        inputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
        outputPrice: 7.5, // $75/MTok = $0.0075/token = $7.5/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'multilingual'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Anthropic',
        model: 'claude-3-haiku-20240307',
        inputPrice: 0.025, // $0.25/MTok = $0.000025/token = $0.025/1K tokens
        outputPrice: 0.125, // $1.25/MTok = $0.000125/token = $0.125/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'multilingual'],
        category: 'text',
        isLatest: false
    },

    // AWS Bedrock Models - January 2025 Pricing
    // AI21 Labs
    {
        provider: 'AWS Bedrock',
        model: 'jamba-1.5-large',
        inputPrice: 2.0, // $0.002/1K tokens = $2.0/1K tokens
        outputPrice: 8.0, // $0.008/1K tokens = $8.0/1K tokens
        contextWindow: 256000,
        capabilities: ['text', 'long-context', 'multilingual'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'jamba-1.5-mini',
        inputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
        outputPrice: 0.4, // $0.0004/1K tokens = $0.4/1K tokens
        contextWindow: 256000,
        capabilities: ['text', 'long-context', 'efficient'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'jurassic-2-mid',
        inputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
        outputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
        contextWindow: 8192,
        capabilities: ['text', 'generation'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'AWS Bedrock',
        model: 'jurassic-2-ultra',
        inputPrice: 18.8, // $0.0188/1K tokens = $18.8/1K tokens
        outputPrice: 18.8, // $0.0188/1K tokens = $18.8/1K tokens
        contextWindow: 8192,
        capabilities: ['text', 'generation'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'AWS Bedrock',
        model: 'jamba-instruct',
        inputPrice: 0.5, // $0.0005/1K tokens = $0.5/1K tokens
        outputPrice: 0.7, // $0.0007/1K tokens = $0.7/1K tokens
        contextWindow: 256000,
        capabilities: ['text', 'instruction-following'],
        category: 'text',
        isLatest: true
    },

    // Amazon Nova Models
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-micro',
        inputPrice: 0.035, // $0.000035/1K tokens = $0.035/1K tokens
        outputPrice: 0.14, // $0.00014/1K tokens = $0.14/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'ultra-fast', 'cost-effective'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-lite',
        inputPrice: 0.06, // $0.00006/1K tokens = $0.06/1K tokens
        outputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
        contextWindow: 300000,
        capabilities: ['text', 'multimodal', 'fast'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-pro',
        inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
        outputPrice: 3.2, // $0.0032/1K tokens = $3.2/1K tokens
        contextWindow: 300000,
        capabilities: ['text', 'multimodal', 'reasoning', 'complex-tasks'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-pro-latency-optimized',
        inputPrice: 1.0, // $0.001/1K tokens = $1.0/1K tokens
        outputPrice: 4.0, // $0.004/1K tokens = $4.0/1K tokens
        contextWindow: 300000,
        capabilities: ['text', 'multimodal', 'reasoning', 'low-latency'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-premier',
        inputPrice: 2.5, // $0.0025/1K tokens = $2.5/1K tokens
        outputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
        contextWindow: 300000,
        capabilities: ['text', 'multimodal', 'advanced-reasoning', 'premium'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-canvas',
        inputPrice: 40.0, // $0.04 per image (1024x1024 standard) = $40/1K images
        outputPrice: 40.0, // Same for image generation
        contextWindow: 4096,
        capabilities: ['image-generation', 'creative-content'],
        category: 'image-generation',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-reel',
        inputPrice: 80.0, // $0.08 per second of 720p video = $80/1K seconds
        outputPrice: 80.0, // Same for video generation
        contextWindow: 4096,
        capabilities: ['video-generation', 'creative-content'],
        category: 'video-generation',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-sonic-speech',
        inputPrice: 3.4, // $0.0034/1K tokens for speech
        outputPrice: 13.6, // $0.0136/1K tokens for speech
        contextWindow: 128000,
        capabilities: ['speech-to-speech', 'audio'],
        category: 'audio',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'amazon-nova-sonic-text',
        inputPrice: 0.06, // $0.00006/1K tokens for text
        outputPrice: 0.24, // $0.00024/1K tokens for text
        contextWindow: 128000,
        capabilities: ['text-to-speech', 'audio'],
        category: 'audio',
        isLatest: true
    },

    // Amazon Titan Models
    {
        provider: 'AWS Bedrock',
        model: 'amazon-titan-text-embeddings-v2',
        inputPrice: 0.02, // $0.00002/1K tokens = $0.02/1K tokens
        outputPrice: 0.02, // Same for embeddings
        contextWindow: 8192,
        capabilities: ['embedding', 'text-representation'],
        category: 'embedding',
        isLatest: true
    },

    // Anthropic on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'claude-opus-4',
        inputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
        outputPrice: 75.0, // $0.075/1K tokens = $75.0/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'premium'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'claude-sonnet-4',
        inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
        outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'claude-3-7-sonnet',
        inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
        outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'extended-thinking'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'claude-3-5-sonnet',
        inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
        outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'claude-3-5-haiku',
        inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
        outputPrice: 4.0, // $0.004/1K tokens = $4.0/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'fast'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'claude-3-5-sonnet-v2',
        inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
        outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'reasoning', 'improved'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'claude-3-haiku',
        inputPrice: 0.25, // $0.00025/1K tokens = $0.25/1K tokens
        outputPrice: 1.25, // $0.00125/1K tokens = $1.25/1K tokens
        contextWindow: 200000,
        capabilities: ['text', 'vision', 'fast', 'cost-effective'],
        category: 'text',
        isLatest: false
    },

    // Cohere on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'command',
        inputPrice: 1.0, // $0.001/1K tokens = $1.0/1K tokens
        outputPrice: 2.0, // $0.002/1K tokens = $2.0/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'generation', 'conversation'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'command-light',
        inputPrice: 0.3, // $0.0003/1K tokens = $0.3/1K tokens
        outputPrice: 0.6, // $0.0006/1K tokens = $0.6/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'generation', 'lightweight'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'command-r-plus',
        inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
        outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'rag', 'enterprise'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'command-r',
        inputPrice: 0.5, // $0.0005/1K tokens = $0.5/1K tokens
        outputPrice: 1.5, // $0.0015/1K tokens = $1.5/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'rag', 'tools'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'embed-3-english',
        inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
        outputPrice: 0.1, // Same for embeddings
        contextWindow: 8192,
        capabilities: ['embedding', 'english'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'embed-3-multilingual',
        inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
        outputPrice: 0.1, // Same for embeddings
        contextWindow: 8192,
        capabilities: ['embedding', 'multilingual'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'rerank-3.5',
        inputPrice: 2000.0, // $2.00/1K queries = $2000/1K tokens (approximation)
        outputPrice: 2000.0, // Same for rerank
        contextWindow: 4096,
        capabilities: ['rerank', 'search-quality'],
        category: 'rerank',
        isLatest: true
    },

    // DeepSeek on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'deepseek-r1',
        inputPrice: 1.35, // $0.00135/1K tokens = $1.35/1K tokens
        outputPrice: 5.4, // $0.0054/1K tokens = $5.4/1K tokens
        contextWindow: 64000,
        capabilities: ['text', 'reasoning', 'cost-effective'],
        category: 'reasoning',
        isLatest: true
    },

    // Luma AI on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'luma-ray2-720p',
        inputPrice: 1500.0, // $1.50 per second = $1500/1K seconds
        outputPrice: 1500.0, // Same for video generation
        contextWindow: 4096,
        capabilities: ['video-generation', '720p', 'high-quality'],
        category: 'video-generation',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'luma-ray2-540p',
        inputPrice: 750.0, // $0.75 per second = $750/1K seconds
        outputPrice: 750.0, // Same for video generation
        contextWindow: 4096,
        capabilities: ['video-generation', '540p', 'cost-effective'],
        category: 'video-generation',
        isLatest: true
    },

    // Meta Llama on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'llama-4-maverick-17b',
        inputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
        outputPrice: 0.97, // $0.00097/1K tokens = $0.97/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'latest-generation'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-4-scout-17b',
        inputPrice: 0.17, // $0.00017/1K tokens = $0.17/1K tokens
        outputPrice: 0.66, // $0.00066/1K tokens = $0.66/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'efficient', 'latest-generation'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.3-instruct-70b',
        inputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
        outputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'instruction-following'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.2-instruct-1b',
        inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
        outputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'lightweight', 'efficient'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.2-instruct-3b',
        inputPrice: 0.15, // $0.00015/1K tokens = $0.15/1K tokens
        outputPrice: 0.15, // $0.00015/1K tokens = $0.15/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'lightweight', 'efficient'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.2-instruct-11b',
        inputPrice: 0.16, // $0.00016/1K tokens = $0.16/1K tokens
        outputPrice: 0.16, // $0.00016/1K tokens = $0.16/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'balanced', 'efficient'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.2-instruct-90b',
        inputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
        outputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'large-scale', 'high-performance'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.1-instruct-8b',
        inputPrice: 0.22, // $0.00022/1K tokens = $0.22/1K tokens
        outputPrice: 0.22, // $0.00022/1K tokens = $0.22/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'instruction-following'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.1-instruct-70b',
        inputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
        outputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'instruction-following', 'large-scale'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3.1-instruct-405b',
        inputPrice: 2.4, // $0.0024/1K tokens = $2.4/1K tokens
        outputPrice: 2.4, // $0.0024/1K tokens = $2.4/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'instruction-following', 'ultra-large'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3-instruct-8b',
        inputPrice: 0.3, // $0.0003/1K tokens = $0.3/1K tokens
        outputPrice: 0.6, // $0.0006/1K tokens = $0.6/1K tokens
        contextWindow: 8192,
        capabilities: ['text', 'instruction-following'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-3-instruct-70b',
        inputPrice: 2.65, // $0.00265/1K tokens = $2.65/1K tokens
        outputPrice: 3.5, // $0.0035/1K tokens = $3.5/1K tokens
        contextWindow: 8192,
        capabilities: ['text', 'instruction-following', 'large-scale'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-2-chat-13b',
        inputPrice: 0.75, // $0.00075/1K tokens = $0.75/1K tokens
        outputPrice: 1.0, // $0.001/1K tokens = $1.0/1K tokens
        contextWindow: 4096,
        capabilities: ['text', 'chat', 'conversation'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'AWS Bedrock',
        model: 'llama-2-chat-70b',
        inputPrice: 1.95, // $0.00195/1K tokens = $1.95/1K tokens
        outputPrice: 2.56, // $0.00256/1K tokens = $2.56/1K tokens
        contextWindow: 4096,
        capabilities: ['text', 'chat', 'conversation', 'large-scale'],
        category: 'text',
        isLatest: false
    },

    // Mistral AI on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'pixtral-large-25.02',
        inputPrice: 2.0, // $0.002/1K tokens = $2.0/1K tokens
        outputPrice: 6.0, // $0.006/1K tokens = $6.0/1K tokens
        contextWindow: 128000,
        capabilities: ['vision', 'multimodal', 'large-scale'],
        category: 'multimodal',
        isLatest: true
    },

    // Stability AI on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'stable-diffusion-3.5-large',
        inputPrice: 80.0, // $0.08 per image = $80/1K images
        outputPrice: 80.0, // Same for image generation
        contextWindow: 4096,
        capabilities: ['image-generation', 'high-quality'],
        category: 'image-generation',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'stable-image-core',
        inputPrice: 40.0, // $0.04 per image = $40/1K images
        outputPrice: 40.0, // Same for image generation
        contextWindow: 4096,
        capabilities: ['image-generation', 'core'],
        category: 'image-generation',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'stable-diffusion-3-large',
        inputPrice: 80.0, // $0.08 per image = $80/1K images
        outputPrice: 80.0, // Same for image generation
        contextWindow: 4096,
        capabilities: ['image-generation', 'large-scale'],
        category: 'image-generation',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'stable-image-ultra',
        inputPrice: 140.0, // $0.14 per image = $140/1K images
        outputPrice: 140.0, // Same for image generation
        contextWindow: 4096,
        capabilities: ['image-generation', 'ultra-quality'],
        category: 'image-generation',
        isLatest: true
    },

    // Writer on Bedrock
    {
        provider: 'AWS Bedrock',
        model: 'palmyra-x4',
        inputPrice: 2.5, // $0.0025/1K tokens = $2.5/1K tokens
        outputPrice: 10.0, // $0.010/1K tokens = $10.0/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'writing', 'enterprise'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'AWS Bedrock',
        model: 'palmyra-x5',
        inputPrice: 0.6, // $0.0006/1K tokens = $0.6/1K tokens
        outputPrice: 6.0, // $0.006/1K tokens = $6.0/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'writing', 'advanced'],
        category: 'text',
        isLatest: true
    },

    // Legacy AWS Bedrock model (keeping for compatibility)
    {
        provider: 'AWS Bedrock',
        model: 'cohere.command-light-text-v14',
        inputPrice: 0.3,
        outputPrice: 0.6,
        contextWindow: 4096,
        capabilities: ['text'],
        category: 'text',
        isLatest: false
    }
];

// Enhanced tokenization estimation for different providers
export function estimateTokens(text: string, provider: string = 'OpenAI'): number {
    if (!text || typeof text !== 'string') return 0;

    const baseTokens = text.length / 4; // Base estimation

    // Provider-specific adjustments based on tokenizer differences
    switch (provider.toLowerCase()) {
        case 'openai':
            // OpenAI's tokenizer (GPT models)
            return Math.ceil(baseTokens * 1.0);

        case 'anthropic':
            // Claude models tend to have slightly more tokens
            return Math.ceil(baseTokens * 1.1);

        case 'google ai':
        case 'google':
            // Gemini models
            return Math.ceil(baseTokens * 0.95);

        case 'deepseek':
            // DeepSeek tokenization similar to OpenAI
            return Math.ceil(baseTokens * 1.0);

        case 'mistral ai':
        case 'mistral':
            // Mistral models
            return Math.ceil(baseTokens * 1.05);

        case 'xai':
            // xAI Grok models (similar to OpenAI)
            return Math.ceil(baseTokens * 1.0);

        case 'cohere':
            // Cohere models
            return Math.ceil(baseTokens * 1.1);

        case 'groq':
            // Groq (Llama models)
            return Math.ceil(baseTokens * 1.0);

        case 'aws bedrock':
            // Bedrock varies by underlying model
            return Math.ceil(baseTokens * 1.05);

        default:
            return Math.ceil(baseTokens);
    }
}

// Enhanced cost calculation with improved fallbacks
export function calculateCost(
    inputTokens: number,
    outputTokens: number,
    provider: string,
    model: string
): number {
    // Find exact model match first
    let pricing = PRICING_DATA.find(p =>
        p.provider.toLowerCase() === provider.toLowerCase() &&
        p.model.toLowerCase() === model.toLowerCase()
    );

    if (!pricing) {
        // Try partial model name matching with better fallbacks
        pricing = PRICING_DATA.find(p =>
            p.provider.toLowerCase() === provider.toLowerCase() &&
            (p.model.toLowerCase().includes(model.toLowerCase()) ||
                model.toLowerCase().includes(p.model.toLowerCase()))
        );
    }

    if (!pricing) {
        // Provider-specific fallbacks to latest models
        const providerModels = PRICING_DATA.filter(p =>
            p.provider.toLowerCase() === provider.toLowerCase()
        );

        if (providerModels.length > 0) {
            // Use the latest model as fallback
            pricing = providerModels.find(p => p.isLatest) || providerModels[0];
        }
    }

    if (!pricing) {
        // Ultimate fallbacks by model name patterns
        if (model.toLowerCase().includes('grok-4')) {
            pricing = PRICING_DATA.find(p => p.model === 'grok-4-0709');
        } else if (model.toLowerCase().includes('grok-3')) {
            pricing = PRICING_DATA.find(p => p.model === 'grok-3');
        } else if (model.toLowerCase().includes('grok-2')) {
            pricing = PRICING_DATA.find(p => p.model === 'grok-2-1212us-east-1');
        } else if (model.toLowerCase().includes('grok')) {
            pricing = PRICING_DATA.find(p => p.model.startsWith('grok'));
        } else if (model.toLowerCase().includes('gpt-4o')) {
            pricing = PRICING_DATA.find(p => p.model === 'gpt-4o');
        } else if (model.toLowerCase().includes('gpt-4')) {
            pricing = PRICING_DATA.find(p => p.model === 'gpt-4');
        } else if (model.toLowerCase().includes('claude-3.5')) {
            pricing = PRICING_DATA.find(p => p.model === 'claude-3-5-sonnet-20241022');
        } else if (model.toLowerCase().includes('claude-3')) {
            pricing = PRICING_DATA.find(p => p.model === 'claude-3-haiku-20240307');
        } else if (model.toLowerCase().includes('gemini-2.5-pro')) {
            pricing = PRICING_DATA.find(p => p.model === 'gemini-2.5-pro');
        } else if (model.toLowerCase().includes('gemini-2.5-flash')) {
            pricing = PRICING_DATA.find(p => p.model === 'gemini-2.5-flash');
        } else if (model.toLowerCase().includes('gemini-2.0-flash')) {
            pricing = PRICING_DATA.find(p => p.model === 'gemini-2.0-flash');
        } else if (model.toLowerCase().includes('gemini-1.5-flash')) {
            pricing = PRICING_DATA.find(p => p.model === 'gemini-1.5-flash');
        } else if (model.toLowerCase().includes('gemini-1.5-pro')) {
            pricing = PRICING_DATA.find(p => p.model === 'gemini-1.5-pro');
        } else if (model.toLowerCase().includes('gemini')) {
            pricing = PRICING_DATA.find(p => p.model.startsWith('gemini'));
        } else if (model.toLowerCase().includes('deepseek-chat')) {
            pricing = PRICING_DATA.find(p => p.model === 'deepseek-chat');
        } else if (model.toLowerCase().includes('deepseek-reasoner')) {
            pricing = PRICING_DATA.find(p => p.model === 'deepseek-reasoner');
        } else if (model.toLowerCase().includes('deepseek')) {
            pricing = PRICING_DATA.find(p => p.model.startsWith('deepseek'));
        } else if (model.toLowerCase().includes('mistral-medium')) {
            pricing = PRICING_DATA.find(p => p.model === 'mistral-medium-latest');
        } else if (model.toLowerCase().includes('mistral-large')) {
            pricing = PRICING_DATA.find(p => p.model === 'mistral-large-latest');
        } else if (model.toLowerCase().includes('mistral-small')) {
            pricing = PRICING_DATA.find(p => p.model === 'mistral-small-latest');
        } else if (model.toLowerCase().includes('codestral')) {
            pricing = PRICING_DATA.find(p => p.model === 'codestral-latest');
        } else if (model.toLowerCase().includes('pixtral')) {
            pricing = PRICING_DATA.find(p => p.model.includes('pixtral'));
        } else if (model.toLowerCase().includes('mistral')) {
            pricing = PRICING_DATA.find(p => p.model.startsWith('mistral'));
        } else if (model.toLowerCase().includes('command-a')) {
            pricing = PRICING_DATA.find(p => p.model === 'command-a');
        } else if (model.toLowerCase().includes('command-r-plus')) {
            pricing = PRICING_DATA.find(p => p.model === 'command-r-plus');
        } else if (model.toLowerCase().includes('command-r7b')) {
            pricing = PRICING_DATA.find(p => p.model === 'command-r7b');
        } else if (model.toLowerCase().includes('command-r')) {
            pricing = PRICING_DATA.find(p => p.model === 'command-r');
        } else if (model.toLowerCase().includes('command')) {
            pricing = PRICING_DATA.find(p => p.model.startsWith('command'));
        } else if (model.toLowerCase().includes('rerank')) {
            pricing = PRICING_DATA.find(p => p.model.includes('rerank'));
        } else if (model.toLowerCase().includes('embed')) {
            pricing = PRICING_DATA.find(p => p.model.includes('embed'));
        } else if (model.toLowerCase().includes('llama')) {
            pricing = PRICING_DATA.find(p => p.model.includes('llama'));
        } else if (model.toLowerCase().includes('nova')) {
            pricing = PRICING_DATA.find(p => p.model.includes('nova'));
        } else if (model.toLowerCase().includes('titan')) {
            pricing = PRICING_DATA.find(p => p.model.includes('titan'));
        } else if (model.toLowerCase().includes('jamba')) {
            pricing = PRICING_DATA.find(p => p.model.includes('jamba'));
        }
    }

    if (!pricing) {
        console.warn(`No pricing data found for ${provider}/${model}. Using default rates.`);
        // Default fallback pricing (approximate middle-tier)
        pricing = {
            provider: 'Unknown',
            model: 'unknown',
            inputPrice: 1.0,
            outputPrice: 3.0
        };
    }

    // Calculate costs (pricing is per 1K tokens)
    const inputCost = (inputTokens / 1000) * pricing.inputPrice;
    const outputCost = (outputTokens / 1000) * pricing.outputPrice;

    return inputCost + outputCost;
}

// Get available providers
export function getProviders(): string[] {
    return Array.from(new Set(PRICING_DATA.map(p => p.provider))).sort();
}

// Get models for a specific provider
export function getModelsForProvider(provider: string): ModelPricing[] {
    return PRICING_DATA.filter(p =>
        p.provider.toLowerCase() === provider.toLowerCase()
    ).sort((a, b) => {
        // Sort latest models first, then by name
        if (a.isLatest && !b.isLatest) return -1;
        if (!a.isLatest && b.isLatest) return 1;
        return a.model.localeCompare(b.model);
    });
}

// Get the cheapest model for a provider
export function getCheapestModel(provider: string): ModelPricing | null {
    const models = getModelsForProvider(provider);
    if (models.length === 0) return null;

    return models.reduce((cheapest, current) => {
        const cheapestTotal = cheapest.inputPrice + cheapest.outputPrice;
        const currentTotal = current.inputPrice + current.outputPrice;
        return currentTotal < cheapestTotal ? current : cheapest;
    });
}

// Get models by category
export function getModelsByCategory(category: string): ModelPricing[] {
    return PRICING_DATA.filter(p =>
        p.category?.toLowerCase() === category.toLowerCase()
    ).sort((a, b) => {
        // Sort by cost (total input + output price)
        const aTotal = a.inputPrice + a.outputPrice;
        const bTotal = b.inputPrice + b.outputPrice;
        return aTotal - bTotal;
    });
}

// Compare model costs for a given usage
export function compareModelCosts(
    inputTokens: number,
    outputTokens: number,
    providers?: string[]
): Array<{
    provider: string;
    model: string;
    cost: number;
    costPer1kTokens: number;
    isLatest: boolean;
}> {
    let modelsToCompare = PRICING_DATA;

    if (providers && providers.length > 0) {
        modelsToCompare = PRICING_DATA.filter(p =>
            providers.some(provider =>
                p.provider.toLowerCase() === provider.toLowerCase()
            )
        );
    }

    return modelsToCompare.map(pricing => ({
        provider: pricing.provider,
        model: pricing.model,
        cost: calculateCost(inputTokens, outputTokens, pricing.provider, pricing.model),
        costPer1kTokens: pricing.inputPrice + pricing.outputPrice,
        isLatest: pricing.isLatest || false
    })).sort((a, b) => a.cost - b.cost);
}

// Export metadata
export const PRICING_METADATA = {
    lastUpdated: new Date().toISOString(),
    source: 'WebScraperService - July 2025',
    totalProviders: getProviders().length,
    totalModels: PRICING_DATA.length,
    dataFormat: 'per_1k_tokens',
    features: [
        'Latest 2025 pricing',
        'AWS Bedrock comprehensive model coverage',
        'Amazon Nova models (Micro, Lite, Pro, Premier, Canvas, Reel, Sonic)',
        'Amazon Titan embeddings',
        'Anthropic Claude 4 and Claude 3.7 on Bedrock',
        'AI21 Labs Jamba 1.5 models',
        'Meta Llama 4, 3.3, 3.2, 3.1, 3, and 2 models',
        'Cohere Command and embedding models on Bedrock',
        'DeepSeek R1 reasoning model',
        'Mistral Pixtral Large vision model',
        'Stability AI image generation models',
        'Luma AI video generation models',
        'Writer Palmyra models',
        'Cohere AI models (Command A, Command R+, Command R, Command R7B)',
        'Cohere embedding and rerank models (Embed 4, Rerank 3.5)',
        'Cohere fine-tuned model support',
        'xAI Grok models (Grok-4, Grok-3, Grok-2 with regional variants)',
        'Grok reasoning models with function calling and structured outputs',
        'Grok image generation models',
        'DeepSeek ultra-low cost models with off-peak pricing',
        'DeepSeek reasoning models with CoT capabilities',
        'DeepSeek context caching support',
        'Complete Mistral AI lineup (Premier & Open models)',
        'Mistral reasoning models (Magistral)',
        'Mistral coding models (Codestral, Devstral)',
        'Mistral vision models (Pixtral)',
        'Mistral edge models (Ministral)',
        'Mistral embedding and moderation models',
        'Reasoning models (o3, o4-mini)',
        'New GPT-4.1 and GPT-4.5 models',
        'Google Gemini 2.5/2.0/1.5/Flash/Pro/Audio/Preview/Native TTS',
        'Groq fast inference',
        'Enhanced tokenization estimation',
        'Improved model matching',
        'Provider-specific fallbacks'
    ]
}; 
