import { ModelPricing } from '../cost';

export const OPENAI_PRICING: ModelPricing[] = [
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
    }
]; 