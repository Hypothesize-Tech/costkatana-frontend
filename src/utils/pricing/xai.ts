import { ModelPricing } from "../cost";

export const XAI_PRICING: ModelPricing[] = [
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
    category: "reasoning",
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
      "reasoning",
      "function-calling",
      "structured-outputs",
    ],
    category: "reasoning",
    isLatest: true,
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
      "reasoning",
      "function-calling",
      "structured-outputs",
    ],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-3-fast",
    inputPrice: 5.0, // $5.00/1M tokens = $0.005/1K tokens
    outputPrice: 25.0, // $25.00/1M tokens = $0.025/1K tokens
    contextWindow: 131072,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "function-calling",
      "structured-outputs",
      "fast-inference",
    ],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-3-mini-fast",
    inputPrice: 0.6, // $0.60/1M tokens = $0.0006/1K tokens
    outputPrice: 4.0, // $4.00/1M tokens = $0.004/1K tokens
    contextWindow: 131072,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "function-calling",
      "structured-outputs",
      "fast-inference",
    ],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "xAI",
    model: "grok-2-1212us-east-1",
    inputPrice: 2.0, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 131072,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "function-calling",
      "structured-outputs",
    ],
    category: "reasoning",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-2-vision-1212us-east-1",
    inputPrice: 2.0, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "multimodal", "reasoning"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-2-1212eu-west-1",
    inputPrice: 2.0, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 131072,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "function-calling",
      "structured-outputs",
    ],
    category: "reasoning",
    isLatest: false,
  },
  {
    provider: "xAI",
    model: "grok-2-vision-1212eu-west-1",
    inputPrice: 2.0, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 10.0, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "multimodal", "reasoning"],
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
