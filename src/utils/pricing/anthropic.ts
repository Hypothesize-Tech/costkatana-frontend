import { ModelPricing } from "../cost";

export const ANTHROPIC_PRICING: ModelPricing[] = [
  {
    provider: "Anthropic",
    model: "claude-opus-4-1-20250805",
    inputPrice: 15.0, // $15/MTok = $0.015/token = $15.0/1K tokens
    outputPrice: 75.0, // $75/MTok = $0.075/token = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "multilingual",
      "extended-thinking",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-opus-4-20250514",
    inputPrice: 15.0, // $15/MTok = $0.015/token = $15.0/1K tokens
    outputPrice: 75.0, // $75/MTok = $0.075/token = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "multilingual",
      "extended-thinking",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-sonnet-4-20250514",
    inputPrice: 3.0, // $3/MTok = $0.003/token = $3.0/1K tokens
    outputPrice: 15.0, // $15/MTok = $0.015/token = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "multilingual",
      "extended-thinking",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-7-sonnet-20250219",
    inputPrice: 3.0, // $3/MTok = $0.003/token = $3.0/1K tokens
    outputPrice: 15.0, // $15/MTok = $0.015/token = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "multilingual",
      "extended-thinking",
    ],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputPrice: 3.0, // $3/MTok = $0.003/token = $3.0/1K tokens
    outputPrice: 15.0, // $15/MTok = $0.015/token = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-haiku-20241022",
    inputPrice: 0.8, // $0.80/MTok = $0.0008/token = $0.8/1K tokens
    outputPrice: 4.0, // $4/MTok = $0.004/token = $4.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-haiku-20240307",
    inputPrice: 0.25, // $0.25/MTok = $0.00025/token = $0.25/1K tokens
    outputPrice: 1.25, // $1.25/MTok = $0.00125/token = $1.25/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: false,
  },
];
