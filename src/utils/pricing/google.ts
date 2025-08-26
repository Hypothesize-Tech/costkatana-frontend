import { ModelPricing } from "../cost";

export const GOOGLE_PRICING: ModelPricing[] = [
  // === Gemini 2.5 Models (Latest) ===
  {
    provider: "Google AI",
    model: "gemini-2.5-pro",
    inputPrice: 0.00125, // $1.25 / 1M tokens = $0.00125 / 1K tokens
    outputPrice: 0.01, // $10.00 / 1M tokens = $0.01 / 1K tokens
    contextWindow: 2000000,
    capabilities: ["text", "multimodal", "reasoning", "coding", "complex-problems"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-pro-large-context",
    inputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    outputPrice: 0.015, // $15.00 / 1M tokens = $0.015 / 1K tokens
    contextWindow: 2000000, // >200k tokens
    capabilities: ["text", "multimodal", "reasoning", "coding", "complex-problems", "large-context"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash",
    inputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    outputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "image", "video", "multimodal", "reasoning", "thinking", "live-api"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-audio",
    inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
    outputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal", "audio-input"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-lite-preview",
    inputPrice: 0.0001, // $0.10 / 1M tokens = $0.0001 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "image", "video", "multimodal", "reasoning", "thinking", "high-throughput"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-lite-audio-preview",
    inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal", "audio-input", "high-throughput"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-native-audio",
    inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
    outputPrice: 0.002, // $2.00 / 1M tokens = $0.002 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal", "native-audio"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-native-audio-output",
    inputPrice: 0.003, // $3.00 / 1M tokens = $0.003 / 1K tokens
    outputPrice: 0.012, // $12.00 / 1M tokens = $0.012 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal", "native-audio", "audio-output"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-preview-tts",
    inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
    outputPrice: 0.01, // $10.00 / 1M tokens = $0.01 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "tts"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-pro-preview-tts",
    inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
    outputPrice: 0.02, // $20.00 / 1M tokens = $0.02 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "tts"],
    category: "audio",
    isLatest: true,
  },

  // === Gemini 2.0 Models ===
  {
    provider: "Google AI",
    model: "gemini-2.0-flash",
    inputPrice: 0.0001, // $0.10 / 1M tokens = $0.0001 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "image", "video", "multimodal", "agents", "next-generation"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-2.0-flash-audio",
    inputPrice: 0.0007, // $0.70 / 1M tokens = $0.0007 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal", "audio-input"],
    category: "audio",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-2.0-flash-lite",
    inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
    outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "multimodal", "cost-efficient", "low-latency"],
    category: "multimodal",
    isLatest: false,
  },

  // === Gemini 1.5 Models ===
  {
    provider: "Google AI",
    model: "gemini-1.5-flash",
    inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
    outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    contextWindow: 128000,
    capabilities: ["text", "image", "video", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-flash-large-context",
    inputPrice: 0.00015, // $0.15 / 1M tokens = $0.00015 / 1K tokens
    outputPrice: 0.0006, // $0.60 / 1M tokens = $0.0006 / 1K tokens
    contextWindow: 128001, // >128k tokens
    capabilities: ["text", "image", "video", "multimodal", "large-context"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-flash-8b",
    inputPrice: 0.0000375, // $0.0375 / 1M tokens = $0.0000375 / 1K tokens
    outputPrice: 0.00015, // $0.15 / 1M tokens = $0.00015 / 1K tokens
    contextWindow: 128000,
    capabilities: ["text", "image", "video", "multimodal", "efficient"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-flash-8b-large-context",
    inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
    outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    contextWindow: 128001,
    capabilities: ["text", "image", "video", "multimodal", "efficient", "large-context"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-pro",
    inputPrice: 0.00125, // $1.25 / 1M tokens = $0.00125 / 1K tokens
    outputPrice: 0.005, // $5.00 / 1M tokens = $0.005 / 1K tokens
    contextWindow: 128000,
    capabilities: ["text", "code", "reasoning", "multimodal"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-pro-large-context",
    inputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    outputPrice: 0.01, // $10.00 / 1M tokens = $0.01 / 1K tokens
    contextWindow: 128001,
    capabilities: ["text", "code", "reasoning", "multimodal", "large-context"],
    category: "text",
    isLatest: false,
  },

  // === Gemma Models (Open Source) ===
  {
    provider: "Google AI",
    model: "gemma-3n",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "multimodal", "140-languages", "mobile-optimized"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemma-3",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 128000,
    capabilities: ["text", "open-source", "multimodal", "140-languages", "wide-variety-tasks"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemma-2",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "text-generation", "summarization", "extraction"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemma",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "text-generation", "summarization", "extraction", "lightweight"],
    category: "text",
    isLatest: false,
  },

  // === Specialized Gemma Models ===
  {
    provider: "Google AI",
    model: "shieldgemma-2",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "safety-evaluation", "instruction-tuned"],
    category: "safety",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "paligemma",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "vision-language", "siglip", "gemma"],
    category: "vision-language",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "codegemma",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "coding", "fill-in-middle", "code-generation", "mathematical-reasoning"],
    category: "coding",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "txgemma",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "therapeutic", "predictions", "classifications", "efficient-training"],
    category: "therapeutic",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "medgemma",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "medical", "medical-comprehension", "variants"],
    category: "medical",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "medsiglip",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "medical", "medical-images", "embedding-space"],
    category: "medical",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "t5gemma",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 8192,
    capabilities: ["text", "open-source", "encoder-decoder", "research", "lightweight", "powerful"],
    category: "research",
    isLatest: true,
  },

  // === Embeddings Models ===
  {
    provider: "Google AI",
    model: "text-embedding-004",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 2048,
    capabilities: ["embedding", "semantic-search", "classification", "clustering"],
    category: "embedding",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "multimodal-embeddings",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 2048,
    capabilities: ["embedding", "multimodal", "image-classification", "image-search"],
    category: "embedding",
    isLatest: true,
  },

  // === Imagen Models (Image Generation) ===
  {
    provider: "Google AI",
    model: "imagen-4-generation",
    inputPrice: 0.04, // Standard
    outputPrice: 0.04, // Standard
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "higher-quality"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "imagen-4-fast-generation",
    inputPrice: 0.04, // Standard
    outputPrice: 0.04, // Standard
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "higher-quality", "lower-latency"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "imagen-4-ultra-generation",
    inputPrice: 0.06, // Ultra
    outputPrice: 0.06, // Ultra
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "higher-quality", "better-prompt-adherence"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "imagen-3-generation",
    inputPrice: 0.03,
    outputPrice: 0.03,
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image"],
    category: "image",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "imagen-3-editing-customization",
    inputPrice: 0.03,
    outputPrice: 0.03,
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "image-editing", "customization", "mask-editing"],
    category: "image",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "imagen-3-fast-generation",
    inputPrice: 0.03,
    outputPrice: 0.03,
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "lower-latency"],
    category: "image",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "imagen-captioning-vqa",
    inputPrice: 0.03,
    outputPrice: 0.03,
    contextWindow: 0,
    capabilities: ["image-generation", "text-to-image", "image-editing", "mask-editing", "captioning", "vqa"],
    category: "image",
    isLatest: false,
  },

  // === Veo Models (Video Generation) ===
  {
    provider: "Google AI",
    model: "veo-2",
    inputPrice: 0.35, // per second
    outputPrice: 0.35, // per second
    contextWindow: 0,
    capabilities: ["video-generation", "text-to-video", "image-to-video", "higher-quality"],
    category: "video",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "veo-3",
    inputPrice: 0.35, // per second
    outputPrice: 0.35, // per second
    contextWindow: 0,
    capabilities: ["video-generation", "text-to-video", "image-to-video", "higher-quality"],
    category: "video",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "veo-3-fast",
    inputPrice: 0.35, // per second
    outputPrice: 0.35, // per second
    contextWindow: 0,
    capabilities: ["video-generation", "text-to-video", "image-to-video", "higher-quality", "lower-latency"],
    category: "video",
    isLatest: true,
  },

  // === Preview Models ===
  {
    provider: "Google AI",
    model: "virtual-try-on",
    inputPrice: 0.0, // Free tier only
    outputPrice: 0.0, // Free tier only
    contextWindow: 0,
    capabilities: ["image-generation", "virtual-try-on", "clothing"],
    category: "image",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "veo-3-preview",
    inputPrice: 0.35, // per second
    outputPrice: 0.35, // per second
    contextWindow: 0,
    capabilities: ["video-generation", "text-to-video", "image-to-video", "higher-quality", "preview"],
    category: "video",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "veo-3-fast-preview",
    inputPrice: 0.35, // per second
    outputPrice: 0.35, // per second
    contextWindow: 0,
    capabilities: ["video-generation", "text-to-video", "image-to-video", "higher-quality", "lower-latency", "preview"],
    category: "video",
    isLatest: true,
  },

  // === Legacy Models for Backward Compatibility ===
  {
    provider: "Google AI",
    model: "gemini-1.0-pro",
    inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
    outputPrice: 0.002, // $2.00 / 1M tokens = $0.002 / 1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "multimodal"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.0-pro-vision",
    inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
    outputPrice: 0.002, // $2.00 / 1M tokens = $0.002 / 1K tokens
    contextWindow: 32768,
    capabilities: ["text", "vision", "multimodal"],
    category: "text",
    isLatest: false,
  }
];
