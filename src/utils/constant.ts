export const APP_NAME = import.meta.env.VITE_APP_NAME || "Cost Katana";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.10";

export const AI_SERVICES = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "text-embedding-ada-002"],
    color: "#00A67E",
    icon: "🤖",
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
    icon: "☁️",
  },
  "google-ai": {
    name: "Google AI",
    models: ["gemini-pro", "gemini-pro-vision", "palm-2"],
    color: "#4285F4",
    icon: "🧠",
  },
  anthropic: {
    name: "Anthropic",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    color: "#D97757",
    icon: "🔮",
  },
  huggingface: {
    name: "Hugging Face",
    models: ["llama-2", "mistral-7b", "falcon-40b"],
    color: "#FFD21E",
    icon: "🤗",
  },
  cohere: {
    name: "Cohere",
    models: ["command", "command-light", "embed-english-v3.0"],
    color: "#39E09B",
    icon: "💬",
  },
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      apiCalls: 1000,
      optimizations: 10,
    },
    features: [
      "Basic usage tracking",
      "Simple analytics",
      "Email alerts",
      "10 optimizations per month",
    ],
  },
  pro: {
    name: "Pro",
    price: 29,
    limits: {
      apiCalls: 10000,
      optimizations: 100,
    },
    features: [
      "Advanced analytics",
      "Unlimited history",
      "Priority support",
      "100 optimizations per month",
      "API access",
      "Custom alerts",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    limits: {
      apiCalls: -1, // Unlimited
      optimizations: -1,
    },
    features: [
      "Everything in Pro",
      "Unlimited usage",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
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
