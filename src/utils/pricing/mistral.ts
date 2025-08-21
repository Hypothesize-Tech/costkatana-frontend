import { ModelPricing } from "../cost";

export const MISTRAL_PRICING: ModelPricing[] = [
  // Premier Models
  {
    provider: "Mistral AI",
    model: "mistral-medium-2508",
    inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
    outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multimodal", "vision", "analysis", "reasoning", "enterprise"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-medium-latest",
    inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
    outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multimodal", "vision", "analysis", "reasoning", "enterprise"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "magistral-medium-2507",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 5.0, // $5/1M tokens = $0.005/1K tokens
    contextWindow: 40000,
    capabilities: ["text", "reasoning", "thinking", "domain-specific", "multilingual"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "magistral-medium-latest",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 5.0, // $5/1M tokens = $0.005/1K tokens
    contextWindow: 40000,
    capabilities: ["text", "reasoning", "thinking", "domain-specific", "multilingual"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "codestral-2508",
    inputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    outputPrice: 0.9, // $0.9/1M tokens = $0.0009/1K tokens
    contextWindow: 256000,
    capabilities: ["code", "programming", "multilingual-code", "fill-in-middle", "code-correction", "test-generation"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "codestral-latest",
    inputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    outputPrice: 0.9, // $0.9/1M tokens = $0.0009/1K tokens
    contextWindow: 256000,
    capabilities: ["code", "programming", "multilingual-code", "fill-in-middle", "code-correction", "test-generation"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "voxtral-mini-2507",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 0,
    capabilities: ["audio", "transcription", "efficient"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "voxtral-mini-latest",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 0,
    capabilities: ["audio", "transcription", "efficient"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "devstral-medium-2507",
    inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
    outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "agents", "advanced-coding", "codebase-exploration", "multi-file-editing"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "devstral-medium-latest",
    inputPrice: 0.4, // $0.4/1M tokens = $0.0004/1K tokens
    outputPrice: 2.0, // $2/1M tokens = $0.002/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "agents", "advanced-coding", "codebase-exploration", "multi-file-editing"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-ocr-2505",
    inputPrice: 1.0, // $1/1000 pages
    outputPrice: 3.0, // $3/1000 pages
    contextWindow: 0,
    capabilities: ["ocr", "document-understanding", "annotations", "text-extraction"],
    category: "document",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-ocr-latest",
    inputPrice: 1.0, // $1/1000 pages
    outputPrice: 3.0, // $3/1000 pages
    contextWindow: 0,
    capabilities: ["ocr", "document-understanding", "annotations", "text-extraction"],
    category: "document",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-large-2411",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "complex-tasks", "high-complexity"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-large-latest",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "complex-tasks", "high-complexity"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "pixtral-large-2411",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
    contextWindow: 128000,
    capabilities: ["vision", "multimodal", "reasoning", "frontier-class"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "pixtral-large-latest",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
    contextWindow: 128000,
    capabilities: ["vision", "multimodal", "reasoning", "frontier-class"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-small-2407",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 32000,
    capabilities: ["text", "multimodal", "multilingual", "open-source"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "mistral-embed",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 8192,
    capabilities: ["embedding", "text", "semantic"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "codestral-embed-2505",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 8192,
    capabilities: ["embedding", "code", "semantic"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-moderation-2411",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 32000,
    capabilities: ["moderation", "classification", "harmful-content-detection"],
    category: "moderation",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-moderation-latest",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 32000,
    capabilities: ["moderation", "classification", "harmful-content-detection"],
    category: "moderation",
    isLatest: true,
  },
  
  // Open Models
  {
    provider: "Mistral AI",
    model: "magistral-small-2507",
    inputPrice: 0.5, // $0.5/1M tokens = $0.0005/1K tokens
    outputPrice: 1.5, // $1.5/1M tokens = $0.0015/1K tokens
    contextWindow: 40000,
    capabilities: ["text", "reasoning", "thinking", "domain-specific", "multilingual"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "magistral-small-latest",
    inputPrice: 0.5, // $0.5/1M tokens = $0.0005/1K tokens
    outputPrice: 1.5, // $1.5/1M tokens = $0.0015/1K tokens
    contextWindow: 40000,
    capabilities: ["text", "reasoning", "thinking", "domain-specific", "multilingual"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "voxtral-small-2507",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 32000,
    capabilities: ["audio", "instruct", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "voxtral-small-latest",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 32000,
    capabilities: ["audio", "instruct", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "voxtral-mini-2507",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 32000,
    capabilities: ["audio", "instruct", "mini"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "voxtral-mini-latest",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    contextWindow: 32000,
    capabilities: ["audio", "instruct", "mini"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-small-2506",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multimodal", "multilingual", "open-source"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-small-latest",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multimodal", "multilingual", "open-source"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "magistral-small-2506",
    inputPrice: 0.5, // $0.5/1M tokens = $0.0005/1K tokens
    outputPrice: 1.5, // $1.5/1M tokens = $0.0015/1K tokens
    contextWindow: 40000,
    capabilities: ["text", "reasoning", "thinking", "domain-specific", "multilingual"],
    category: "reasoning",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "devstral-small-2507",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "agents", "open-source", "codebase-exploration", "multi-file-editing"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "devstral-small-latest",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "agents", "open-source", "codebase-exploration", "multi-file-editing"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-small-2503",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multimodal", "multilingual", "open-source", "image-understanding"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "mistral-small-2501",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 32000,
    capabilities: ["text", "multimodal", "multilingual", "open-source"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "devstral-small-2505",
    inputPrice: 0.1, // $0.1/1M tokens = $0.0001/1K tokens
    outputPrice: 0.3, // $0.3/1M tokens = $0.0003/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "agents", "open-source", "24b-parameter"],
    category: "code",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "pixtral-12b-2409",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["vision", "multimodal", "small", "image-understanding"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "pixtral-12b",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["vision", "multimodal", "small", "image-understanding"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "open-mistral-nemo-2407",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "open-source", "best-multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "open-mistral-nemo",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "open-source", "best-multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "mistral-nemo",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "code", "specialized"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "Mistral AI",
    model: "open-mistral-7b",
    inputPrice: 0.25, // $0.25/1M tokens = $0.00025/1K tokens
    outputPrice: 0.25, // $0.25/1M tokens = $0.00025/1K tokens
    contextWindow: 32000,
    capabilities: ["text", "open-source", "fast"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "open-mixtral-8x7b",
    inputPrice: 0.7, // $0.7/1M tokens = $0.0007/1K tokens
    outputPrice: 0.7, // $0.7/1M tokens = $0.0007/1K tokens
    contextWindow: 32000,
    capabilities: ["text", "mixture-of-experts", "open-source"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Mistral AI",
    model: "open-mixtral-8x22b",
    inputPrice: 2.0, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 6.0, // $6/1M tokens = $0.006/1K tokens
    contextWindow: 65000,
    capabilities: [
      "text",
      "mixture-of-experts",
      "open-source",
      "high-performance",
    ],
    category: "text",
    isLatest: false,
  },
];
