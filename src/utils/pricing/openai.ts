import { ModelPricing } from "../cost";

export const OPENAI_PRICING: ModelPricing[] = [
  // === GPT-5 Models (Latest) ===
  {
    provider: "OpenAI",
    model: "gpt-5",
    inputPrice: 0.00125, // $1.25/1M tokens = $0.00125/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis", "coding", "agents"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-5-mini",
    inputPrice: 0.00025, // $0.25/1M tokens = $0.00025/1K tokens
    outputPrice: 0.002, // $2.00/1M tokens = $0.002/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis", "efficient"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-5-nano",
    inputPrice: 0.00005, // $0.05/1M tokens = $0.00005/1K tokens
    outputPrice: 0.0004, // $0.40/1M tokens = $0.0004/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "fast", "cost-effective"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-5-pro",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.02, // $20.00/1M tokens = $0.02/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis", "coding", "agents", "premium"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-5-codex",
    inputPrice: 0.00125, // $1.25/1M tokens = $0.00125/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "programming", "agents", "coding"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-5-chat-latest",
    inputPrice: 0.00125, // $1.25/1M tokens = $0.00125/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "chat", "reasoning", "analysis"],
    category: "text",
    isLatest: true,
  },

  // === GPT-4.1 Series (Latest) ===
  {
    provider: "OpenAI",
    model: "gpt-4.1",
    inputPrice: 0.002, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 0.008, // $8.00/1M tokens = $0.008/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "analysis", "enhanced"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4.1-mini",
    inputPrice: 0.0004, // $0.40/1M tokens = $0.0004/1K tokens
    outputPrice: 0.0016, // $1.60/1M tokens = $0.0016/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "analysis", "efficient"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4.1-nano",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0004, // $0.40/1M tokens = $0.0004/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "fast", "cost-effective"],
    category: "text",
    isLatest: true,
  },

  // === GPT-4o Series (Latest) ===
  {
    provider: "OpenAI",
    model: "gpt-4o-2024-08-06",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal", "analysis"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-2024-05-13",
    inputPrice: 0.005, // $5.00/1M tokens = $0.005/1K tokens
    outputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-audio-preview",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "audio", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-realtime-preview",
    inputPrice: 0.005, // $5.00/1M tokens = $0.005/1K tokens
    outputPrice: 0.02, // $20.00/1M tokens = $0.02/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "realtime", "multimodal"],
    category: "realtime",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-mini-2024-07-18",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal", "efficient"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-mini-audio-preview",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "audio", "efficient"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-mini-realtime-preview",
    inputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    outputPrice: 0.0024, // $2.40/1M tokens = $0.0024/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "realtime", "efficient"],
    category: "realtime",
    isLatest: true,
  },

  // === O-Series Models (Latest) ===
  {
    provider: "OpenAI",
    model: "o3-pro",
    inputPrice: 0.02, // $20.00/1M tokens = $0.02/1K tokens
    outputPrice: 0.08, // $80.00/1M tokens = $0.08/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis", "pro"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "o3-deep-research",
    inputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    outputPrice: 0.04, // $40.00/1M tokens = $0.04/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "research", "analysis", "deep"],
    category: "research",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "o4-mini",
    inputPrice: 0.0011, // $1.10/1M tokens = $0.0011/1K tokens
    outputPrice: 0.0044, // $4.40/1M tokens = $0.0044/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "efficient"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "o4-mini-deep-research",
    inputPrice: 0.002, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 0.008, // $8.00/1M tokens = $0.008/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "research", "analysis", "efficient"],
    category: "research",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "o3",
    inputPrice: 0.002, // $2.00/1M tokens = $0.002/1K tokens
    outputPrice: 0.008, // $8.00/1M tokens = $0.008/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "o1-pro",
    inputPrice: 0.15, // $150.00/1M tokens = $0.15/1K tokens
    outputPrice: 0.6, // $600.00/1M tokens = $0.6/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis", "premium"],
    category: "reasoning",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "o1",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.06, // $60.00/1M tokens = $0.06/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis", "advanced"],
    category: "reasoning",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "o3-mini",
    inputPrice: 0.0011, // $1.10/1M tokens = $0.0011/1K tokens
    outputPrice: 0.0044, // $4.40/1M tokens = $0.0044/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "efficient"],
    category: "reasoning",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "o1-mini",
    inputPrice: 0.0011, // $1.10/1M tokens = $0.0011/1K tokens
    outputPrice: 0.0044, // $4.40/1M tokens = $0.0044/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "efficient"],
    category: "reasoning",
    isLatest: false,
  },

  // === Video Generation Models ===
  {
    provider: "OpenAI",
    model: "sora-2",
    inputPrice: 0.05, // Note: Price per second, not per 1K tokens
    outputPrice: 0.05, // Note: Price per second, not per 1K tokens
    contextWindow: 0,
    capabilities: ["video-generation", "audio", "synced-audio"],
    category: "video",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "sora-2-pro",
    inputPrice: 0.10, // Note: Price per second, not per 1K tokens
    outputPrice: 0.10, // Note: Price per second, not per 1K tokens
    contextWindow: 0,
    capabilities: ["video-generation", "audio", "synced-audio", "advanced"],
    category: "video",
    isLatest: true,
  },

  // === Image Generation Models ===
  {
    provider: "OpenAI",
    model: "gpt-image-1",
    inputPrice: 0.04, // Note: Price per request, not per 1K tokens
    outputPrice: 0.04, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-image-1-mini",
    inputPrice: 0.02, // Note: Price per request, not per 1K tokens
    outputPrice: 0.02, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "cost-efficient"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "dall-e-3",
    inputPrice: 0.04, // Note: Price per request, not per 1K tokens
    outputPrice: 0.04, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image"],
    category: "image",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "dall-e-2",
    inputPrice: 0.02, // Note: Price per request, not per 1K tokens
    outputPrice: 0.02, // Note: Price per request, not per 1K tokens
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image"],
    category: "image",
    isLatest: false,
  },

  // === Audio and Realtime Models ===
  {
    provider: "OpenAI",
    model: "gpt-realtime",
    inputPrice: 0.005, // $5.00/1M tokens = $0.005/1K tokens
    outputPrice: 0.02, // $20.00/1M tokens = $0.02/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "audio", "realtime", "multimodal"],
    category: "realtime",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-realtime-mini",
    inputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    outputPrice: 0.0024, // $2.40/1M tokens = $0.0024/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "audio", "realtime", "efficient"],
    category: "realtime",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-audio",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "audio", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-audio-mini",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "audio", "efficient"],
    category: "audio",
    isLatest: true,
  },

  // === Transcription Models ===
  {
    provider: "OpenAI",
    model: "gpt-4o-transcribe",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 0,
    capabilities: ["audio", "transcription", "speech-to-text"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-transcribe-diarize",
    inputPrice: 0.0002, // $0.20/1M tokens = $0.0002/1K tokens
    outputPrice: 0.0002, // $0.20/1M tokens = $0.0002/1K tokens
    contextWindow: 0,
    capabilities: ["audio", "transcription", "speech-to-text", "diarization"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-mini-transcribe",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 0,
    capabilities: ["audio", "transcription", "speech-to-text", "efficient"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "whisper-1",
    inputPrice: 0.006, // Note: Price per minute, not per 1K tokens
    outputPrice: 0.006, // Note: Price per minute, not per 1K tokens
    contextWindow: 0,
    capabilities: ["audio", "transcription", "speech-to-text", "general-purpose"],
    category: "audio",
    isLatest: true,
  },

  // === Text-to-Speech Models ===
  {
    provider: "OpenAI",
    model: "gpt-4o-mini-tts",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    contextWindow: 0,
    capabilities: ["audio", "text-to-speech", "tts"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "tts-1",
    inputPrice: 0.015, // Note: Price per 1K characters, not per 1K tokens
    outputPrice: 0.015, // Note: Price per 1K characters, not per 1K tokens
    contextWindow: 0,
    capabilities: ["audio", "text-to-speech", "tts", "fast"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "tts-1-hd",
    inputPrice: 0.030, // Note: Price per 1K characters, not per 1K tokens
    outputPrice: 0.030, // Note: Price per 1K characters, not per 1K tokens
    contextWindow: 0,
    capabilities: ["audio", "text-to-speech", "tts", "high-quality"],
    category: "audio",
    isLatest: true,
  },

  // === Open-Weight Models ===
  {
    provider: "OpenAI",
    model: "gpt-oss-120b",
    inputPrice: 0.0, // Open-weight, pricing varies by deployment
    outputPrice: 0.0,
    contextWindow: 131072,
    capabilities: ["text", "open-source", "open-weight"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-oss-20b",
    inputPrice: 0.0, // Open-weight, pricing varies by deployment
    outputPrice: 0.0,
    contextWindow: 131072,
    capabilities: ["text", "open-source", "open-weight", "low-latency"],
    category: "text",
    isLatest: true,
  },

  // === Specialized Models ===
  {
    provider: "OpenAI",
    model: "codex-mini-latest",
    inputPrice: 0.0015, // $1.50/1M tokens = $0.0015/1K tokens
    outputPrice: 0.006, // $6.00/1M tokens = $0.006/1K tokens
    contextWindow: 128000,
    capabilities: ["code", "programming", "reasoning"],
    category: "code",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "omni-moderation-latest",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 32768,
    capabilities: ["moderation", "text", "image", "harmful-content-detection"],
    category: "moderation",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-mini-search-preview-2025-03-11",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "search", "multimodal"],
    category: "search",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-search-preview-2025-03-11",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "search", "multimodal"],
    category: "search",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "computer-use-preview-2025-03-11",
    inputPrice: 0.003, // $3.00/1M tokens = $0.003/1K tokens
    outputPrice: 0.012, // $12.00/1M tokens = $0.012/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "computer-use", "automation"],
    category: "computer-use",
    isLatest: true,
  },

  // === Embedding Models ===
  {
    provider: "OpenAI",
    model: "text-embedding-3-small",
    inputPrice: 0.00002, // $0.02/1M tokens = $0.00002/1K tokens
    outputPrice: 0.00002, // $0.02/1M tokens = $0.00002/1K tokens
    contextWindow: 8191,
    capabilities: ["embedding", "semantic-search"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "text-embedding-3-large",
    inputPrice: 0.00013, // $0.13/1M tokens = $0.00013/1K tokens
    outputPrice: 0.00013, // $0.13/1M tokens = $0.00013/1K tokens
    contextWindow: 8191,
    capabilities: ["embedding", "semantic-search", "high-quality"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "OpenAI",
    model: "text-embedding-ada-002",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 8191,
    capabilities: ["embedding", "semantic-search"],
    category: "embedding",
    isLatest: false,
  },

  // === ChatGPT Models ===
  {
    provider: "OpenAI",
    model: "chatgpt-4o-latest",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal", "chat"],
    category: "multimodal",
    isLatest: false,
  },

  // === Legacy and Deprecated Models ===
  {
    provider: "OpenAI",
    model: "gpt-4.5-preview",
    inputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    outputPrice: 0.03, // $30.00/1M tokens = $0.03/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "o1-preview",
    inputPrice: 0.015, // $15.00/1M tokens = $0.015/1K tokens
    outputPrice: 0.06, // $60.00/1M tokens = $0.06/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "reasoning", "analysis"],
    category: "reasoning",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "text-moderation-latest",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 32768,
    capabilities: ["moderation", "text", "harmful-content-detection"],
    category: "moderation",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "text-moderation-stable",
    inputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    outputPrice: 0.0001, // $0.10/1M tokens = $0.0001/1K tokens
    contextWindow: 32768,
    capabilities: ["moderation", "text", "harmful-content-detection"],
    category: "moderation",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "babbage-002",
    inputPrice: 0.0,
    outputPrice: 0.0,
    contextWindow: 16384,
    capabilities: ["text"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "davinci-002",
    inputPrice: 0.0,
    outputPrice: 0.0,
    contextWindow: 16384,
    capabilities: ["text"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o-mini",
    inputPrice: 0.00015, // $0.15/1M tokens = $0.00015/1K tokens
    outputPrice: 0.0006, // $0.60/1M tokens = $0.0006/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-4o",
    inputPrice: 0.0025, // $2.50/1M tokens = $0.0025/1K tokens
    outputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-4-turbo",
    inputPrice: 0.01, // $10.00/1M tokens = $0.01/1K tokens
    outputPrice: 0.03, // $30.00/1M tokens = $0.03/1K tokens
    contextWindow: 128000,
    capabilities: ["text", "vision", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-4",
    inputPrice: 0.03, // $30.00/1M tokens = $0.03/1K tokens
    outputPrice: 0.06, // $60.00/1M tokens = $0.06/1K tokens
    contextWindow: 8192,
    capabilities: ["text"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-3.5-turbo-0125",
    inputPrice: 0.0005, // $0.50/1M tokens = $0.0005/1K tokens
    outputPrice: 0.0015, // $1.50/1M tokens = $0.0015/1K tokens
    contextWindow: 16385,
    capabilities: ["text"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "OpenAI",
    model: "gpt-3.5-turbo",
    inputPrice: 0.0005, // $0.50/1M tokens = $0.0005/1K tokens
    outputPrice: 0.0015, // $1.50/1M tokens = $0.0015/1K tokens
    contextWindow: 16385,
    capabilities: ["text"],
    category: "text",
    isLatest: false,
  },
];
