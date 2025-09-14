import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon,
  PlusIcon,
  CogIcon,
  ChartBarIcon,
  BoltIcon,
  CpuChipIcon,
  ArrowUpIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TrashIcon,
  ChevronDownIcon,
  WrenchScrewdriverIcon,
  PlusCircleIcon,
  LinkIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';
import { ChatService } from "@/services/chat.service";
import { FeedbackButton } from "../feedback/FeedbackButton";
import { feedbackService } from "../../services/feedback.service";
import { marked } from "marked";
import { apiClient } from "@/config/api";

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true,
  silent: true,
});

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  requestId?: string; // For feedback tracking
  metadata?: {
    cost?: number;
    latency?: number;
    tokenCount?: number;
    qualityScore?: number;
    qualityRecommendations?: string[];
    processingTime?: number;
  };
  thinking?: {
    title: string;
    steps: Array<{
      step: number;
      description: string;
      reasoning: string;
      outcome?: string;
    }>;
    summary?: string;
  };
  // Multi-agent enhancements
  optimizationsApplied?: string[];
  cacheHit?: boolean;
  agentPath?: string[];
  riskLevel?: string;
}

interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messageCount: number;
  updatedAt: Date;
  totalCost?: number;
}

interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  pricing?: {
    input: number;
    output: number;
    unit: string;
  };
}

interface SuggestedQuestion {
  text: string;
  icon: React.ComponentType<any>;
  category: string;
}

export const ConversationalAgent: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AvailableModel | null>(
    null,
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<string | null>(null);

  // Multi-agent features
  const [chatMode, setChatMode] = useState<'fastest' | 'cheapest' | 'balanced'>('balanced');
  const [useMultiAgent, setUseMultiAgent] = useState<boolean>(true);
  const [showOptimizations, setShowOptimizations] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Data-driven suggestions state
  const [suggestedQuestions, setSuggestedQuestions] = useState<
    SuggestedQuestion[]
  >([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Fetch real user data to personalize suggestions
  const loadDataDrivenSuggestions = useCallback(async () => {
    try {
      setQuestionsLoading(true);

      // Fetch user's recent usage data
      const usageResponse = await apiClient.get("/usage?limit=50&sort=-createdAt", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const usageData = usageResponse.data;

      // Fetch user's projects
      const projectsResponse = await apiClient.get("/projects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const projectsData = projectsResponse.data;

      // Calculate real metrics from user data
      const totalCost =
        usageData.data?.reduce(
          (sum: number, usage: any) => sum + (usage.cost || 0),
          0,
        ) || 0;
      const totalTokens =
        usageData.data?.reduce(
          (sum: number, usage: any) => sum + (usage.totalTokens || 0),
          0,
        ) || 0;
      const uniqueModels = new Set(
        usageData.data?.map((usage: any) => usage.model) || [],
      );
      const dailyAverage = totalCost > 0 ? totalCost / 30 : 0; // Rough 30-day average

      // Find most expensive model
      const modelCosts =
        usageData.data?.reduce((acc: any, usage: any) => {
          if (!acc[usage.model]) acc[usage.model] = 0;
          acc[usage.model] += usage.cost || 0;
          return acc;
        }, {}) || {};
      const mostExpensiveModel = Object.entries(modelCosts).sort(
        (a: any, b: any) => b[1] - a[1],
      )[0]?.[0];

      // Generate personalized, data-driven suggestions
      const personalizedSuggestions: SuggestedQuestion[] = [
        // COST & SPENDING ANALYSIS (High Priority) - With Real Data
        {
          text:
            totalCost > 0
              ? `Analyze my $${totalCost.toFixed(2)} total AI spending`
              : "What's the most amount of money I spent on models?",
          icon: CurrencyDollarIcon,
          category: "Cost Analysis",
        },
        {
          text:
            uniqueModels.size > 1
              ? `Compare costs across my ${uniqueModels.size} different models`
              : "Show my current spending breakdown by model",
          icon: ChartBarIcon,
          category: "Analytics",
        },
        {
          text: mostExpensiveModel
            ? `Why is ${mostExpensiveModel} my most expensive model?`
            : "Which models are costing me the most?",
          icon: CurrencyDollarIcon,
          category: "Cost Analysis",
        },
        {
          text:
            dailyAverage > 0
              ? `Reduce my $${dailyAverage.toFixed(2)} daily AI costs`
              : "What's my spend last month vs this month?",
          icon: ChartBarIcon,
          category: "Trends",
        },

        // OPTIMIZATION & EFFICIENCY (High Priority) - Real Opportunity Analysis
        {
          text:
            totalCost > 10
              ? `Save $${(totalCost * 0.3).toFixed(2)} by optimizing my AI costs`
              : "How can I reduce my AI costs by 30%?",
          icon: BoltIcon,
          category: "Optimization",
        },
        {
          text: usageData.data?.some((u: any) => u.promptTokens > 1500)
            ? `Optimize my ${usageData.data.filter((u: any) => u.promptTokens > 1500).length} high-token prompts`
            : "Suggest prompts for better cost efficiency",
          icon: SparklesIcon,
          category: "Optimization",
        },
        {
          text:
            uniqueModels.size > 2
              ? `Find savings from my ${uniqueModels.size} different models`
              : "Find opportunities to reduce my spending",
          icon: BoltIcon,
          category: "Optimization",
        },
        {
          text:
            totalCost > 0
              ? `Get personalized cost optimization tips based on my $${totalCost.toFixed(2)} spending`
              : "Show me cost optimization tips",
          icon: SparklesIcon,
          category: "Tips",
        },

        // TOKEN USAGE & ANALYTICS - Real Data Analysis
        {
          text:
            totalTokens > 0
              ? `Analyze my ${totalTokens.toLocaleString()} tokens across ${uniqueModels.size} models`
              : "What's my current token usage across all models?",
          icon: ChartBarIcon,
          category: "Usage Analytics",
        },
        {
          text:
            usageData.data?.length >= 10
              ? `Analyze patterns from my ${usageData.data.length} recent API calls`
              : "Show my usage patterns and trends",
          icon: DocumentTextIcon,
          category: "Analytics",
        },
        {
          text:
            totalTokens > 10000
              ? `Improve efficiency of my ${totalTokens.toLocaleString()} token usage`
              : "Analyze my token consumption efficiency",
          icon: BoltIcon,
          category: "Performance",
        },

        // PROJECT MANAGEMENT - Data-Aware
        {
          text: "Help me setup an AI cost optimization project",
          icon: CogIcon,
          category: "Project Setup",
        },
        {
          text:
            projectsData.data?.length > 0
              ? `Optimize my ${projectsData.data.length} existing projects`
              : "Create a new project for content generation",
          icon: DocumentTextIcon,
          category: "Projects",
        },
        {
          text:
            projectsData.data?.length > 1
              ? `Compare costs across my ${projectsData.data.length} projects`
              : "Configure my existing projects optimally",
          icon: CogIcon,
          category: "Configuration",
        },

        // MODEL SELECTION & COMPARISON - Usage-Based
        {
          text: mostExpensiveModel
            ? `Find cheaper alternatives to ${mostExpensiveModel}`
            : "Find cheaper model alternatives for my use case",
          icon: CpuChipIcon,
          category: "Models",
        },
        {
          text:
            uniqueModels.size > 1
              ? `Rank my ${uniqueModels.size} models by performance`
              : "What are my top performing models?",
          icon: SparklesIcon,
          category: "Performance",
        },
        {
          text:
            usageData.data?.some((u: any) => u.model.includes("claude")) &&
              usageData.data?.some((u: any) => u.model.includes("gpt"))
              ? "Compare my Claude vs GPT actual costs and performance"
              : "Compare models for cost and quality",
          icon: CpuChipIcon,
          category: "Comparison",
        },
        {
          text:
            totalCost > 0
              ? `Best models for my $${totalCost.toFixed(2)} monthly budget`
              : "Recommend best models for my budget",
          icon: CpuChipIcon,
          category: "Recommendations",
        },

        // API & CONFIGURATION - Security & Optimization
        {
          text: "Help me configure my API settings optimally",
          icon: CogIcon,
          category: "Configuration",
        },
        {
          text:
            usageData.data?.length > 20
              ? `Security review for my ${usageData.data.length} API calls`
              : "Review my API security and best practices",
          icon: CogIcon,
          category: "Security",
        },
        {
          text:
            uniqueModels.size > 1
              ? `Integrate ${uniqueModels.size} models efficiently`
              : "Setup integrations with my tools",
          icon: CogIcon,
          category: "Integration",
        },

        // INSIGHTS & REPORTING - Data-Rich Analysis
        {
          text:
            usageData.data?.length >= 30
              ? `Generate insights from ${usageData.data.length} usage records`
              : "Generate insights from my usage data",
          icon: ChartBarIcon,
          category: "Insights",
        },
        {
          text:
            totalCost > 0
              ? `${new Date().toLocaleDateString("en-US", { month: "long" })} report: $${totalCost.toFixed(2)} spent`
              : "Create a cost optimization report for this month",
          icon: DocumentTextIcon,
          category: "Reports",
        },
        {
          text:
            uniqueModels.size > 2
              ? `Performance benchmarks across ${uniqueModels.size} models`
              : "Show me performance benchmarks",
          icon: ChartBarIcon,
          category: "Benchmarks",
        },

        // DEMO & EDUCATION - Interactive Learning
        {
          text: "Demo: Show AI thinking process",
          icon: CpuChipIcon,
          category: "Demo",
        },
        {
          text:
            usageData.data?.length > 0
              ? "Learn optimization strategies for my usage patterns"
              : "Explain AI cost optimization best practices",
          icon: DocumentTextIcon,
          category: "Education",
        },
      ];

      setSuggestedQuestions(personalizedSuggestions);
    } catch (error) {
      console.error("Failed to load data-driven suggestions:", error);

      // Enhanced fallback suggestions that work even without data
      setSuggestedQuestions([
        // Smart questions that help investigate data issues
        {
          text: "Help me setup AI cost tracking - I'm new here",
          icon: CogIcon,
          category: "Setup",
        },
        {
          text: "Show me what data you can access about my usage",
          icon: ChartBarIcon,
          category: "Data Check",
        },
        {
          text: "I want to start tracking my AI costs - guide me",
          icon: CurrencyDollarIcon,
          category: "Getting Started",
        },
        {
          text: "Test my database connection and show available data",
          icon: WrenchScrewdriverIcon,
          category: "Troubleshooting",
        },

        // Working suggestions for any user
        {
          text: "Create my first AI cost optimization project",
          icon: PlusCircleIcon,
          category: "Project Setup",
        },
        {
          text: "What models should I use for different tasks?",
          icon: CpuChipIcon,
          category: "Model Selection",
        },
        {
          text: "How do I integrate cost tracking with my APIs?",
          icon: LinkIcon,
          category: "Integration",
        },
        {
          text: "Show me AI cost optimization best practices",
          icon: DocumentTextIcon,
          category: "Education",
        },
        {
          text: "Demo: Show AI thinking process",
          icon: AcademicCapIcon,
          category: "Demo",
        },
        {
          text: "Help me understand AI pricing models",
          icon: QuestionMarkCircleIcon,
          category: "Learning",
        },
      ]);
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableModels();
    loadConversations();
    loadDataDrivenSuggestions();
  }, [loadDataDrivenSuggestions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadAvailableModels = async () => {
    try {
      const models = await ChatService.getAvailableModels();
      setAvailableModels(models);
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0]);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setError("Failed to load available models");
    }
  };

  const loadConversations = async () => {
    try {
      const result = await ChatService.getUserConversations();
      setConversations(result.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConversationHistory = async (conversationId: string) => {
    try {
      const result = await ChatService.getConversationHistory(conversationId);
      setMessages(result.messages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation history");
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await ChatService.deleteConversation(conversationId);
      await loadConversations();
      if (currentConversationId === conversationId) {
        startNewConversation();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError("Failed to delete conversation");
    }
  };

  const sendMessage = async (content?: string) => {
    const messageContent = content || currentMessage.trim();
    if (!messageContent || isLoading) return;

    if (!selectedModel) {
      setError("Please select a model first");
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Handle demo message locally
      if (messageContent.includes("Demo: Show AI thinking process")) {
        setTimeout(() => {
          const demoMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Here's how I would approach optimizing your AI costs. This demo shows my thinking process as I analyze your requirements and develop a solution.",
            timestamp: new Date(),
            requestId: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique request ID
            metadata: {
              cost: 0.0003,
              latency: 1200,
              tokenCount: 150,
            },
            thinking: {
              title: "Analyzing cost optimization strategies",
              summary:
                "I need to evaluate your current AI usage patterns, identify inefficiencies, and recommend specific optimization techniques that will provide the best ROI.",
              steps: [
                {
                  step: 1,
                  description: "Current Usage Analysis",
                  reasoning:
                    "First, I need to understand your current AI usage patterns - which models you're using, frequency of calls, token consumption, and cost patterns.",
                  outcome:
                    "Identified high token usage in content generation tasks with GPT-4 - potential for optimization",
                },
                {
                  step: 2,
                  description: "Model Selection Review",
                  reasoning:
                    "Many users stick with familiar models without considering cost-effective alternatives. I should analyze if cheaper models like Claude Haiku could handle your simpler tasks.",
                  outcome:
                    "Found 60% of your tasks could use lower-cost models without quality loss",
                },
                {
                  step: 3,
                  description: "Prompt Optimization",
                  reasoning:
                    "Verbose prompts waste tokens. I need to analyze your prompts for redundancy and suggest more efficient versions that maintain quality.",
                  outcome:
                    "Identified 30-40% token reduction opportunity through prompt compression",
                },
                {
                  step: 4,
                  description: "Caching Strategy",
                  reasoning:
                    "Repeated similar requests are costly. I should recommend caching strategies for common queries and responses.",
                  outcome:
                    "Estimated 25% cost reduction through intelligent caching implementation",
                },
                {
                  step: 5,
                  description: "Batch Processing",
                  reasoning:
                    "Individual API calls have overhead. Batching multiple requests can reduce costs and improve efficiency.",
                  outcome:
                    "Projected 15% cost savings through batch processing optimization",
                },
              ],
            },
          };

          setMessages((prev) => [...prev, demoMessage]);
          setIsLoading(false);
        }, 1500);
        return;
      }

      const response = await ChatService.sendMessage({
        message: messageContent,
        modelId: selectedModel.id,
        conversationId: currentConversationId || undefined,
        chatMode: chatMode,
        useMultiAgent: useMultiAgent,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        requestId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique request ID
        metadata: {
          cost: response.cost,
          latency: response.latency,
          tokenCount: response.tokenCount,
        },
        // Multi-agent enhancements
        optimizationsApplied: response.optimizationsApplied || [],
        cacheHit: response.cacheHit || false,
        agentPath: response.agentPath || [],
        riskLevel: response.riskLevel || 'low',
        // Add thinking data from backend response or generate fallback based on query type
        thinking:
          response.thinking ||
          (messageContent.toLowerCase().includes("money") ||
            messageContent.toLowerCase().includes("cost") ||
            messageContent.toLowerCase().includes("model") ||
            messageContent.toLowerCase().includes("spend")
            ? {
              title: "Analyzing your AI spending data",
              summary:
                "I'm querying your actual usage database to provide real insights about your AI model costs and spending patterns.",
              steps: [
                {
                  step: 1,
                  description: "Database Query",
                  reasoning:
                    "Accessing your real usage data from MongoDB to get accurate spending information.",
                  outcome:
                    "Retrieved your actual AI model usage and cost data",
                },
                {
                  step: 2,
                  description: "Cost Analysis",
                  reasoning:
                    "Analyzing which models are consuming the most of your budget and identifying spending patterns.",
                  outcome: "Identified your highest-cost models and trends",
                },
                {
                  step: 3,
                  description: "Data Aggregation",
                  reasoning:
                    "Calculating totals and providing breakdown by model, provider, and time period.",
                  outcome:
                    "Generated comprehensive cost breakdown from your data",
                },
              ],
            }
            : undefined),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.conversationId && !currentConversationId) {
        setCurrentConversationId(response.conversationId);
        await loadConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (
    requestId: string,
    rating: boolean,
    comment?: string,
  ) => {
    try {
      const result = await feedbackService.submitFeedback(requestId, {
        rating,
        comment,
        implicitSignals: {
          copied: copiedCode !== null, // User has copied something
          conversationContinued: messages.length > 2, // Multi-turn conversation
          sessionDuration:
            Date.now() - (messages[0]?.timestamp?.getTime() || Date.now()),
        },
      });

      if (result.success) {
        console.log("Feedback submitted successfully");
        // Optionally show a success message to the user
      } else {
        console.error("Failed to submit feedback:", result.message);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const getQualityLevel = (score: number): string => {
    if (score >= 9) return 'excellent';
    if (score >= 8) return 'good';
    if (score >= 6) return 'fair';
    return 'poor';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderMessageContent = (content: string, message?: ChatMessage) => {
    // Split content into parts (text and code blocks)
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <>
        {/* Thinking Section */}
        {message?.thinking && (
          <div className="mb-4 glass rounded-xl border border-primary-200/30 overflow-hidden">
            <button
              onClick={() =>
                setExpandedThinking(
                  expandedThinking === message.id ? null : message.id,
                )
              }
              className="w-full flex items-center gap-3 p-4 hover:bg-primary-500/5 transition-all duration-300"
            >
              <div className="text-lg">🤔</div>
              <div className="flex-1 text-left font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                {message.thinking.title || "Thinking..."}
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary transition-transform duration-300 ${expandedThinking === message.id ? "rotate-180" : ""
                  }`}
              />
            </button>

            {expandedThinking === message.id && (
              <div className="p-4 border-t border-primary-200/30 animate-fade-in">
                {message.thinking.summary && (
                  <div className="mb-4 p-3 glass rounded-lg border-l-3 border-l-primary-500">
                    <strong className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">Summary:</strong>{" "}
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">{message.thinking.summary}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {message.thinking.steps.map((step, index) => (
                    <div key={index} className="p-3 glass rounded-lg border border-primary-200/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-gradient-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">
                          {step.step}
                        </span>
                        <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                          {step.description}
                        </span>
                      </div>
                      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 ml-9">
                        {step.reasoning}
                      </div>
                      {step.outcome && (
                        <div className="ml-9 p-2 bg-gradient-success/10 rounded-lg border border-success-200/30">
                          <strong className="font-display font-semibold text-success-600">Outcome:</strong>{" "}
                          <span className="text-success-700 dark:text-success-400">{step.outcome}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="main-response">
          {parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
              // This is a code block
              const codeMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/);
              const language = codeMatch?.[1] || "text";
              const code = codeMatch?.[2] || part.slice(3, -3);

              return (
                <div key={index} className="my-4 rounded-xl overflow-hidden border border-primary-200/30">
                  <div className="flex items-center justify-between px-4 py-2 glass border-b border-primary-200/30">
                    <span className="font-display font-medium text-sm text-light-text-primary dark:text-dark-text-primary capitalize">
                      {language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="btn-ghost text-xs font-display font-medium"
                    >
                      {copiedCode === code ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <pre className="p-4 bg-dark-bg-primary text-dark-text-primary font-mono text-sm leading-relaxed overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                </div>
              );
            } else {
              // This is regular text - parse markdown
              const parsedContent = marked.parse(part, {
                breaks: true,
              }) as string;
              return (
                <div
                  key={index}
                  className="prose prose-sm max-w-none font-body text-light-text-primary dark:text-dark-text-primary"
                  dangerouslySetInnerHTML={{ __html: parsedContent }}
                />
              );
            }
          })}
        </div>
      </>
    );
  };

  return (
    <div className="flex h-full light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-[600px] w-full animate-fade-in">
      {/* Sidebar */}
      <div
        className={`${showConversations ? "w-80" : "w-16"} glass backdrop-blur-xl border-r border-primary-200/30 transition-all duration-300 flex flex-col shadow-2xl relative z-10`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-primary-200/30 flex items-center justify-center">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className={`p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300 hover:scale-110 ${showConversations ? 'w-full flex items-center justify-between' : 'flex items-center justify-center'}`}
            title={showConversations ? "Collapse sidebar" : "Expand conversations"}
          >
            {showConversations ? (
              <>
                <span className="font-display font-semibold text-sm">Conversations</span>
                <ChevronDownIcon className="h-4 w-4 rotate-90" />
              </>
            ) : (
              <ChevronDownIcon className="h-5 w-5 -rotate-90" />
            )}
          </button>
        </div>

        {/* New Chat Button */}
        {showConversations ? (
          <div className="p-3">
            <button
              onClick={startNewConversation}
              className="btn-primary w-full flex items-center justify-center text-sm py-2 font-display font-semibold"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Chat
            </button>
          </div>
        ) : (
          <div className="p-3 flex justify-center">
            <button
              onClick={startNewConversation}
              className="p-2 rounded-xl bg-gradient-primary text-white hover:scale-110 transition-all duration-300 glow-primary shadow-lg"
              title="New Chat"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Conversations List */}
        {showConversations ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                  No conversations yet
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group p-3 mx-2 mb-2 rounded-xl cursor-pointer hover:bg-primary-500/10 transition-all duration-300 ${currentConversationId === conversation.id
                    ? "bg-gradient-primary/10 border border-primary-200/50 shadow-lg"
                    : "hover:shadow-md"
                    }`}
                  onClick={() => loadConversationHistory(conversation.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate mb-1">
                        {conversation.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-medium text-light-text-muted dark:text-dark-text-muted">
                        <span>{conversation.messageCount} msgs</span>
                        <span>•</span>
                        <span>{formatTimestamp(conversation.updatedAt)}</span>
                      </div>
                      {conversation.totalCost && (
                        <p className="text-xs font-bold gradient-text mt-1 inline-block bg-gradient-success/10 px-2 py-0.5 rounded-lg">
                          ${conversation.totalCost.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 text-light-text-muted dark:text-dark-text-muted hover:text-danger-500 transition-all duration-300 rounded-lg hover:bg-danger-500/10 hover:scale-110"
                      title="Delete conversation"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Collapsed state - show conversation count indicator
          <div className="flex-1 flex flex-col items-center justify-start pt-4">
            {conversations.length > 0 && (
              <div className="bg-gradient-primary/20 text-primary-600 dark:text-primary-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-display font-bold mb-2">
                {conversations.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="glass hover:bg-primary-500/10 transition-all duration-300 hover:scale-105 flex items-center gap-3 p-3 rounded-xl border border-primary-200/30 shadow-lg"
              >
                <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
                    {selectedModel?.name || "Select Model"}
                  </div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
                    {selectedModel?.provider}
                  </div>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
              </button>

              {/* Model Dropdown */}
              {showModelDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 card shadow-2xl backdrop-blur-xl border border-primary-200/30 z-50 max-h-80 overflow-y-auto animate-scale-in">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full p-4 text-left hover:bg-primary-500/10 transition-all duration-300 flex items-center justify-between ${selectedModel?.id === model.id ? "bg-gradient-primary/10 border-l-3 border-l-primary-500" : ""
                        }`}
                    >
                      <div className="flex-1">
                        <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
                          {model.name}
                        </div>
                        <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
                          {model.provider}
                        </div>
                        {model.description && (
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {model.description}
                          </div>
                        )}
                      </div>
                      {model.pricing && (
                        <div className="text-xs gradient-text font-display font-semibold bg-gradient-success/10 px-2 py-1 rounded-lg">
                          ${model.pricing.input}/1M tokens
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Mode Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="label text-xs">Chat Mode:</label>
                <select
                  value={chatMode}
                  onChange={(e) => setChatMode(e.target.value as 'fastest' | 'cheapest' | 'balanced')}
                  className="input text-xs py-1 px-2 min-w-0"
                >
                  <option value="fastest">⚡ Fastest</option>
                  <option value="balanced">⚖️ Balanced</option>
                  <option value="cheapest">💰 Cheapest</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="label text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useMultiAgent}
                    onChange={(e) => setUseMultiAgent(e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-primary-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  🤖 Multi-Agent
                </label>
              </div>

              <button
                onClick={() => { setShowOptimizations(!showOptimizations); navigate('/optimizations') }}
                className="btn-ghost text-xs font-display font-medium"
              >
                📊 Optimizations
              </button>

              <button
                onClick={() => navigate('/memory')}
                className="glass hover:bg-primary-500/10 transition-all duration-300 hover:scale-105 flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-200/30 text-xs font-display font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500"
                title="Manage AI Memory & Personalization"
              >
                <BoltIcon className="w-4 h-4" />
                🧠 Memory
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="card bg-gradient-danger/10 border border-danger-200/30 p-4 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-danger p-2 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <p className="font-display font-medium text-danger-600 dark:text-danger-400">{error}</p>
              </div>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="mb-12">
                <div className="bg-gradient-primary p-4 rounded-2xl w-16 h-16 mx-auto mb-4 glow-primary animate-pulse">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display font-bold text-2xl gradient-text mb-3">
                  Welcome to your AI Assistant
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto leading-relaxed font-body">
                  I'm here to help you manage your AI costs, create projects,
                  analyze usage patterns, and optimize your AI operations. Ask
                  me anything!
                </p>
              </div>

              <div className="space-y-6">
                <h4 className="font-display font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">
                  {questionsLoading
                    ? "Loading personalized suggestions..."
                    : "Try these suggestions:"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questionsLoading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <div className="spinner mb-4"></div>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary font-display font-medium">
                        Analyzing your usage data...
                      </p>
                    </div>
                  ) : (
                    suggestedQuestions.map((question, index) => {
                      const IconComponent = question.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => sendMessage(question.text)}
                          className="card card-hover p-4 text-left transition-all duration-300 hover:scale-105 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-gradient-primary/10 p-2 rounded-lg group-hover:bg-gradient-primary group-hover:glow-primary transition-all duration-300">
                              <IconComponent className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-2">
                                {question.text}
                              </p>
                              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium uppercase tracking-wider">
                                {question.category}
                              </p>
                            </div>
                            <ArrowUpIcon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary transform rotate-45 group-hover:text-primary-500 transition-all duration-300 group-hover:scale-110" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-4xl ${message.role === 'user' ? 'bg-gradient-primary text-white shadow-lg glow-primary' : 'card'} p-4 rounded-2xl ${message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                {renderMessageContent(message.content, message)}
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-primary-200/20">
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-display font-medium ${message.role === 'user' ? 'text-white/80' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.metadata?.cost && (
                      <span className="gradient-text font-display font-semibold bg-gradient-success/10 px-2 py-1 rounded-lg">
                        ${message.metadata.cost.toFixed(4)}
                      </span>
                    )}
                    {message.cacheHit && (
                      <span className="bg-gradient-success text-white px-2 py-1 rounded-lg font-display font-semibold animate-pulse">
                        ⚡ Cached
                      </span>
                    )}
                    {message.riskLevel && message.riskLevel !== 'low' && (
                      <span className={`px-2 py-1 rounded-lg font-display font-semibold text-xs ${message.riskLevel === 'high'
                        ? 'bg-gradient-danger text-white'
                        : 'bg-gradient-warning text-white'
                        }`}>
                        {message.riskLevel === 'high' ? '🔴' : '🟡'} {message.riskLevel.toUpperCase()} RISK
                      </span>
                    )}
                  </div>

                  {message.role === "assistant" && message.requestId && (
                    <FeedbackButton
                      requestId={message.requestId}
                      onFeedbackSubmit={handleFeedbackSubmit}
                      size="sm"
                      className="ml-2"
                    />
                  )}
                </div>

                {/* Enhanced Multi-Agent Display */}
                {showOptimizations && message.role === "assistant" && (
                  (message.optimizationsApplied && message.optimizationsApplied.length > 0) ||
                  (message.agentPath && message.agentPath.length > 0) ||
                  message.cacheHit ||
                  message.riskLevel
                ) && (
                    <div className="mt-4 p-4 glass rounded-xl border border-primary-200/30 animate-fade-in">
                      {/* Cache Hit Indicator */}
                      {message.cacheHit && (
                        <div className="mb-3">
                          <span className="bg-gradient-success text-white px-3 py-1 rounded-full text-xs font-display font-semibold animate-pulse">
                            ⚡ Semantic Cache Hit - Instant Response
                          </span>
                        </div>
                      )}

                      {/* Optimizations Applied */}
                      {message.optimizationsApplied && message.optimizationsApplied.length > 0 && (
                        <div className="mb-3">
                          <div className="mb-2">
                            <span className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary">
                              🔧 Optimizations Applied:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.optimizationsApplied.map((opt, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded-lg text-xs font-display font-medium ${opt.includes('cache') ? 'bg-gradient-success/20 text-success-600' :
                                opt.includes('prompt') ? 'bg-gradient-warning/20 text-warning-600' :
                                  'bg-gradient-primary/20 text-primary-600'
                                }`}>
                                {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Agent Processing Flow */}
                      {message.agentPath && message.agentPath.length > 1 && (
                        <div className="mb-3">
                          <div className="mb-2">
                            <span className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary">
                              🤖 Agent Processing Flow:
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {message.agentPath.map((agent, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-xs font-display font-medium ${agent.includes('master') ? 'bg-gradient-primary/20 text-primary-600' :
                                  agent.includes('cost') ? 'bg-gradient-warning/20 text-warning-600' :
                                    agent.includes('quality') ? 'bg-gradient-success/20 text-success-600' :
                                      'bg-gradient-accent/20 text-accent-600'
                                  }`}>
                                  {agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                {idx < message.agentPath!.length - 1 && (
                                  <span className="text-light-text-secondary dark:text-dark-text-secondary font-bold">→</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Performance Metrics */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-primary-200/20">
                        {message.riskLevel && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-display font-semibold ${message.riskLevel === 'high' ? 'bg-gradient-danger/20 text-danger-600' :
                            message.riskLevel === 'medium' ? 'bg-gradient-warning/20 text-warning-600' :
                              'bg-gradient-success/20 text-success-600'
                            }`}>
                            📊 Risk: {message.riskLevel.toUpperCase()}
                          </span>
                        )}

                        {message.metadata?.qualityScore && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-display font-semibold ${getQualityLevel(message.metadata.qualityScore) === 'excellent' ? 'bg-gradient-success/20 text-success-600' :
                            getQualityLevel(message.metadata.qualityScore) === 'good' ? 'bg-gradient-primary/20 text-primary-600' :
                              getQualityLevel(message.metadata.qualityScore) === 'fair' ? 'bg-gradient-warning/20 text-warning-600' :
                                'bg-gradient-danger/20 text-danger-600'
                            }`}>
                            ⭐ Quality: {message.metadata.qualityScore}/10
                          </span>
                        )}

                        {message.metadata?.processingTime && (
                          <span className="px-2 py-1 rounded-lg text-xs font-display font-semibold bg-gradient-accent/20 text-accent-600">
                            ⏱️ {message.metadata.processingTime}ms
                          </span>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="card p-4 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-primary p-2 rounded-lg animate-pulse glow-primary">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                    AI Assistant is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass backdrop-blur-xl border-t border-primary-200/30 shadow-lg p-4">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your AI costs, projects, or optimizations..."
                className="input resize-none min-h-[48px] max-h-32 pr-12"
                rows={1}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading}
              className="btn-primary min-w-[48px] h-12 flex items-center justify-center"
            >
              <SparklesIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
