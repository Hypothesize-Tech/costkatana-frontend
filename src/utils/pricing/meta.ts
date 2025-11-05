import { ModelPricing } from "../cost";

export const META_PRICING: ModelPricing[] = [
  // === Llama 4 Series (Latest) ===
  {
    provider: "Meta",
    model: "llama-4-scout",
    inputPrice: 0.00019, // $0.19/1M tokens = $0.00019/1K tokens
    outputPrice: 0.00049, // $0.49/1M tokens = $0.00049/1K tokens
    contextWindow: 10000000,
    capabilities: ["text", "vision", "multimodal", "long-context", "multilingual", "image-grounding"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-4-maverick",
    inputPrice: 0.00019, // $0.19/1M tokens = $0.00019/1K tokens
    outputPrice: 0.00049, // $0.49/1M tokens = $0.00049/1K tokens
    contextWindow: 10000000,
    capabilities: ["text", "vision", "multimodal", "long-context", "multilingual", "image-grounding", "fast-responses"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-4-behemoth-preview",
    inputPrice: 0.00019, // $0.19/1M tokens = $0.00019/1K tokens
    outputPrice: 0.00049, // $0.49/1M tokens = $0.00049/1K tokens
    contextWindow: 10000000,
    capabilities: ["text", "vision", "multimodal", "long-context", "multilingual", "image-grounding", "teacher-model"],
    category: "multimodal",
    isLatest: true,
  },

  // === Llama 3.3 Series ===
  {
    provider: "Meta",
    model: "llama-3.3-70b",
    inputPrice: 0.00059, // $0.59/1M tokens = $0.00059/1K tokens
    outputPrice: 0.00079, // $0.79/1M tokens = $0.00079/1K tokens
    contextWindow: 131072,
    capabilities: ["text", "multilingual", "open-source"],
    category: "text",
    isLatest: true,
  },

  // === Llama 3.2 Series ===
  {
    provider: "Meta",
    model: "llama-3.2-11b",
    inputPrice: 0.00016, // $0.16/1M tokens = $0.00016/1K tokens
    outputPrice: 0.00016, // $0.16/1M tokens = $0.00016/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal", "open-source"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-3.2-90b",
    inputPrice: 0.00072, // $0.72/1M tokens = $0.00072/1K tokens
    outputPrice: 0.00072, // $0.72/1M tokens = $0.00072/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal", "open-source"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-3.2-3b",
    inputPrice: 0.00005, // $0.05/1M tokens = $0.00005/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "lightweight", "mobile", "edge", "open-source"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-3.2-1b",
    inputPrice: 0.00005, // $0.05/1M tokens = $0.00005/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "lightweight", "mobile", "edge", "open-source"],
    category: "text",
    isLatest: true,
  },

  // === Llama 3.1 Series ===
  {
    provider: "Meta",
    model: "llama-3.1-405b",
    inputPrice: 0.0, // Open source - pricing varies by provider
    outputPrice: 0.0,
    contextWindow: 131072,
    capabilities: ["text", "multilingual", "open-source"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Meta",
    model: "llama-3.1-8b",
    inputPrice: 0.00005, // $0.05/1M tokens = $0.00005/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 131072,
    capabilities: ["text", "multilingual", "open-source"],
    category: "text",
    isLatest: false,
  },

  // === Llama 3 Series (Legacy) ===
  {
    provider: "Meta",
    model: "llama-3-70b",
    inputPrice: 0.00059, // $0.59/1M tokens = $0.00059/1K tokens
    outputPrice: 0.00079, // $0.79/1M tokens = $0.00079/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "open-source"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Meta",
    model: "llama-3-8b",
    inputPrice: 0.00005, // $0.05/1M tokens = $0.00005/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "open-source"],
    category: "text",
    isLatest: false,
  },
];
