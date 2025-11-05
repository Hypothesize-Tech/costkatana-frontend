import { ModelPricing } from "../cost";

export const ANTHROPIC_PRICING: ModelPricing[] = [
  // === Claude 4.5 Series (Latest) ===
  {
    provider: "Anthropic",
    model: "claude-sonnet-4-5",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-sonnet-4-5-v1:0",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-haiku-4-5",
    inputPrice: 0.001, // $1.00/1M tokens = $0.001/1K tokens
    outputPrice: 0.005, // $5.00/1M tokens = $0.005/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-haiku-4-5-v1:0",
    inputPrice: 0.001, // $1.00/1M tokens = $0.001/1K tokens
    outputPrice: 0.005, // $5.00/1M tokens = $0.005/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
    category: "text",
    isLatest: true,
  },

  // === Claude 4 Series ===
  {
    provider: "Anthropic",
    model: "claude-opus-4-1-20250805",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.075, // $75.00/1M tokens = $0.075/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-opus-4-1-20250805-v1:0",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.075, // $75.00/1M tokens = $0.075/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-opus-4-20250514",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.075, // $75.00/1M tokens = $0.075/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-opus-4-20250514-v1:0",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.075, // $75.00/1M tokens = $0.075/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Anthropic",
    model: "claude-sonnet-4-20250514",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-sonnet-4-20250514-v1:0",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
  },

  // === Claude 3.7 Series (Deprecated) ===
  {
    provider: "Anthropic",
    model: "claude-3-7-sonnet-20250219",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-7-sonnet-20250219-v1:0",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: false,
  },

  // === Claude 3.5 Series ===
  {
    provider: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-5-sonnet-20241022-v1:0",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-haiku-20241022",
    inputPrice: 0.0008, // $0.80/1M tokens = $0.0008/1K tokens
    outputPrice: 0.004, // $4.00/1M tokens = $0.004/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-5-haiku-20241022-v1:0",
    inputPrice: 0.0008, // $0.80/1M tokens = $0.0008/1K tokens
    outputPrice: 0.004, // $4.00/1M tokens = $0.004/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
    inputPrice: 0.0008, // $0.80/1M tokens = $0.0008/1K tokens
    outputPrice: 0.004, // $4.00/1M tokens = $0.004/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
    category: "text",
    isLatest: true,
  },

  // === Claude 3 Series (Legacy) ===
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-opus-20240229-v1:0",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.075, // $75.00/1M tokens = $0.075/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Anthropic",
    model: "claude-3-haiku-20240307",
    inputPrice: 0.00025, // $0.25/1M tokens = $0.00025/1K tokens
    outputPrice: 0.00125, // $1.25/1M tokens = $0.00125/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-haiku-20240307-v1:0",
    inputPrice: 0.00025, // $0.25/1M tokens = $0.00025/1K tokens
    outputPrice: 0.00125, // $1.25/1M tokens = $0.00125/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multilingual"],
    category: "text",
    isLatest: false,
  },
];
