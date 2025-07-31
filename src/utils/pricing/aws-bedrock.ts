import { ModelPricing } from "../cost";

export const AWS_BEDROCK_PRICING: ModelPricing[] = [
  // AI21 Labs
  {
    provider: "AWS Bedrock",
    model: "jamba-1.5-large",
    inputPrice: 2.0, // $0.002/1K tokens = $2.0/1K tokens
    outputPrice: 8.0, // $0.008/1K tokens = $8.0/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "long-context", "multilingual"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "jamba-1.5-mini",
    inputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    outputPrice: 0.4, // $0.0004/1K tokens = $0.4/1K tokens
    contextWindow: 256000,
    capabilities: ["text", "long-context", "efficient"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "jurassic-2-mid",
    inputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
    outputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "generation"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "jurassic-2-ultra",
    inputPrice: 18.8, // $0.0188/1K tokens = $18.8/1K tokens
    outputPrice: 18.8, // $0.0188/1K tokens = $18.8/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "generation"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "jamba-instruct",
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
    model: "amazon-nova-micro",
    inputPrice: 0.035, // $0.000035/1K tokens = $0.035/1K tokens
    outputPrice: 0.14, // $0.00014/1K tokens = $0.14/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "ultra-fast", "cost-effective"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-lite",
    inputPrice: 0.06, // $0.00006/1K tokens = $0.06/1K tokens
    outputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "fast"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-pro",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 3.2, // $0.0032/1K tokens = $3.2/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "reasoning", "complex-tasks"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-pro-latency-optimized",
    inputPrice: 1.0, // $0.001/1K tokens = $1.0/1K tokens
    outputPrice: 4.0, // $0.004/1K tokens = $4.0/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "reasoning", "low-latency"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-premier",
    inputPrice: 2.5, // $0.0025/1K tokens = $2.5/1K tokens
    outputPrice: 12.5, // $0.0125/1K tokens = $12.5/1K tokens
    contextWindow: 300000,
    capabilities: ["text", "multimodal", "advanced-reasoning", "premium"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-canvas",
    inputPrice: 40.0, // $0.04 per image (1024x1024 standard) = $40/1K images
    outputPrice: 40.0, // Same for image generation
    contextWindow: 4096,
    capabilities: ["image-generation", "creative-content"],
    category: "image-generation",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-reel",
    inputPrice: 80.0, // $0.08 per second of 720p video = $80/1K seconds
    outputPrice: 80.0, // Same for video generation
    contextWindow: 4096,
    capabilities: ["video-generation", "creative-content"],
    category: "video-generation",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-sonic-speech",
    inputPrice: 3.4, // $0.0034/1K tokens for speech
    outputPrice: 13.6, // $0.0136/1K tokens for speech
    contextWindow: 128000,
    capabilities: ["speech-to-speech", "audio"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "amazon-nova-sonic-text",
    inputPrice: 0.06, // $0.00006/1K tokens for text
    outputPrice: 0.24, // $0.00024/1K tokens for text
    contextWindow: 128000,
    capabilities: ["text-to-speech", "audio"],
    category: "audio",
    isLatest: true,
  },

  // Amazon Titan Models
  {
    provider: "AWS Bedrock",
    model: "amazon-titan-text-embeddings-v2",
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
    model: "claude-opus-4",
    inputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    outputPrice: 75.0, // $0.075/1K tokens = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "premium"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-sonnet-4",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-3-7-sonnet",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "extended-thinking"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-3-5-sonnet",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-3-5-haiku",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 4.0, // $0.004/1K tokens = $4.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-3-opus",
    inputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    outputPrice: 75.0, // $0.075/1K tokens = $75.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning", "premium"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-3-sonnet",
    inputPrice: 3.0, // $0.003/1K tokens = $3.0/1K tokens
    outputPrice: 15.0, // $0.015/1K tokens = $15.0/1K tokens
    contextWindow: 200000,
    capabilities: ["text", "vision", "reasoning"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "claude-3-haiku",
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
    model: "llama-3-70b-instruct",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruction-following"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "llama-3-8b-instruct",
    inputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    outputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruction-following", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "llama-3-70b-chat",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "chat"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "llama-3-8b-chat",
    inputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    outputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "chat", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "llama-2-70b-chat",
    inputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    outputPrice: 0.8, // $0.0008/1K tokens = $0.8/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "chat"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "llama-2-13b-chat",
    inputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    outputPrice: 0.2, // $0.0002/1K tokens = $0.2/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "chat", "fast"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "AWS Bedrock",
    model: "llama-2-7b-chat",
    inputPrice: 0.08, // $0.00008/1K tokens = $0.08/1K tokens
    outputPrice: 0.08, // $0.00008/1K tokens = $0.08/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "chat", "ultra-fast"],
    category: "text",
    isLatest: false,
  },

  // Mistral AI on Bedrock
  {
    provider: "AWS Bedrock",
    model: "mistral-7b-instruct",
    inputPrice: 0.15, // $0.00015/1K tokens = $0.15/1K tokens
    outputPrice: 0.15, // $0.00015/1K tokens = $0.15/1K tokens
    contextWindow: 8192,
    capabilities: ["text", "instruction-following", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "mixtral-8x7b-instruct",
    inputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
    outputPrice: 0.24, // $0.00024/1K tokens = $0.24/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "instruction-following", "mixture-of-experts"],
    category: "text",
    isLatest: true,
  },

  // Cohere on Bedrock
  {
    provider: "AWS Bedrock",
    model: "command",
    inputPrice: 1.5, // $0.0015/1K tokens = $1.5/1K tokens
    outputPrice: 6.0, // $0.006/1K tokens = $6.0/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "generation"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "command-light",
    inputPrice: 0.3, // $0.0003/1K tokens = $0.3/1K tokens
    outputPrice: 1.2, // $0.0012/1K tokens = $1.2/1K tokens
    contextWindow: 4096,
    capabilities: ["text", "generation", "fast"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "embed-english-v3",
    inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
    outputPrice: 0.1, // Same for embeddings
    contextWindow: 512,
    capabilities: ["embedding", "english"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "embed-multilingual-v3",
    inputPrice: 0.1, // $0.0001/1K tokens = $0.1/1K tokens
    outputPrice: 0.1, // Same for embeddings
    contextWindow: 512,
    capabilities: ["embedding", "multilingual"],
    category: "embedding",
    isLatest: true,
  },

  // Stability AI on Bedrock
  {
    provider: "AWS Bedrock",
    model: "stable-diffusion-xl-v1",
    inputPrice: 0.18, // $0.00018 per image = $0.18/1K images
    outputPrice: 0.18, // Same for image generation
    contextWindow: 77,
    capabilities: ["image-generation", "creative-content"],
    category: "image-generation",
    isLatest: true,
  },

  // Google on Bedrock
  {
    provider: "AWS Bedrock",
    model: "gemini-pro",
    inputPrice: 0.5, // $0.0005/1K tokens = $0.5/1K tokens
    outputPrice: 1.5, // $0.0015/1K tokens = $1.5/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "reasoning"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "AWS Bedrock",
    model: "gemini-pro-vision",
    inputPrice: 0.5, // $0.0005/1K tokens = $0.5/1K tokens
    outputPrice: 1.5, // $0.0015/1K tokens = $1.5/1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "multimodal"],
    category: "multimodal",
    isLatest: true,
  },
];
