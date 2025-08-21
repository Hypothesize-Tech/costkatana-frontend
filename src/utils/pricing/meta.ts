import { ModelPricing } from "../cost";

export const META_PRICING: ModelPricing[] = [
  {
    provider: "Meta",
    model: "llama-4-scout",
    inputPrice: 0.19, // $0.19/1M tokens = $0.00019/1K tokens
    outputPrice: 0.49, // $0.49/1M tokens = $0.00049/1K tokens
    contextWindow: 10000000, // 10M context window
    capabilities: [
      "text",
      "vision",
      "multimodal",
      "long-context",
      "multilingual",
      "image-grounding",
    ],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-4-maverick",
    inputPrice: 0.19, // $0.19/1M tokens = $0.00019/1K tokens
    outputPrice: 0.49, // $0.49/1M tokens = $0.00049/1K tokens
    contextWindow: 10000000, // 10M context window
    capabilities: [
      "text",
      "vision",
      "multimodal",
      "long-context",
      "multilingual",
      "image-grounding",
      "fast-responses",
    ],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Meta",
    model: "llama-4-behemoth-preview",
    inputPrice: 0.19, // $0.19/1M tokens = $0.00019/1K tokens
    outputPrice: 0.49, // $0.49/1M tokens = $0.00049/1K tokens
    contextWindow: 10000000, // 10M context window
    capabilities: [
      "text",
      "vision",
      "multimodal",
      "long-context",
      "multilingual",
      "image-grounding",
      "teacher-model",
    ],
    category: "multimodal",
    isLatest: true,
  },
];
