// Import provider-specific pricing configurations
import { OPENAI_PRICING } from "./pricing/openai";
import { COHERE_PRICING } from "./pricing/cohere";
import { XAI_PRICING } from "./pricing/xai";
import { DEEPSEEK_PRICING } from "./pricing/deepseek";
import { MISTRAL_PRICING } from "./pricing/mistral";
import { GOOGLE_PRICING } from "./pricing/google";
import { ANTHROPIC_PRICING } from "./pricing/anthropic";
import { AWS_BEDROCK_PRICING } from "./pricing/aws-bedrock";

export interface ModelPricing {
  provider: string;
  model: string;
  inputPrice: number; // per 1K tokens
  outputPrice: number; // per 1K tokens
  contextWindow?: number;
  capabilities?: string[];
  category?: string;
  isLatest?: boolean;
}

// Fresh pricing data updated July 2025 - All prices per 1K tokens
export const PRICING_DATA: ModelPricing[] = [
  ...OPENAI_PRICING,
  ...COHERE_PRICING,
  ...XAI_PRICING,
  ...DEEPSEEK_PRICING,
  ...MISTRAL_PRICING,
  ...GOOGLE_PRICING,
  ...ANTHROPIC_PRICING,
  ...AWS_BEDROCK_PRICING,
];

// Enhanced tokenization estimation for different providers
export function estimateTokens(
  text: string,
  provider: string = "OpenAI",
): number {
  if (!text || typeof text !== "string") return 0;

  const baseTokens = text.length / 4; // Base estimation

  // Provider-specific adjustments based on tokenizer differences
  switch (provider.toLowerCase()) {
    case "openai":
      // OpenAI's tokenizer (GPT models)
      return Math.ceil(baseTokens * 1.0);

    case "anthropic":
      // Claude models tend to have slightly more tokens
      return Math.ceil(baseTokens * 1.1);

    case "google ai":
    case "google":
      // Gemini models
      return Math.ceil(baseTokens * 0.95);

    case "deepseek":
      // DeepSeek tokenization similar to OpenAI
      return Math.ceil(baseTokens * 1.0);

    case "mistral ai":
    case "mistral":
      // Mistral models
      return Math.ceil(baseTokens * 1.05);

    case "xai":
      // xAI Grok models (similar to OpenAI)
      return Math.ceil(baseTokens * 1.0);

    case "cohere":
      // Cohere models
      return Math.ceil(baseTokens * 1.1);

    case "groq":
      // Grok (Llama models)
      return Math.ceil(baseTokens * 1.0);

    case "aws bedrock":
      // Bedrock varies by underlying model
      return Math.ceil(baseTokens * 1.05);

    default:
      return Math.ceil(baseTokens);
  }
}

// Enhanced cost calculation with improved fallbacks
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  provider: string,
  model: string,
): number {
  // Find exact model match first
  let pricing = PRICING_DATA.find(
    (p) =>
      p.provider.toLowerCase() === provider.toLowerCase() &&
      p.model.toLowerCase() === model.toLowerCase(),
  );

  if (!pricing) {
    // Try partial model name matching with better fallbacks
    pricing = PRICING_DATA.find(
      (p) =>
        p.provider.toLowerCase() === provider.toLowerCase() &&
        (p.model.toLowerCase().includes(model.toLowerCase()) ||
          model.toLowerCase().includes(p.model.toLowerCase())),
    );
  }

  if (!pricing) {
    // Provider-specific fallbacks to latest models
    const providerModels = PRICING_DATA.filter(
      (p) => p.provider.toLowerCase() === provider.toLowerCase(),
    );

    if (providerModels.length > 0) {
      // Use the latest model as fallback
      pricing = providerModels.find((p) => p.isLatest) || providerModels[0];
    }
  }

  if (!pricing) {
    // Ultimate fallbacks by model name patterns
    if (model.toLowerCase().includes("grok-4")) {
      pricing = PRICING_DATA.find((p) => p.model === "grok-4-0709");
    } else if (model.toLowerCase().includes("grok-3")) {
      pricing = PRICING_DATA.find((p) => p.model === "grok-3");
    } else if (model.toLowerCase().includes("grok-2")) {
      pricing = PRICING_DATA.find((p) => p.model === "grok-2-1212us-east-1");
    } else if (model.toLowerCase().includes("claude-3-opus")) {
      pricing = PRICING_DATA.find((p) => p.model === "claude-opus-4-20250514");
    } else if (model.toLowerCase().includes("claude-3-sonnet")) {
      pricing = PRICING_DATA.find(
        (p) => p.model === "claude-sonnet-4-20250514",
      );
    } else if (model.toLowerCase().includes("claude-3-haiku")) {
      pricing = PRICING_DATA.find(
        (p) => p.model === "claude-3-5-haiku-20241022",
      );
    } else if (model.toLowerCase().includes("gpt-4o")) {
      pricing = PRICING_DATA.find((p) => p.model === "gpt-4o-2024-08-06");
    } else if (model.toLowerCase().includes("gpt-4")) {
      pricing = PRICING_DATA.find((p) => p.model === "gpt-4.1-2025-04-14");
    } else if (model.toLowerCase().includes("gpt-3.5")) {
      pricing = PRICING_DATA.find((p) => p.model === "gpt-3.5-turbo-0125");
    } else if (model.toLowerCase().includes("gemini")) {
      pricing = PRICING_DATA.find((p) => p.model === "gemini-2.5-pro");
    } else if (model.toLowerCase().includes("mistral")) {
      pricing = PRICING_DATA.find((p) => p.model === "mistral-medium-latest");
    } else if (model.toLowerCase().includes("deepseek")) {
      pricing = PRICING_DATA.find((p) => p.model === "deepseek-chat");
    } else if (model.toLowerCase().includes("command")) {
      pricing = PRICING_DATA.find((p) => p.model === "command-a");
    }
  }

  if (!pricing) {
    // Final fallback to a reasonable default
    console.warn(
      `No pricing found for ${provider}/${model}, using default pricing`,
    );
    return inputTokens * 0.002 + outputTokens * 0.008; // Default OpenAI-like pricing
  }

  // Calculate cost based on found pricing
  const inputCost = (inputTokens / 1000) * pricing.inputPrice;
  const outputCost = (outputTokens / 1000) * pricing.outputPrice;

  return inputCost + outputCost;
}

// Get all available providers
export function getProviders(): string[] {
  const providers = new Set(PRICING_DATA.map((p) => p.provider));
  return Array.from(providers).sort();
}

// Get models for a specific provider
export function getModelsForProvider(provider: string): ModelPricing[] {
  return PRICING_DATA.filter(
    (p) => p.provider.toLowerCase() === provider.toLowerCase(),
  ).sort((a, b) => {
    // Sort by isLatest first, then by model name
    if (a.isLatest && !b.isLatest) return -1;
    if (!a.isLatest && b.isLatest) return 1;
    return a.model.localeCompare(b.model);
  });
}

// Get the cheapest model for a provider
export function getCheapestModel(provider: string): ModelPricing | null {
  const providerModels = getModelsForProvider(provider);
  if (providerModels.length === 0) return null;

  return providerModels.reduce((cheapest, current) => {
    const cheapestCost = cheapest.inputPrice + cheapest.outputPrice;
    const currentCost = current.inputPrice + current.outputPrice;
    return currentCost < cheapestCost ? current : cheapest;
  });
}

// Get models by category
export function getModelsByCategory(category: string): ModelPricing[] {
  return PRICING_DATA.filter(
    (p) => p.category?.toLowerCase() === category.toLowerCase(),
  ).sort((a, b) => {
    // Sort by isLatest first, then by provider, then by model name
    if (a.isLatest && !b.isLatest) return -1;
    if (!a.isLatest && b.isLatest) return 1;
    if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
    return a.model.localeCompare(b.model);
  });
}

// Compare model costs for given input/output tokens
export function compareModelCosts(
  inputTokens: number,
  outputTokens: number,
  providers?: string[],
): Array<{
  provider: string;
  model: string;
  cost: number;
  costPer1kTokens: number;
  isLatest: boolean;
}> {
  const totalTokens = inputTokens + outputTokens;
  const modelsToCompare = providers
    ? PRICING_DATA.filter((p) => providers.includes(p.provider))
    : PRICING_DATA;

  const comparisons = modelsToCompare.map((pricing) => {
    const cost = calculateCost(
      inputTokens,
      outputTokens,
      pricing.provider,
      pricing.model,
    );
    const costPer1kTokens = totalTokens > 0 ? (cost / totalTokens) * 1000 : 0;

    return {
      provider: pricing.provider,
      model: pricing.model,
      cost,
      costPer1kTokens,
      isLatest: pricing.isLatest || false,
    };
  });

  // Sort by cost (cheapest first), then by isLatest, then by provider, then by model
  return comparisons.sort((a, b) => {
    if (Math.abs(a.cost - b.cost) < 0.0001) {
      if (a.isLatest && !b.isLatest) return -1;
      if (!a.isLatest && b.isLatest) return 1;
      if (a.provider !== b.provider)
        return a.provider.localeCompare(b.provider);
      return a.model.localeCompare(b.model);
    }
    return a.cost - b.cost;
  });
}

// Export metadata
export const PRICING_METADATA = {
  lastUpdated: new Date().toISOString(),
  source: "WebScraperService - July 2025",
  totalProviders: getProviders().length,
  totalModels: PRICING_DATA.length,
  dataFormat: "per_1k_tokens",
  features: [
    "Latest 2025 pricing",
    "AWS Bedrock comprehensive model coverage",
    "Amazon Nova models (Micro, Lite, Pro, Premier, Canvas, Reel, Sonic)",
    "Amazon Titan embeddings",
    "Anthropic Claude 4 and Claude 3.7 on Bedrock",
    "AI21 Labs Jamba 1.5 models",
    "Meta Llama 4, 3.3, 3.2, 3.1, 3, and 2 models",
    "Cohere Command and embedding models on Bedrock",
    "DeepSeek R1 reasoning model",
    "Mistral Pixtral Large vision model",
    "Stability AI image generation models",
    "Luma AI video generation models",
    "Writer Palmyra models",
    "Cohere AI models (Command A, Command R+, Command R, Command R7B)",
    "Cohere embedding and rerank models (Embed 4, Rerank 3.5)",
    "Cohere fine-tuned model support",
    "xAI Grok models (Grok-4, Grok-3, Grok-2 with regional variants)",
    "Grok reasoning models with function calling and structured outputs",
    "Grok image generation models",
    "DeepSeek ultra-low cost models with off-peak pricing",
    "DeepSeek reasoning models with CoT capabilities",
    "DeepSeek context caching support",
    "Complete Mistral AI lineup (Premier & Open models)",
    "Mistral reasoning models (Magistral)",
    "Mistral coding models (Codestral, Devstral)",
    "Mistral vision models (Pixtral)",
    "Mistral edge models (Ministral)",
    "Mistral embedding and moderation models",
    "Reasoning models (o3, o4-mini)",
    "New GPT-4.1 and GPT-4.5 models",
    "Google Gemini 2.5/2.0/1.5/Flash/Pro/Audio/Preview/Native TTS",
    "Grok fast inference",
    "Enhanced tokenization estimation",
    "Improved model matching",
    "Provider-specific fallbacks",
  ],
};
