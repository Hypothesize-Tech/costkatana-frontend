import { ModelPricing } from "../cost";

export const COHERE_PRICING: ModelPricing[] = [
  {
    provider: "Cohere",
    model: "command-a",
    inputPrice: 2.5, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "agentic-ai", "multilingual", "human-evaluations"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r-plus",
    inputPrice: 2.5, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "enterprise", "scalable", "real-world-use-cases"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r",
    inputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "rag", "long-context", "external-apis", "tools"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r-fine-tuned",
    inputPrice: 0.3, // $0.30/1M tokens = $0.0003/1K tokens
    outputPrice: 1.2, // $1.20/1M tokens = $0.0012/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "fine-tuned", "custom"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "command-r7b",
    inputPrice: 0.0375, // $0.0375/1M tokens = $0.0000375/1K tokens
    outputPrice: 0.15, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "speed", "efficiency", "quality"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "rerank-3.5",
    inputPrice: 2.0, // $2.00/1K searches
    outputPrice: 2.0, // Same for rerank models
    contextWindow: 4096,
    capabilities: ["rerank", "semantic-search", "search-quality-boost"],
    category: "rerank",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-4",
    inputPrice: 0.12, // $0.12/1M tokens = $0.00012/1K tokens
    outputPrice: 0.12, // Same for embedding models
    contextWindow: 8192,
    capabilities: ["embedding", "multimodal", "semantic-search", "rag"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Cohere",
    model: "embed-4-image",
    inputPrice: 0.47, // $0.47/1M image tokens = $0.00047/1K tokens
    outputPrice: 0.47, // Same for image embedding models
    contextWindow: 8192,
    capabilities: ["embedding", "image", "multimodal"],
    category: "embedding",
    isLatest: true,
  },
];
