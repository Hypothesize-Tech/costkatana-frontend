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
          <div className="thinking-section">
            <button
              onClick={() =>
                setExpandedThinking(
                  expandedThinking === message.id ? null : message.id,
                )
              }
              className="thinking-header"
            >
              <div className="thinking-icon">🤔</div>
              <div className="thinking-title">
                {message.thinking.title || "Thinking..."}
              </div>
              <ChevronDownIcon
                className={`thinking-chevron ${expandedThinking === message.id ? "expanded" : ""}`}
              />
            </button>

            {expandedThinking === message.id && (
              <div className="thinking-content">
                {message.thinking.summary && (
                  <div className="thinking-summary">
                    <strong>Summary:</strong> {message.thinking.summary}
                  </div>
                )}

                <div className="thinking-steps">
                  {message.thinking.steps.map((step, index) => (
                    <div key={index} className="thinking-step">
                      <div className="step-header">
                        <span className="step-number">{step.step}</span>
                        <span className="step-description">
                          {step.description}
                        </span>
                      </div>
                      <div className="step-reasoning">{step.reasoning}</div>
                      {step.outcome && (
                        <div className="step-outcome">
                          <strong>Outcome:</strong> {step.outcome}
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
                <div key={index} className="code-block-container">
                  <div className="code-block-header">
                    <span className="code-language">{language}</span>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="copy-button"
                    >
                      {copiedCode === code ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <pre className="code-block">
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
                  className="text-content markdown-content"
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
    <div className="chat-container">
      {/* Sidebar */}
      <div
        className={`sidebar ${showConversations ? "expanded" : "collapsed"}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="toggle-button"
          >
            <ChevronDownIcon
              className={`icon ${showConversations ? "rotated" : ""}`}
            />
            {showConversations && <span>Conversations</span>}
          </button>
        </div>

        {/* New Chat Button */}
        {showConversations && (
          <div className="new-chat-container">
            <button onClick={startNewConversation} className="new-chat-button">
              <PlusIcon className="icon-small" />
              New Chat
            </button>
          </div>
        )}

        {/* Conversations List */}
        {showConversations && (
          <div className="conversations-list">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${currentConversationId === conversation.id ? "active" : ""}`}
                onClick={() => loadConversationHistory(conversation.id)}
              >
                <div className="conversation-content">
                  <h4 className="conversation-title">{conversation.title}</h4>
                  <p className="conversation-info">
                    {conversation.messageCount} messages •{" "}
                    {formatTimestamp(conversation.updatedAt)}
                  </p>
                  {conversation.totalCost && (
                    <p className="conversation-cost">
                      ${conversation.totalCost.toFixed(4)} total cost
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="delete-button"
                >
                  <TrashIcon className="icon-small" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="model-selector">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="model-button"
              >
                <SparklesIcon className="icon-small" />
                <div className="model-info">
                  <div className="model-name">
                    {selectedModel?.name || "Select Model"}
                  </div>
                  <div className="model-provider">
                    {selectedModel?.provider}
                  </div>
                </div>
                <ChevronDownIcon className="icon-small" />
              </button>

              {/* Model Dropdown */}
              {showModelDropdown && (
                <div className="model-dropdown">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className={`model-option ${selectedModel?.id === model.id ? "active" : ""}`}
                    >
                      <div className="model-details">
                        <div className="model-name">{model.name}</div>
                        <div className="model-provider">{model.provider}</div>
                        {model.description && (
                          <div className="model-description">
                            {model.description}
                          </div>
                        )}
                      </div>
                      {model.pricing && (
                        <div className="model-pricing">
                          ${model.pricing.input}/1M tokens
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {error && <div className="error-message">{error}</div>}

          {messages.length === 0 && !isLoading && (
            <div className="welcome-section">
              <div className="welcome-content">
                <SparklesIcon className="welcome-icon" />
                <h3 className="welcome-title">Welcome to your AI Assistant</h3>
                <p className="welcome-description">
                  I'm here to help you manage your AI costs, create projects,
                  analyze usage patterns, and optimize your AI operations. Ask
                  me anything!
                </p>
              </div>

              <div className="suggestions-section">
                <h4 className="suggestions-title">
                  {questionsLoading
                    ? "Loading personalized suggestions..."
                    : "Try these suggestions:"}
                </h4>
                <div className="suggestions-grid">
                  {questionsLoading ? (
                    <div className="loading-suggestions">
                      <div className="loading-spinner"></div>
                      <p>Analyzing your usage data...</p>
                    </div>
                  ) : (
                    suggestedQuestions.map((question, index) => {
                      const IconComponent = question.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => sendMessage(question.text)}
                          className="suggestion-card"
                        >
                          <IconComponent className="suggestion-icon" />
                          <div className="suggestion-content">
                            <p className="suggestion-text">{question.text}</p>
                            <p className="suggestion-category">
                              {question.category}
                            </p>
                          </div>
                          <ArrowUpIcon className="suggestion-arrow" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                {renderMessageContent(message.content, message)}
                <div className="message-footer">
                  <div className="message-info">
                    <span className="message-time">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.metadata?.cost && (
                      <span className="message-cost">
                        ${message.metadata.cost.toFixed(4)}
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
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <SparklesIcon className="typing-icon" />
                  <span>AI Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your AI costs, projects, or optimizations..."
              className="message-input"
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading}
              className="send-button"
            >
              <SparklesIcon className="icon-small" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
                .chat-container {
                    display: flex;
                    height: 100%;
                    min-height: 600px;
                    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
                    color: #1e293b;
                    letter-spacing: -0.01em;
                }

                /* Sidebar Styles */
                .sidebar {
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
                }

                .sidebar.expanded {
                    width: 320px;
                }

                .sidebar.collapsed {
                    width: 64px;
                }

                .sidebar-header {
                    padding: 16px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .toggle-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .toggle-button:hover {
                    color: #334155;
                }

                .icon {
                    width: 20px;
                    height: 20px;
                    transition: transform 0.2s;
                }

                .icon.rotated {
                    transform: rotate(180deg);
                }

                .icon-small {
                    width: 16px;
                    height: 16px;
                }

                .new-chat-container {
                    padding: 16px;
                }

                .new-chat-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .sidebar.collapsed .new-chat-button {
                    padding: 10px;
                    justify-content: center;
                    gap: 0;
                    min-width: 40px;
                    width: 40px;
                    border-radius: 6px;
                }

                .new-chat-button:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                }

                .conversations-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .conversation-item {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: start;
                    gap: 12px;
                }

                .conversation-item:hover {
                    background: #f8fafc;
                }

                .conversation-item.active {
                    background: #eff6ff;
                    border-left: 3px solid #3b82f6;
                }

                .conversation-content {
                    flex: 1;
                    min-width: 0;
                }

                .conversation-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 6px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: -0.01em;
                }

                .conversation-info {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }

                .conversation-cost {
                    font-size: 11px;
                    color: #059669;
                    margin: 4px 0 0 0;
                    font-weight: 600;
                    background: #ecfdf5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    display: inline-block;
                }

                .delete-button {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.2s;
                }

                .delete-button:hover {
                    color: #dc2626;
                }

                /* Main Chat Styles */
                .main-chat {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-header {
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .model-selector {
                    position: relative;
                }

                .model-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .model-button:hover {
                    background: #e2e8f0;
                }

                .model-info {
                    text-align: left;
                }

                .model-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1e293b;
                }

                .model-provider {
                    font-size: 12px;
                    color: #64748b;
                }

                .model-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 4px;
                    width: 320px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .model-option {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    background: white;
                    cursor: pointer;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: background-color 0.2s;
                }

                .model-option:hover {
                    background: #f8fafc;
                }

                .model-option.active {
                    background: #eff6ff;
                }

                .model-details {
                    flex: 1;
                }

                .model-description {
                    font-size: 11px;
                    color: #64748b;
                    margin-top: 2px;
                }

                .model-pricing {
                    font-size: 12px;
                    color: #059669;
                    font-weight: 600;
                    background: #ecfdf5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid #d1fae5;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nova-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                    color: #14532d;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    border: 1px solid #a7f3d0;
                    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.1);
                    letter-spacing: 0.01em;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Messages Area */
                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    scroll-behavior: smooth;
                }

                .error-message {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }

                /* Welcome Section */
                .welcome-section {
                    text-align: center;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .welcome-content {
                    margin-bottom: 48px;
                }

                .welcome-icon {
                    width: 64px;
                    height: 64px;
                    color: #3b82f6;
                    margin: 0 auto 16px;
                }

                .welcome-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 12px 0;
                    letter-spacing: -0.02em;
                }

                .welcome-description {
                    color: #475569;
                    max-width: 520px;
                    margin: 0 auto;
                    line-height: 1.6;
                    font-size: 16px;
                }

                .suggestions-section {
                    margin-bottom: 16px;
                }

                .suggestions-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 24px 0;
                }

                .suggestions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 12px;
                }

                .suggestion-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 18px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .suggestion-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                }

                .suggestion-icon {
                    width: 22px;
                    height: 22px;
                    color: #3b82f6;
                    flex-shrink: 0;
                    opacity: 0.9;
                }

                .suggestion-content {
                    flex: 1;
                    min-width: 0;
                }

                .suggestion-text {
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    letter-spacing: -0.01em;
                }

                .suggestion-category {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .suggestion-arrow {
                    width: 16px;
                    height: 16px;
                    color: #9ca3af;
                    transform: rotate(45deg);
                }

                /* Message Styles */
                .message {
                    display: flex;
                    margin-bottom: 24px;
                    max-width: 100%;
                }

                .message.user {
                    justify-content: flex-end;
                }

                .message.assistant {
                    justify-content: flex-start;
                }

                .message-content {
                    max-width: 70%;
                    padding: 16px 20px;
                    border-radius: 16px;
                    line-height: 1.5;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .message.user .message-content {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .message.assistant .message-content {
                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                    border: 1px solid #e2e8f0;
                    color: #0f172a;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                .text-content {
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                /* Code Block Styles */
                .code-block-container {
                    margin: 12px 0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #1e293b;
                }

                .code-block-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background: #334155;
                    color: #e2e8f0;
                    font-size: 12px;
                }

                .code-language {
                    text-transform: capitalize;
                    font-weight: 500;
                }

                .copy-button {
                    background: #475569;
                    color: #e2e8f0;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: background-color 0.2s;
                }

                .copy-button:hover {
                    background: #64748b;
                }

                .code-block {
                    padding: 16px;
                    margin: 0;
                    background: #1e293b;
                    color: #e2e8f0;
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                .code-block code {
                    background: transparent;
                    color: inherit;
                    padding: 0;
                }

                .message-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-top: 12px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    font-size: 11px;
                }

                .message.user .message-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                }

                .message-time {
                    font-weight: 500;
                    opacity: 0.8;
                }

                .message.user .message-time {
                    color: rgba(255, 255, 255, 0.8);
                }

                .message.assistant .message-time {
                    color: #64748b;
                }

                .message-cost {
                    color: #059669;
                    font-weight: 600;
                    background: #ecfdf5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                }

                .typing-icon {
                    width: 16px;
                    height: 16px;
                    animation: pulse 1.5s infinite;
                }

                /* Input Area */
                .input-area {
                    background: white;
                    border-top: 1px solid #e2e8f0;
                    padding: 16px 24px;
                    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
                }

                .input-container {
                    display: flex;
                    align-items: end;
                    gap: 12px;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .message-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    resize: none;
                    font-size: 14px;
                    line-height: 1.5;
                    min-height: 48px;
                    max-height: 120px;
                    font-family: inherit;
                    transition: border-color 0.2s;
                }

                .message-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .send-button {
                    padding: 12px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    min-width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .send-button:hover:not(:disabled) {
                    background: #2563eb;
                }

                .send-button:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                }

                /* Scrollbar Styles */
                .messages-area::-webkit-scrollbar,
                .conversations-list::-webkit-scrollbar,
                .model-dropdown::-webkit-scrollbar {
                    width: 6px;
                }

                .messages-area::-webkit-scrollbar-track,
                .conversations-list::-webkit-scrollbar-track,
                .model-dropdown::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }

                .messages-area::-webkit-scrollbar-thumb,
                .conversations-list::-webkit-scrollbar-thumb,
                .model-dropdown::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }

                .messages-area::-webkit-scrollbar-thumb:hover,
                .conversations-list::-webkit-scrollbar-thumb:hover,
                .model-dropdown::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Thinking Section Styles */
                .thinking-section {
                    margin-bottom: 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f8fafc;
                }

                .thinking-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    text-align: left;
                }

                .thinking-header:hover {
                    background: #f1f5f9;
                }

                .thinking-icon {
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                }

                .thinking-title {
                    flex: 1;
                    font-weight: 500;
                    color: #475569;
                    font-size: 14px;
                }

                .thinking-chevron {
                    width: 16px;
                    height: 16px;
                    color: #94a3b8;
                    transition: transform 0.2s ease;
                }

                .thinking-chevron.expanded {
                    transform: rotate(180deg);
                }

                .thinking-content {
                    padding: 16px;
                    border-top: 1px solid #e2e8f0;
                    background: white;
                    animation: expandThinking 0.2s ease-out;
                }

                @keyframes expandThinking {
                    from {
                        opacity: 0;
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 500px;
                    }
                }

                .thinking-summary {
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #f0f9ff;
                    border-left: 3px solid #0ea5e9;
                    border-radius: 4px;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .thinking-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .thinking-step {
                    padding: 12px;
                    background: #fafafa;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                }

                .step-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .step-number {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    background: #3b82f6;
                    color: white;
                    border-radius: 50%;
                    font-size: 11px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .step-description {
                    font-weight: 500;
                    color: #1e293b;
                    font-size: 13px;
                }

                .step-reasoning {
                    color: #64748b;
                    font-size: 12px;
                    line-height: 1.4;
                    margin-bottom: 8px;
                }

                .step-outcome {
                    font-size: 12px;
                    color: #059669;
                    background: #ecfdf5;
                    padding: 6px 8px;
                    border-radius: 4px;
                    border: 1px solid #d1fae5;
                }

                .step-outcome strong {
                    color: #047857;
                }

                .main-response {
                    margin-top: 8px;
                }

                .message.assistant .thinking-section {
                    margin-bottom: 12px;
                }

                /* Markdown Content Styles */
                .markdown-content {
                    line-height: 1.6;
                }

                .markdown-content h1, 
                .markdown-content h2, 
                .markdown-content h3, 
                .markdown-content h4, 
                .markdown-content h5, 
                .markdown-content h6 {
                    margin: 12px 0 6px 0;
                    font-weight: 600;
                    line-height: 1.3;
                }

                .message.user .markdown-content h1,
                .message.user .markdown-content h2,
                .message.user .markdown-content h3,
                .message.user .markdown-content h4,
                .message.user .markdown-content h5,
                .message.user .markdown-content h6 {
                    color: white;
                }

                .message.assistant .markdown-content h1,
                .message.assistant .markdown-content h2,
                .message.assistant .markdown-content h3,
                .message.assistant .markdown-content h4,
                .message.assistant .markdown-content h5,
                .message.assistant .markdown-content h6 {
                    color: #1e293b;
                }

                .markdown-content h1 { font-size: 1.4em; }
                .markdown-content h2 { font-size: 1.25em; }
                .markdown-content h3 { font-size: 1.1em; }

                .markdown-content p {
                    margin: 6px 0;
                }

                .message.user .markdown-content p {
                    color: rgba(255, 255, 255, 0.95);
                }

                .message.assistant .markdown-content p {
                    color: #374151;
                }

                .markdown-content strong {
                    font-weight: 600;
                }

                .message.user .markdown-content strong {
                    color: white;
                }

                .message.assistant .markdown-content strong {
                    color: #1e293b;
                }

                .markdown-content em {
                    font-style: italic;
                }

                .message.user .markdown-content em {
                    color: rgba(255, 255, 255, 0.9);
                }

                .message.assistant .markdown-content em {
                    color: #4b5563;
                }

                .markdown-content ul, 
                .markdown-content ol {
                    margin: 6px 0;
                    padding-left: 20px;
                }

                .message.user .markdown-content ul,
                .message.user .markdown-content ol {
                    color: rgba(255, 255, 255, 0.95);
                }

                .message.assistant .markdown-content ul,
                .message.assistant .markdown-content ol {
                    color: #374151;
                }

                .markdown-content li {
                    margin: 3px 0;
                }

                .markdown-content blockquote {
                    margin: 8px 0;
                    padding: 6px 12px;
                    border-left: 4px solid #3b82f6;
                    background: rgba(59, 130, 246, 0.1);
                    font-style: italic;
                }

                .message.user .markdown-content blockquote {
                    border-left-color: rgba(255, 255, 255, 0.5);
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.9);
                }

                .message.assistant .markdown-content blockquote {
                    color: #64748b;
                }

                .markdown-content a {
                    text-decoration: none;
                }

                .message.user .markdown-content a {
                    color: rgba(255, 255, 255, 0.9);
                }

                .message.assistant .markdown-content a {
                    color: #3b82f6;
                }

                .markdown-content a:hover {
                    text-decoration: underline;
                }

                .markdown-content code:not(pre code) {
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    font-size: 0.9em;
                }

                .message.user .markdown-content code:not(pre code) {
                    background: rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.95);
                }

                .message.assistant .markdown-content code:not(pre code) {
                    background: #f1f5f9;
                    color: #e11d48;
                }

                .markdown-content hr {
                    border: none;
                    border-top: 1px solid;
                    margin: 12px 0;
                }

                .message.user .markdown-content hr {
                    border-top-color: rgba(255, 255, 255, 0.3);
                }

                .message.assistant .markdown-content hr {
                    border-top-color: #e2e8f0;
                }

                .markdown-content table {
                    border-collapse: collapse;
                    margin: 8px 0;
                    width: 100%;
                }

                .markdown-content th,
                .markdown-content td {
                    border: 1px solid;
                    padding: 6px 10px;
                    text-align: left;
                }

                .message.user .markdown-content th,
                .message.user .markdown-content td {
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .message.assistant .markdown-content th,
                .message.assistant .markdown-content td {
                    border-color: #e2e8f0;
                }

                .markdown-content th {
                    font-weight: 600;
                }

                .message.user .markdown-content th {
                    background: rgba(255, 255, 255, 0.1);
                }

                .message.assistant .markdown-content th {
                    background: #f8fafc;
                }
            `}</style>
    </div>
  );
};
