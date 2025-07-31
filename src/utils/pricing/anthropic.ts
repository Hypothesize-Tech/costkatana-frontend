import { ModelPricing } from "../cost";

export const ANTHROPIC_PRICING: ModelPricing[] = [
  {
    provider: "Anthropic",
    model: "claude-opus-4-20250514",
    inputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
    outputPrice: 7.5, // $75/MTok = $0.0075/token = $7.5/1K tokens
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
    model: "claude-opus-4-0",
    inputPrice: 1.5,
    outputPrice: 7.5,
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
    inputPrice: 0.3, // $3/MTok = $0.0003/token = $0.3/1K tokens
    outputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
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
    model: "claude-sonnet-4-0",
    inputPrice: 0.3,
    outputPrice: 1.5,
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
    inputPrice: 0.3, // $3/MTok = $0.0003/token = $0.3/1K tokens
    outputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
    contextWindow: 200000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "multilingual",
      "extended-thinking",
    ],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-7-sonnet-latest",
    inputPrice: 0.3,
    outputPrice: 1.5,
    contextWindow: 200000,
    capabilities: [
      "text",
      "vision",
      "reasoning",
      "multilingual",
      "extended-thinking",
    ],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputPrice: 0.3, // $3/MTok = $0.0003/token = $0.3/1K tokens
    outputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-sonnet-latest",
    inputPrice: 0.3,
    outputPrice: 1.5,
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-sonnet-20240620",
    inputPrice: 0.3,
    outputPrice: 1.5,
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-haiku-20241022",
    inputPrice: 0.08, // $0.80/MTok = $0.00008/token = $0.08/1K tokens
    outputPrice: 0.4, // $4/MTok = $0.0004/token = $0.4/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-haiku-latest",
    inputPrice: 0.08,
    outputPrice: 0.4,
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-3-opus-20240229",
    inputPrice: 1.5, // $15/MTok = $0.0015/token = $1.5/1K tokens
    outputPrice: 7.5, // $75/MTok = $0.0075/token = $7.5/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-haiku-20240307",
    inputPrice: 0.025, // $0.25/MTok = $0.000025/token = $0.025/1K tokens
    outputPrice: 0.125, // $1.25/MTok = $0.000125/token = $0.125/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: false,
  },
];
