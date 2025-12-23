export const APP_NAME = import.meta.env.VITE_APP_NAME || "Cost Katana";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.10";

export const AI_SERVICES = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "text-embedding-ada-002"],
    color: "#FFF",
    logo: "/assets/openai.png", // Logo path - add logo to public/assets/ folder
  },
  "aws-bedrock": {
    name: "AWS Bedrock",
    models: [
      "claude-3-opus",
      "claude-3-sonnet",
      "claude-3-haiku",
      "claude-2.1",
    ],
    color: "#FF9900",
    logo: "/assets/aws-bedrock.svg", // Logo path - add logo to public/assets/ folder
  },
  "google-ai": {
    name: "Google AI",
    models: ["gemini-pro", "gemini-pro-vision", "palm-2"],
    color: "#4285F4",
    logo: "/assets/gemini-ai.svg", // Logo path - add logo to public/assets/ folder
  },
  anthropic: {
    name: "Anthropic",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    color: "#D97757",
    logo: "/assets/anthropic.png", // Logo path - add logo to public/assets/ folder
  },
  huggingface: {
    name: "Hugging Face",
    models: ["llama-2", "mistral-7b", "falcon-40b"],
    color: "#FFD21E",
    logo: "/assets/huggingface.svg", // Logo path - add logo to public/assets/ folder
  },
  cohere: {
    name: "Cohere",
    models: ["command", "command-light", "embed-english-v3.0"],
    color: "#39E09B",
    logo: "/assets/cohere.svg", // Logo path - add logo to public/assets/ folder
  },
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    displayName: "Free",
    price: 0,
    yearlyPrice: 0,
    currency: "USD",
    trialDays: 0,
    limits: {
      tokensPerMonth: 1_000_000,
      requestsPerMonth: 5_000,
      logsPerMonth: 5_000,
      projects: 1,
      workflows: 10,
      seats: 1,
      cortexDailyUsage: 0,
    },
    allowedModels: ['claude-3-haiku', 'gpt-3.5-turbo', 'gemini-1.5-flash'],
    features: [
      "Basic usage tracking",
      "Simple analytics",
      "Email alerts",
      "1M tokens/month",
      "5K requests/month",
      "5K logs/month",
      "1 project",
      "10 workflows",
    ],
  },
  plus: {
    name: "Plus",
    displayName: "Plus",
    price: 25,
    yearlyPrice: 240, // 20% discount
    currency: "USD",
    trialDays: 7,
    limits: {
      tokensPerMonth: 2_000_000,
      requestsPerMonth: 10_000,
      logsPerMonth: -1, // Unlimited
      projects: -1, // Unlimited
      workflows: 100,
      seats: 1,
      cortexDailyUsage: 0,
    },
    allowedModels: ['*'], // All models
    features: [
      "Advanced analytics",
      "Unlimited logs & projects",
      "2M tokens/month",
      "10K requests/month",
      "100 workflows",
      "All AI models",
      "Priority support",
      "Overage: $5/1M tokens",
    ],
    overage: {
      tokensPerMillion: 5,
      seatsPerUser: 0,
    },
    popular: true,
  },
  pro: {
    name: "Pro",
    displayName: "Pro",
    price: 499,
    yearlyPrice: 4790, // 20% discount
    currency: "USD",
    trialDays: 7,
    limits: {
      tokensPerMonth: 5_000_000, // Base, additional paid
      requestsPerMonth: 50_000,
      logsPerMonth: -1, // Unlimited
      projects: -1, // Unlimited
      workflows: 100, // Per user
      seats: 20,
      cortexDailyUsage: 0,
    },
    allowedModels: ['*'], // All models
    features: [
      "Everything in Plus",
      "50K requests/month",
      "20 seats included",
      "All AI models + AWS Bedrock",
      "Advanced metrics",
      "Priority support",
      "Overage: $5/1M tokens, $20/user/month",
    ],
    overage: {
      tokensPerMillion: 5,
      seatsPerUser: 20,
    },
  },
  enterprise: {
    name: "Enterprise",
    displayName: "Enterprise",
    price: 0, // Custom pricing
    yearlyPrice: 0,
    currency: "USD",
    trialDays: 0,
    limits: {
      tokensPerMonth: -1, // Unlimited
      requestsPerMonth: -1, // Unlimited
      logsPerMonth: -1, // Unlimited
      projects: -1, // Unlimited
      workflows: -1, // Unlimited
      seats: -1, // Custom
      cortexDailyUsage: -1, // Unlimited
    },
    allowedModels: ['*', 'custom'], // All models + custom
    features: [
      "Everything in Pro",
      "Unlimited everything",
      "Custom AI models",
      "Unlimited Cortex",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
      "Discord/Slack support",
    ],
  },
} as const;

export const ALERT_TYPES = {
  cost_threshold: {
    label: "Cost Threshold",
    icon: "💰",
    color: "warning",
  },
  usage_spike: {
    label: "Usage Spike",
    icon: "📈",
    color: "danger",
  },
  optimization_available: {
    label: "Optimization Available",
    icon: "💡",
    color: "success",
  },
  weekly_summary: {
    label: "Weekly Summary",
    icon: "📊",
    color: "primary",
  },
  monthly_summary: {
    label: "Monthly Summary",
    icon: "📅",
    color: "primary",
  },
  error_rate: {
    label: "Error Rate",
    icon: "⚠️",
    color: "danger",
  },
} as const;

export const OPTIMIZATION_CATEGORIES = {
  prompt_reduction: {
    label: "Prompt Reduction",
    description: "Reduce prompt length while maintaining intent",
    icon: "✂️",
  },
  context_optimization: {
    label: "Context Optimization",
    description: "Optimize context window usage",
    icon: "🎯",
  },
  response_formatting: {
    label: "Response Formatting",
    description: "Structure responses for efficiency",
    icon: "📝",
  },
  batch_processing: {
    label: "Batch Processing",
    description: "Combine multiple requests",
    icon: "📦",
  },
  model_selection: {
    label: "Model Selection",
    description: "Use more cost-effective models",
    icon: "🔄",
  },
} as const;

export const DATE_RANGES = {
  today: {
    label: "Today",
    getValue: () => ({
      startDate: new Date(new Date().setHours(0, 0, 0, 0)),
      endDate: new Date(new Date().setHours(23, 59, 59, 999)),
    }),
  },
  yesterday: {
    label: "Yesterday",
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: new Date(yesterday.setHours(0, 0, 0, 0)),
        endDate: new Date(yesterday.setHours(23, 59, 59, 999)),
      };
    },
  },
  last7Days: {
    label: "Last 7 Days",
    getValue: () => ({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }),
  },
  last30Days: {
    label: "Last 30 Days",
    getValue: () => ({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }),
  },
  thisMonth: {
    label: "This Month",
    getValue: () => {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      };
    },
  },
  lastMonth: {
    label: "Last Month",
    getValue: () => {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        ),
      };
    },
  },
} as const;

export const CHART_COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  indigo: "#6366F1",
  teal: "#14B8A6",
} as const;

export const PAGE_SIZES = [10, 20, 50, 100] as const;
