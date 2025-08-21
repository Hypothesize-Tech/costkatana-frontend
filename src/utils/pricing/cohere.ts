import { ModelPricing } from "../cost";

export const COHERE_PRICING: ModelPricing[] = [
  {
    provider: "Cohere",
    model: "command-a-03-2025",
    inputPrice: 2.5, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "agentic", "multilingual", "human-evaluations"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r7b-12-2024",
    inputPrice: 0.0375, // $0.0375/1M tokens = $0.0000375/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "rag", "tool-use", "agents"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-a-reasoning-08-2025",
    inputPrice: 2.5, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "reasoning", "agentic", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-a-vision-07-2025",
    inputPrice: 2.5, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal", "enterprise"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r-plus-04-2024",
    inputPrice: 2.5, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "enterprise", "rag", "tools", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r-08-2024",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "rag", "tools", "agents"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r-03-2024",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "rag", "tools", "agents"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Cohere",
    model: "command",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "conversational"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Cohere",
    model: "command-nightly",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "experimental", "nightly"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Cohere",
    model: "command-light",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "lightweight", "fast"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Cohere",
    model: "command-light-nightly",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "lightweight", "experimental", "nightly"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Cohere",
    model: "rerank-v3.5",
    inputPrice: 2.0, // $2.00/1K searches
    outputPrice: 2.0, // Same for rerank models
    contextWindow: 4096,
    capabilities: ["rerank", "semantic-search", "search-quality-boost"],
    category: "rerank",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "rerank-english-v3.0",
    inputPrice: 2.0, // $2.00/1K searches
    outputPrice: 2.0, // Same for rerank models
    contextWindow: 4096,
    capabilities: ["rerank", "semantic-search", "english"],
    category: "rerank",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "rerank-multilingual-v3.0",
    inputPrice: 2.0, // $2.00/1K searches
    outputPrice: 2.0, // Same for rerank models
    contextWindow: 4096,
    capabilities: ["rerank", "semantic-search", "multilingual"],
    category: "rerank",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-v4.0",
    inputPrice: 0.12, // $0.12/1M tokens = $0.00012/1K tokens
    outputPrice: 0.12, // Same for embedding models
    contextWindow: 128000,
    capabilities: ["embedding", "multimodal", "semantic-search", "rag"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-english-v3.0",
    inputPrice: 0.10, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.10, // Same for embedding models
    contextWindow: 512,
    capabilities: ["embedding", "english"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-english-light-v3.0",
    inputPrice: 0.10, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.10, // Same for embedding models
    contextWindow: 512,
    capabilities: ["embedding", "english", "lightweight"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-multilingual-v3.0",
    inputPrice: 0.10, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.10, // Same for embedding models
    contextWindow: 512,
    capabilities: ["embedding", "multilingual"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-multilingual-light-v3.0",
    inputPrice: 0.10, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.10, // Same for embedding models
    contextWindow: 512,
    capabilities: ["embedding", "multilingual", "lightweight"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "c4ai-aya-expanse-8b",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "multilingual", "23-languages"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "c4ai-aya-expanse-32b",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "23-languages"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "c4ai-aya-vision-8b",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 16384,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "c4ai-aya-vision-32b",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 16384,
    capabilities: ["text", "vision", "multimodal", "multilingual", "23-languages"],
    category: "multimodal",
    isLatest: true,
  },
];
