import { ModelPricing } from '../cost';

export const MISTRAL_PRICING: ModelPricing[] = [
    // Premier Models
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
        inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
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
        contextWindow: 32000,
        capabilities: ['code', 'programming', 'multilingual-code'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'devstral-medium-2507',
        inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
        outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
        contextWindow: 128000,
        capabilities: ['code', 'agents', 'advanced-coding'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-ocr-latest',
        inputPrice: 1.0, // $1/1000 pages
        outputPrice: 3.0, // $3/1000 pages
        contextWindow: 0,
        capabilities: ['ocr', 'document-understanding', 'annotations'],
        category: 'document',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-saba-latest',
        inputPrice: 0.2, // $0.2/1M tokens = $0.0002/1K tokens
        outputPrice: 0.6, // $0.6/1M tokens = $0.0006/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'custom-trained', 'regional'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-large-latest',
        inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
        outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'reasoning', 'complex-tasks'],
        category: 'text',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'pixtral-large-latest',
        inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
        outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
        contextWindow: 128000,
        capabilities: ['vision', 'multimodal', 'reasoning'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'ministral-8b-latest',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'edge', 'on-device'],
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
        outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        contextWindow: 8192,
        capabilities: ['embedding', 'code'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-embed',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        contextWindow: 8192,
        capabilities: ['embedding', 'text'],
        category: 'embedding',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-moderation-latest',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        contextWindow: 32000,
        capabilities: ['moderation', 'classification'],
        category: 'moderation',
        isLatest: true
    },
    // Open Models
    {
        provider: 'Mistral AI',
        model: 'mistral-small-latest',
        inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
        outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'multimodal', 'multilingual', 'open-source'],
        category: 'multimodal',
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
        capabilities: ['vision', 'multimodal', 'small'],
        category: 'multimodal',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'mistral-nemo',
        inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
        contextWindow: 128000,
        capabilities: ['text', 'code', 'specialized'],
        category: 'code',
        isLatest: true
    },
    {
        provider: 'Mistral AI',
        model: 'open-mistral-7b',
        inputPrice: 0.25, // $0.25/1M tokens = $0.00025/1K tokens
        outputPrice: 0.25, // $0.25/1M tokens = $0.00025/1K tokens
        contextWindow: 32000,
        capabilities: ['text', 'open-source', 'fast'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Mistral AI',
        model: 'open-mixtral-8x7b',
        inputPrice: 0.7, // $0.7/1M tokens = $0.0007/1K tokens
        outputPrice: 0.7, // $0.7/1M tokens = $0.0007/1K tokens
        contextWindow: 32000,
        capabilities: ['text', 'mixture-of-experts', 'open-source'],
        category: 'text',
        isLatest: false
    },
    {
        provider: 'Mistral AI',
        model: 'open-mixtral-8x22b',
        inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
        outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
        contextWindow: 65000,
        capabilities: ['text', 'mixture-of-experts', 'open-source', 'high-performance'],
        category: 'text',
        isLatest: false
    }
]; 