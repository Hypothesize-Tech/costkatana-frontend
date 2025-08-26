import { ModelPricing } from "../cost";

export const GROK_PRICING: ModelPricing[] = [
  {
    provider: "xAI",
    model: "grok-4-0709",
    inputPrice: 3.0, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 15.0, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 256000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "function-calling",
      "structured-outputs",
    ],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-3",
    inputPrice: 3.0, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 15.0, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 131072,
    capabilities: [
      "text",
      "vision",
      "function-calling",
      "structured-outputs",
    ],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-3-mini",
    inputPrice: 0.3, // $0.30/1M tokens = $0.0003/1K tokens
    outputPrice: 0.5, // $0.50/1M tokens = $0.0005/1K tokens
    contextWindow: 131072,
    capabilities: [
      "text",
      "vision",
      "function-calling",
      "structured-outputs",
    ],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-2-image-1212",
    inputPrice: 0.07, // $0.07 per image output
    outputPrice: 0.07, // Same for image generation models
    contextWindow: 4096,
    capabilities: ["text", "image-generation"],
    category: "image-generation",
    isLatest: true,
  },
];
