import { ModelPricing } from "../cost";

export const DEEPSEEK_PRICING: ModelPricing[] = [
  {
    provider: "DeepSeek",
    model: "deepseek-chat",
    inputPrice: 0.27, // $0.27/1M tokens = $0.00027/1K tokens
    outputPrice: 1.1, // $1.10/1M tokens = $0.0011/1K tokens
    contextWindow: 64000,
    capabilities: ["text", "json", "function-calling", "chat-prefix", "fim"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "DeepSeek",
    model: "deepseek-chat-cached",
    inputPrice: 0.07, // $0.07/1M tokens cache hit = $0.00007/1K tokens
    outputPrice: 1.1, // $1.10/1M tokens = $0.0011/1K tokens
    contextWindow: 64000,
    capabilities: [
      "text",
      "json",
      "function-calling",
      "chat-prefix",
      "fim",
      "context-caching",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "DeepSeek",
    model: "deepseek-reasoner",
    inputPrice: 0.55, // $0.55/1M tokens = $0.00055/1K tokens
    outputPrice: 2.19, // $2.19/1M tokens = $0.00219/1K tokens
    contextWindow: 64000,
    capabilities: [
      "text",
      "reasoning",
      "cot",
      "json",
      "function-calling",
      "chat-prefix",
    ],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "DeepSeek",
    model: "deepseek-reasoner-cached",
    inputPrice: 0.14, // $0.14/1M tokens cache hit = $0.00014/1K tokens
    outputPrice: 2.19, // $2.19/1M tokens = $0.00219/1K tokens
    contextWindow: 64000,
    capabilities: [
      "text",
      "reasoning",
      "cot",
      "json",
      "function-calling",
      "chat-prefix",
      "context-caching",
    ],
    category: "reasoning",
    isLatest: true,
  },
  // DeepSeek Off-Peak Pricing (UTC 16:30-00:30) - 50% discount for deepseek-chat, 75% discount for deepseek-reasoner
  {
    provider: "DeepSeek",
    model: "deepseek-chat-offpeak",
    inputPrice: 0.135, // 50% off standard price
    outputPrice: 0.55, // 50% off standard price
    contextWindow: 64000,
    capabilities: [
      "text",
      "json",
      "function-calling",
      "chat-prefix",
      "fim",
      "off-peak-pricing",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "DeepSeek",
    model: "deepseek-chat-cached-offpeak",
    inputPrice: 0.035, // 50% off cached price
    outputPrice: 0.55, // 50% off standard price
    contextWindow: 64000,
    capabilities: [
      "text",
      "json",
      "function-calling",
      "chat-prefix",
      "fim",
      "context-caching",
      "off-peak-pricing",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "DeepSeek",
    model: "deepseek-reasoner-offpeak",
    inputPrice: 0.135, // 75% off standard price
    outputPrice: 0.55, // 75% off standard price
    contextWindow: 64000,
    capabilities: [
      "text",
      "reasoning",
      "cot",
      "json",
      "function-calling",
      "chat-prefix",
      "off-peak-pricing",
    ],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "DeepSeek",
    model: "deepseek-reasoner-cached-offpeak",
    inputPrice: 0.035, // 75% off cached price
    outputPrice: 0.55, // 75% off standard price
    contextWindow: 64000,
    capabilities: [
      "text",
      "reasoning",
      "cot",
      "json",
      "function-calling",
      "chat-prefix",
      "context-caching",
      "off-peak-pricing",
    ],
    category: "reasoning",
    isLatest: true,
  },
];
