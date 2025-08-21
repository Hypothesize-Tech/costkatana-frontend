import { ModelPricing } from "../cost";

export const AWS_BEDROCK_PRICING: ModelPricing[] = [
  // AI21 Labs
  {
    provider: "AWS Bedrock",
    model: "ai21.jamba-1-5-large-v1:0",
    inputPrice: 2.0, // $0.002/1K tokens = $2.0/1K tokens
    outputPrice: 8.0, // $0.008/1K tokens = $8.0/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "long-context", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "ai21.jamba-1-5-mini-v1:0",
    inputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    outputPrice: 0.4, // $0.0004/1K tokens = $0.4/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "long-context", "efficient"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "ai21.jamba-instruct-v1:0",
    inputPrice: 0.5, // $0.0005/1K tokens = $0.5/1K tokens
    outputPrice: 0.7, // $0.0007/1K tokens = $0.7/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "instruction-following"],
    category: "text",
    isLatest: true,
  },

  // Amazon Nova Models
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-micro-v1:0",
    inputPrice: 0.035, // $0.000035/1K tokens = $0.035/1K tokens
    outputPrice: 0.14, // $0.00014/1K tokens = $0.14/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "ultra-fast", "cost-effective"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-lite-v1:0",
    inputPrice: 0.06, // $0.00006/1K tokens = $0.06/1K tokens
    outputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "fast"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-pro-v1:0",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 3.2, // $0.0032/1K tokens = $3.2/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "reasoning", "complex-tasks"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-premier-v1:0",
    inputPrice: 2.5, // $0.0025/1K tokens = $2.5/1K tokens
    outputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "advanced-reasoning", "premium"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-canvas-v1:0",
    inputPrice: 40.0, // $0.04 per image (1024x1024 standard) = $40/1K images
    outputPrice: 40.0, // Same for image generation
    contextWindow: 4096,
    capabilities: ["image-generation", "creative-content"],
    category: "image-generation",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-reel-v1:0",
    inputPrice: 80.0, // $0.08 per second of 720p video = $80/1K seconds
    outputPrice: 80.0, // Same for video generation
    contextWindow: 4096,
    capabilities: ["video-generation", "creative-content"],
    category: "video-generation",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.nova-sonic-v1:0",
    inputPrice: 3.4, // $0.0034/1K tokens for speech
    outputPrice: 13.6, // $0.0136/1K tokens for speech
    contextWindow: 300000,
    capabilities: ["speech", "multimodal", "native-audio"],
    category: "audio",
    isLatest: true,
  },

  // Amazon Titan Models
  {
    provider: "AWS Bedrock",
    model: "amazon.titan-text-express-v1",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 1.6, // $0.0016/1K tokens = $1.6/1K tokens
    contextWindow: 8000,
    capabilities: ["text"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.titan-text-lite-v1",
    inputPrice: 0.3, // $0.0003/1K tokens = $0.3/1K tokens
    outputPrice: 0.4, // $0.0004/1K tokens = $0.4/1K tokens
    contextWindow: 4000,
    capabilities: ["text"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon.titan-embed-text-v2:0",
    inputPrice: 0.02, // $0.00002/1K tokens = $0.02/1K tokens
    outputPrice: 0.02, // Same for embeddings
    contextWindow: 8192,
    capabilities: ["embedding", "text-representation"],
    category: "embedding",
    isLatest: true,
  },

  // Anthropic on Bedrock
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-opus-4-1-20250805-v1:0",
    inputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    outputPrice: 75.0, // $0.075/1K tokens = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "premium", "extended-thinking"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-opus-4-20250514-v1:0",
    inputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    outputPrice: 75.0, // $0.075/1K tokens = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "premium"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-sonnet-4-20250514-v1:0",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "extended-thinking"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-7-sonnet-20250219-v1:0",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "extended-thinking"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-5-sonnet-20241022-v1:0",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-5-haiku-20241022-v1:0",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 4.0, // $0.004/1K tokens = $4.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-opus-20240229-v1:0",
    inputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    outputPrice: 75.0, // $0.075/1K tokens = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "premium"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "anthropic.claude-3-haiku-20240307-v1:0",
    inputPrice: 0.25, // $0.00025/1K tokens = $0.25/1K tokens
    outputPrice: 1.25, // $0.00125/1K tokens = $1.25/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "fast"],
    category: "text",
    isLatest: false,
  },

  // Meta Llama Models
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-70b-instruct-v1:0",
    inputPrice: 0.59, // $0.00059/1K tokens = $0.59/1K tokens
    outputPrice: 0.79, // $0.00079/1K tokens = $0.79/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruction-following"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-8b-instruct-v1:0",
    inputPrice: 0.05, // $0.00005/1K tokens = $0.05/1K tokens
    outputPrice: 0.10, // $0.00010/1K tokens = $0.10/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruction-following", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-2-11b-instruct-v1:0",
    inputPrice: 0.16, // $0.00016/1K tokens = $0.16/1K tokens
    outputPrice: 0.16, // $0.00016/1K tokens = $0.16/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruction-following", "vision"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama3-2-90b-instruct-v1:0",
    inputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
    outputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruction-following", "vision"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama4-scout-17b-instruct-v1:0",
    inputPrice: 0.17, // $0.00017/1K tokens = $0.17/1K tokens
    outputPrice: 0.66, // $0.00066/1K tokens = $0.66/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruction-following", "vision"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "meta.llama4-maverick-17b-instruct-v1:0",
    inputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
    outputPrice: 0.97, // $0.00097/1K tokens = $0.97/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "instruction-following", "vision"],
    category: "multimodal",
    isLatest: true,
  },

  // Mistral AI on Bedrock
  {
    provider: "AWS Bedrock",
    model: "mistral.mistral-7b-instruct-v0:2",
    inputPrice: 0.15, // $0.00015/1K tokens = $0.15/1K tokens
    outputPrice: 0.45, // $0.00045/1K tokens = $0.45/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruction-following", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.mixtral-8x7b-instruct-v0:1",
    inputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
    outputPrice: 0.72, // $0.00072/1K tokens = $0.72/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruction-following", "mixture-of-experts"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.mistral-large-2402-v1:0",
    inputPrice: 6.50, // $0.0065/1K tokens = $6.50/1K tokens
    outputPrice: 25.00, // $0.025/1K tokens = $25.00/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruction-following"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.mistral-small-2402-v1:0",
    inputPrice: 2.00, // $0.002/1K tokens = $2.00/1K tokens
    outputPrice: 6.00, // $0.006/1K tokens = $6.00/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruction-following"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mistral.pixtral-large-2502-v1:0",
    inputPrice: 2.0, // $0.002/1K tokens = $2.0/1K tokens
    outputPrice: 6.0, // $0.006/1K tokens = $6.0/1K tokens
    contextWindow: 128000,
    capabilities: ["vision", "multimodal", "reasoning"],
    category: "multimodal",
    isLatest: true,
  },

  // Cohere on Bedrock
  {
    provider: "AWS Bedrock",
    model: "cohere.command-r-plus-v1:0",
    inputPrice: 2.5, // $0.0025/1K tokens = $2.5/1K tokens
    outputPrice: 10.0, // $0.01/1K tokens = $10.0/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "enterprise"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "cohere.command-r-v1:0",
    inputPrice: 0.15, // $0.00015/1K tokens = $0.15/1K tokens
    outputPrice: 0.6, // $0.0006/1K tokens = $0.6/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "multilingual", "rag", "tools"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "cohere.embed-english-v3",
    inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
    outputPrice: 0.1, // Same for embeddings
    contextWindow: 512,
    capabilities: ["embedding", "english"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "cohere.embed-multilingual-v3",
    inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
    outputPrice: 0.1, // Same for embeddings
    contextWindow: 512,
    capabilities: ["embedding", "multilingual"],
    category: "embedding",
    isLatest: true,
  },

  // DeepSeek Models
  {
    provider: "AWS Bedrock",
    model: "deepseek.r1-v1:0",
    inputPrice: 1.35, // $0.00135/1K tokens = $1.35/1K tokens
    outputPrice: 5.4, // $0.0054/1K tokens = $5.4/1K tokens
    contextWindow: 64000,
    capabilities: ["text", "reasoning", "cot"],
    category: "reasoning",
    isLatest: true,
  },

  // Stability AI on Bedrock
  {
    provider: "AWS Bedrock",
    model: "stability.stable-diffusion-xl-v1:0",
    inputPrice: 0.18, // $0.00018 per image = $0.18/1K images
    outputPrice: 0.18, // Same for image generation
    contextWindow: 77,
    capabilities: ["image-generation", "creative-content"],
    category: "image-generation",
    isLatest: true,
  },

  // TwelveLabs Models
  {
    provider: "AWS Bedrock",
    model: "twelvelabs.pegasus-1-2-v1:0",
    inputPrice: 0.0, // Free tier
    outputPrice: 0.0,
    contextWindow: 0,
    capabilities: ["text", "video", "multimodal"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "twelvelabs.marengo-embed-2-7-v1:0",
    inputPrice: 0.0, // Free tier
    outputPrice: 0.0,
    contextWindow: 0,
    capabilities: ["embedding", "multimodal"],
    category: "embedding",
    isLatest: true,
  }
];
