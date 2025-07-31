import { ModelPricing } from "../cost";

export const GOOGLE_PRICING: ModelPricing[] = [
  {
    provider: "Google AI",
    model: "gemini-2.5-pro",
    inputPrice: 0.00125, // $1.25 / 1M tokens = $0.00125 / 1K tokens
    outputPrice: 0.01, // $10.00 / 1M tokens = $0.01 / 1K tokens
    contextWindow: 200000,
    capabilities: ["text", "code", "reasoning", "multimodal"],
    category: "text",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-pro-large-context",
    inputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    outputPrice: 0.015, // $15.00 / 1M tokens = $0.015 / 1K tokens
    contextWindow: 200001, // >200k tokens
    capabilities: ["text", "code", "reasoning", "multimodal"],
    category: "text",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash",
    inputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    outputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "image", "video", "audio", "multimodal"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-audio",
    inputPrice: 0.001, // $1.00 / 1M tokens = $0.001 / 1K tokens
    outputPrice: 0.0025, // $2.50 / 1M tokens = $0.0025 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-lite-preview",
    inputPrice: 0.0001, // $0.10 / 1M tokens = $0.0001 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "image", "video", "multimodal"],
    category: "multimodal",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-lite-audio-preview",
    inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-native-audio",
    inputPrice: 0.0005, // $0.50 / 1M tokens = $0.0005 / 1K tokens
    outputPrice: 0.002, // $2.00 / 1M tokens = $0.002 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal"],
    category: "audio",
    isLatest: true,
  },
  {
    provider: "Google AI",
    model: "gemini-2.5-flash-native-audio-output",
    inputPrice: 0.003, // $3.00 / 1M tokens = $0.003 / 1K tokens
    outputPrice: 0.012, // $12.00 / 1M tokens = $0.012 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal"],
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
  {
    provider: "Google AI",
    model: "gemini-2.0-flash",
    inputPrice: 0.0001, // $0.10 / 1M tokens = $0.0001 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "image", "video", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-2.0-flash-audio",
    inputPrice: 0.0007, // $0.70 / 1M tokens = $0.0007 / 1K tokens
    outputPrice: 0.0004, // $0.40 / 1M tokens = $0.0004 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["audio", "multimodal"],
    category: "audio",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-2.0-flash-lite",
    inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
    outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    contextWindow: 1000000,
    capabilities: ["text", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
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
    capabilities: ["text", "image", "video", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-flash-8b",
    inputPrice: 0.0000375, // $0.0375 / 1M tokens = $0.0000375 / 1K tokens
    outputPrice: 0.00015, // $0.15 / 1M tokens = $0.00015 / 1K tokens
    contextWindow: 128000,
    capabilities: ["text", "image", "video", "multimodal"],
    category: "multimodal",
    isLatest: false,
  },
  {
    provider: "Google AI",
    model: "gemini-1.5-flash-8b-large-context",
    inputPrice: 0.000075, // $0.075 / 1M tokens = $0.000075 / 1K tokens
    outputPrice: 0.0003, // $0.30 / 1M tokens = $0.0003 / 1K tokens
    contextWindow: 128001,
    capabilities: ["text", "image", "video", "multimodal"],
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
    capabilities: ["text", "code", "reasoning", "multimodal"],
    category: "text",
    isLatest: false,
  },
];
