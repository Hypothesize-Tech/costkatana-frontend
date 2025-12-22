import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon,
  PlusIcon,
  ChartBarIcon,
  BoltIcon,
  CpuChipIcon,
  ArrowUpIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TrashIcon,
  ChevronDownIcon,
  LinkIcon,
  XMarkIcon,
  PaperClipIcon,
  EyeIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  LockOpenIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalculatorIcon,
  CubeIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  FolderOpenIcon,
  ServerIcon,
  PresentationChartLineIcon,
  BeakerIcon,
  LightBulbIcon,
  FilmIcon,
  BookOpenIcon,
  ScaleIcon,
  ClockIcon,
  ChartPieIcon,
  FireIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';
import { ChatService } from "@/services/chat.service";
import { FeedbackButton } from "../feedback/FeedbackButton";
import { feedbackService } from "../../services/feedback.service";
import { marked } from "marked";
import { apiClient } from "@/config/api";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { PreviewRenderer } from "../preview/PreviewRenderer";
import { CodePreview } from "../preview/CodePreview";
import { DocumentMetadata, documentService } from "@/services/document.service";
import { useSessionRecording } from "@/hooks/useSessionRecording";
import GitHubConnector from "./GitHubConnector";
import FeatureSelector from "./FeatureSelector";
import PRStatusPanel from "./PRStatusPanel";
import githubService, { GitHubRepository } from "../../services/github.service";
import {
  Send,
  Copy,
  Eye,
  EyeOff,
  Check,
  Settings,
  Brain,
  MessageSquare,
  FileText,
  Zap,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { IntegrationMentionHint } from "./IntegrationMentionHint";
import { MentionAutocomplete } from "./MentionAutocomplete";
import TemplatePicker from "./TemplatePicker";
import TemplateVariableInput from "./TemplateVariableInput";
import { useTemplateStore } from "@/stores/templateStore";
import { PromptTemplate } from "@/types/promptTemplate.types";
import ThreatDetectionService from "@/services/threatDetection.service";
import { SuggestionsShimmer } from "../shimmer/SuggestionsShimmer";
import { ConversationsShimmer } from "../shimmer/ConversationsShimmer";
import { MessageShimmer } from "../shimmer/MessageShimmer";
import { GoogleServicePanel } from "./GoogleServicePanel";
import { GooglePickerModal } from "../google/GooglePickerModal";
import { googleService, GoogleConnection } from "../../services/google.service";

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
  requestId?: string;
  attachedDocuments?: Array<{
    documentId: string;
    fileName: string;
    chunksCount: number;
    fileType?: string;
  }>;
  metadata?: {
    cost?: number;
    latency?: number;
    tokenCount?: number;
    qualityScore?: number;
    qualityRecommendations?: string[];
    processingTime?: number;
    templateId?: string;
    templateName?: string;
    templateVariables?: Record<string, any>;
    templateUsed?: {
      id: string;
      name: string;
      category: string;
      variablesResolved: Array<{
        variableName: string;
        value: string;
        confidence: number;
        source: string;
        reasoning?: string;
      }>;
    };
    type?: string;
    count?: number;
    service?: 'gmail' | 'calendar' | 'drive' | 'docs' | 'sheets';
  };
  viewLinks?: Array<{
    label: string;
    url: string;
    type: 'document' | 'spreadsheet' | 'presentation' | 'file' | 'email' | 'calendar' | 'form';
  }>;
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
  optimizationsApplied?: string[];
  cacheHit?: boolean;
  agentPath?: string[];
  riskLevel?: string;
  sources?: Array<{
    title: string;
    url: string;
    type: 'web' | 'document' | 'api' | 'database';
    description?: string;
  }>;
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
  capabilities?: string[];
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
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AvailableModel | null>(
    null,
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<string | null>(null);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [currentSources, setCurrentSources] = useState<ChatMessage['sources']>([]);

  // Session recording hook
  const { recordComplete, isRecording } = useSessionRecording({
    feature: 'chat',
    autoStart: true,
    label: 'Chat Conversation'
  });

  // Preview functionality
  const [showPreviews, setShowPreviews] = useState<Record<string, boolean>>({});
  const [previewMode, setPreviewMode] = useState<'strict' | 'moderate' | 'permissive'>('strict');

  // Memoized preview toggle function to prevent re-renders
  const togglePreview = useCallback((codeId: string) => {
    setShowPreviews(prev => ({ ...prev, [codeId]: !prev[codeId] }));
  }, []);

  // Memoized preview mode change function
  const handlePreviewModeChange = useCallback((mode: 'strict' | 'moderate' | 'permissive') => {
    setPreviewMode(mode);
  }, []);

  // Multi-agent features
  const [chatMode, setChatMode] = useState<'fastest' | 'cheapest' | 'balanced'>('balanced');
  const [useMultiAgent, setUseMultiAgent] = useState<boolean>(true);
  const [showOptimizations, setShowOptimizations] = useState<boolean>(false);

  // Document upload for RAG
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentMetadata[]>([]);
  const [showGitHubConnector, setShowGitHubConnector] = useState(false);
  const [gitHubConnectorMode, setGitHubConnectorMode] = useState<'integration' | 'chat'>('chat');
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepository; connectionId: string } | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [githubConnection, setGithubConnection] = useState<{ avatarUrl?: string; username?: string; hasConnection: boolean }>({ hasConnection: false });

  // Template functionality
  const {
    selectedTemplate,
    isTemplatePickerOpen,
    openTemplatePicker,
    closeTemplatePicker,
    selectTemplate,
    clearTemplate,
  } = useTemplateStore();
  const [showVariableInput, setShowVariableInput] = useState(false);
  const [showAttachmentsPopover, setShowAttachmentsPopover] = useState(false);
  const [showAllModelsDropdown, setShowAllModelsDropdown] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ documentId: string; fileName: string } | null>(null);
  const [hasExistingIntegrations, setHasExistingIntegrations] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  const [showGooglePanel, setShowGooglePanel] = useState(false);
  const [googlePanelTab, setGooglePanelTab] = useState<'quick' | 'gmail' | 'drive' | 'sheets' | 'docs' | 'calendar'>('quick');
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [pickerFileType, setPickerFileType] = useState<'docs' | 'sheets' | 'drive'>('drive');
  const [googleConnection, setGoogleConnection] = useState<{ hasConnection: boolean; connection?: GoogleConnection }>({ hasConnection: false });

  // Link attachment state
  const [attachedLinks, setAttachedLinks] = useState<Array<{ url: string; title?: string }>>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

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
          icon: BanknotesIcon,
          category: "Cost Analysis",
        },
        {
          text:
            uniqueModels.size > 1
              ? `Compare costs across my ${uniqueModels.size} different models`
              : "Show my current spending breakdown by model",
          icon: ChartPieIcon,
          category: "Analytics",
        },
        {
          text: mostExpensiveModel
            ? `Why is ${mostExpensiveModel} my most expensive model?`
            : "Which models are costing me the most?",
          icon: FireIcon,
          category: "Cost Analysis",
        },
        {
          text:
            dailyAverage > 0
              ? `Reduce my $${dailyAverage.toFixed(2)} daily AI costs`
              : "What's my spend last month vs this month?",
          icon: ArrowTrendingDownIcon,
          category: "Trends",
        },

        // OPTIMIZATION & EFFICIENCY (High Priority) - Real Opportunity Analysis
        {
          text:
            totalCost > 10
              ? `Save $${(totalCost * 0.3).toFixed(2)} by optimizing my AI costs`
              : "How can I reduce my AI costs by 30%?",
          icon: RocketLaunchIcon,
          category: "Optimization",
        },
        {
          text: usageData.data?.some((u: any) => u.promptTokens > 1500)
            ? `Optimize my ${usageData.data.filter((u: any) => u.promptTokens > 1500).length} high-token prompts`
            : "Suggest prompts for better cost efficiency",
          icon: PuzzlePieceIcon,
          category: "Optimization",
        },
        {
          text:
            uniqueModels.size > 2
              ? `Find savings from my ${uniqueModels.size} different models`
              : "Find opportunities to reduce my spending",
          icon: MagnifyingGlassIcon,
          category: "Optimization",
        },
        {
          text:
            totalCost > 0
              ? `Get personalized cost optimization tips based on my $${totalCost.toFixed(2)} spending`
              : "Show me cost optimization tips",
          icon: LightBulbIcon,
          category: "Tips",
        },

        // TOKEN USAGE & ANALYTICS - Real Data Analysis
        {
          text:
            totalTokens > 0
              ? `Analyze my ${totalTokens.toLocaleString()} tokens across ${uniqueModels.size} models`
              : "What's my current token usage across all models?",
          icon: CubeIcon,
          category: "Usage Analytics",
        },
        {
          text:
            usageData.data?.length >= 10
              ? `Analyze patterns from my ${usageData.data.length} recent API calls`
              : "Show my usage patterns and trends",
          icon: ClockIcon,
          category: "Analytics",
        },
        {
          text:
            totalTokens > 10000
              ? `Improve efficiency of my ${totalTokens.toLocaleString()} token usage`
              : "Analyze my token consumption efficiency",
          icon: ArrowTrendingUpIcon,
          category: "Performance",
        },

        // PROJECT MANAGEMENT - Data-Aware
        {
          text: "Help me setup an AI cost optimization project",
          icon: FolderOpenIcon,
          category: "Project Setup",
        },
        {
          text:
            projectsData.data?.length > 0
              ? `Optimize my ${projectsData.data.length} existing projects`
              : "Create a new project for content generation",
          icon: FolderIcon,
          category: "Projects",
        },
        {
          text:
            projectsData.data?.length > 1
              ? `Compare costs across my ${projectsData.data.length} projects`
              : "Configure my existing projects optimally",
          icon: AdjustmentsHorizontalIcon,
          category: "Configuration",
        },

        // MODEL SELECTION & COMPARISON - Usage-Based
        {
          text: mostExpensiveModel
            ? `Find cheaper alternatives to ${mostExpensiveModel}`
            : "Find cheaper model alternatives for my use case",
          icon: ScaleIcon,
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
          icon: ScaleIcon,
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
          icon: ServerIcon,
          category: "Configuration",
        },
        {
          text:
            usageData.data?.length > 20
              ? `Security review for my ${usageData.data.length} API calls`
              : "Review my API security and best practices",
          icon: ShieldCheckIcon,
          category: "Security",
        },
        {
          text:
            uniqueModels.size > 1
              ? `Integrate ${uniqueModels.size} models efficiently`
              : "Setup integrations with my tools",
          icon: LinkIcon,
          category: "Integration",
        },

        // INSIGHTS & REPORTING - Data-Rich Analysis
        {
          text:
            usageData.data?.length >= 30
              ? `Generate insights from ${usageData.data.length} usage records`
              : "Generate insights from my usage data",
          icon: BeakerIcon,
          category: "Insights",
        },
        {
          text:
            totalCost > 0
              ? `${new Date().toLocaleDateString("en-US", { month: "long" })} report: $${totalCost.toFixed(2)} spent`
              : "Create a cost optimization report for this month",
          icon: PresentationChartLineIcon,
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
          icon: FilmIcon,
          category: "Demo",
        },
        {
          text:
            usageData.data?.length > 0
              ? "Learn optimization strategies for my usage patterns"
              : "Explain AI cost optimization best practices",
          icon: BookOpenIcon,
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
          icon: RocketLaunchIcon,
          category: "Setup",
        },
        {
          text: "Show me what data you can access about my usage",
          icon: CircleStackIcon,
          category: "Data Check",
        },
        {
          text: "I want to start tracking my AI costs - guide me",
          icon: BanknotesIcon,
          category: "Getting Started",
        },
        {
          text: "Test my database connection and show available data",
          icon: CommandLineIcon,
          category: "Troubleshooting",
        },

        // Working suggestions for any user
        {
          text: "Create my first AI cost optimization project",
          icon: FolderOpenIcon,
          category: "Project Setup",
        },
        {
          text: "What models should I use for different tasks?",
          icon: CpuChipIcon,
          category: "Model Selection",
        },
        {
          text: "How do I integrate cost tracking with my APIs?",
          icon: ServerIcon,
          category: "Integration",
        },
        {
          text: "Show me AI cost optimization best practices",
          icon: BookOpenIcon,
          category: "Education",
        },
        {
          text: "Demo: Show AI thinking process",
          icon: FilmIcon,
          category: "Demo",
        },
        {
          text: "Help me understand AI pricing models",
          icon: CalculatorIcon,
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
    loadGitHubConnection();
    loadGoogleConnection();

    // Restore last conversation from localStorage
    const savedConversationId = localStorage.getItem('currentConversationId');
    if (savedConversationId) {
      loadConversationHistory(savedConversationId);
    }
  }, []);

  const loadGitHubConnection = async () => {
    try {
      const connections = await githubService.listConnections();
      if (connections.length > 0 && connections[0].isActive) {
        setGithubConnection({
          avatarUrl: connections[0].avatarUrl,
          username: connections[0].githubUsername,
          hasConnection: true
        });

        // Check for existing integrations
        try {
          const integrations = await githubService.listIntegrations();
          setHasExistingIntegrations(integrations.length > 0);
        } catch (intError) {
          console.error('Failed to check integrations:', intError);
          setHasExistingIntegrations(false);
        }
      } else {
        setGithubConnection({ hasConnection: false });
        setHasExistingIntegrations(false);
      }
    } catch (error) {
      console.error('Failed to load GitHub connections:', error);
      setGithubConnection({ hasConnection: false });
      setHasExistingIntegrations(false);
    }
  };

  const loadGoogleConnection = async () => {
    try {
      const connections = await googleService.listConnections();
      const activeConnection = connections.find(conn => conn.isActive);

      if (activeConnection) {
        setGoogleConnection({
          hasConnection: true,
          connection: activeConnection
        });
      } else {
        setGoogleConnection({ hasConnection: false });
      }
    } catch (error) {
      console.error('Failed to load Google connection:', error);
      setGoogleConnection({ hasConnection: false });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to select best model based on chat mode
  const selectModelByChatMode = useCallback((models: AvailableModel[], mode: 'fastest' | 'cheapest' | 'balanced'): AvailableModel | null => {
    if (models.length === 0) return null;

    switch (mode) {
      case 'fastest': {
        // Prioritize fast models: Haiku, Nova Lite/Micro, smaller Llama models
        const fastestIds = [
          'anthropic.claude-3-5-haiku-20241022-v1:0',
          'anthropic.claude-3-haiku-20240307-v1:0',
          'amazon.nova-lite-v1:0',
          'amazon.nova-micro-v1:0',
          'meta.llama3-8b-instruct-v1:0',
          'mistral.mistral-7b-instruct-v0:2',
        ];
        for (const id of fastestIds) {
          const model = models.find(m => m.id === id);
          if (model) return model;
        }
        // Fallback: find cheapest model (usually faster)
        return models.sort((a, b) => {
          const aCost = a.pricing?.input || Infinity;
          const bCost = b.pricing?.input || Infinity;
          return aCost - bCost;
        })[0];
      }

      case 'cheapest': {
        // Prioritize cheapest models: Haiku, Nova Lite/Micro, smaller models
        const cheapestIds = [
          'anthropic.claude-3-5-haiku-20241022-v1:0',
          'anthropic.claude-3-haiku-20240307-v1:0',
          'amazon.nova-micro-v1:0',
          'amazon.nova-lite-v1:0',
          'meta.llama3-8b-instruct-v1:0',
          'mistral.mistral-7b-instruct-v0:2',
        ];
        for (const id of cheapestIds) {
          const model = models.find(m => m.id === id);
          if (model) return model;
        }
        // Fallback: sort by total cost (input + output)
        return models.sort((a, b) => {
          const aCost = (a.pricing?.input || 0) + (a.pricing?.output || 0);
          const bCost = (b.pricing?.input || 0) + (b.pricing?.output || 0);
          return aCost - bCost;
        })[0];
      }

      case 'balanced':
      default: {
        // Prioritize balanced models: Claude 3.5 Sonnet, Nova Pro, Mistral Large
        const balancedIds = [
          'anthropic.claude-3-5-sonnet-20240620-v1:0',
          'anthropic.claude-3-5-sonnet-20241022-v1:0',
          'anthropic.claude-sonnet-4-20250514-v1:0',
          'amazon.nova-pro-v1:0',
          'mistral.mistral-large-2402-v1:0',
          'anthropic.claude-3-7-sonnet-20250219-v1:0',
        ];
        for (const id of balancedIds) {
          const model = models.find(m => m.id === id);
          if (model) return model;
        }
        // Fallback: first available model
        return models[0];
      }
    }
  }, []);

  // Update model selection when chat mode changes
  useEffect(() => {
    if (availableModels.length > 0) {
      const recommendedModel = selectModelByChatMode(availableModels, chatMode);
      if (recommendedModel && recommendedModel.id !== selectedModel?.id) {
        setSelectedModel(recommendedModel);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMode, availableModels.length, selectModelByChatMode]);

  const loadAvailableModels = async () => {
    try {
      const models = await ChatService.getAvailableModels();
      setAvailableModels(models);

      // Auto-select model based on chat mode
      if (models.length > 0) {
        const recommendedModel = selectModelByChatMode(models, chatMode);
        if (recommendedModel) {
          setSelectedModel(recommendedModel);
        }
      }
    } catch (error) {
      console.error("Error loading models:", error);
      setError("Failed to load available models");
    }
  };

  // Get top 5 models for quick selection based on quality and capabilities
  const getTopModels = (): AvailableModel[] => {
    if (availableModels.length <= 5) return availableModels;

    // Define top tier models based on capabilities and quality
    const topTierIds = [
      'anthropic.claude-opus-4-1-20250805-v1:0', // Claude 4 Opus - most powerful
      'anthropic.claude-sonnet-4-20250514-v1:0', // Claude Sonnet 4 - high performance
      'anthropic.claude-3-5-sonnet-20240620-v1:0', // Claude 3.5 Sonnet - popular
      'mistral.mistral-large-2402-v1:0', // Mistral Large - advanced
      'amazon.nova-pro-v1:0', // Nova Pro - high performance
    ];

    // Secondary tier (if top tier not available)
    const secondaryTierIds = [
      'anthropic.claude-3-7-sonnet-20250219-v1:0',
      'anthropic.claude-3-5-haiku-20241022-v1:0',
      'meta.llama3-70b-instruct-v1:0',
      'meta.llama4-scout-17b-instruct-v1:0',
    ];

    const topModels: AvailableModel[] = [];
    const usedIds = new Set<string>();

    // Add top tier models first
    topTierIds.forEach(id => {
      const model = availableModels.find(m => m.id === id);
      if (model && !usedIds.has(model.id)) {
        topModels.push(model);
        usedIds.add(model.id);
      }
    });

    // Fill with secondary tier if needed
    if (topModels.length < 5) {
      secondaryTierIds.forEach(id => {
        if (topModels.length >= 5) return;
        const model = availableModels.find(m => m.id === id);
        if (model && !usedIds.has(model.id)) {
          topModels.push(model);
          usedIds.add(model.id);
        }
      });
    }

    // Score remaining models by capabilities and add best ones
    if (topModels.length < 5) {
      const scoredModels = availableModels
        .filter(m => !usedIds.has(m.id))
        .map(model => {
          let score = 0;
          const caps = model.capabilities || [];

          // Score based on capabilities
          if (caps.includes('reasoning')) score += 10;
          if (caps.includes('extended-thinking')) score += 10;
          if (caps.includes('multimodal')) score += 5;
          if (caps.includes('vision')) score += 3;
          if (caps.includes('text')) score += 2;

          // Prefer models with better names (not generic)
          if (!model.name.toLowerCase().includes('claude') &&
            !model.name.toLowerCase().includes('nova') &&
            model.name.length > 3) {
            score += 2;
          }

          return { model, score };
        })
        .sort((a, b) => b.score - a.score);

      scoredModels.forEach(({ model }) => {
        if (topModels.length < 5) {
          topModels.push(model);
          usedIds.add(model.id);
        }
      });
    }

    return topModels.slice(0, 5);
  };

  // Get all other models (not in top 5)
  const getOtherModels = (): AvailableModel[] => {
    const topModelIds = new Set(getTopModels().map(m => m.id));
    return availableModels.filter(m => !topModelIds.has(m.id));
  };

  // Helper function to format model display with name, number, and version
  const formatModelDisplay = (model: AvailableModel | null): string => {
    if (!model) return "Select Model";

    // Skip version for Claude models - they already have version in name
    const isClaude = model.id.includes('claude') || model.provider.toLowerCase().includes('anthropic');

    if (isClaude) {
      // For Claude, use the name as-is if it's descriptive, otherwise extract from ID
      if (model.name.toLowerCase() === 'claude') {
        // Extract Claude version from ID - handle various patterns
        const modelId = model.id.toLowerCase();

        // Pattern 1: claude-opus-4-1 or claude-sonnet-4
        let claudeMatch = modelId.match(/claude-(opus|sonnet|haiku)-(\d+)(?:-(\d+))?/);
        if (claudeMatch) {
          const type = claudeMatch[1].charAt(0).toUpperCase() + claudeMatch[1].slice(1);
          const version = claudeMatch[2];
          const subVersion = claudeMatch[3] ? `.${claudeMatch[3]}` : '';
          return `Claude ${version} ${type}${subVersion}`;
        }

        // Pattern 2: claude-3-5-sonnet or claude-3-7-sonnet
        claudeMatch = modelId.match(/claude-(\d+)-(\d+)-(sonnet|haiku|opus)/);
        if (claudeMatch) {
          const type = claudeMatch[3].charAt(0).toUpperCase() + claudeMatch[3].slice(1);
          return `Claude ${claudeMatch[1]}.${claudeMatch[2]} ${type}`;
        }

        // Pattern 3: claude-3-opus or claude-3-haiku
        claudeMatch = modelId.match(/claude-(\d+)-(sonnet|haiku|opus)/);
        if (claudeMatch) {
          const type = claudeMatch[2].charAt(0).toUpperCase() + claudeMatch[2].slice(1);
          return `Claude ${claudeMatch[1]} ${type}`;
        }
      }
      return model.name;
    }

    let displayName = model.name;
    const modelId = model.id.toLowerCase();

    // Extract model number from ID (e.g., llama3, llama3-2, llama4, titan-text-lite)
    let number = '';

    // Llama models: llama3, llama3-2, llama4
    const llamaMatch = modelId.match(/llama(\d+)(?:-(\d+))?/);
    if (llamaMatch) {
      number = llamaMatch[2] ? `3.${llamaMatch[2]}` : llamaMatch[1];
      displayName = `Llama ${number}`;
    }

    // Titan models
    if (modelId.includes('titan')) {
      const titanMatch = modelId.match(/titan-(\w+)-?(\w+)?/);
      if (titanMatch) {
        const variant = titanMatch[1] || titanMatch[2] || '';
        if (variant === 'text') {
          displayName = model.name.includes('Lite') ? 'Titan Text Lite' : 'Titan Text';
        } else if (variant === 'embed') {
          displayName = 'Titan Embed';
        }
      }
    }

    // Extract version patterns from model ID
    let version = '';

    // Pattern 1: v1:0, v2:1 format (e.g., amazon.nova-pro-v1:0)
    const vColonMatch = modelId.match(/v(\d+):(\d+)/);
    if (vColonMatch) {
      version = `v${vColonMatch[1]}.${vColonMatch[2]}`;
    }

    // Pattern 2: Date-based versions -1106, -0314 (e.g., gpt-4-1106-preview)
    if (!version) {
      const dateMatch = modelId.match(/-(\d{4})(?:-|$)/);
      if (dateMatch) {
        version = dateMatch[1];
      }
    }

    // Pattern 3: Simple v1, v2 format (but not v1:0 which is already handled)
    if (!version) {
      const simpleVMatch = modelId.match(/v(\d+)(?:-|$)/);
      if (simpleVMatch) {
        version = `v${simpleVMatch[1]}`;
      }
    }

    // Build display string
    if (version && !llamaMatch) {
      // Only add version if we have a meaningful name
      if (model.name.length > 3 && !model.name.toLowerCase().includes('nova')) {
        displayName = `${displayName} ${version}`;
      }
    }

    return displayName;
  };

  // Helper function to get model subtitle (provider + version info)
  const getModelSubtitle = (model: AvailableModel): string => {
    const isClaude = model.id.includes('claude') || model.provider.toLowerCase().includes('anthropic');

    if (isClaude) {
      return model.provider;
    }

    // Extract version from ID for non-Claude models
    const modelId = model.id.toLowerCase();
    let version = '';

    // Pattern 1: v1:0 format
    const vColonMatch = modelId.match(/v(\d+):(\d+)/);
    if (vColonMatch) {
      version = `v${vColonMatch[1]}.${vColonMatch[2]}`;
    }

    // Pattern 2: Date-based -1106
    if (!version) {
      const dateMatch = modelId.match(/-(\d{4})(?:-|$)/);
      if (dateMatch) {
        version = dateMatch[1];
      }
    }

    // Pattern 3: Simple v1
    if (!version) {
      const simpleVMatch = modelId.match(/v(\d+)(?:-|$)/);
      if (simpleVMatch) {
        version = `v${simpleVMatch[1]}`;
      }
    }

    if (version) {
      return `${model.provider} • ${version}`;
    }

    return model.provider;
  };

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const result = await ChatService.getUserConversations();
      setConversations(result.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadConversationHistory = async (conversationId: string) => {
    try {
      const result = await ChatService.getConversationHistory(conversationId);
      setMessages(result.messages);
      setCurrentConversationId(conversationId);

      // Save to localStorage
      localStorage.setItem('currentConversationId', conversationId);

      // Restore GitHub repository context if exists
      if (result.conversation?.githubContext && result.conversation.githubContext.connectionId && result.conversation.githubContext.repositoryFullName) {
        try {
          // Fetch repository details to restore selectedRepo
          const connections = await githubService.listConnections();
          const connection = connections.find(c => c._id === result.conversation!.githubContext!.connectionId);
          if (connection) {
            const repos = await githubService.getRepositories(connection._id);
            const repo = repos.repositories.find(r => r.fullName === result.conversation!.githubContext!.repositoryFullName);
            if (repo) {
              setSelectedRepo({
                repo,
                connectionId: connection._id
              });
            }
          }
        } catch (error) {
          console.error('Failed to restore repository context:', error);
          // Continue without repository context
        }
      }

      // Restore attached documents from the last user message
      const lastUserMessage = [...result.messages].reverse().find((msg) => msg.role === 'user');
      if (lastUserMessage?.attachedDocuments && lastUserMessage.attachedDocuments.length > 0) {
        const documentsMetadata = lastUserMessage.attachedDocuments.map((doc: { documentId: string; fileName: string; chunksCount: number; fileType?: string }) => ({
          documentId: doc.documentId,
          fileName: doc.fileName,
          chunksCount: doc.chunksCount,
          fileType: doc.fileType || 'application/octet-stream',
          uploadDate: new Date().toISOString() // Use current date as fallback since historical date isn't critical for UI
        }));
        setSelectedDocuments(documentsMetadata);
      } else {
        setSelectedDocuments([]);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation history");
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
    localStorage.removeItem('currentConversationId');
  };

  const handleDeleteClick = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await ChatService.deleteConversation(conversationToDelete);
      await loadConversations();
      if (currentConversationId === conversationToDelete) {
        startNewConversation();
      }
      setShowDeleteConfirmation(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError("Failed to delete conversation");
      setShowDeleteConfirmation(false);
      setConversationToDelete(null);
    }
  };

  const cancelDeleteConversation = () => {
    setShowDeleteConfirmation(false);
    setConversationToDelete(null);
  };

  // GitHub integration handlers
  // Select repository for integration
  const handleSelectRepository = (repo: GitHubRepository, connectionId: string) => {
    setSelectedRepo({ repo, connectionId });
    setShowGitHubConnector(false);
    setShowFeatureSelector(true);
  };

  // Select repository for chat context (without integration)
  const handleSelectRepoForChat = async (repo: GitHubRepository, connectionId: string) => {
    setSelectedRepo({ repo, connectionId });
    setShowGitHubConnector(false);

    // Save repository context to conversation if we have an active conversation
    if (currentConversationId) {
      try {
        await apiClient.patch(`/chat/conversations/${currentConversationId}/github-context`, {
          githubContext: {
            connectionId,
            repositoryId: repo.id,
            repositoryName: repo.name,
            repositoryFullName: repo.fullName
          }
        });
      } catch (error) {
        console.error('Failed to save repository context:', error);
        // Continue anyway - it's not critical
      }
    }

    // Add a message to chat indicating repository is selected
    const repoMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: `✅ Repository selected: **${repo.fullName}**\n\nI can now help you make changes to this repository. Just ask me what you'd like to modify!\n\n**Examples:**\n- "Add a new API endpoint for user registration"\n- "Fix the bug in the login function"\n- "Create a new component for the dashboard"`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, repoMessage]);
  };

  const handleStartIntegration = async (
    features: { name: string; enabled: boolean }[],
    integrationType: 'npm' | 'cli' | 'python' | 'http-headers'
  ) => {
    if (!selectedRepo) return;

    try {
      const repoFullName = selectedRepo.repo.fullName;
      const result = await githubService.startIntegration({
        connectionId: selectedRepo.connectionId,
        repositoryId: selectedRepo.repo.id,
        repositoryName: selectedRepo.repo.name,
        repositoryFullName: repoFullName,
        integrationType,
        selectedFeatures: features,
        conversationId: currentConversationId || undefined
      });

      setShowFeatureSelector(false);
      setSelectedRepo(null);

      // Refresh integration status
      await loadGitHubConnection();

      // Show progress panel
      setSelectedIntegration(result.integrationId);

      // Add a message to the chat about the integration
      const integrationMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🚀 Great! I've started integrating CostKatana into **${repoFullName}**.\n\nI'm currently:\n1. Analyzing your repository structure\n2. Generating integration code\n3. Creating a pull request\n\nThis usually takes 1-2 minutes. I'll let you know when the PR is ready!\n\n[View Progress](#integration:${result.integrationId})`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, integrationMessage]);

      // Poll for status updates
      const pollStatus = async () => {
        try {
          const status = await githubService.getIntegrationStatus(result.integrationId);
          if (status.prUrl || status.status === 'open' || status.status === 'merged') {
            // Update the message with PR link
            const updatedMessage = `✅ Integration complete for **${repoFullName}**!\n\n${status.prUrl ? `🔗 [View Pull Request](${status.prUrl})` : 'Pull request created successfully!'}\n\nStatus: ${status.status}`;

            setMessages(prev => prev.map(msg =>
              msg.id === integrationMessage.id
                ? { ...msg, content: updatedMessage }
                : msg
            ));

            if (status.prUrl) {
              // Close progress panel after a delay
              setTimeout(() => {
                setSelectedIntegration(null);
              }, 5000);
            }
          } else if (status.status === 'failed') {
            setMessages(prev => prev.map(msg =>
              msg.id === integrationMessage.id
                ? { ...msg, content: `❌ Integration failed for **${repoFullName}**.\n\n${status.errorMessage || 'Please try again or check the logs.'}` }
                : msg
            ));
          } else {
            // Continue polling
            setTimeout(pollStatus, 3000);
          }
        } catch (error) {
          console.error('Failed to poll integration status:', error);
        }
      };

      // Start polling after 3 seconds
      setTimeout(pollStatus, 3000);
    } catch (error) {
      console.error('Failed to start integration:', error);
      setError('Failed to start GitHub integration');
    }
  };

  // Template handlers
  const handleTemplateSelect = (template: PromptTemplate) => {
    selectTemplate(template);
    if (template.variables.length > 0) {
      setShowVariableInput(true);
    } else {
      // No variables, send directly
      handleTemplateSubmit({});
    }
  };

  const handleTemplateSubmit = async (variables: Record<string, any>) => {
    setShowVariableInput(false);
    if (!selectedTemplate || !selectedModel) return;

    setIsLoading(true);
    setError(null);

    // Create a formatted message showing the template being used
    const templateMessage = `**Using Template: ${selectedTemplate.name}**\n\n${selectedTemplate.description || ''}\n\n**Variables:**\n${Object.entries(variables).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}`;

    // Add user message showing template usage
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: templateMessage,
      timestamp: new Date(),
      metadata: {
        templateId: selectedTemplate._id,
        templateName: selectedTemplate.name,
        templateVariables: variables,
      },
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setLoadingMessageId(loadingId);

    try {
      const response = await ChatService.sendMessage({
        modelId: selectedModel.id,
        conversationId: currentConversationId || undefined,
        chatMode: chatMode,
        useMultiAgent: useMultiAgent,
        templateId: selectedTemplate._id,
        templateVariables: variables,
        documentIds: selectedDocuments.length > 0
          ? selectedDocuments.map(doc => doc.documentId)
          : undefined,
      });

      // Remove loading indicator
      setLoadingMessageId(null);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        metadata: {
          cost: response.cost,
          latency: response.latency,
          tokenCount: response.tokenCount,
          templateUsed: response.templateUsed,
        },
        optimizationsApplied: response.optimizationsApplied,
        cacheHit: response.cacheHit,
        agentPath: response.agentPath,
        riskLevel: response.riskLevel,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation
      if (!currentConversationId) {
        setCurrentConversationId(response.conversationId);
      }

      // Clear template
      clearTemplate();
      setSelectedDocuments([]);

    } catch (error: any) {
      console.error("Error using template:", error);
      setError(error.response?.data?.message || "Failed to use template");
      setLoadingMessageId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Picker commands
  const handlePickerCommand = (messageContent: string): boolean => {
    const lowerMessage = messageContent.toLowerCase().trim();

    // Check for picker commands with both colon and space formats
    // Pattern: @drive:select, @drive select, @drive:picker, @drive picker
    const drivePickerPattern = /@drive[: ](select|picker)/;
    const docsPickerPattern = /@(docs|gdocs)[: ](select|picker)/;
    const sheetsPickerPattern = /@(sheets|gsheets)[: ](select|picker)/;

    if (drivePickerPattern.test(lowerMessage)) {
      if (!googleConnection.hasConnection) {
        setError("Please connect your Google account first. Go to Settings > Integrations to connect.");
        return true; // Return true to prevent sending the message
      }
      setPickerFileType('drive');
      setShowGooglePicker(true);
      return true;
    }
    if (docsPickerPattern.test(lowerMessage)) {
      if (!googleConnection.hasConnection) {
        setError("Please connect your Google account first. Go to Settings > Integrations to connect.");
        return true;
      }
      setPickerFileType('docs');
      setShowGooglePicker(true);
      return true;
    }
    if (sheetsPickerPattern.test(lowerMessage)) {
      if (!googleConnection.hasConnection) {
        setError("Please connect your Google account first. Go to Settings > Integrations to connect.");
        return true;
      }
      setPickerFileType('sheets');
      setShowGooglePicker(true);
      return true;
    }

    return false;
  };

  const sendMessage = async (content?: string) => {
    const messageContent = content || currentMessage.trim();
    if (!messageContent || isLoading) return;

    if (!selectedModel) {
      setError("Please select a model first");
      return;
    }

    // Check if this is a picker command
    if (handlePickerCommand(messageContent)) {
      setCurrentMessage("");
      return;
    }

    // SECURITY CHECK: Threat detection before sending message
    const threatCheck = ThreatDetectionService.checkContent(messageContent);

    if (threatCheck.isBlocked) {
      const errorMessage = ThreatDetectionService.getErrorMessage(threatCheck);
      setError(errorMessage);
      return;
    }

    // Link metadata extraction is now handled on the backend in /message endpoint
    // Frontend just sends the message as-is, backend will enrich it automatically

    // Append attached links to message content with explicit formatting for AI
    let finalMessageContent = messageContent;
    if (attachedLinks.length > 0) {
      const linksSection = attachedLinks.map((link, idx) => {
        // Format explicitly for AI to understand:
        // Link 1: [Title]
        // URL: https://...
        // (This ensures AI can see the actual URL and title separately)
        if (link.title && link.title !== new URL(link.url).hostname.replace('www.', '')) {
          return `\n\n📎 **Attached Link ${idx + 1}:** ${link.title}\n**URL:** ${link.url}`;
        }
        return `\n\n📎 **Attached Link ${idx + 1}:** ${link.url}`;
      }).join('');
      finalMessageContent = `${finalMessageContent}${linksSection}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalMessageContent, // Includes attached links, backend will enrich URLs with metadata
      timestamp: new Date(),
      attachedDocuments: selectedDocuments.length > 0 ? selectedDocuments : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setAttachedLinks([]); // Clear attached links after sending
    setIsLoading(true);
    setLoadingMessageId(userMessage.id);
    setError(null);

    try {
      // Handle demo message locally
      if (messageContent.includes("Demo: Show AI thinking process")) {
        setTimeout(() => {
          // Parse sources from demo response
          const demoResponse = "Here's how I would approach optimizing your AI costs. This demo shows my thinking process as I analyze your requirements and develop a solution.\n\nSources: 1. https://www.google.com/search?q=write%20a%20program%20in%20python%20for%20factorial%20of%20n";
          const demoSources = parseSourcesFromResponse(demoResponse);

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
            sources: demoSources,
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
          setLoadingMessageId(null);
        }, 1500);
        return;
      }

      const response = await ChatService.sendMessage({
        message: finalMessageContent,
        modelId: selectedModel.id,
        conversationId: currentConversationId || undefined,
        chatMode: chatMode,
        useMultiAgent: useMultiAgent,
        documentIds: selectedDocuments.length > 0
          ? selectedDocuments.map(doc => doc.documentId)
          : undefined,
        // Include GitHub repository context if a repo is selected
        ...(selectedRepo ? {
          githubContext: {
            connectionId: selectedRepo.connectionId,
            repositoryId: selectedRepo.repo.id,
            repositoryName: selectedRepo.repo.name,
            repositoryFullName: selectedRepo.repo.fullName
          }
        } : {})
      });

      // Parse sources from the response text
      const sources = parseSourcesFromResponse(response.response);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        requestId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          cost: response.cost,
          latency: response.latency,
          tokenCount: response.tokenCount,
          ...(response.metadata || {}), // Include Google service metadata
        },
        // Multi-agent enhancements
        optimizationsApplied: response.optimizationsApplied || [],
        cacheHit: response.cacheHit || false,
        agentPath: response.agentPath || [],
        riskLevel: response.riskLevel || 'low',
        sources: sources,
        viewLinks: response.viewLinks, // Add Google service view links
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

      // Handle Google Picker from backend response metadata
      if (response.metadata?.requiresPicker && response.metadata?.fileType && googleConnection.hasConnection) {
        setPickerFileType(response.metadata.fileType as 'docs' | 'sheets' | 'drive');
        setShowGooglePicker(true);
      }

      // Handle GitHub integration polling if integration data is present
      if (response.githubIntegrationData?.integrationId) {
        const integrationId = response.githubIntegrationData.integrationId;

        // Show PR status panel if integration is starting
        if (response.githubIntegrationData.status !== 'open' && response.githubIntegrationData.status !== 'merged') {
          setSelectedIntegration(integrationId);
        }

        // Poll for integration status updates with visual progress
        const pollIntegrationStatus = async () => {
          try {
            const status = await githubService.getIntegrationStatus(integrationId);

            // Update message with progress
            const progressEmojis: Record<string, string> = {
              'initializing': '⚙️',
              'analyzing': '🔍',
              'generating': '✨',
              'draft': '📝',
              'open': '✅',
              'merged': '🎉',
              'failed': '❌'
            };

            const emoji = progressEmojis[status.status] || '⏳';
            let progressMessage = `${emoji} **Integration Status**: ${status.status.toUpperCase()}\n📊 **Progress**: ${status.progress}%\n\n**Current Step**: ${status.currentStep}`;

            // Add progress steps
            const steps = [
              { name: 'Analyzing repository', done: ['open', 'merged', 'generating', 'draft'].includes(status.status) },
              { name: 'Generating integration code', done: ['open', 'merged', 'draft'].includes(status.status) },
              { name: 'Creating pull request', done: ['open', 'merged'].includes(status.status) },
              { name: 'Pull request ready', done: ['open', 'merged'].includes(status.status) }
            ];

            progressMessage += `\n\n**Progress Steps:**\n`;
            steps.forEach(step => {
              progressMessage += `${step.done ? '✅' : '⏳'} ${step.name}\n`;
            });

            if (status.prUrl) {
              progressMessage += `\n\n🎉 **Pull Request Created Successfully!**\n\n🔗 **[View & Review Pull Request](${status.prUrl})**\n\n*Click the link above to review and merge the changes when ready!*`;
            }

            if (status.errorMessage) {
              progressMessage += `\n\n⚠️ **Error**: ${status.errorMessage}`;
            }

            // Update the message in real-time
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, content: progressMessage }
                : msg
            ));

            // Update selected integration to show PR status panel
            if (status.status === 'open' || status.status === 'merged') {
              setSelectedIntegration(integrationId);

              // Auto-close panel after 10 seconds if PR is ready
              if (status.prUrl) {
                setTimeout(() => {
                  setSelectedIntegration(null);
                }, 10000);
              }
            } else if (status.status === 'failed') {
              setSelectedIntegration(null);
            } else {
              // Continue polling
              setTimeout(pollIntegrationStatus, 3000);
            }
          } catch (error) {
            console.error('Failed to poll integration status:', error);
            // Retry after 5 seconds on error
            setTimeout(pollIntegrationStatus, 5000);
          }
        };

        // Start polling after 2 seconds
        setTimeout(pollIntegrationStatus, 2000);
      }
      setIsLoading(false);
      setLoadingMessageId(null);

      // Record the interaction for session replay
      if (isRecording) {
        try {
          await recordComplete(
            {
              timestamp: new Date().toISOString(),
              model: selectedModel.id,
              prompt: messageContent,
              response: response.response,
              parameters: {
                chatMode,
                useMultiAgent,
                documentIds: selectedDocuments.map(d => d.documentId)
              },
              tokens: {
                input: response.tokenCount ? Math.floor(response.tokenCount * 0.4) : 0,
                output: response.tokenCount ? Math.ceil(response.tokenCount * 0.6) : 0
              },
              cost: response.cost,
              latency: response.latency,
              provider: 'aws-bedrock',
              requestMetadata: {
                conversationId: currentConversationId,
                chatMode,
                useMultiAgent,
                hasDocuments: selectedDocuments.length > 0,
                documentCount: selectedDocuments.length,
                documentIds: selectedDocuments.map(d => d.documentId)
              },
              responseMetadata: {
                thinking: response.thinking,
                optimizationsApplied: response.optimizationsApplied,
                cacheHit: response.cacheHit,
                agentPath: response.agentPath,
                riskLevel: response.riskLevel
              }
            },
            {
              action: 'chat_message_sent',
              details: {
                conversationId: currentConversationId,
                modelId: selectedModel.id,
                hasDocuments: selectedDocuments.length > 0,
                optimizationsApplied: response.optimizationsApplied,
                cacheHit: response.cacheHit
              }
            }
          );
        } catch (error) {
          console.error('Failed to record interaction:', error);
        }
      }

      if (response.conversationId) {
        if (!currentConversationId) {
          setCurrentConversationId(response.conversationId);
          localStorage.setItem('currentConversationId', response.conversationId);
        }
        await loadConversations();
      }
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Handle security blocks from backend
      if (error.response?.status === 403 && error.response?.data?.error === 'SECURITY_BLOCK') {
        const threatCategory = error.response.data.threatCategory;
        const ThreatDetectionService = (await import('@/services/threatDetection.service')).default;
        const errorMessage = ThreatDetectionService.getErrorMessage({
          isBlocked: true,
          threatCategory: threatCategory,
          reason: error.response.data.message || 'Message blocked by security system',
          confidence: error.response.data.confidence || 0.8
        });
        setError(errorMessage);
      } else {
        setError(
          error instanceof Error ? error.message : "Failed to send message",
        );
      }

      setIsLoading(false);
      setLoadingMessageId(null);

      // Remove the user message if it was added before the error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      // Additional cleanup if needed
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


  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // max-h-40 = 160px
      const minHeight = 56; // min-h-[56px]
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [currentMessage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Helper function to detect and highlight CostKatana commands and linkify URLs in text
  const linkifyText = (text: string): React.ReactNode => {
    // Enhanced regex pattern for URLs - supports http, https, www, and common TLDs
    const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+)/gi;
    // Match @word or @word:action (e.g., @google, @drive:select, @google:list-issues)
    const commandPattern = /(@[a-z]+(?::[a-z-]+)?)/gi;

    // Split by both URLs and commands
    const combinedPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+|@[a-z]+(?::[a-z-]+)?)/gi;
    const parts = text.split(combinedPattern);

    return parts.map((part, index) => {
      // Check if it's a URL
      if (urlPattern.test(part)) {
        // Add protocol if missing (for www. links)
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline decoration-primary-400/50 hover:decoration-primary-600 transition-colors font-medium inline-flex items-center gap-1 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
            <LinkIcon className="w-3 h-3 inline opacity-60 flex-shrink-0" />
          </a>
        );
      }

      // Check if it's a CostKatana command
      if (commandPattern.test(part)) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-400/60 dark:border-emerald-500/60 bg-gradient-to-r from-emerald-400/30 to-emerald-500/30 dark:from-emerald-500/40 dark:to-emerald-600/40 text-emerald-900 dark:text-emerald-100 font-mono text-sm font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 cursor-default backdrop-blur-sm"
            title={`CostKatana Command: ${part}`}
          >
            {part}
          </span>
        );
      }

      return part;
    });
  };

  // Handle keyboard events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle link attachment with metadata extraction
  const handleAddLink = () => {
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 100);
  };

  const handleLinkInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLinkAttachment();
    } else if (e.key === 'Escape') {
      setShowLinkInput(false);
      setLinkInputValue('');
    }
  };

  const addLinkAttachment = async () => {
    const trimmedLink = linkInputValue.trim();
    if (!trimmedLink) return;

    // Validate URL format
    const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+)/gi;
    const isValidUrl = urlPattern.test(trimmedLink);

    if (!isValidUrl) {
      setError('Please enter a valid URL (e.g., https://example.com or www.example.com)');
      return;
    }

    // Add protocol if missing
    const fullUrl = trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`;

    try {
      // Extract basic info from URL
      const urlObj = new URL(fullUrl);
      let title = urlObj.hostname.replace('www.', '');

      // Try to fetch metadata from backend
      try {
        const response = await apiClient.post('/utils/extract-link-metadata', { url: fullUrl });
        if (response.data && response.data.title) {
          title = response.data.title;
        }
      } catch (metadataError) {
        // Fallback to hostname if metadata fetch fails
        console.log('Could not fetch metadata, using hostname');
      }

      setAttachedLinks(prev => [...prev, { url: fullUrl, title }]);
      setLinkInputValue('');
      setShowLinkInput(false);
      setError(null);
    } catch (err) {
      setError('Invalid URL format');
    }
  };

  const removeLinkAttachment = (index: number) => {
    setAttachedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const openSourcesModal = (sources: ChatMessage['sources']) => {
    setCurrentSources(sources || []);
    setShowSourcesModal(true);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <LinkIcon className="w-4 h-4" />;
      case 'document':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'api':
        return <ServerIcon className="w-4 h-4" />;
      case 'database':
        return <CircleStackIcon className="w-4 h-4" />;
      default:
        return <BookOpenIcon className="w-4 h-4" />;
    }
  };

  const parseSourcesFromResponse = (responseText: string): ChatMessage['sources'] => {
    const sources: ChatMessage['sources'] = [];
    // Look for "Sources:" section in the response - try multiple patterns
    const patterns = [
      /Sources:\s*([\s\S]*?)(?:\n\n|\n*$|$)/i,
      /Sources:\s*\n([\s\S]*?)(?:\n\n|\n*$|$)/i,
      /Sources:\s*\d+\.\s*([\s\S]*?)(?:\n\n|\n*$|$)/i
    ];

    let sourcesMatch = null;
    for (const pattern of patterns) {
      sourcesMatch = responseText.match(pattern);
      if (sourcesMatch) break;
    }

    if (sourcesMatch && sourcesMatch[1]) {
      const sourcesText = sourcesMatch[1];

      // Extract individual source lines (numbered list like "1. https://...")
      const sourceLines = sourcesText.match(/\d+\.\s*(https?:\/\/[^\s\n]+)/g);

      if (sourceLines) {
        sourceLines.forEach((line, index) => {
          const urlMatch = line.match(/\d+\.\s*(https?:\/\/[^\s\n]+)/);
          if (urlMatch && urlMatch[1]) {
            const url = urlMatch[1];

            // Determine source type based on URL domain
            let type: 'web' | 'document' | 'api' | 'database' = 'web';

            if (url.includes('google.com/search') || url.includes('search') || url.includes('bing.com') || url.includes('duckduckgo.com')) {
              type = 'web';
            } else if (url.includes('api.') || url.includes('/api/') || url.includes('docs/api')) {
              type = 'api';
            } else if (url.includes('docs') || url.includes('documentation') || url.includes('readme') || url.includes('.md')) {
              type = 'document';
            } else if (url.includes('database') || url.includes('db') || url.includes('mongodb') || url.includes('postgresql')) {
              type = 'database';
            }

            // Create a more descriptive title from the URL
            const urlObj = new URL(url);
            let title = urlObj.hostname;

            // If it's a search URL, extract the search query
            if (url.includes('google.com/search') || url.includes('search')) {
              const searchParams = new URLSearchParams(urlObj.search);
              const query = searchParams.get('q');
              if (query) {
                title = `Search: ${decodeURIComponent(query)}`;
              }
            } else {
              // For other URLs, use the path as title
              title = urlObj.pathname !== '/' ? `${urlObj.hostname}${urlObj.pathname}` : urlObj.hostname;
            }

            sources.push({
              title: title,
              url: url,
              type: type,
              description: `Source ${index + 1} - ${type.toUpperCase()} reference`
            });
          }
        });
      }
    }

    return sources.length > 0 ? sources : undefined;
  };

  // Convert plain URLs to markdown links for proper rendering
  const convertUrlsToMarkdown = (text: string): string => {
    const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    return text.replace(urlPattern, (url, offset) => {
      // Check if already in markdown format [text](url) or (url)
      const beforeUrl = text.substring(Math.max(0, offset - 50), offset);
      const afterUrl = text.substring(offset + url.length, offset + url.length + 10);

      // Skip if already in markdown link format
      if (beforeUrl.includes('](') && afterUrl.startsWith(')')) {
        return url;
      }
      if (beforeUrl.includes('(') && afterUrl.startsWith(')')) {
        return url;
      }

      // Handle "🔗 Link: URL" format - convert to markdown
      if (beforeUrl.includes('🔗') || beforeUrl.includes('Link:')) {
        return `[${url}](${url})`;
      }

      // Convert plain URL to markdown link format
      return `[${url}](${url})`;
    });
  };

  const renderMessageContent = (content: string, message?: ChatMessage) => {
    // Convert plain URLs to markdown for proper rendering
    const processedContent = convertUrlsToMarkdown(content);
    const isUserMessage = message?.role === 'user';

    return (
      <>
        {/* Thinking Section */}
        {message?.thinking && (
          <div className="mb-4 glass rounded-xl border border-primary-200/30 backdrop-blur-xl overflow-hidden shadow-lg">
            <button
              onClick={() =>
                setExpandedThinking(
                  expandedThinking === message.id ? null : message.id,
                )
              }
              className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-primary-500/5 hover:to-transparent transition-all duration-300"
            >
              <div className="p-2 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                <span className="text-lg">🤔</span>
              </div>
              <div className="flex-1 text-left font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                {message.thinking.title || "Thinking Process"}
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 text-primary-500 transition-transform duration-300 ${expandedThinking === message.id ? "rotate-180" : ""
                  }`}
              />
            </button>

            {expandedThinking === message.id && (
              <div className="p-5 border-t border-primary-200/30 animate-fade-in bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                {message.thinking.summary && (
                  <div className="mb-4 p-4 glass rounded-lg border-l-4 border-l-primary-500 shadow-md">
                    <strong className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">Summary:</strong>{" "}
                    <span className="font-body text-light-text-secondary dark:text-dark-text-secondary">{message.thinking.summary}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {message.thinking.steps.map((step, index) => (
                    <div key={index} className="p-4 glass rounded-lg border border-primary-200/30 shadow-md hover:border-primary-300/50 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-gradient-to-br from-primary-500 to-primary-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm font-display font-bold shadow-lg">
                          {step.step}
                        </span>
                        <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                          {step.description}
                        </span>
                      </div>
                      <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mb-3 ml-11 leading-relaxed">
                        {step.reasoning}
                      </div>
                      {step.outcome && (
                        <div className="ml-11 p-3 glass rounded-lg border border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20">
                          <strong className="font-display font-bold text-success-600 dark:text-success-400">Outcome:</strong>{" "}
                          <span className="font-body text-success-700 dark:text-success-300">{step.outcome}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Google Service View Links */}
        {message?.viewLinks && message.viewLinks.length > 0 && (
          <div className="mb-4 glass rounded-xl border border-primary-200/30 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="p-4 bg-gradient-to-r from-primary-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  Quick Actions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.viewLinks.map((link, index) => {
                  const getIcon = () => {
                    switch (link.type) {
                      case 'document': return <DocumentTextIcon className="w-4 h-4" />;
                      case 'spreadsheet': return <ChartBarIcon className="w-4 h-4" />;
                      case 'presentation': return <PresentationChartLineIcon className="w-4 h-4" />;
                      case 'email': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
                      case 'calendar': return <ClockIcon className="w-4 h-4" />;
                      case 'form': return <DocumentTextIcon className="w-4 h-4" />;
                      default: return <FolderIcon className="w-4 h-4" />;
                    }
                  };

                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-primary-200/30 hover:border-primary-400/50 hover:bg-primary-500/10 transition-all duration-200 text-sm font-medium text-primary-700 dark:text-primary-300 hover:shadow-md group"
                    >
                      <span className="text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                        {getIcon()}
                      </span>
                      <span className="font-display">{link.label}</span>
                      <LinkIcon className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Using ReactMarkdown with SyntaxHighlighter */}
        <div className="main-response">
          <div className="prose prose-sm max-w-none font-body text-light-text-primary dark:text-dark-text-primary">
            <ReactMarkdown
              components={{
                // Make links clickable and open in new tab with proper styling for user/assistant messages
                a({ href, children, ...props }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isUserMessage
                        ? 'text-white hover:text-white/90 underline decoration-white/70 hover:decoration-white font-bold'
                        : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline decoration-primary-400/50 hover:decoration-primary-600 font-medium'
                        } transition-colors inline-flex items-center gap-1`}
                      {...props}
                    >
                      {children}
                      <LinkIcon className={`w-3 h-3 inline ${isUserMessage ? 'opacity-80' : 'opacity-60'}`} />
                    </a>
                  );
                },
                code({ className, children, ...props }: { className?: string; children?: React.ReactNode;[key: string]: any }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match || className?.includes('inline');
                  const codeContent = String(children).replace(/\n$/, '');
                  const language = match ? match[1] : 'text';

                  // Create a stable codeId using content hash to prevent re-renders
                  const contentHash = codeContent.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                  }, 0);
                  const codeId = `${language}-${Math.abs(contentHash).toString(36)}`;

                  // Check if language has preview capability
                  const hasPreview = ['html', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx', 'react', 'vue', 'angular', 'svelte', 'css', 'scss', 'terminal', 'bash', 'shell'].includes(language.toLowerCase());

                  // Check if inline code is a CostKatana command
                  const commandPattern = /^@[a-z]+(?::[a-z-]+)?$/i;
                  if (isInline && commandPattern.test(codeContent.trim())) {
                    return (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-400/60 dark:border-emerald-500/60 bg-gradient-to-r from-emerald-400/30 to-emerald-500/30 dark:from-emerald-500/40 dark:to-emerald-600/40 text-emerald-900 dark:text-emerald-100 font-mono text-sm font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 cursor-default backdrop-blur-sm"
                        title={`CostKatana Command: ${codeContent}`}
                      >
                        {codeContent}
                      </span>
                    );
                  }

                  return !isInline && match ? (
                    <div className="my-4 rounded-xl overflow-hidden border border-primary-200/30">
                      <div className="flex items-center justify-between px-4 py-2 glass border-b border-primary-200/30">
                        <div className="flex items-center space-x-2">
                          <span className="font-display font-medium text-sm text-light-text-primary dark:text-dark-text-primary capitalize">
                            {language}
                          </span>
                          {hasPreview && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                              PREVIEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {hasPreview && (
                            <button
                              onClick={() => togglePreview(codeId)}
                              className="px-3 py-1.5 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-200/50 dark:hover:bg-primary-800/40 border border-primary-200/30 dark:border-primary-700/30 transition-all text-xs font-display font-medium text-primary-700 dark:text-primary-300 flex items-center gap-1"
                              title="Toggle Preview"
                            >
                              {showPreviews[codeId] ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  Hide Preview
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  Show Preview
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => copyToClipboard(codeContent)}
                            className="px-3 py-1.5 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-200/50 dark:hover:bg-primary-800/40 border border-primary-200/30 dark:border-primary-700/30 transition-all text-xs font-display font-medium text-primary-700 dark:text-primary-300 flex items-center gap-1"
                          >
                            {copiedCode === codeContent ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={language}
                        PreTag="div"
                        className="rounded-b-xl !mt-0 !p-4 !bg-[#011627] text-sm leading-relaxed overflow-x-auto"
                        showLineNumbers={true}
                        wrapLines={true}
                      >
                        {codeContent}
                      </SyntaxHighlighter>

                      {/* Preview Section */}
                      {hasPreview && showPreviews[codeId] && (
                        <div className="mt-4 border-t border-primary-200/30">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Preview for {language} code (ID: {codeId}) - State: {showPreviews[codeId] ? 'SHOWING' : 'HIDDEN'}
                            </div>
                            {language.toLowerCase() === 'html' ? (
                              <CodePreview
                                code={codeContent}
                                language={language}
                                title={`${language.toUpperCase()} Preview`}
                                sandboxMode={previewMode}
                                theme="auto"
                                maxHeight="400px"
                                allowFullscreen={true}
                                allowDownload={true}
                              />
                            ) : (
                              <PreviewRenderer
                                content={codeContent}
                                language={language}
                                showPreview={true}
                                sandboxMode={previewMode}
                                theme="auto"
                                maxHeight="400px"
                                allowFullscreen={true}
                                allowDownload={true}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <code className={`${className} bg-primary-100 dark:bg-primary-900 px-1.5 py-0.5 rounded text-sm`} {...props}>
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
                // Enhanced styling for other markdown elements
                h1: ({ children }) => (
                  <h1 className="text-2xl font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-4 mt-6 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-3 mt-5 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2 mt-4 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 last:mb-0 leading-relaxed text-light-text-primary dark:text-dark-text-primary">
                    {typeof children === 'string' ? linkifyText(children) : children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 last:mb-0 space-y-1 text-light-text-primary dark:text-dark-text-primary">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 last:mb-0 space-y-1 text-light-text-primary dark:text-dark-text-primary">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-light-text-primary dark:text-dark-text-primary">
                    {typeof children === 'string' ? linkifyText(children) : children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-300 pl-4 italic mb-4 last:mb-0 text-light-text-secondary dark:text-dark-text-secondary bg-primary-50/50 dark:bg-primary-900/30 py-2 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4 last:mb-0">
                    <table className="min-w-full border-collapse border border-primary-200/30 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-primary-50/50 dark:bg-primary-900/30">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="border border-primary-200/30 px-4 py-2 text-left font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-primary-200/30 px-4 py-2 text-light-text-primary dark:text-dark-text-primary">
                    {children}
                  </td>
                ),
                strong: ({ children }) => (
                  <strong className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-light-text-primary dark:text-dark-text-primary">
                    {children}
                  </em>
                ),
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        </div>
      </>
    );
  };

  const SourcesModal = () => {
    if (!showSourcesModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="glass max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-200/30">
            <h3 className="text-xl font-display font-bold text-light-text-primary dark:text-dark-text-primary inline-flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              Sources & References
            </h3>
            <button
              onClick={() => setShowSourcesModal(false)}
              className="p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {(currentSources || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  No sources available for this response.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(currentSources || []).map((source, index) => (
                  <div
                    key={index}
                    className="glass p-4 rounded-xl border border-primary-200/30 hover:border-primary-300/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Source Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-accent/20 flex items-center justify-center text-lg">
                        {getSourceIcon(source.type)}
                      </div>

                      {/* Source Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 line-clamp-2">
                              {source.title}
                            </h4>
                            {source.description && (
                              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-2">
                                {source.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-light-text-muted dark:text-dark-text-muted">
                              <span className={`px-2 py-1 rounded-full font-medium ${source.type === 'web' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                source.type === 'document' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                  source.type === 'api' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                    'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                                }`}>
                                {source.type.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => window.open(source.url, '_blank')}
                            className="flex-shrink-0 p-2 rounded-lg bg-gradient-primary text-white hover:scale-105 transition-all duration-300 shadow-lg glow-primary"
                            title="Open source in new tab"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>

                        {/* URL */}
                        <div className="mt-2 p-2 bg-primary-50/50 dark:bg-primary-900/30 rounded-lg border border-primary-200/20">
                          <p className="text-xs font-mono text-light-text-muted dark:text-dark-text-muted break-all">
                            {source.url}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-primary-200/30">
            <button
              onClick={() => setShowSourcesModal(false)}
              className="btn-primary px-6 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-0 w-full animate-fade-in relative">
      {/* Mobile Conversations Drawer */}
      {showConversations && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowConversations(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] glass backdrop-blur-xl border-r border-primary-200/30 shadow-2xl z-50 md:hidden flex flex-col transform transition-transform duration-300">
            {/* Mobile Drawer Header */}
            <div className="p-2 border-b border-primary-200/30 flex items-center justify-between shrink-0">
              <h3 className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary">
                Conversations
              </h3>
              <button
                onClick={() => setShowConversations(false)}
                className="p-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 rounded-lg hover:bg-primary-500/10 transition-all"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button - Mobile */}
            <div className="p-2 border-b border-primary-200/30">
              <button
                onClick={() => {
                  startNewConversation();
                  setShowConversations(false);
                }}
                className="btn btn-primary w-full flex items-center justify-center text-sm py-1.5 font-display font-semibold"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Chat
              </button>
            </div>

            {/* Conversations List - Mobile */}
            <div className="flex-1 overflow-y-auto p-1.5">
              {conversationsLoading ? (
                <ConversationsShimmer count={5} collapsed={false} />
              ) : conversations.length === 0 ? (
                <div className="p-3 text-center">
                  <p className="text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                    No conversations yet
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group p-2 mb-1 rounded-lg cursor-pointer hover:bg-primary-500/10 transition-all duration-300 ${currentConversationId === conversation.id
                      ? "bg-gradient-primary/10 border border-primary-200/50 shadow-lg"
                      : "hover:shadow-md"
                      }`}
                    onClick={() => {
                      loadConversationHistory(conversation.id);
                      setShowConversations(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary truncate mb-0.5">
                          {conversation.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-light-text-muted dark:text-dark-text-muted">
                          <span>{conversation.messageCount} msgs</span>
                          <span>•</span>
                          <span>{formatTimestamp(conversation.updatedAt)}</span>
                        </div>
                        {conversation.totalCost && (
                          <p className="text-[10px] font-bold gradient-text mt-0.5 inline-block bg-gradient-success/10 px-1.5 py-0.5 rounded">
                            ${conversation.totalCost.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(conversation.id, e);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-1.5 p-1 text-light-text-muted dark:text-dark-text-muted hover:text-danger-500 transition-all duration-300 rounded-lg hover:bg-danger-500/10"
                        title="Delete conversation"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Sidebar - Desktop/Tablet */}
      <div
        className={`hidden md:flex ${showConversations ? "w-64 lg:w-80" : "w-16"} glass backdrop-blur-xl border-r border-primary-200/30 transition-all duration-300 flex-col shadow-2xl relative z-10 overflow-hidden`}
      >
        {/* Sidebar Header - Desktop/Tablet */}
        <div className="p-2 md:p-3 border-b border-primary-200/30 flex items-center justify-center">
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

        {/* New Chat Button - Desktop/Tablet */}
        {showConversations ? (
          <div className="p-2 md:p-3">
            <button
              onClick={startNewConversation}
              className="btn btn-primary w-full flex items-center justify-center text-sm py-1.5 md:py-2 font-display font-semibold"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Chat
            </button>
          </div>
        ) : (
          <div className="p-2 md:p-3 flex justify-center">
            <button
              onClick={startNewConversation}
              className="p-1.5 md:p-2 rounded-xl bg-gradient-primary text-white hover:scale-110 transition-all duration-300 glow-primary shadow-lg"
              title="New Chat"
            >
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        )}

        {/* Conversations List */}
        {showConversations ? (
          conversationsLoading ? (
            <ConversationsShimmer count={5} collapsed={false} />
          ) : (
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
                    className={`group p-2 md:p-2.5 lg:p-3 mx-1 md:mx-2 mb-1.5 md:mb-2 rounded-lg md:rounded-xl cursor-pointer hover:bg-primary-500/10 transition-all duration-300 ${currentConversationId === conversation.id
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
                        onClick={(e) => handleDeleteClick(conversation.id, e)}
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
          )
        ) : (
          // Collapsed state - show conversation count indicator or shimmer
          conversationsLoading ? (
            <ConversationsShimmer count={1} collapsed={true} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-start pt-4">
              {conversations.length > 0 && (
                <div className="bg-gradient-primary/20 text-primary-600 dark:text-primary-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-display font-bold mb-2">
                  {conversations.length}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="glass backdrop-blur-xl border-b border-primary-200/30 shadow-xl bg-gradient-to-r from-white/90 via-white/70 to-white/90 dark:from-dark-card/90 dark:via-dark-card/70 dark:to-dark-card/90 shrink-0">
          <div className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5">
            {/* Mobile: Stacked Layout */}
            <div className="flex flex-col gap-2 md:hidden">
              {/* Top Row: Title & Conversations Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-1.5 sm:p-2 rounded-lg glow-primary shadow-lg shrink-0">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display font-bold text-sm sm:text-base gradient-text-primary truncate">
                      AI Assistant
                    </h2>
                  </div>
                </div>
                {/* Conversations Button - Mobile */}
                <button
                  onClick={() => setShowConversations(!showConversations)}
                  className="relative p-1.5 sm:p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-300 glass rounded-lg border border-primary-200/30 shrink-0"
                  title="Conversations"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {conversations.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {conversations.length > 9 ? '9+' : conversations.length}
                    </span>
                  )}
                </button>
              </div>
              {/* Bottom Row: Essential Controls Only */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
                {/* Chat Mode - Mobile */}
                <div className="glass rounded-lg border border-primary-200/30 p-0.5 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10 shrink-0">
                  <div className="relative">
                    <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                      {chatMode === 'fastest' && <BoltIcon className="w-3 h-3 text-primary-500" />}
                      {chatMode === 'balanced' && <AdjustmentsHorizontalIcon className="w-3 h-3 text-primary-500" />}
                      {chatMode === 'cheapest' && <CurrencyDollarIcon className="w-3 h-3 text-primary-500" />}
                    </div>
                    <select
                      value={chatMode}
                      onChange={(e) => setChatMode(e.target.value as 'fastest' | 'cheapest' | 'balanced')}
                      className="input text-xs py-1 pl-6 pr-5 min-w-[75px] appearance-none bg-white/80 dark:bg-gray-800/80 border-primary-200/30 font-display font-semibold cursor-pointer"
                    >
                      <option value="fastest">Fastest</option>
                      <option value="balanced">Balanced</option>
                      <option value="cheapest">Cheapest</option>
                    </select>
                    <ChevronDownIcon className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-primary-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tablet & Desktop: Horizontal Layout */}
            <div className="hidden md:flex items-center justify-between gap-4">
              {/* Left: Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl glow-primary shadow-lg shrink-0">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display font-bold text-xl gradient-text-primary truncate">
                    AI Assistant
                  </h2>
                </div>
              </div>

              {/* Right: Controls and Actions */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Chat Mode Selector - Tablet & Desktop */}
                <div className="glass rounded-lg border border-primary-200/30 p-1.5 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                      {chatMode === 'fastest' && <BoltIcon className="w-3.5 h-3.5 text-primary-500" />}
                      {chatMode === 'balanced' && <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 text-primary-500" />}
                      {chatMode === 'cheapest' && <CurrencyDollarIcon className="w-3.5 h-3.5 text-primary-500" />}
                    </div>
                    <select
                      value={chatMode}
                      onChange={(e) => setChatMode(e.target.value as 'fastest' | 'cheapest' | 'balanced')}
                      className="input text-xs py-1.5 pl-8 pr-7 min-w-[100px] appearance-none bg-white/80 dark:bg-gray-800/80 border-primary-200/30 font-display font-semibold cursor-pointer hover:border-primary-400/50 transition-all"
                    >
                      <option value="fastest">Fastest</option>
                      <option value="balanced">Balanced</option>
                      <option value="cheapest">Cheapest</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                  </div>
                </div>

                {/* Multi-Agent Toggle */}
                <div className="glass rounded-lg border border-primary-200/30 p-1.5 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10" title={useMultiAgent ? "Multi-Agent Mode: ON" : "Multi-Agent Mode: OFF"}>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={useMultiAgent}
                        onChange={(e) => setUseMultiAgent(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-9 h-5 rounded-full transition-all duration-300 ${useMultiAgent
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${useMultiAgent ? 'translate-x-4' : 'translate-x-0.5'
                          }`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CpuChipIcon className={`w-4 h-4 transition-colors shrink-0 ${useMultiAgent ? 'text-primary-500' : 'text-light-text-secondary dark:text-dark-text-secondary'
                        }`} />
                      <span className={`hidden lg:inline text-xs font-display font-semibold whitespace-nowrap transition-colors ${useMultiAgent
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-light-text-secondary dark:text-dark-text-secondary'
                        }`}>
                        Multi-Agent
                      </span>
                    </div>
                  </label>
                </div>

                {/* Preview Mode Selector - Hidden on Mobile */}
                <div className="hidden lg:block glass rounded-lg border border-primary-200/30 p-1.5 bg-gradient-to-br from-primary-50/30 to-transparent dark:from-primary-900/10">
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                      {previewMode === 'strict' && <ShieldCheckIcon className="w-3.5 h-3.5 text-primary-500" />}
                      {previewMode === 'moderate' && <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 text-primary-500" />}
                      {previewMode === 'permissive' && <LockOpenIcon className="w-3.5 h-3.5 text-primary-500" />}
                    </div>
                    <select
                      value={previewMode}
                      onChange={(e) => handlePreviewModeChange(e.target.value as 'strict' | 'moderate' | 'permissive')}
                      className="input text-xs py-1.5 pl-8 pr-7 min-w-[100px] appearance-none bg-white/80 dark:bg-gray-800/80 border-primary-200/30 font-display font-semibold cursor-pointer hover:border-primary-400/50 transition-all"
                    >
                      <option value="strict">Strict</option>
                      <option value="moderate">Moderate</option>
                      <option value="permissive">Permissive</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-primary-500 pointer-events-none" />
                  </div>
                </div>

                {/* Action Buttons - Hidden on Mobile */}
                <div className="hidden xl:flex items-center gap-1.5 ml-1">
                  <button
                    onClick={() => { setShowOptimizations(!showOptimizations); navigate('/optimizations') }}
                    className="glass hover:bg-gradient-to-br hover:from-primary-500/20 hover:to-primary-600/20 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/30 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 group"
                    title="View Optimizations"
                  >
                    <ChartBarIcon className="w-4 h-4 text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors shrink-0" />
                    <span className="whitespace-nowrap">Optimizations</span>
                  </button>

                  <button
                    onClick={() => navigate('/memory')}
                    className="glass hover:bg-gradient-to-br hover:from-primary-500/20 hover:to-primary-600/20 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200/30 text-xs font-display font-semibold text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 group"
                    title="Manage AI Memory & Personalization"
                  >
                    <BoltIcon className="w-4 h-4 text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors shrink-0" />
                    <span className="whitespace-nowrap">Memory</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 md:p-3 lg:p-4 xl:p-6 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6">
          {error && (
            <div className="glass border border-danger-200/30 bg-gradient-to-br from-danger-500/20 to-danger-600/20 p-5 animate-scale-in shadow-2xl backdrop-blur-xl rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-danger-500 to-danger-600 p-2.5 rounded-xl shadow-lg">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <p className="font-display font-semibold text-danger-600 dark:text-danger-400">{error}</p>
              </div>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="mb-12">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-5 rounded-3xl w-20 h-20 mx-auto mb-6 glow-primary animate-pulse shadow-2xl flex items-center justify-center">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl md:text-3xl gradient-text-primary mb-3 sm:mb-4">
                  Welcome to your AI Assistant
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto leading-relaxed font-body text-sm sm:text-base px-4">
                  I'm here to help you manage your AI costs, create projects,
                  analyze usage patterns, and optimize your AI operations. Ask
                  me anything!
                </p>
              </div>

              {/* Integration Mention Hint - Prominent */}
              <IntegrationMentionHint variant="prominent" />

              <div className="space-y-6">
                <h4 className="font-display font-semibold text-lg text-light-text-primary dark:text-dark-text-primary">
                  {questionsLoading
                    ? "Loading personalized suggestions..."
                    : "Try these suggestions:"}
                </h4>
                {questionsLoading ? (
                  <SuggestionsShimmer count={6} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {suggestedQuestions.map((question, index) => {
                      const IconComponent = question.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => sendMessage(question.text)}
                          className="glass p-5 text-left transition-all duration-300 hover:scale-105 hover:-translate-y-1 group shadow-xl backdrop-blur-xl border border-primary-200/30 hover:border-primary-400/50 hover:shadow-2xl rounded-xl bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 p-2.5 rounded-xl group-hover:from-primary-500 group-hover:to-primary-600 group-hover:glow-primary transition-all duration-300 shadow-md">
                              <IconComponent className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary mb-1.5 line-clamp-2 leading-snug">
                                {question.text}
                              </p>
                              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-display font-medium uppercase tracking-wider">
                                {question.category}
                              </p>
                            </div>
                            <ArrowUpIcon className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary transform rotate-45 group-hover:text-primary-500 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const shouldShowShimmer = isLoading && loadingMessageId === message.id && message.role === 'user' && isLastMessage;

            return (
              <React.Fragment key={message.id}>
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-4xl ${message.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl glow-primary'
                    : 'glass shadow-2xl backdrop-blur-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50'
                    } p-5 rounded-2xl ${message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'} transition-all hover:shadow-2xl`}>
                    {renderMessageContent(message.content, message)}

                    {/* Attached Documents Display */}
                    {message.attachedDocuments && message.attachedDocuments.length > 0 && (
                      <div className={`mt-4 flex flex-wrap gap-2 ${message.role === 'user' ? 'opacity-90' : ''}`}>
                        {message.attachedDocuments.map((doc) => (
                          <div
                            key={doc.documentId}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm glass backdrop-blur-sm border transition-all hover:scale-105 ${message.role === 'user'
                              ? 'border-white/30 bg-white/20 hover:bg-white/30'
                              : 'border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 hover:border-primary-300/50'
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg ${message.role === 'user'
                              ? 'bg-white/20'
                              : 'bg-gradient-to-br from-primary-500/20 to-primary-600/20'
                              }`}>
                              <DocumentTextIcon className={`w-4 h-4 ${message.role === 'user' ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                            </div>
                            <span className={`font-display font-semibold max-w-[200px] truncate ${message.role === 'user' ? 'text-white' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                              {doc.fileName}
                            </span>
                            <span className={`text-xs font-body px-1.5 py-0.5 rounded-lg ${message.role === 'user'
                              ? 'bg-white/20 text-white/90'
                              : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                              }`}>
                              {doc.chunksCount} chunks
                            </span>
                            <button
                              onClick={() => setPreviewDocument({ documentId: doc.documentId, fileName: doc.fileName })}
                              className={`ml-1 p-1.5 rounded-lg transition-all hover:scale-110 ${message.role === 'user'
                                ? 'hover:bg-white/30 text-white/90 hover:text-white'
                                : 'hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                                }`}
                              title="Preview document"
                              aria-label="Preview document"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-primary-200/30">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-body ${message.role === 'user' ? 'text-white/80' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {(message.metadata?.templateId || message.metadata?.templateUsed) && (
                          <span className={`glass px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 ${message.role === 'user'
                            ? 'border-white/30 bg-white/20 text-white'
                            : 'border-purple-200/30 bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-600 dark:text-purple-400'
                            } font-display font-semibold text-xs`}>
                            <SparklesIcon className="w-3.5 h-3.5" />
                            {message.metadata?.templateName || message.metadata?.templateUsed?.name || 'Template'}
                          </span>
                        )}
                        {message.metadata?.cost && (
                          <span className={`glass px-2.5 py-1 rounded-lg border ${message.role === 'user'
                            ? 'border-white/30 bg-white/20 text-white'
                            : 'border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400'
                            } font-display font-bold text-xs`}>
                            ${message.metadata.cost.toFixed(4)}
                          </span>
                        )}
                        {message.cacheHit && (
                          <span className="glass px-2.5 py-1 rounded-lg border border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400 font-display font-semibold text-xs animate-pulse inline-flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Cached
                          </span>
                        )}
                        {message.riskLevel && message.riskLevel !== 'low' && (
                          <span className={`glass px-2.5 py-1 rounded-lg border font-display font-bold text-xs inline-flex items-center gap-1 ${message.riskLevel === 'high'
                            ? 'border-danger-200/30 bg-gradient-to-br from-danger-500/20 to-danger-600/20 text-danger-600 dark:text-danger-400'
                            : 'border-warning-200/30 bg-gradient-to-br from-warning-500/20 to-warning-600/20 text-warning-600 dark:text-warning-400'
                            }`}>
                            {message.riskLevel === 'high' ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {message.riskLevel.toUpperCase()} RISK
                          </span>
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <button
                            onClick={() => openSourcesModal(message.sources)}
                            className="glass px-2.5 py-1 rounded-lg border border-accent-200/30 bg-gradient-to-br from-accent-500/20 to-accent-600/20 text-accent-600 dark:text-accent-400 hover:from-accent-500/30 hover:to-accent-600/30 transition-all duration-300 font-display font-semibold text-xs inline-flex items-center gap-1"
                          >
                            <BookOpenIcon className="w-3 h-3" />
                            {message.sources.length} Source{message.sources.length > 1 ? 's' : ''}
                          </button>
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
                        <div className="mt-4 p-5 glass rounded-xl border border-primary-200/30 backdrop-blur-xl animate-fade-in shadow-lg bg-gradient-to-br from-primary-50/20 to-transparent dark:from-primary-900/10">
                          {/* Cache Hit Indicator */}
                          {message.cacheHit && (
                            <div className="mb-4">
                              <span className="glass border border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400 px-3 py-1.5 rounded-lg text-xs font-display font-bold animate-pulse shadow-md inline-flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" />
                                Semantic Cache Hit - Instant Response
                              </span>
                            </div>
                          )}

                          {/* Optimizations Applied */}
                          {message.optimizationsApplied && message.optimizationsApplied.length > 0 && (
                            <div className="mb-3">
                              <div className="mb-2">
                                <span className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary inline-flex items-center gap-1.5">
                                  <Settings className="w-4 h-4" />
                                  Optimizations Applied:
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {message.optimizationsApplied.map((opt, idx) => {
                                  // Determine color and icon based on optimization type
                                  let borderClass = 'border-primary-200/30';
                                  let bgClass = 'bg-gradient-to-br from-primary-500/20 to-primary-600/20';
                                  let textClass = 'text-primary-600 dark:text-primary-400';
                                  let IconComponent = Settings;

                                  if (opt.includes('cache')) {
                                    borderClass = 'border-success-200/30';
                                    bgClass = 'bg-gradient-to-br from-success-500/20 to-success-600/20';
                                    textClass = 'text-success-600 dark:text-success-400';
                                    IconComponent = Zap;
                                  } else if (opt.includes('prompt') || opt.includes('system')) {
                                    borderClass = 'border-warning-200/30';
                                    bgClass = 'bg-gradient-to-br from-warning-500/20 to-warning-600/20';
                                    textClass = 'text-warning-600 dark:text-warning-400';
                                    IconComponent = Brain;
                                  } else if (opt.includes('multi_turn') || opt.includes('context')) {
                                    borderClass = 'border-primary-200/30';
                                    bgClass = 'bg-gradient-to-br from-primary-500/20 to-primary-600/20';
                                    textClass = 'text-primary-600 dark:text-primary-400';
                                    IconComponent = MessageSquare;
                                  } else if (opt.includes('summarization')) {
                                    borderClass = 'border-accent-200/30';
                                    bgClass = 'bg-gradient-to-br from-accent-500/20 to-accent-600/20';
                                    textClass = 'text-accent-600 dark:text-accent-400';
                                    IconComponent = FileText;
                                  }

                                  return (
                                    <span key={idx} className={`glass px-3 py-1.5 rounded-lg border ${borderClass} ${bgClass} ${textClass} text-xs font-display font-bold shadow-sm inline-flex items-center gap-1.5`} title={opt}>
                                      <IconComponent className="w-3 h-3" />
                                      {opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                  );
                                })}
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
                                {message.agentPath.map((agent, idx) => {
                                  let borderClass = 'border-accent-200/30';
                                  let bgClass = 'bg-gradient-to-br from-accent-500/20 to-accent-600/20';
                                  let textClass = 'text-accent-600 dark:text-accent-400';

                                  if (agent.includes('master')) {
                                    borderClass = 'border-primary-200/30';
                                    bgClass = 'bg-gradient-to-br from-primary-500/20 to-primary-600/20';
                                    textClass = 'text-primary-600 dark:text-primary-400';
                                  } else if (agent.includes('cost')) {
                                    borderClass = 'border-warning-200/30';
                                    bgClass = 'bg-gradient-to-br from-warning-500/20 to-warning-600/20';
                                    textClass = 'text-warning-600 dark:text-warning-400';
                                  } else if (agent.includes('quality')) {
                                    borderClass = 'border-success-200/30';
                                    bgClass = 'bg-gradient-to-br from-success-500/20 to-success-600/20';
                                    textClass = 'text-success-600 dark:text-success-400';
                                  }

                                  return (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className={`glass px-3 py-1.5 rounded-lg border ${borderClass} ${bgClass} ${textClass} text-xs font-display font-bold shadow-sm`}>
                                        {agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </span>
                                      {idx < message.agentPath!.length - 1 && (
                                        <span className="text-primary-500 font-bold">→</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Performance Metrics */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-primary-200/30">
                            {message.riskLevel && (
                              <span className={`glass px-3 py-1.5 rounded-lg border text-xs font-display font-bold shadow-sm ${message.riskLevel === 'high'
                                ? 'border-danger-200/30 bg-gradient-to-br from-danger-500/20 to-danger-600/20 text-danger-600 dark:text-danger-400' :
                                message.riskLevel === 'medium'
                                  ? 'border-warning-200/30 bg-gradient-to-br from-warning-500/20 to-warning-600/20 text-warning-600 dark:text-warning-400' :
                                  'border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400'
                                }`}>
                                📊 Risk: {message.riskLevel.toUpperCase()}
                              </span>
                            )}

                            {message.metadata?.qualityScore && (
                              <span className={`glass px-3 py-1.5 rounded-lg border text-xs font-display font-bold shadow-sm ${getQualityLevel(message.metadata.qualityScore) === 'excellent'
                                ? 'border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400' :
                                getQualityLevel(message.metadata.qualityScore) === 'good'
                                  ? 'border-primary-200/30 bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-primary-600 dark:text-primary-400' :
                                  getQualityLevel(message.metadata.qualityScore) === 'fair'
                                    ? 'border-warning-200/30 bg-gradient-to-br from-warning-500/20 to-warning-600/20 text-warning-600 dark:text-warning-400' :
                                    'border-danger-200/30 bg-gradient-to-br from-danger-500/20 to-danger-600/20 text-danger-600 dark:text-danger-400'
                                }`}>
                                ⭐ Quality: {message.metadata.qualityScore}/10
                              </span>
                            )}

                            {message.metadata?.processingTime && (
                              <span className="glass px-3 py-1.5 rounded-lg border border-accent-200/30 bg-gradient-to-br from-accent-500/20 to-accent-600/20 text-accent-600 dark:text-accent-400 text-xs font-display font-bold shadow-sm">
                                ⏱️ {message.metadata.processingTime}ms
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Show shimmer right after the user message that triggered loading */}
                {shouldShowShimmer && (
                  <MessageShimmer />
                )}
              </React.Fragment>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass backdrop-blur-xl border-t border-primary-200/30 dark:border-primary-500/20 shadow-2xl bg-gradient-light-panel dark:bg-gradient-dark-panel shrink-0">
          <div className="max-w-4xl mx-auto p-1.5 sm:p-2 md:p-3 lg:p-4 space-y-1.5 sm:space-y-2 md:space-y-3">
            {/* Selected Repository Indicator - Right Aligned */}
            {selectedRepo && (
              <div className="flex items-center justify-between px-4 py-2.5 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel max-w-md ml-auto animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg glow-primary">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-display font-semibold text-secondary-700 dark:text-secondary-300 truncate">
                      {selectedRepo.repo.fullName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRepo(null);
                    const clearMessage: ChatMessage = {
                      id: Date.now().toString(),
                      role: "assistant",
                      content: "Repository context cleared. You can select a new repository anytime.",
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, clearMessage]);
                  }}
                  className="p-1.5 text-secondary-500 dark:text-secondary-400 hover:text-danger-500 dark:hover:text-danger-400 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded-lg transition-all duration-200"
                  title="Clear repository"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Selected Documents Display - Right Aligned */}
            {selectedDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedDocuments.map((doc) => (
                  <div
                    key={doc.documentId}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-secondary-50 dark:bg-secondary-800/30 rounded-lg border border-secondary-200/50 dark:border-secondary-700/50 text-xs hover:shadow-sm transition-all"
                  >
                    <DocumentTextIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                    <span className="text-secondary-700 dark:text-secondary-300 font-medium max-w-[120px] truncate">
                      {doc.fileName}
                    </span>
                    <span className="text-secondary-500 dark:text-secondary-400">
                      {doc.chunksCount}
                    </span>
                    <button
                      onClick={() => setSelectedDocuments(prev => prev.filter(d => d.documentId !== doc.documentId))}
                      className="p-0.5 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded transition-colors"
                      title="Remove"
                    >
                      <XMarkIcon className="w-3 h-3 text-secondary-500 dark:text-secondary-400 hover:text-danger-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attached Links Display - Enhanced */}
            {attachedLinks.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-display font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider px-1">
                  Attached Links ({attachedLinks.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachedLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-primary-200/50 dark:border-primary-700/50 shadow-md hover:shadow-lg transition-all group bg-gradient-to-br from-primary-50/80 to-primary-100/50 dark:from-primary-900/40 dark:to-primary-800/30 min-w-[200px] max-w-full"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
                        <LinkIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-display font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                          title={link.title || link.url}
                        >
                          {link.title || new URL(link.url).hostname.replace('www.', '')}
                        </a>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate mt-0.5" title={link.url}>
                          {new URL(link.url).hostname}
                        </div>
                      </div>
                      <button
                        onClick={() => removeLinkAttachment(index)}
                        className="flex-shrink-0 p-1.5 hover:bg-danger-100 dark:hover:bg-danger-900/40 rounded-lg transition-all hover:scale-110 group"
                        title="Remove link"
                      >
                        <XMarkIcon className="w-4 h-4 text-secondary-400 dark:text-secondary-500 group-hover:text-danger-500 dark:group-hover:text-danger-400 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link Input Field - Cursor-style */}
            {showLinkInput && (
              <div className="glass rounded-lg border border-primary-300 dark:border-primary-600 shadow-lg backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-3 animate-scale-in">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <span className="text-sm font-display font-semibold text-primary-700 dark:text-primary-300">
                    Add Link
                  </span>
                  <button
                    onClick={() => {
                      setShowLinkInput(false);
                      setLinkInputValue('');
                    }}
                    className="ml-auto p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={linkInputRef}
                    type="text"
                    value={linkInputValue}
                    onChange={(e) => setLinkInputValue(e.target.value)}
                    onKeyDown={handleLinkInputKeyPress}
                    placeholder="Paste or type URL (e.g., https://example.com)"
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-primary-200/50 dark:border-primary-700/50 bg-white dark:bg-dark-card text-secondary-900 dark:text-white placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400 dark:focus:border-primary-600 transition-all outline-none"
                  />
                  <button
                    onClick={addLinkAttachment}
                    disabled={!linkInputValue.trim()}
                    className={`px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all ${linkInputValue.trim()
                      ? 'bg-gradient-primary text-white hover:scale-105 shadow-md hover:shadow-lg'
                      : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-400 dark:text-secondary-500 cursor-not-allowed'
                      }`}
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 font-mono">Enter</kbd> to add or <kbd className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 font-mono">Esc</kbd> to cancel
                </div>
              </div>
            )}

            {/* Compact Integration Mention Hint - Above Input */}
            {messages.length > 0 && (
              <IntegrationMentionHint variant="compact" />
            )}

            {/* Message Input Container */}
            <div className="glass rounded-lg sm:rounded-xl md:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-1 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-3.5 focus-within:border-primary-400 dark:focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-300">
              <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
                {/* Attachments Popover Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentsPopover(!showAttachmentsPopover)}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-800/50 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
                    title="Attach files, GitHub, or integrations"
                  >
                    <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </button>

                  {/* Attachments Popover */}
                  {showAttachmentsPopover && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowAttachmentsPopover(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-2 w-64 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel z-50 animate-scale-in overflow-hidden">
                        <div className="p-2">
                          {/* Add Link Button */}
                          <button
                            onClick={() => {
                              setShowAttachmentsPopover(false);
                              handleAddLink();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 mb-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-200/30 dark:border-primary-500/20 bg-primary-50/50 dark:bg-primary-900/10"
                          >
                            <LinkIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <div className="flex-1 text-left">
                              <span className="block text-sm font-medium text-gray-900 dark:text-white">Add Link</span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400">Attach URL to message</span>
                            </div>
                          </button>

                          {/* Template Picker Button */}
                          <button
                            onClick={() => {
                              setShowAttachmentsPopover(false);
                              openTemplatePicker();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 mb-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors border border-primary-200/30 dark:border-primary-500/20 bg-primary-50/50 dark:bg-primary-900/10"
                          >
                            <SparklesIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            <div className="flex-1 text-left">
                              <span className="block text-sm font-medium text-gray-900 dark:text-white">Use Template</span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400">Quick start with prompts</span>
                            </div>
                          </button>

                          {/* Document Upload in Popover */}
                          <div className="mb-2">
                            <input
                              ref={hiddenFileInputRef}
                              type="file"
                              accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,.ts,.js,.py,.java,.cpp,.go,.rs,.rb"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setShowAttachmentsPopover(false);
                                  try {
                                    const validation = documentService.validateFile(file);
                                    if (!validation.valid) {
                                      setError(validation.error || 'Invalid file');
                                      return;
                                    }

                                    const result = await documentService.uploadDocument(file, {
                                      onProgress: () => { } // Silent upload in popover
                                    });

                                    const docMetadata: DocumentMetadata = {
                                      documentId: result.documentId,
                                      fileName: result.fileName,
                                      fileType: file.name.split('.').pop() || 'unknown',
                                      uploadDate: new Date().toISOString(),
                                      chunksCount: result.documentsCreated || 0,
                                      s3Key: result.s3Key
                                    };

                                    setSelectedDocuments(prev => [...prev, docMetadata]);

                                    // Reset input
                                    if (hiddenFileInputRef.current) {
                                      hiddenFileInputRef.current.value = '';
                                    }
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Upload failed');
                                  }
                                }
                              }}
                              className="hidden"
                            />
                            <button
                              onClick={() => hiddenFileInputRef.current?.click()}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                            >
                              <PaperClipIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                              <span className="text-sm font-medium text-secondary-900 dark:text-white">Upload Document</span>
                            </button>
                          </div>

                          {/* GitHub Connect in Popover */}
                          <div className="mb-2">
                            <button
                              onClick={async () => {
                                setShowAttachmentsPopover(false);
                                setGitHubConnectorMode('chat');
                                setShowGitHubConnector(true);
                                setTimeout(() => loadGitHubConnection(), 500);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                            >
                              {githubConnection?.hasConnection && githubConnection?.avatarUrl ? (
                                <>
                                  <img
                                    src={githubConnection.avatarUrl}
                                    alt={githubConnection.username || 'GitHub'}
                                    className="w-4 h-4 rounded-full"
                                  />
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">View GitHub Repos</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                  </svg>
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">Connect GitHub</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Google Workspace Connection */}
                          <div className="mb-2">
                            <button
                              onClick={() => {
                                setShowAttachmentsPopover(false);
                                if (googleConnection.hasConnection) {
                                  setShowGooglePanel(true);
                                  setGooglePanelTab('quick');
                                } else {
                                  navigate('/integrations');
                                }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                            >
                              {googleConnection.hasConnection ? (
                                <>
                                  <svg className="w-5 h-5 integration-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                  </svg>
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">Google Workspace</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 integration-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                  </svg>
                                  <span className="text-sm font-medium text-secondary-900 dark:text-white">Connect Google</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* GitHub Integrations - Conditional Display */}
                          {githubConnection.hasConnection && (
                            <>
                              {/* Show "View Integrations" if user has existing integrations */}
                              {hasExistingIntegrations ? (
                                <div className="mb-2">
                                  <button
                                    onClick={() => {
                                      setShowAttachmentsPopover(false);
                                      navigate('/github');
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                                  >
                                    <ChartBarIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                                    <span className="text-sm font-medium text-secondary-900 dark:text-white">View GitHub Integrations</span>
                                  </button>
                                </div>
                              ) : (
                                /* Show "Add Integration" only if no integrations exist and no repo is selected */
                                !selectedRepo && (
                                  <div className="mb-2">
                                    <button
                                      onClick={() => {
                                        setShowAttachmentsPopover(false);
                                        setGitHubConnectorMode('integration');
                                        setShowGitHubConnector(true);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                                    >
                                      <PlusIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                                      <span className="text-sm font-medium text-secondary-900 dark:text-white">Add GitHub Integration</span>
                                    </button>
                                  </div>
                                )
                              )}
                            </>
                          )}

                          {/* All Integrations - Separator */}
                          <div className="pt-2 mb-2 border-t border-primary-200/30 dark:border-primary-500/20">
                            <button
                              onClick={() => {
                                setShowAttachmentsPopover(false);
                                navigate('/integrations');
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                            >
                              <Cog6ToothIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                              <span className="text-sm font-medium text-secondary-900 dark:text-white">All Integrations</span>
                            </button>
                          </div>

                          {/* Disconnect GitHub */}
                          {githubConnection.hasConnection && (
                            <div className="pt-2 border-t border-primary-200/30 dark:border-primary-500/20">
                              <button
                                onClick={async () => {
                                  setShowAttachmentsPopover(false);
                                  if (window.confirm('Are you sure you want to disconnect GitHub? This will remove all your GitHub connections.')) {
                                    try {
                                      const connections = await githubService.listConnections();
                                      for (const conn of connections) {
                                        if (conn.isActive) {
                                          await githubService.disconnectConnection(conn._id);
                                        }
                                      }
                                      await loadGitHubConnection();
                                      setMessages(prev => [...prev, {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: '✅ GitHub has been disconnected successfully.',
                                        timestamp: new Date()
                                      }]);
                                    } catch (error) {
                                      console.error('Failed to disconnect GitHub:', error);
                                      setError('Failed to disconnect GitHub. Please try again.');
                                    }
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded-lg transition-colors text-danger-600 dark:text-danger-400"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Disconnect GitHub</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      selectedDocuments.length > 0
                        ? `Ask me about ${selectedDocuments.map(d => d.fileName).join(', ')}...`
                        : "Ask me anything about your AI costs, projects, or optimizations..."
                    }
                    className="w-full px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-5 lg:pt-6 pb-1.5 sm:pb-2 pr-8 sm:pr-10 md:pr-12 lg:pr-14 resize-none min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px] max-h-28 sm:max-h-32 md:max-h-36 lg:max-h-40 overflow-y-auto bg-transparent border-none outline-none text-secondary-900 dark:text-white placeholder:text-secondary-400 dark:placeholder:text-secondary-500 font-body text-sm leading-relaxed focus:ring-0 focus:outline-none relative z-10"
                    rows={1}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
                      height: '56px'
                    }}
                  />

                  {/* Mention Autocomplete */}
                  <MentionAutocomplete
                    value={currentMessage}
                    onChange={(newValue) => {
                      setCurrentMessage(newValue);
                      setTimeout(() => {
                        if (handlePickerCommand(newValue.trim())) {
                          setCurrentMessage("");
                        }
                      }, 0);
                    }}
                    onSelect={() => {
                      // Mention is already inserted in the textarea
                      // The onChange handler will check for picker commands
                    }}
                    textareaRef={textareaRef}
                  />
                </div>

                {/* Model Selector - Next to Send Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1 px-1.5 sm:px-2 md:px-2.5 py-1.5 sm:py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-secondary-50 dark:bg-secondary-800/50 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
                    title={`Select model: ${formatModelDisplay(selectedModel)}`}
                  >
                    <div className="bg-gradient-primary p-0.5 sm:p-1 rounded glow-primary shrink-0">
                      <SparklesIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <span className="hidden md:inline text-xs font-display font-semibold text-secondary-900 dark:text-white max-w-[80px] lg:max-w-[100px] truncate">
                      {formatModelDisplay(selectedModel)}
                    </span>
                    <ChevronDownIcon className="hidden md:block w-3 h-3 text-secondary-600 dark:text-secondary-400 shrink-0" />
                  </button>

                  {/* Model Dropdown - Mobile Bottom Sheet / Desktop Dropdown */}
                  {showModelDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={() => {
                          setShowModelDropdown(false);
                          setShowAllModelsDropdown(false);
                        }}
                      />
                      {/* Mobile: Bottom Sheet */}
                      <div className="fixed md:hidden bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl shadow-2xl backdrop-blur-xl border-t border-l border-r border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel bg-white/95 dark:bg-dark-card/95 animate-slide-up">
                        {/* Bottom Sheet Handle */}
                        <div className="sticky top-0 bg-gradient-light-panel dark:bg-gradient-dark-panel z-10 pt-3 pb-2 px-4 border-b border-primary-200/30">
                          <div className="w-12 h-1 bg-primary-300 dark:bg-primary-700 rounded-full mx-auto mb-2"></div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-base gradient-text-primary">Select Model</h3>
                            <button
                              onClick={() => {
                                setShowModelDropdown(false);
                                setShowAllModelsDropdown(false);
                              }}
                              className="p-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 rounded-lg hover:bg-primary-500/10 transition-all"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 space-y-2">
                          {/* Top Models - Mobile Compact */}
                          <div className="mb-3">
                            <div className="px-2 py-1 mb-2 rounded-lg bg-primary-50/50 dark:bg-primary-900/20">
                              <span className="text-[10px] font-display font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">⭐ Top Models</span>
                            </div>
                            {getTopModels().map((model) => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model);
                                  setShowModelDropdown(false);
                                  setShowAllModelsDropdown(false);
                                }}
                                className={`w-full p-2.5 text-left active:bg-primary-500/20 transition-all duration-200 rounded-lg border touch-manipulation mb-1.5 ${selectedModel?.id === model.id ? "bg-gradient-primary/10 border-primary-300 dark:border-primary-600" : "border-primary-100/50 dark:border-primary-800/50 bg-white/50 dark:bg-dark-card/50"
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <div className="font-display font-semibold text-xs text-secondary-900 dark:text-white truncate">
                                        {formatModelDisplay(model)}
                                      </div>
                                      {selectedModel?.id === model.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-primary flex-shrink-0" />
                                      )}
                                    </div>
                                    {model.pricing && (
                                      <div className="text-[10px] text-success-600 dark:text-success-400 font-semibold">
                                        ${model.pricing.input.toFixed(2)}/1M in
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* More Models - Mobile */}
                          {getOtherModels().length > 0 && (
                            <div className="pt-2 border-t border-primary-200/30 dark:border-primary-500/20">
                              <button
                                onClick={() => setShowAllModelsDropdown(!showAllModelsDropdown)}
                                className="w-full p-2.5 text-left active:bg-primary-500/20 transition-all duration-200 rounded-lg flex items-center justify-between bg-white/30 dark:bg-dark-card/30 touch-manipulation"
                              >
                                <span className="font-display font-semibold text-xs text-secondary-900 dark:text-white">
                                  More Models ({getOtherModels().length})
                                </span>
                                <ChevronDownIcon
                                  className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-300 shrink-0 ${showAllModelsDropdown ? 'rotate-180' : ''
                                    }`}
                                />
                              </button>

                              {showAllModelsDropdown && (
                                <div className="mt-1.5 space-y-1 max-h-[40vh] overflow-y-auto">
                                  {getOtherModels().map((model) => (
                                    <button
                                      key={model.id}
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setShowModelDropdown(false);
                                        setShowAllModelsDropdown(false);
                                      }}
                                      className={`w-full p-2 text-left active:bg-primary-500/20 transition-all duration-200 rounded-lg border touch-manipulation ${selectedModel?.id === model.id ? "bg-gradient-primary/10 border-primary-300 dark:border-primary-600" : "border-primary-100/50 dark:border-primary-800/50 bg-white/50 dark:bg-dark-card/50"
                                        }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <div className="font-display font-medium text-xs text-secondary-900 dark:text-white truncate">
                                              {formatModelDisplay(model)}
                                            </div>
                                            {selectedModel?.id === model.id && (
                                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-primary flex-shrink-0" />
                                            )}
                                          </div>
                                          {model.pricing && (
                                            <div className="text-[10px] text-success-600 dark:text-success-400 font-semibold mt-0.5">
                                              ${model.pricing.input.toFixed(2)}/1M in
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop: Dropdown */}
                      <div className="hidden md:block absolute bottom-full right-0 mb-2 w-72 shadow-2xl backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 z-50 max-h-[500px] overflow-y-auto rounded-xl bg-gradient-light-panel dark:bg-gradient-dark-panel bg-white/95 dark:bg-dark-card/95 animate-scale-in">
                        {/* Top 5 Models */}
                        <div className="p-2">
                          <div className="px-2 py-1.5 mb-1 rounded-lg bg-primary-50/50 dark:bg-primary-900/20">
                            <span className="text-xs font-display font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">⭐ Top Models</span>
                          </div>
                          {getTopModels().map((model) => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model);
                                setShowModelDropdown(false);
                                setShowAllModelsDropdown(false);
                              }}
                              className={`w-full p-2.5 text-left hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 rounded-lg border ${selectedModel?.id === model.id ? "bg-gradient-primary/10 border-primary-300 dark:border-primary-600" : "border-primary-100/50 dark:border-primary-800/50 bg-white/50 dark:bg-dark-card/50"
                                } mb-2 last:mb-0`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <div className="font-display font-semibold text-sm text-secondary-900 dark:text-white truncate">
                                      {formatModelDisplay(model)}
                                    </div>
                                    {selectedModel?.id === model.id && (
                                      <div className="w-2 h-2 rounded-full bg-gradient-primary flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs text-secondary-500 dark:text-secondary-400 font-medium truncate">
                                      {getModelSubtitle(model)}
                                    </div>
                                    {model.pricing && (
                                      <div className="text-xs text-success-600 dark:text-success-400 font-semibold whitespace-nowrap">
                                        ${model.pricing.input.toFixed(2)}/1M
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}

                          {/* More Models Section */}
                          {getOtherModels().length > 0 && (
                            <div className="mt-2 pt-2 border-t border-primary-200/30 dark:border-primary-500/20">
                              <div className="relative">
                                <button
                                  onClick={() => setShowAllModelsDropdown(!showAllModelsDropdown)}
                                  className="w-full p-2.5 text-left hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 rounded-lg flex items-center justify-between bg-white/30 dark:bg-dark-card/30"
                                >
                                  <span className="font-display font-semibold text-sm text-secondary-900 dark:text-white">
                                    More Models ({getOtherModels().length})
                                  </span>
                                  <ChevronDownIcon
                                    className={`w-4 h-4 text-secondary-600 dark:text-secondary-400 transition-transform duration-300 shrink-0 ${showAllModelsDropdown ? 'rotate-180' : ''
                                      }`}
                                  />
                                </button>

                                {/* Nested Dropdown for Other Models - Desktop */}
                                {showAllModelsDropdown && (
                                  <div className="mt-1 space-y-1 max-h-[400px] overflow-y-auto">
                                    {getOtherModels().map((model) => (
                                      <button
                                        key={model.id}
                                        onClick={() => {
                                          setSelectedModel(model);
                                          setShowModelDropdown(false);
                                          setShowAllModelsDropdown(false);
                                        }}
                                        className={`w-full p-2 text-left hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 rounded-lg border ${selectedModel?.id === model.id ? "bg-gradient-primary/10 border-primary-300 dark:border-primary-600" : "border-primary-100/50 dark:border-primary-800/50 bg-white/50 dark:bg-dark-card/50"
                                          }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <div className="font-display font-medium text-xs text-secondary-900 dark:text-white truncate">
                                                {formatModelDisplay(model)}
                                              </div>
                                              {selectedModel?.id === model.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-primary flex-shrink-0" />
                                              )}
                                            </div>
                                            {model.pricing && (
                                              <div className="text-[10px] text-success-600 dark:text-success-400 font-semibold mt-0.5">
                                                ${model.pricing.input.toFixed(2)}/1M
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={!currentMessage.trim() || isLoading}
                  className={`relative flex items-center justify-center transition-all duration-300 shrink-0 ${!currentMessage.trim() || isLoading
                    ? 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-secondary-200/50 dark:bg-secondary-700/50 text-secondary-400 dark:text-secondary-500 cursor-not-allowed rounded-full'
                    : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-gradient-primary hover:bg-gradient-primary/90 text-white rounded-full hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl glow-primary'
                    }`}
                  title={!currentMessage.trim() ? "Enter a message to send" : "Send message"}
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${!currentMessage.trim()
                        ? 'opacity-50'
                        : ''
                        }`}
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              </div>
              {/* Helper text */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-2 px-1">
                <div className="text-xs text-secondary-400 dark:text-secondary-500 font-medium">
                  {currentMessage.length > 0 && (
                    <span className="text-primary-500 dark:text-primary-400">
                      {currentMessage.length} character{currentMessage.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="text-xs text-secondary-400 dark:text-secondary-500 font-medium flex flex-wrap items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 font-mono text-xs">
                    Enter
                  </kbd>
                  <span className="hidden sm:inline">to send</span>
                  <span className="sm:hidden">send</span>
                  <span className="hidden lg:inline">
                    <kbd className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 font-mono text-xs ml-2">
                      Shift
                    </kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 font-mono text-xs">
                      Enter
                    </kbd>
                    <span>for new line</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Modal */}
      <SourcesModal />

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          documentId={previewDocument.documentId}
          fileName={previewDocument.fileName}
          onClose={() => setPreviewDocument(null)}
        />
      )}

      {/* Template Components */}
      <TemplatePicker
        isOpen={isTemplatePickerOpen}
        onClose={closeTemplatePicker}
        onSelectTemplate={handleTemplateSelect}
      />

      {selectedTemplate && showVariableInput && (
        <TemplateVariableInput
          template={selectedTemplate}
          onSubmit={handleTemplateSubmit}
          onCancel={() => {
            setShowVariableInput(false);
            clearTemplate();
          }}
          conversationHistory={messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))}
        />
      )}

      {/* GitHub Integration Modals */}
      {showGitHubConnector && (
        <GitHubConnector
          onSelectRepository={gitHubConnectorMode === 'integration' ? handleSelectRepository : handleSelectRepoForChat}
          onClose={async () => {
            setShowGitHubConnector(false);
            // Reload both connections and integrations
            await loadGitHubConnection();
          }}
        />
      )}

      {showFeatureSelector && selectedRepo && (
        <FeatureSelector
          onConfirm={handleStartIntegration}
          onClose={() => {
            setShowFeatureSelector(false);
            setSelectedRepo(null);
          }}
          repositoryName={selectedRepo.repo.name}
          detectedLanguage={selectedRepo.repo.language}
        />
      )}

      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full">
            <PRStatusPanel
              integrationId={selectedIntegration}
              onClose={() => setSelectedIntegration(null)}
            />
            <button
              onClick={() => setSelectedIntegration(null)}
              className="mt-4 w-full py-2 bg-white dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus-ring"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass max-w-md w-full rounded-2xl shadow-2xl animate-scale-in border border-danger-200/30 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-danger-200/30">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center shadow-lg">
                <TrashIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  Delete Conversation
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-light-text-primary dark:text-dark-text-primary font-body leading-relaxed">
                Are you sure you want to delete this conversation? All messages and history will be permanently removed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-200/30">
              <button
                onClick={cancelDeleteConversation}
                className="px-5 py-2.5 rounded-xl border border-primary-200/30 bg-white/50 dark:bg-dark-card/50 text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 dark:hover:bg-primary-500/20 transition-all duration-300 font-display font-semibold text-sm hover:scale-105 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700 transition-all duration-300 font-display font-semibold text-sm hover:scale-105 hover:shadow-lg shadow-danger-500/30"
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Google Service Panel */}
      <GoogleServicePanel
        isOpen={showGooglePanel}
        onClose={() => setShowGooglePanel(false)}
        defaultTab={googlePanelTab}
      />

      {/* Google Picker Modal */}
      <GooglePickerModal
        isOpen={showGooglePicker}
        onClose={() => setShowGooglePicker(false)}
        fileType={pickerFileType}
        connectionId={googleConnection?.connection?._id || ''}
        onFilesSelected={(files) => {
          const fileNames = files.map(f => f.fileName).join(', ');
          const message: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            content: `✅ **File${files.length > 1 ? 's' : ''} Selected Successfully!**\n\n${fileNames}\n\nYou can now use commands to work with ${files.length > 1 ? 'these files' : 'this file'} directly! Try:\n\n• \`@${pickerFileType} list\` - See all accessible files\n• Access specific files by name in your commands`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, message]);
        }}
        multiSelect={true}
      />
    </div>
  );
};
