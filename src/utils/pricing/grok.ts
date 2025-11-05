import { ModelPricing } from "../cost";

export const GROK_PRICING: ModelPricing[] = [
  // === Grok 4 Fast Series (Latest) ===
  {
    provider: "xAI",
    model: "grok-4-fast-reasoning",
    inputPrice: 0.0002, // $0.20/1M tokens = $0.0002/1K tokens
    outputPrice: 0.0005, // $0.50/1M tokens = $0.0005/1K tokens
    contextWindow: 2000000,
    capabilities: ["text", "reasoning", "function-calling", "structured-outputs"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-4-fast-non-reasoning",
    inputPrice: 0.0002, // $0.20/1M tokens = $0.0002/1K tokens
    outputPrice: 0.0005, // $0.50/1M tokens = $0.0005/1K tokens
    contextWindow: 2000000,
    capabilities: ["text", "function-calling", "structured-outputs"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-code-fast-1",
    inputPrice: 0.0002, // $0.20/1M tokens = $0.0002/1K tokens
    outputPrice: 0.0015, // $1.50/1M tokens = $0.0015/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "coding", "function-calling", "structured-outputs"],
    category: "code",
    isLatest: true,
  },

  // === Grok 4 Series ===
  {
    provider: "xAI",
    model: "grok-4-0709",
    inputPrice: 0.003, // $3.0/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.0/1M tokens = $0.015/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "reasoning", "function-calling", "structured-outputs"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-4",
    inputPrice: 0.003, // $3.0/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.0/1M tokens = $0.015/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "reasoning", "function-calling", "structured-outputs"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-4-latest",
    inputPrice: 0.003, // $3.0/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.0/1M tokens = $0.015/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "reasoning", "function-calling", "structured-outputs"],
    category: "text",
    isLatest: true,
  },

  // === Grok 3 Series ===
  {
    provider: "xAI",
    model: "grok-3",
    inputPrice: 0.003, // $3.0/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.0/1M tokens = $0.015/1K tokens
    contextWindow: 131072,
    capabilities: ["text", "vision", "function-calling", "structured-outputs"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-3-mini",
    inputPrice: 0.0003, // $0.3/1M tokens = $0.0003/1K tokens
    outputPrice: 0.0005, // $0.5/1M tokens = $0.0005/1K tokens
    contextWindow: 131072,
    capabilities: ["text", "vision", "function-calling", "structured-outputs"],
    category: "multimodal",
    isLatest: false,
  },

  // === Grok 2 Vision Series ===
  {
    provider: "xAI",
    model: "grok-2-vision-1212",
    inputPrice: 0.002, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 0.01, // $10.0/1M tokens = $0.01/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "image-understanding"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-2-vision-1212-us-east-1",
    inputPrice: 0.002, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 0.01, // $10.0/1M tokens = $0.01/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "image-understanding"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-2-vision-1212-eu-west-1",
    inputPrice: 0.002, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 0.01, // $10.0/1M tokens = $0.01/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "image-understanding"],
    category: "multimodal",
    isLatest: false,
  },

  // === Grok 2 Image Generation ===
  {
    provider: "xAI",
    model: "grok-2-image-1212",
    inputPrice: 0.07, // Note: Price per request, not per 1K tokens
    outputPrice: 0.07, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-2-image",
    inputPrice: 0.07, // Note: Price per request, not per 1K tokens
    outputPrice: 0.07, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-2-image-latest",
    inputPrice: 0.07, // Note: Price per request, not per 1K tokens
    outputPrice: 0.07, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation"],
    category: "image",
    isLatest: true,
  },
];
