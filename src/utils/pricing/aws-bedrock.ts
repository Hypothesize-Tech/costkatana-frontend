import { ModelPricing } from "../cost";

export const AWS_BEDROCK_PRICING: ModelPricing[] = [
  // Amazon Nova Models
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-pro-v1:0",
    inputPrice: 0.0008, // $0.80/1M tokens = $0.0008/1K tokens
    outputPrice: 0.0032, // $3.20/1M tokens = $0.0032/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "image", "video", "multimodal", "reasoning"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-lite-v1:0",
    inputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    outputPrice: 0.0024, // $2.40/1M tokens = $0.0024/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "image", "multimodal", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-micro-v1:0",
    inputPrice: 0.00035, // $0.35/1M tokens = $0.00035/1K tokens
    outputPrice: 0.0014, // $1.40/1M tokens = $0.0014/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "fast", "efficient"],
    category: "text",
    isLatest: true,
  },

  // AI21 Labs Models
  {
    provider: "AWS Bedrock",
    model: "ai21.jamba-1-5-large-v1:0",
    inputPrice: 0.002, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 0.008, // $8.0/1M tokens = $0.008/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "long-context"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "ai21.jamba-1-5-mini-v1:0",
    inputPrice: 0.0002, // $0.2/1M tokens = $0.0002/1K tokens
    outputPrice: 0.0004, // $0.4/1M tokens = $0.0004/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "long-context", "efficient"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "ai21.jamba-instruct-v1:0",
    inputPrice: 0.0005, // $0.5/1M tokens = $0.0005/1K tokens
    outputPrice: 0.0007, // $0.7/1M tokens = $0.0007/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "instruct", "long-context"],
    category: "text",
    isLatest: true,
  },

  // Amazon Nova Models (with cache read support)
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-premier-v1:0",
    inputPrice: 0.0025, // $2.5/1M tokens = $0.0025/1K tokens
    outputPrice: 0.0125, // $12.5/1M tokens = $0.0125/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "advanced-reasoning"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-canvas-v1:0",
    inputPrice: 0.04, // Note: Price per request, not per 1K tokens
    outputPrice: 0.04, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-reel-v1:0",
    inputPrice: 0.08, // Note: Price per request, not per 1K tokens
    outputPrice: 0.08, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["video-generation"],
    category: "video",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-sonic-v1:0",
    inputPrice: 0.0034, // $3.4/1M tokens = $0.0034/1K tokens
    outputPrice: 0.0136, // $13.6/1M tokens = $0.0136/1K tokens
    contextWindow: 300000,
    capabilities: ["speech", "multimodal", "native-audio"],
    category: "audio",
    isLatest: true,
  },

  // Amazon Titan Models
  {
    provider: "AWS Bedrock",
    model: "amazon.titan-text-express-v1",
    inputPrice: 0.0008, // $0.8/1M tokens = $0.0008/1K tokens
    outputPrice: 0.0016, // $1.6/1M tokens = $0.0016/1K tokens
    contextWindow: 8000,
    capabilities: ["text"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.titan-text-lite-v1",
    inputPrice: 0.0003, // $0.3/1M tokens = $0.0003/1K tokens
    outputPrice: 0.0004, // $0.4/1M tokens = $0.0004/1K tokens
    contextWindow: 4000,
    capabilities: ["text"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.titan-embed-text-v2:0",
    inputPrice: 0.00002, // $0.02/1M tokens = $0.00002/1K tokens
    outputPrice: 0.00002, // $0.02/1M tokens = $0.00002/1K tokens
    contextWindow: 8192,
    capabilities: ["embedding"],
    category: "embedding",
    isLatest: true,
  },

  // Anthropic Models on AWS Bedrock
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
    provider: "AWS Bedrock",
    model: "anthropic.claude-haiku-4-5-v1:0",
    inputPrice: 0.001, // $1.00/1M tokens = $0.001/1K tokens
    outputPrice: 0.005, // $5.00/1M tokens = $0.005/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "multilingual"],
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
    provider: "AWS Bedrock",
    model: "anthropic.claude-sonnet-4-20250514-v1:0",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning", "extended-thinking", "multilingual"],
    category: "text",
    isLatest: true,
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
    model: "anthropic.claude-3-opus-20240229-v1:0",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.075, // $75.00/1M tokens = $0.075/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "multimodal", "reasoning"],
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

  // Cohere Models on AWS Bedrock
  {
    provider: "AWS Bedrock",
    model: "cohere.command-r-plus-v1:0",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "enterprise"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "cohere.command-r-v1:0",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "rag", "tools"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "cohere.embed-english-v3",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0,
    contextWindow: 512,
    capabilities: ["embedding"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "cohere.embed-multilingual-v3",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0,
    contextWindow: 512,
    capabilities: ["embedding", "multilingual"],
    category: "embedding",
    isLatest: true,
  },

  // Meta Models on AWS Bedrock
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-70b-instruct-v1:0",
    inputPrice: 0.00059, // $0.59/1M tokens = $0.00059/1K tokens
    outputPrice: 0.00079, // $0.79/1M tokens = $0.00079/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruct"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-8b-instruct-v1:0",
    inputPrice: 0.00005, // $0.05/1M tokens = $0.00005/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruct"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-2-11b-instruct-v1:0",
    inputPrice: 0.00016, // $0.16/1M tokens = $0.00016/1K tokens
    outputPrice: 0.00016, // $0.16/1M tokens = $0.00016/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruct", "vision"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-2-90b-instruct-v1:0",
    inputPrice: 0.00072, // $0.72/1M tokens = $0.00072/1K tokens
    outputPrice: 0.00072, // $0.72/1M tokens = $0.00072/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruct", "vision"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama4-scout-17b-instruct-v1:0",
    inputPrice: 0.00017, // $0.17/1M tokens = $0.00017/1K tokens
    outputPrice: 0.00066, // $0.66/1M tokens = $0.00066/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruct", "vision"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama4-maverick-17b-instruct-v1:0",
    inputPrice: 0.00024, // $0.24/1M tokens = $0.00024/1K tokens
    outputPrice: 0.00097, // $0.97/1M tokens = $0.00097/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruct", "vision"],
    category: "multimodal",
    isLatest: true,
  },

  // Mistral AI Models on AWS Bedrock
  {
    provider: "AWS Bedrock",
    model: "mistral.mistral-7b-instruct-v0:2",
    inputPrice: 0.00014, // $0.14/1M tokens = $0.00014/1K tokens
    outputPrice: 0.00042, // $0.42/1M tokens = $0.00042/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruct"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.mixtral-8x7b-instruct-v0:1",
    inputPrice: 0.00014, // $0.14/1M tokens = $0.00014/1K tokens
    outputPrice: 0.00042, // $0.42/1M tokens = $0.00042/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruct"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.mistral-large-2402-v1:0",
    inputPrice: 0.0065, // $6.50/1M tokens = $0.0065/1K tokens
    outputPrice: 0.025, // $25.00/1M tokens = $0.025/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruct"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.mistral-small-2402-v1:0",
    inputPrice: 0.002, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 0.006, // $6.00/1M tokens = $0.006/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruct"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.pixtral-large-2502-v1:0",
    inputPrice: 0.002, // $2.0/1M tokens = $0.002/1K tokens
    outputPrice: 0.006, // $6.0/1M tokens = $0.006/1K tokens
    contextWindow: 128000,
    capabilities: ["vision", "multimodal", "reasoning"],
    category: "multimodal",
    isLatest: true,
  },

  // DeepSeek Models
  {
    provider: "AWS Bedrock",
    model: "deepseek.r1-v1:0",
    inputPrice: 0.00135, // $1.35/1M tokens = $0.00135/1K tokens
    outputPrice: 0.0054, // $5.4/1M tokens = $0.0054/1K tokens
    contextWindow: 64000,
    capabilities: ["text", "reasoning", "cot"],
    category: "reasoning",
    isLatest: true,
  },

  // Stability AI Models
  {
    provider: "AWS Bedrock",
    model: "stability.stable-diffusion-xl-v1:0",
    inputPrice: 0.18, // Note: Price per request, not per 1K tokens
    outputPrice: 0.18, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation"],
    category: "image",
    isLatest: true,
  },

  // TwelveLabs Models
  {
    provider: "AWS Bedrock",
    model: "twelvelabs.pegasus-1-2-v1:0",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0,
    contextWindow: 0,
    capabilities: ["text", "video", "multimodal"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "twelvelabs.marengo-embed-2-7-v1:0",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0,
    contextWindow: 0,
    capabilities: ["embedding", "multimodal"],
    category: "embedding",
    isLatest: true,
  },
];
