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
  ChevronRightIcon,
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
  GlobeAltIcon,
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
  DocumentIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatService } from "@/services/chat.service";
import { FeedbackButton } from "../feedback/FeedbackButton";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { feedbackService } from "../../services/feedback.service";
import { marked } from "marked";
import { apiClient, chatApiClient } from "@/config/api";
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
import { CategorizedConversations } from "./CategorizedConversations";
import githubService, { GitHubRepository } from "../../services/github.service";
import {
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  AlertTriangle,
  Send,
  Settings,
  Brain,
  MessageSquare,
  FileText,
  Zap,
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
import { VercelServicePanel } from "./VercelServicePanel";
import { AWSServicePanel } from "../integrations/AWSServicePanel";
import { MongoDBIntegrationPanel } from "./MongoDBIntegrationPanel";
import { googleService, GoogleConnection } from "../../services/google.service";
import vercelService from "../../services/vercel.service";
import { awsService, AWSConnection } from "../../services/aws.service";
import { mongodbService, MongoDBConnection } from "../../services/mongodb.service";
import { UniversalGovernedAgent } from "./UniversalGovernedAgent";
import VercelConnector from "../integrations/VercelConnector";
import { AWSConnector } from "../integrations/AWSConnector";
import AttachFilesModal from "./AttachFilesModal";
import { MessageAttachment } from "../../types/attachment.types";
import { FileIngestionLoader } from "./FileIngestionLoader";
import { IntegrationSelector, IntegrationSelectionData } from "./IntegrationSelector";
import GoogleFileAttachmentService from "../../services/googleFileAttachment.service";
import { FileLibraryPanel } from "./FileLibraryPanel";
import { MongoDBResultViewer } from "./MongoDBResultViewer";
import GovernedPlanCard from "./GovernedPlanCard";
import { useChatContext } from "../../hooks/useChatContext";
import { SourcesModal, PlanModificationDialog, ChangeRequestDialog } from "./modals";

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
  messageType?: 'user' | 'assistant' | 'system' | 'governed_plan';
  governedTaskId?: string;
  planState?: 'SCOPE' | 'CLARIFY' | 'PLAN' | 'BUILD' | 'VERIFY' | 'DONE';
  attachedDocuments?: Array<{
    documentId: string;
    fileName: string;
    chunksCount: number;
    fileType?: string;
  }>;
  attachments?: MessageAttachment[];
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
    webSearchUsed?: boolean; // Web search was used for this response
    quotaUsed?: number; // Quota used after this search
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
  // Integration agent selection (for interactive parameter collection)
  requiresSelection?: boolean;
  selection?: {
    parameterName: string;
    question: string;
    options: Array<{
      id: string;
      label: string;
      value: string;
      description?: string;
      icon?: string;
    }>;
    allowCustom: boolean;
    customPlaceholder?: string;
    integration: string;
    pendingAction: string;
    collectedParams: Record<string, unknown>;
    originalMessage?: string;
  };
  // MongoDB result data
  mongodbResult?: {
    type: 'table' | 'json' | 'schema' | 'stats' | 'chart' | 'error' | 'empty' | 'text' | 'explain';
    data: any;
    action?: string;
    connectionId?: string;
    database?: string;
    connectionAlias?: string;
  };
  mongodbSelectedViewType?: 'table' | 'json' | 'schema' | 'stats' | 'chart' | 'text' | 'error' | 'empty' | 'explain';
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
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showConversationFilesModal, setShowConversationFilesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);

  // Chat context for governed tasks
  const {
    connectToChat,
    disconnectFromChat
  } = useChatContext();
  const [selectedModel, setSelectedModel] = useState<AvailableModel | null>(
    null,
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsOffset, setConversationsOffset] = useState(0);
  const [conversationsHasMore, setConversationsHasMore] = useState(false);
  const [conversationsLoadingMore, setConversationsLoadingMore] = useState(false);
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

  // Plan modification states
  const [showPlanModifyDialog, setShowPlanModifyDialog] = useState(false);
  const [currentPlanTaskId, setCurrentPlanTaskId] = useState<string | null>(null);
  const [planModificationText, setPlanModificationText] = useState("");
  const [isPlanModifying, setIsPlanModifying] = useState(false);

  // Code change request states
  const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false);
  const [changeRequestText, setChangeRequestText] = useState("");
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  // File Library state
  const [fileLibraryExpanded, setFileLibraryExpanded] = useState(false);
  const [fileLibraryFilterMode, setFileLibraryFilterMode] = useState<'all' | 'current'>('all');

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

  // Web search state
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [showAppsSubmenu, setShowAppsSubmenu] = useState<boolean>(false);

  // Plan Mode (Governed Agent) state
  const [planModeEnabled, setPlanModeEnabled] = useState<boolean>(false);

  // Document upload for RAG
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentMetadata[]>([]);
  const [showGitHubConnector, setShowGitHubConnector] = useState(false);
  const [gitHubConnectorMode, setGitHubConnectorMode] = useState<'integration' | 'chat'>('chat');
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<{ repo: GitHubRepository; connectionId: string } | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [githubConnection, setGithubConnection] = useState<{ avatarUrl?: string; username?: string; hasConnection: boolean }>({ hasConnection: false });

  // Integration selection ref for multi-turn parameter collection
  const pendingSelectionRef = useRef<{
    parameterName: string;
    value: string | number | boolean;
    pendingAction: string;
    collectedParams: Record<string, unknown>;
    integration?: string;
  } | null>(null);

  // Handler for integration selection
  const handleIntegrationSelection = useCallback((selection: ChatMessage['selection'], value: string) => {
    if (!selection || !selectedModel) return;

    // Store the selection response for the next message, including the integration
    pendingSelectionRef.current = {
      parameterName: selection.parameterName,
      value,
      pendingAction: selection.pendingAction,
      collectedParams: selection.collectedParams,
      integration: selection.integration,
    };

    // Send a message with the selection to continue the flow
    const userMessage = `Selected: ${value}`;
    setCurrentMessage(userMessage);

    // Trigger send message
    setTimeout(() => {
      const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
      if (sendButton) {
        sendButton.click();
      }
    }, 100);
  }, [selectedModel]);

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
  const [googlePanelTab, setGooglePanelTab] = useState<'quick' | 'drive' | 'sheets' | 'docs'>('quick');
  const [showVercelPanel, setShowVercelPanel] = useState(false);
  const [showMongoDBPanel, setShowMongoDBPanel] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Governed Agent state
  const [showGovernedAgent, setShowGovernedAgent] = useState(false);
  const [governedTaskId, setGovernedTaskId] = useState<string | null>(null);
  const [governedClassification, setGovernedClassification] = useState<any>(null);
  const [showGovernedPrompt, setShowGovernedPrompt] = useState(false);
  const [pendingGovernedMessage, setPendingGovernedMessage] = useState<string | null>(null);
  const [governedTaskProgress, setGovernedTaskProgress] = useState<{
    mode: string;
    status: string;
    scopeAnalysis?: any;
    plan?: any;
  } | null>(null);

  // Confirmation dialog state for app disconnections
  const [appDisconnectDialog, setAppDisconnectDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });
  const [googleConnection, setGoogleConnection] = useState<{ hasConnection: boolean; connection?: GoogleConnection }>({ hasConnection: false });
  const [vercelConnection, setVercelConnection] = useState<{ hasConnection: boolean; username?: string; avatarUrl?: string }>({ hasConnection: false });
  const [showVercelConnector, setShowVercelConnector] = useState(false);
  const [awsConnection, setAwsConnection] = useState<{ hasConnection: boolean; connection?: AWSConnection }>({ hasConnection: false });
  const [showAWSConnector, setShowAWSConnector] = useState(false);
  const [showAWSPanel, setShowAWSPanel] = useState(false);
  const [mongodbConnection, setMongodbConnection] = useState<{ hasConnection: boolean; connection?: MongoDBConnection }>({ hasConnection: false });

  // Conversation deletion state
  const [deleteConfirmConversationId, setDeleteConfirmConversationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Link attachment state
  const [attachedLinks, setAttachedLinks] = useState<Array<{ url: string; title?: string }>>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // File ingestion state
  const [ingestingFiles, setIngestingFiles] = useState<Array<{ uploadId: string; fileName: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocumentsRef = useRef<Record<string, { documentId: string; fileName: string; fileType: string; s3Key: string }>>({});

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
    loadVercelConnection();
    loadGoogleConnection();
    loadAWSConnection();
    loadMongoDBConnection();

    // Restore last conversation from localStorage
    const savedConversationId = localStorage.getItem('currentConversationId');
    if (savedConversationId) {
      loadConversationHistory(savedConversationId);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromChat();
    };
  }, [disconnectFromChat]);

  // Handle pre-attached files from navigation state
  useEffect(() => {
    if (location.state?.attachedFiles) {
      const files = location.state.attachedFiles as MessageAttachment[];
      setAttachments(files);
      // Clear the state to prevent re-attaching on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Handle pre-attached Google files from URL parameters
  useEffect(() => {
    const googleFileAttachment = GoogleFileAttachmentService.parseFromURLParams();
    if (googleFileAttachment) {
      setAttachments(prev => {
        // Check if file is already attached to prevent duplicates
        const exists = prev.some(att =>
          att.type === 'google' && att.googleFileId === googleFileAttachment.googleFileId
        );
        if (!exists) {
          return [...prev, googleFileAttachment];
        }
        return prev;
      });

      // Clean URL parameters after processing
      GoogleFileAttachmentService.cleanURLParams();

      // Set a default message to encourage interaction
      setCurrentMessage(`Please analyze and help me with the attached ${googleFileAttachment.fileType}: "${googleFileAttachment.fileName}"`);
    }
  }, [location.search]);

  // Handle MongoDB commands from sessionStorage (when navigating from IntegrationsPage)
  useEffect(() => {
    const mongodbCommand = sessionStorage.getItem('mongodb_command');
    if (mongodbCommand) {
      setCurrentMessage(mongodbCommand);
      // Clear it so it doesn't persist
      sessionStorage.removeItem('mongodb_command');
    }
  }, [location.pathname]); // Re-run when pathname changes

  // Handle conversation ID from URL path (e.g., /chat/conversationId or /dashboard/conversationId)
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    let conversationIdFromUrl: string | null = null;

    // Check for /chat/:conversationId
    const chatIndex = pathParts.indexOf('chat');
    if (chatIndex !== -1 && pathParts[chatIndex + 1]) {
      conversationIdFromUrl = pathParts[chatIndex + 1];
    }

    // Check for /dashboard/:conversationId
    const dashboardIndex = pathParts.indexOf('dashboard');
    if (dashboardIndex !== -1 && pathParts[dashboardIndex + 1]) {
      conversationIdFromUrl = pathParts[dashboardIndex + 1];
    }

    if (conversationIdFromUrl && conversationIdFromUrl !== currentConversationId) {
      loadConversationHistory(conversationIdFromUrl);
    }
  }, [location.pathname]);

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

  const loadVercelConnection = async () => {
    try {
      const connections = await vercelService.listConnections();
      if (connections.length > 0 && connections[0].isActive) {
        setVercelConnection({
          hasConnection: true,
          username: connections[0].vercelUsername,
          avatarUrl: connections[0].avatarUrl
        });
      } else {
        setVercelConnection({ hasConnection: false });
      }
    } catch (error) {
      console.error('Failed to load Vercel connections:', error);
      setVercelConnection({ hasConnection: false });
    }
  };

  const loadAWSConnection = async () => {
    try {
      const result = await awsService.listConnections();
      const activeConnection = result.connections?.find(c => c.status === 'active');
      if (activeConnection) {
        setAwsConnection({
          hasConnection: true,
          connection: activeConnection
        });
      } else {
        setAwsConnection({ hasConnection: false });
      }
    } catch (error) {
      console.error('Failed to load AWS connections:', error);
      setAwsConnection({ hasConnection: false });
    }
  };

  const loadMongoDBConnection = async () => {
    try {
      const connections = await mongodbService.listConnections();
      const activeConnection = connections.find(c => c.isActive);
      setMongodbConnection({
        hasConnection: !!activeConnection,
        connection: activeConnection
      });
    } catch (error) {
      console.error('Failed to load MongoDB connection:', error);
      setMongodbConnection({ hasConnection: false });
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

  // Get all attachments from the conversation
  const getAllConversationAttachments = (): MessageAttachment[] => {
    const allAttachments: MessageAttachment[] = [];
    messages.forEach((message) => {
      if (message.attachments && message.attachments.length > 0) {
        allAttachments.push(...message.attachments);
      }
    });
    return allAttachments;
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

  const loadConversations = async (append: boolean = false) => {
    try {
      if (!append) {
        setConversationsLoading(true);
        setConversationsOffset(0);
      } else {
        setConversationsLoadingMore(true);
      }

      const limit = 20;
      const offset = append ? conversationsOffset : 0;
      const result = await ChatService.getUserConversations(limit, offset);

      if (append) {
        setConversations(prev => [...prev, ...result.conversations]);
        setConversationsOffset(offset + result.conversations.length);
      } else {
        setConversations(result.conversations);
        setConversationsOffset(result.conversations.length);
      }

      // Check if there are more conversations to load
      setConversationsHasMore(result.conversations.length === limit && result.total > offset + result.conversations.length);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setConversationsLoading(false);
      setConversationsLoadingMore(false);
    }
  };

  const loadMoreConversations = () => {
    loadConversations(true);
  };

  // Local conversation update function for immediate UI feedback
  const updateConversationLocally = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, ...updates }
          : conv
      )
    );
  }, []);

  // Handle conversation deletion
  const handleDeleteRequest = useCallback((conversationId: string) => {
    setDeleteConfirmConversationId(conversationId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmConversationId || isDeleting) return;
    const conversationId = deleteConfirmConversationId;
    try {
      setIsDeleting(true);
      await ChatService.deleteConversation(conversationId);
      setDeleteConfirmConversationId(null);
      loadConversations(); // Reload conversations after deletion
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmConversationId]);

  const loadConversationHistory = async (conversationId: string) => {
    try {
      const result = await ChatService.getConversationHistory(conversationId);
      setMessages(result.messages);
      setCurrentConversationId(conversationId);

      // Save to localStorage
      localStorage.setItem('currentConversationId', conversationId);

      // Connect to chat context for governed tasks
      connectToChat(conversationId);

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
    setSelectedDocuments([]);
    setAttachments([]);
    setAttachedLinks([]);
    setSelectedRepo(null);
    localStorage.removeItem('currentConversationId');
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

  // Governed Agent Handlers
  const handleUseGovernedAgent = async () => {
    if (!pendingGovernedMessage) return;

    try {
      setShowGovernedPrompt(false);
      setIsLoading(true);
      setGovernedTaskProgress({ mode: 'INITIALIZING', status: 'pending' });

      const response = await ChatService.initiateGovernedTask(
        pendingGovernedMessage,
        currentConversationId || undefined
      );

      setGovernedTaskId(response.taskId);
      setShowGovernedAgent(true);
      setPendingGovernedMessage(null);
      setCurrentMessage("");

      // If a new conversation was created, update the current conversation ID
      if (response.conversationId && response.conversationId !== currentConversationId) {
        setCurrentConversationId(response.conversationId);
        // Also update the URL to reflect the new conversation
        navigate(`/dashboard/${response.conversationId}`, { replace: true });
        // Refresh conversations list to show the newly created conversation
        loadConversations();
      }

      // Add the GovernedPlanCard message to the chat immediately
      const governedPlanMessage: ChatMessage = {
        id: `governed-plan-${response.taskId}`,
        role: 'assistant',
        content: `🤖 **Autonomous Agent Initiated**\n\nI'm creating a plan to: ${pendingGovernedMessage}\n\nExpand the card below to see the full plan and execution details.`,
        timestamp: new Date(),
        messageType: 'governed_plan',
        governedTaskId: response.taskId,
        planState: response.mode as any
      };
      setMessages(prev => [...prev, governedPlanMessage]);

      // Start streaming progress updates
      const cleanup = ChatService.streamGovernedTaskProgress(
        response.taskId,
        (data) => {
          // Update progress state with real-time updates
          setGovernedTaskProgress({
            mode: data.mode || 'UNKNOWN',
            status: data.status || 'pending',
            scopeAnalysis: data.scopeAnalysis,
            plan: data.plan
          });

          // Add AI messages to chat for each phase
          if (data.mode === 'SCOPE' && data.scopeAnalysis) {
            const scopeMessage: ChatMessage = {
              id: `scope-${Date.now()}`,
              role: 'assistant',
              content: `🔍 **Scope Analysis Complete**\n\n✅ Compatible: ${data.scopeAnalysis.compatible ? 'Yes' : 'No'}\n📊 Complexity: ${data.scopeAnalysis.estimatedComplexity}\n🔌 Required Integrations: ${data.scopeAnalysis.requiredIntegrations?.join(', ') || 'None'}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, scopeMessage]);
          }

          if (data.mode === 'PLAN' && data.plan) {
            const planMessage: ChatMessage = {
              id: `plan-${Date.now()}`,
              role: 'assistant',
              content: `📋 **Execution Plan Generated**\n\n🎯 Phases: ${data.plan.phases?.length || 0}\n⏱️ Estimated Duration: ${data.plan.estimatedDuration}s\n⚠️ Risk Level: ${data.plan.riskAssessment?.level || 'unknown'}\n\n${data.plan.phases?.map((phase: any, idx: number) =>
                `**Phase ${idx + 1}:** ${phase.name} (${phase.steps?.length || 0} steps)`
              ).join('\n')}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, planMessage]);
          }

          if (data.mode === 'BUILD') {
            const buildMessage: ChatMessage = {
              id: `build-${Date.now()}`,
              role: 'assistant',
              content: `🔨 **Build Mode Active**\n\nExecuting the plan...`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, buildMessage]);
          }

          if (data.mode === 'VERIFY') {
            const verifyMessage: ChatMessage = {
              id: `verify-${Date.now()}`,
              role: 'assistant',
              content: `✅ **Verification Mode**\n\nVerifying execution results...`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, verifyMessage]);
          }
        },
        () => {
          // On complete
          setIsLoading(false);
          const completeMessage: ChatMessage = {
            id: `complete-${Date.now()}`,
            role: 'assistant',
            content: `✨ **Task Complete!**\n\nThe governed agent has successfully completed your request.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completeMessage]);
        },
        (error) => {
          // On error
          setIsLoading(false);
          setError(error);
        }
      );

      // Cleanup on unmount
      return () => cleanup();

    } catch (error: any) {
      console.error("Failed to initiate governed task:", error);
      setError(error.message || "Failed to start governed agent");
      setIsLoading(false);
    }
  };

  const handleUseNormalChat = () => {
    setShowGovernedPrompt(false);
    setPendingGovernedMessage(null);
    // Allow user to edit and resend
  };

  const closeGovernedAgent = () => {
    setShowGovernedAgent(false);
    setGovernedTaskId(null);
    setGovernedClassification(null);
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


  const sendMessage = async (content?: string) => {
    const messageContent = content || currentMessage.trim();
    if ((!messageContent && attachments.length === 0) || isLoading) return;

    if (!selectedModel) {
      setError("Please select a model first");
      return;
    }

    // GOVERNED AGENT: Check if plan mode is enabled
    if (planModeEnabled) {
      try {
        // Show loading state while classifying
        setIsLoading(true);
        setLoadingMessageId('classifying');

        const classification = await ChatService.classifyMessage(messageContent);

        if (classification.shouldUseGovernedAgent) {
          // Show prompt to user asking if they want to use governed agent
          setPendingGovernedMessage(messageContent);
          setGovernedClassification(classification);
          setShowGovernedPrompt(true);
          setIsLoading(false);
          setLoadingMessageId(null);
          return; // Don't send yet, wait for user confirmation
        }

        setIsLoading(false);
        setLoadingMessageId(null);
      } catch (classifyError) {
        console.warn("Failed to classify message, proceeding with normal chat:", classifyError);
        setIsLoading(false);
        setLoadingMessageId(null);
        // Continue with normal chat flow if classification fails
      }
    }

    setCurrentMessage("");

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

    // If files are attached, enhance the message to instruct AI to analyze them
    if (attachments.length > 0) {
      const fileNames = attachments.map(att => att.fileName).join(', ');
      if (!finalMessageContent || finalMessageContent.trim().length === 0) {
        // If no message, create a default instruction
        finalMessageContent = `Please analyze the following file(s) and provide a comprehensive summary: ${fileNames}`;
      } else {
        // If there's a message, append instruction to analyze files
        finalMessageContent = `${finalMessageContent}\n\n[Note: I've attached ${attachments.length} file(s): ${fileNames}. Please analyze ${attachments.length === 1 ? 'this file' : 'these files'} in the context of my question above.]`;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalMessageContent, // Includes attached links, backend will enrich URLs with metadata
      timestamp: new Date(),
      attachedDocuments: selectedDocuments.length > 0 ? selectedDocuments : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setAttachedLinks([]); // Clear attached links after sending
    setAttachments([]); // Clear file attachments after sending
    setIsLoading(true);
    setLoadingMessageId(userMessage.id);
    setError(null);

    // Show helpful message for file attachments
    if (attachments.length > 0) {
      console.log(`Processing ${attachments.length} file(s)... This may take a moment.`);
    }

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
        useWebSearch: webSearchEnabled,
        documentIds: selectedDocuments.length > 0
          ? selectedDocuments.map(doc => doc.documentId)
          : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        // Include GitHub repository context if a repo is selected
        ...(selectedRepo ? {
          githubContext: {
            connectionId: selectedRepo.connectionId,
            repositoryId: selectedRepo.repo.id,
            repositoryName: selectedRepo.repo.name,
            repositoryFullName: selectedRepo.repo.fullName
          }
        } : {}),
        // Include selection response if continuing from a selection
        ...(pendingSelectionRef.current ? {
          selectionResponse: pendingSelectionRef.current
        } : {})
      });

      // Clear pending selection after sending
      pendingSelectionRef.current = null;

      // Parse sources from the response text
      const sources = parseSourcesFromResponse(response.response);

      // Check if the response contains IntegrationSelector data (from backend)
      const requiresIntegrationSelector = response.requiresIntegrationSelector || response.metadata?.requiresIntegrationSelector;
      const integrationSelectorData = response.integrationSelectorData || response.metadata?.integrationSelectorData;

      // DEBUG: Log what we're receiving
      console.log('🔍 DEBUG: Response received from backend:', {
        hasRequiresIntegrationSelector: !!response.requiresIntegrationSelector,
        hasIntegrationSelectorData: !!response.integrationSelectorData,
        hasFormattedResult: !!response.formattedResult,
        hasMongodbIntegrationData: !!response.mongodbIntegrationData,
        formattedResult: response.formattedResult,
        mongodbIntegrationData: response.mongodbIntegrationData,
        requiresIntegrationSelector,
        integrationSelectorDataKeys: integrationSelectorData ? Object.keys(integrationSelectorData) : null,
        responseKeys: Object.keys(response),
        metadataKeys: response.metadata ? Object.keys(response.metadata) : null,
        fullResponse: response
      });

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
          webSearchUsed: response.webSearchUsed || false,
          quotaUsed: response.quotaUsed,
          ...(response.metadata || {}), // Include Google service metadata
        },
        // Multi-agent enhancements
        optimizationsApplied: response.optimizationsApplied || [],
        cacheHit: response.cacheHit || false,
        agentPath: response.agentPath || [],
        riskLevel: response.riskLevel || 'low',
        sources: sources,
        viewLinks: response.viewLinks, // Add Google service view links
        // Integration selection data (map from backend naming to frontend naming)
        requiresSelection: requiresIntegrationSelector || response.requiresSelection,
        selection: integrationSelectorData || response.selection,
        // MongoDB result data
        mongodbResult: response.formattedResult ? {
          type: response.formattedResult.type || 'json',
          data: response.formattedResult.data,
          action: response.mongodbIntegrationData?.action,
          connectionId: response.mongodbIntegrationData?.connectionId,
          database: response.mongodbIntegrationData?.database,
          connectionAlias: response.mongodbIntegrationData?.connectionAlias
        } : undefined,
        mongodbSelectedViewType: response.mongodbSelectedViewType, // Add this line
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
        // Set current conversation if not already set
        if (!currentConversationId) {
          setCurrentConversationId(response.conversationId);
          localStorage.setItem('currentConversationId', response.conversationId);
        }

        // Update conversations list
        setConversations(prevConversations => {
          const existingConv = prevConversations.find(c => c.id === response.conversationId);

          if (existingConv) {
            // Update existing conversation and move to top
            const updatedConv = {
              ...existingConv,
              messageCount: existingConv.messageCount + 2, // user message + assistant message
              updatedAt: new Date(),
              totalCost: (existingConv.totalCost || 0) + (response.cost || 0),
            };
            const otherConvs = prevConversations.filter(c => c.id !== response.conversationId);
            return [updatedConv, ...otherConvs];
          } else {
            // Add new conversation to the top
            const newConversation: Conversation = {
              id: response.conversationId,
              title: response.messageType === 'governed_plan'
                ? `🤖 ${messageContent.slice(0, 40)}...`
                : messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
              modelId: selectedModel.id,
              messageCount: 2, // user message + assistant message
              updatedAt: new Date(),
              totalCost: response.cost || 0,
              // Add governed task indicator if it's a governed plan
              ...(response.governedTaskId && {
                governedTaskId: response.governedTaskId,
                isGovernedPlan: true
              })
            };
            return [newConversation, ...prevConversations];
          }
        });
      }

      // Handle governed plan response
      if (response.messageType === 'governed_plan' && response.governedTaskId) {
        console.log('🤖 Governed plan created:', {
          taskId: response.governedTaskId,
          conversationId: response.conversationId
        });

        // Update the assistant message to include governed plan metadata
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                messageType: 'governed_plan',
                governedTaskId: response.governedTaskId,
                planState: 'SCOPE'
              }
            ];
          }
          return prev;
        });

        // Connect to chat context for governed tasks
        if (response.conversationId) {
          connectToChat(response.conversationId);
        }

        // Navigate to the conversation if it's new
        if (!currentConversationId || currentConversationId !== response.conversationId) {
          setCurrentConversationId(response.conversationId);
          localStorage.setItem('currentConversationId', response.conversationId);

          // Load the conversation history to show the governed plan
          setTimeout(() => {
            loadConversationHistory(response.conversationId);
          }, 100);
        }

        // Refresh conversations to show the governed task indicator
        loadConversations();
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
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        // Handle timeout errors
        setError(
          attachments.length > 0 || attachedLinks.length > 0
            ? "Request timed out. Large files or complex requests may take longer. Please try again with smaller files or a simpler question."
            : "Request timed out. Please try again with a simpler question or check your internet connection."
        );
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        // Handle network errors
        setError("Network error. Please check your internet connection and try again.");
      } else if (error.response?.status === 413) {
        // Handle payload too large
        setError("File is too large. Please try uploading a smaller file (max 10MB).");
      } else {
        // Generic error handling
        const errorMessage = error.response?.data?.message
          || error.message
          || "Failed to send message. Please try again.";
        setError(errorMessage);
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

  // Plan modification handlers
  const handleModifyPlan = async () => {
    if (!currentPlanTaskId || !planModificationText.trim()) return;

    try {
      setIsPlanModifying(true);
      const response = await apiClient.post(`/chat/${currentConversationId}/plan/${currentPlanTaskId}/modify`, {
        modifications: planModificationText
      });

      if (response.data.success) {
        // Add the modification as a message in chat
        const modificationMessage: ChatMessage = {
          id: `mod-${Date.now()}`,
          role: 'assistant',
          content: `✏️ **Plan Modified**\n\nYour modification request has been processed. The plan has been updated based on your feedback:\n\n"${planModificationText}"`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, modificationMessage]);

        // Close dialog and reset
        setShowPlanModifyDialog(false);
        setPlanModificationText("");
        setCurrentPlanTaskId(null);
      }
    } catch (error) {
      console.error('Failed to modify plan:', error);
      setError('Failed to modify plan. Please try again.');
    } finally {
      setIsPlanModifying(false);
    }
  };

  // Code change request handlers
  const handleRequestCodeChanges = async () => {
    if (!currentPlanTaskId || !changeRequestText.trim()) return;

    try {
      setIsRequestingChanges(true);
      const response = await apiClient.post(`/chat/${currentConversationId}/plan/${currentPlanTaskId}/redeploy`, {
        changeRequest: changeRequestText
      });

      if (response.data.success) {
        // Add the change request as a message in chat
        const changeMessage: ChatMessage = {
          id: `change-${Date.now()}`,
          role: 'assistant',
          content: `🔄 **Code Change Request**\n\nProcessing your change request:\n\n"${changeRequestText}"\n\nThe code will be updated and redeployed based on your requirements.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, changeMessage]);

        // Close dialog and reset
        setShowChangeRequestDialog(false);
        setChangeRequestText("");
        setCurrentPlanTaskId(null);
      }
    } catch (error) {
      console.error('Failed to request code changes:', error);
      setError('Failed to request code changes. Please try again.');
    } finally {
      setIsRequestingChanges(false);
    }
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

  // Handler to update MongoDB result view type
  const handleMongoViewTypeChange = useCallback(async (messageId: string, viewType: ChatMessage['mongodbSelectedViewType']) => {
    if (!messageId || !viewType) return;

    try {
      await chatApiClient.put(`/chat/message/${messageId}/viewType`, { viewType });
      // Optimistically update the UI
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, mongodbSelectedViewType: viewType } : msg
        )
      );
      console.log(`Updated message ${messageId} to view type: ${viewType}`);
    } catch (error) {
      console.error(`Failed to update view type for message ${messageId}:`, error);
    }
  }, []);

  // Render the message content
  const renderMessageContent = useCallback((content: string, message?: ChatMessage) => {
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

        {/* Web Search Sources */}
        {message?.sources && message.sources.length > 0 && (
          <div className="mb-4 glass rounded-xl border border-success-200/30 dark:border-success-700/30 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="p-4 bg-gradient-to-r from-success-500/5 to-transparent">
              <div className="flex items-center gap-2 mb-3">
                <MagnifyingGlassIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  Web Sources
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 font-medium">
                  {message.sources.length}
                </span>
              </div>
              <div className="space-y-2">
                {message.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 glass rounded-lg border border-success-200/30 dark:border-success-700/30 hover:border-success-400/50 hover:bg-success-500/10 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-600 dark:text-success-400 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-sm text-light-text-primary dark:text-dark-text-primary group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors line-clamp-1">
                        {source.title}
                      </div>
                      {source.description && (
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">
                          {source.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-success-600 dark:text-success-400 font-medium">
                          {new URL(source.url).hostname.replace('www.', '')}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300">
                          {source.type || 'web'}
                        </span>
                      </div>
                    </div>
                    <LinkIcon className="w-4 h-4 text-success-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
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

        {/* MongoDB Result Viewer */}
        {message?.mongodbResult && (
          <div className="mb-4 glass rounded-xl border border-primary-200/30 backdrop-blur-xl overflow-hidden shadow-lg">
            <div className="p-4 bg-gradient-to-r from-primary-500/5 to-transparent">
              {/* Display IntegrationSelector choices if available */}
              {message.selection?.integration === 'mongodb' && message.selection.collectedParams && (
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <span className="font-semibold">Integration:</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                    {String(message.selection.integration)}
                  </span>
                  {typeof message.selection.collectedParams.action !== "undefined" && message.selection.collectedParams.action !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                      Action: {String(message.selection.collectedParams.action)}
                    </span>
                  )}
                  {typeof message.selection.collectedParams.collectionName !== "undefined" && message.selection.collectedParams.collectionName !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium">
                      Collection: {String(message.selection.collectedParams.collectionName)}
                    </span>
                  )}
                  {typeof message.selection.collectedParams.query !== "undefined" && message.selection.collectedParams.query !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium">
                      Query: {JSON.stringify(message.selection.collectedParams.query).substring(0, 50)}...
                    </span>
                  )}
                  {typeof message.selection.collectedParams.pipeline !== "undefined" && message.selection.collectedParams.pipeline !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium">
                      Pipeline: {JSON.stringify(message.selection.collectedParams.pipeline).substring(0, 50)}...
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <CircleStackIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                  MongoDB Query Results
                </span>
                {message.mongodbResult?.connectionAlias && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                    {String(message.mongodbResult.connectionAlias)}
                  </span>
                )}
              </div>
              <MongoDBResultViewer
                messageId={message.id}
                data={message.mongodbResult.data}
                initialViewType={message.mongodbSelectedViewType || (message.mongodbResult.type || 'json')}
                onViewTypeChange={(newType) => handleMongoViewTypeChange(message.id, newType)}
              />
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
  }, [expandedThinking, showPreviews, copiedCode, handleMongoViewTypeChange, convertUrlsToMarkdown, togglePreview, copyToClipboard, linkifyText]);

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
            <div className="flex-1 overflow-y-auto p-1.5 flex flex-col min-h-0">
              <div className="flex-1">
                {conversationsLoading ? (
                  <ConversationsShimmer count={5} collapsed={false} />
                ) : (
                  <CategorizedConversations
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={(id) => {
                      loadConversationHistory(id);
                      setShowConversations(false);
                    }}
                    onConversationsUpdate={loadConversations}
                    onConversationUpdate={updateConversationLocally}
                    onDeleteRequest={handleDeleteRequest}
                    collapsed={false}
                    hasMore={conversationsHasMore}
                    isLoadingMore={conversationsLoadingMore}
                    onLoadMore={loadMoreConversations}
                  />
                )}
              </div>

              {/* File Library Panel - Mobile */}
              <FileLibraryPanel
                isExpanded={fileLibraryExpanded}
                onToggleExpanded={() => setFileLibraryExpanded(!fileLibraryExpanded)}
                currentConversationId={currentConversationId || undefined}
                filterMode={fileLibraryFilterMode}
                onFilterModeChange={setFileLibraryFilterMode}
              />
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
            <div className="flex-1 flex flex-col min-h-0">
              <CategorizedConversations
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={loadConversationHistory}
                onConversationsUpdate={loadConversations}
                onConversationUpdate={updateConversationLocally}
                onDeleteRequest={handleDeleteRequest}
                collapsed={false}
                hasMore={conversationsHasMore}
                isLoadingMore={conversationsLoadingMore}
                onLoadMore={loadMoreConversations}
              />

              {/* File Library Panel */}
              <FileLibraryPanel
                isExpanded={fileLibraryExpanded}
                onToggleExpanded={() => setFileLibraryExpanded(!fileLibraryExpanded)}
                currentConversationId={currentConversationId || undefined}
                filterMode={fileLibraryFilterMode}
                onFilterModeChange={setFileLibraryFilterMode}
              />
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
                {/* Render GovernedPlanCard for governed_plan messages */}
                {message.messageType === 'governed_plan' && message.governedTaskId ? (
                  <div className="my-4">
                    <GovernedPlanCard
                      taskId={message.governedTaskId}
                      chatId={currentConversationId || ''}
                      onInteract={(action, data) => {
                        // Handle plan interactions
                        if (action === 'question_answered') {
                          // Show answer in chat
                          const answerMessage: ChatMessage = {
                            id: `answer-${Date.now()}`,
                            role: 'assistant',
                            content: `**Question:** ${data.question}\n\n**Answer:** ${data.answer}`,
                            timestamp: new Date()
                          };
                          setMessages(prev => [...prev, answerMessage]);
                        } else if (action === 'modify_plan') {
                          // Open modification dialog
                          setCurrentPlanTaskId(data.taskId);
                          setShowPlanModifyDialog(true);
                        } else if (action === 'request_changes') {
                          // Open change request dialog
                          setCurrentPlanTaskId(data.taskId);
                          setShowChangeRequestDialog(true);
                        }
                      }}
                    />
                  </div>
                ) : (
                  // Regular message rendering
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-4xl ${message.role === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl glow-primary'
                      : 'glass shadow-2xl backdrop-blur-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50'
                      } p-5 rounded-2xl ${message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'} transition-all hover:shadow-2xl`}>
                      {renderMessageContent(message.content, message)}

                      {/* Integration Selection UI */}
                      {message.role === 'assistant' && (
                        <>
                          {message.requiresSelection && message.selection && (
                            <div className="mt-4 pt-4 border-t border-gray-700/30">
                              <IntegrationSelector
                                selection={message.selection as IntegrationSelectionData}
                                onSelect={(value) => handleIntegrationSelection(message.selection, value)}
                                disabled={isLoading}
                              />
                            </div>
                          )}
                        </>
                      )}

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

                      {/* File Attachments Display */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className={`mt-4 flex flex-wrap gap-2 ${message.role === 'user' ? 'opacity-90' : ''}`}>
                          {message.attachments.map((attachment, idx) => {
                            // Get Google file metadata for enhanced display
                            const googleMetadata = attachment.type === 'google'
                              ? GoogleFileAttachmentService.getFileMetadata(attachment)
                              : null;

                            return (
                              <div
                                key={`${attachment.fileId}-${idx}`}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm glass backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${message.role === 'user'
                                  ? 'border-white/30 bg-white/20 hover:bg-white/30 hover:shadow-white/20'
                                  : 'border-primary-200/30 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 hover:border-primary-300/50 hover:shadow-primary/20'
                                  }`}
                              >
                                <div className={`p-1.5 rounded-lg ${message.role === 'user'
                                  ? 'bg-white/20'
                                  : attachment.type === 'google'
                                    ? 'bg-gradient-primary glow-primary'
                                    : 'bg-gradient-to-br from-primary-500/20 to-primary-600/20'
                                  }`}>
                                  {attachment.type === 'google' ? (
                                    googleMetadata?.icon ? (
                                      <img
                                        src={googleMetadata.icon}
                                        alt={googleMetadata.displayType}
                                        className="w-4 h-4 object-contain"
                                      />
                                    ) : (
                                      <DocumentTextIcon className="w-4 h-4 text-white" />
                                    )
                                  ) : (
                                    <PaperClipIcon className={`w-4 h-4 ${message.role === 'user' ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className={`font-display font-semibold max-w-[200px] truncate ${message.role === 'user' ? 'text-white' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                                    {attachment.fileName}
                                  </span>
                                  {googleMetadata && (
                                    <span className={`text-xs font-body ${message.role === 'user' ? 'text-white/70' : 'text-secondary-500 dark:text-secondary-400'}`}>
                                      {googleMetadata.formattedSize} • {googleMetadata.lastModified}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-xs font-body px-1.5 py-0.5 rounded-lg ${message.role === 'user'
                                  ? 'bg-white/20 text-white/90'
                                  : attachment.type === 'google'
                                    ? 'bg-gradient-primary text-white glow-primary'
                                    : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                  }`}>
                                  {attachment.type === 'google' ? googleMetadata?.displayType || 'Google' : 'Uploaded'}
                                </span>
                                {attachment.url && (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`ml-1 p-1.5 rounded-lg transition-all hover:scale-110 ${message.role === 'user'
                                      ? 'hover:bg-white/30 text-white/90 hover:text-white'
                                      : 'hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                                      }`}
                                    title="Open file"
                                    aria-label="Open file"
                                  >
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
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
                          {message.metadata?.webSearchUsed && (
                            <span className="glass px-2.5 py-1 rounded-lg border border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400 font-display font-semibold text-xs inline-flex items-center gap-1">
                              <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                              Web Search
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
                )}

                {/* Show shimmer right after the user message that triggered loading */}
                {shouldShowShimmer && (
                  <MessageShimmer />
                )}
              </React.Fragment>
            );
          })}

          {/* Classification Loading Indicator */}
          {isLoading && loadingMessageId === 'classifying' && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-4xl glass shadow-2xl backdrop-blur-xl border border-primary-200/30 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 p-5 rounded-2xl rounded-bl-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 dark:border-primary-700/30 border-t-primary-600 dark:border-t-primary-400"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-display font-semibold text-primary-900 dark:text-primary-100">
                      Analyzing your request...
                    </p>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      Determining if structured planning is beneficial
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Governed Agent Progress Indicator */}
          {governedTaskProgress && isLoading && (
            <div className="flex justify-start animate-fade-in mb-4">
              <div className="max-w-4xl glass shadow-2xl backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 p-5 rounded-2xl rounded-bl-sm transition-all hover:shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg glow-primary animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-bold text-secondary-900 dark:text-white mb-3">
                      🤖 Governed Agent Working
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-display font-medium text-light-text-secondary dark:text-dark-text-secondary">Mode:</span>
                        <span className={`glass px-3 py-1 rounded-lg border font-display font-semibold text-xs ${governedTaskProgress.mode === 'SCOPE' ? 'border-blue-200/30 bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400' :
                          governedTaskProgress.mode === 'PLAN' ? 'border-yellow-200/30 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-600 dark:text-yellow-400' :
                            governedTaskProgress.mode === 'BUILD' ? 'border-success-200/30 bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400' :
                              governedTaskProgress.mode === 'VERIFY' ? 'border-primary-200/30 bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-primary-600 dark:text-primary-400' :
                                'border-secondary-200/30 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 text-secondary-600 dark:text-secondary-400'
                          }`}>
                          {governedTaskProgress.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-display font-medium text-light-text-secondary dark:text-dark-text-secondary">Status:</span>
                        <span className="text-sm text-light-text-primary dark:text-dark-text-primary font-body capitalize">{governedTaskProgress.status}</span>
                      </div>
                      {governedTaskProgress.mode === 'SCOPE' && (
                        <div className="glass px-3 py-2 rounded-lg border border-blue-200/30 dark:border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm">
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            📊 Analyzing task requirements and compatibility...
                          </p>
                        </div>
                      )}
                      {governedTaskProgress.mode === 'PLAN' && (
                        <div className="glass px-3 py-2 rounded-lg border border-yellow-200/30 dark:border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm">
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            🧠 Using Claude 4 Sonnet to generate execution plan...
                          </p>
                        </div>
                      )}
                      {governedTaskProgress.mode === 'BUILD' && (
                        <div className="glass px-3 py-2 rounded-lg border border-success-200/30 dark:border-success-500/20 bg-gradient-to-br from-success-500/10 to-success-600/10 backdrop-blur-sm">
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            🔨 Executing the plan step by step...
                          </p>
                        </div>
                      )}
                      {governedTaskProgress.mode === 'VERIFY' && (
                        <div className="glass px-3 py-2 rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-sm">
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            ✅ Verifying execution and results...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

            {/* Compact Integration Mention Hint */}
            {messages.length > 0 && (
              <IntegrationMentionHint variant="compact" />
            )}

            {/* Message Input Container */}
            <div className="glass rounded-lg sm:rounded-xl md:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-1 sm:p-1.5 md:p-2 lg:p-2.5 xl:p-3.5 focus-within:border-primary-400 dark:focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-300">
              {/* Main Input Row */}
              <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
                {/* Attachments Popover Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentsPopover(!showAttachmentsPopover)}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 flex items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-800/50 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
                    title="Attach files, GitHub, or integrations"
                  >
                    <PlusIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-all duration-300 ease-in-out transform ${showAttachmentsPopover ? 'rotate-45' : 'rotate-0'}`} />
                  </button>

                  {/* Attachments Popover */}
                  {showAttachmentsPopover && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowAttachmentsPopover(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-2 w-64 glass rounded-xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel z-50 animate-scale-in overflow-visible">
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

                                    // Convert to base64 first
                                    const base64Data = await documentService['fileToBase64'](file);

                                    // Upload to get uploadId
                                    const apiClient = (await import('@/config/api')).apiClient;
                                    const uploadResponse = await apiClient.post('/ingestion/upload', {
                                      fileName: file.name,
                                      fileData: base64Data,
                                      mimeType: file.type
                                    });

                                    const uploadId = uploadResponse.data.data.uploadId;
                                    const documentId = uploadResponse.data.data.documentId;
                                    const s3Key = uploadResponse.data.data.s3Key;

                                    // Add to ingesting files to show loader
                                    setIngestingFiles(prev => [...prev, { uploadId, fileName: file.name }]);

                                    // Store document info for when ingestion completes
                                    pendingDocumentsRef.current[uploadId] = {
                                      documentId,
                                      fileName: file.name,
                                      fileType: file.name.split('.').pop() || 'unknown',
                                      s3Key
                                    };

                                    // The backend processes asynchronously, so we'll wait for completion via SSE
                                    // The FileIngestionLoader component will handle the SSE connection
                                    // We'll add the document when ingestion completes

                                    // Reset input
                                    if (hiddenFileInputRef.current) {
                                      hiddenFileInputRef.current.value = '';
                                    }
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Upload failed');
                                    // Remove from ingesting files on error
                                    setIngestingFiles(prev => prev.filter(f => f.fileName !== file.name));
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

                          {/* Web Search */}
                          <div className="mb-2">
                            <button
                              onClick={() => {
                                setShowAttachmentsPopover(false);
                                setWebSearchEnabled(!webSearchEnabled);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors ${webSearchEnabled ? 'bg-primary-500/10 dark:bg-primary-500/20' : ''}`}
                            >
                              <GlobeAltIcon className={`w-4 h-4 ${webSearchEnabled ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-400'}`} />
                              <span className="text-sm font-medium text-secondary-900 dark:text-white">Web Search</span>
                              {webSearchEnabled && (
                                <Check className="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400" />
                              )}
                            </button>
                          </div>

                          {/* Plan Mode (Governed Agent) */}
                          <div className="mb-2">
                            <button
                              onClick={() => {
                                setShowAttachmentsPopover(false);
                                setPlanModeEnabled(!planModeEnabled);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors ${planModeEnabled ? 'bg-primary-500/10 dark:bg-primary-500/20' : ''}`}
                            >
                              <svg
                                className={`w-4 h-4 ${planModeEnabled ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-400'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium text-secondary-900 dark:text-white">Plan Mode</span>
                              {planModeEnabled && (
                                <Check className="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400" />
                              )}
                            </button>
                          </div>

                          {/* Apps - Nested Menu */}
                          <div
                            className="mb-2 relative overflow-visible"
                            onMouseEnter={() => setShowAppsSubmenu(true)}
                            onMouseLeave={() => setShowAppsSubmenu(false)}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
                            >
                              <PuzzlePieceIcon className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                              <span className="text-sm font-medium text-secondary-900 dark:text-white">Apps</span>
                              <ChevronRightIcon className="w-3 h-3 ml-auto text-secondary-400 dark:text-secondary-500 transition-transform" />
                            </button>

                            {/* Nested Apps Menu */}
                            {showAppsSubmenu && (
                              <div className="absolute left-full top-0 ml-2 w-56 glass rounded-lg border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel z-[100] animate-fade-in">
                                <div className="p-2">
                                  {/* GitHub */}
                                  <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1">
                                      {githubConnection?.hasConnection && githubConnection?.avatarUrl ? (
                                        <>
                                          <img
                                            src={githubConnection.avatarUrl}
                                            alt={githubConnection.username || 'GitHub'}
                                            className="w-4 h-4 rounded-full"
                                          />
                                          <span className="text-sm font-medium text-secondary-900 dark:text-white">GitHub</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                          </svg>
                                          <span className="text-sm font-medium text-secondary-900 dark:text-white">GitHub</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {githubConnection?.hasConnection ? (
                                        <>
                                          <button
                                            onClick={async () => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setGitHubConnectorMode('chat');
                                              setShowGitHubConnector(true);
                                              setTimeout(() => loadGitHubConnection(), 500);
                                            }}
                                            className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                            title="Connected - Click to view"
                                          >
                                            <EyeIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setAppDisconnectDialog({
                                                isOpen: true,
                                                title: 'Disconnect GitHub',
                                                message: 'Are you sure you want to disconnect GitHub? This will remove all your GitHub connections and integrations. This action cannot be undone.',
                                                onConfirm: async () => {
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
                                              });
                                            }}
                                            className="p-1 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded transition-colors"
                                            title="Disconnect GitHub"
                                          >
                                            <XMarkIcon className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={async () => {
                                            setShowAttachmentsPopover(false);
                                            setShowAppsSubmenu(false);
                                            setGitHubConnectorMode('chat');
                                            setShowGitHubConnector(true);
                                            setTimeout(() => loadGitHubConnection(), 500);
                                          }}
                                          className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                          title="Connect GitHub"
                                        >
                                          <PlusIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Google */}
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1">
                                      <svg className="w-4 h-4 integration-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                      </svg>
                                      <span className="text-sm font-medium text-secondary-900 dark:text-white">Google</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {googleConnection?.hasConnection ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setShowGooglePanel(true);
                                              setGooglePanelTab('quick');
                                            }}
                                            className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                            title="Connected - Click to view"
                                          >
                                            <EyeIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setAppDisconnectDialog({
                                                isOpen: true,
                                                title: 'Disconnect Google',
                                                message: 'Are you sure you want to disconnect Google? This will remove your Google connection and access to Google services. This action cannot be undone.',
                                                onConfirm: async () => {
                                                  try {
                                                    await googleService.disconnectConnection(googleConnection.connection?._id || '');
                                                    // Reload Google connection state
                                                    // You'll need to implement loadGoogleConnection similar to loadGitHubConnection
                                                    setMessages(prev => [...prev, {
                                                      id: Date.now().toString(),
                                                      role: 'assistant',
                                                      content: '✅ Google has been disconnected successfully.',
                                                      timestamp: new Date()
                                                    }]);
                                                  } catch (error) {
                                                    console.error('Failed to disconnect Google:', error);
                                                    setError('Failed to disconnect Google. Please try again.');
                                                  }
                                                }
                                              });
                                            }}
                                            className="p-1 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded transition-colors"
                                            title="Disconnect Google"
                                          >
                                            <XMarkIcon className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setShowAttachmentsPopover(false);
                                            setShowAppsSubmenu(false);
                                            navigate('/integrations');
                                          }}
                                          className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                          title="Connect Google"
                                        >
                                          <PlusIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Vercel */}
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1">
                                      {vercelConnection?.hasConnection && vercelConnection?.avatarUrl ? (
                                        <>
                                          <img
                                            src={vercelConnection.avatarUrl}
                                            alt={vercelConnection.username || 'Vercel'}
                                            className="w-4 h-4 rounded-full"
                                          />
                                          <span className="text-sm font-medium text-secondary-900 dark:text-white">Vercel</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 text-secondary-600 dark:text-secondary-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L2 19.5h20L12 2z" />
                                          </svg>
                                          <span className="text-sm font-medium text-secondary-900 dark:text-white">Vercel</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {vercelConnection?.hasConnection ? (
                                        <>
                                          <button
                                            onClick={async () => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setShowVercelPanel(true);
                                              setTimeout(() => loadVercelConnection(), 500);
                                            }}
                                            className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                            title="Connected - Click to view"
                                          >
                                            <EyeIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setAppDisconnectDialog({
                                                isOpen: true,
                                                title: 'Disconnect Vercel',
                                                message: 'Are you sure you want to disconnect Vercel? This will remove your Vercel connection. This action cannot be undone.',
                                                onConfirm: async () => {
                                                  try {
                                                    const connections = await vercelService.listConnections();
                                                    for (const conn of connections) {
                                                      if (conn.isActive) {
                                                        await vercelService.disconnectConnection(conn._id);
                                                      }
                                                    }
                                                    await loadVercelConnection();
                                                    setMessages(prev => [...prev, {
                                                      id: Date.now().toString(),
                                                      role: 'assistant',
                                                      content: '✅ Vercel has been disconnected successfully.',
                                                      timestamp: new Date()
                                                    }]);
                                                  } catch (error) {
                                                    console.error('Failed to disconnect Vercel:', error);
                                                    setError('Failed to disconnect Vercel. Please try again.');
                                                  }
                                                }
                                              });
                                            }}
                                            className="p-1 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded transition-colors"
                                            title="Disconnect Vercel"
                                          >
                                            <XMarkIcon className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setShowAttachmentsPopover(false);
                                            setShowAppsSubmenu(false);
                                            setShowVercelConnector(true);
                                          }}
                                          className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                          title="Connect Vercel"
                                        >
                                          <PlusIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* AWS */}
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                          <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.072-.583.16-.863.279a2.047 2.047 0 0 1-.255.104.505.505 0 0 1-.128.024c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586h-.016zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.264-.168.312a.549.549 0 0 1-.32.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08h-.687zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.807-.414l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.742.167-1.142.167z" fill="#FF9900" />
                                        </svg>
                                      </div>
                                      <span className="text-sm font-medium text-secondary-900 dark:text-white">AWS</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {awsConnection?.hasConnection ? (
                                        <>
                                          <button
                                            onClick={async () => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setShowAWSPanel(true);
                                              setTimeout(() => loadAWSConnection(), 500);
                                            }}
                                            className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                            title="Connected - Click to view"
                                          >
                                            <EyeIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setAppDisconnectDialog({
                                                isOpen: true,
                                                title: 'Disconnect AWS',
                                                message: 'Are you sure you want to disconnect AWS? This will revoke CostKatana access to your AWS account. This action cannot be undone.',
                                                onConfirm: async () => {
                                                  try {
                                                    if (awsConnection.connection) {
                                                      await awsService.deleteConnection(awsConnection.connection.id);
                                                    }
                                                    await loadAWSConnection();
                                                    setMessages(prev => [...prev, {
                                                      id: Date.now().toString(),
                                                      role: 'assistant',
                                                      content: '✅ AWS has been disconnected successfully.',
                                                      timestamp: new Date()
                                                    }]);
                                                  } catch (error) {
                                                    console.error('Failed to disconnect AWS:', error);
                                                    setError('Failed to disconnect AWS. Please try again.');
                                                  }
                                                }
                                              });
                                            }}
                                            className="p-1 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded transition-colors"
                                            title="Disconnect AWS"
                                          >
                                            <XMarkIcon className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setShowAttachmentsPopover(false);
                                            setShowAppsSubmenu(false);
                                            setShowAWSConnector(true);
                                          }}
                                          className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                          title="Connect AWS"
                                        >
                                          <PlusIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* MongoDB */}
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill-rule="evenodd" clip-rule="evenodd" fill="#439934" d="M88.038 42.812c1.605 4.643 2.761 9.383 3.141 14.296.472 6.095.256 12.147-1.029 18.142-.035.165-.109.32-.164.48-.403.001-.814-.049-1.208.012-3.329.523-6.655 1.065-9.981 1.604-3.438.557-6.881 1.092-10.313 1.687-1.216.21-2.721-.041-3.212 1.641-.014.046-.154.054-.235.08l.166-10.051-.169-24.252 1.602-.275c2.62-.429 5.24-.864 7.862-1.281 3.129-.497 6.261-.98 9.392-1.465 1.381-.215 2.764-.412 4.148-.618z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#45A538" d="M61.729 110.054c-1.69-1.453-3.439-2.842-5.059-4.37-8.717-8.222-15.093-17.899-18.233-29.566-.865-3.211-1.442-6.474-1.627-9.792-.13-2.322-.318-4.665-.154-6.975.437-6.144 1.325-12.229 3.127-18.147l.099-.138c.175.233.427.439.516.702 1.759 5.18 3.505 10.364 5.242 15.551 5.458 16.3 10.909 32.604 16.376 48.9.107.318.384.579.583.866l-.87 2.969z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#46A037" d="M88.038 42.812c-1.384.206-2.768.403-4.149.616-3.131.485-6.263.968-9.392 1.465-2.622.417-5.242.852-7.862 1.281l-1.602.275-.012-1.045c-.053-.859-.144-1.717-.154-2.576-.069-5.478-.112-10.956-.18-16.434-.042-3.429-.105-6.857-.175-10.285-.043-2.13-.089-4.261-.185-6.388-.052-1.143-.236-2.28-.311-3.423-.042-.657.016-1.319.029-1.979.817 1.583 1.616 3.178 2.456 4.749 1.327 2.484 3.441 4.314 5.344 6.311 7.523 7.892 12.864 17.068 16.193 27.433z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#409433" d="M65.036 80.753c.081-.026.222-.034.235-.08.491-1.682 1.996-1.431 3.212-1.641 3.432-.594 6.875-1.13 10.313-1.687 3.326-.539 6.652-1.081 9.981-1.604.394-.062.805-.011 1.208-.012-.622 2.22-1.112 4.488-1.901 6.647-.896 2.449-1.98 4.839-3.131 7.182a49.142 49.142 0 01-6.353 9.763c-1.919 2.308-4.058 4.441-6.202 6.548-1.185 1.165-2.582 2.114-3.882 3.161l-.337-.23-1.214-1.038-1.256-2.753a41.402 41.402 0 01-1.394-9.838l.023-.561.171-2.426c.057-.828.133-1.655.168-2.485.129-2.982.241-5.964.359-8.946z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#4FAA41" d="M65.036 80.753c-.118 2.982-.23 5.964-.357 8.947-.035.83-.111 1.657-.168 2.485l-.765.289c-1.699-5.002-3.399-9.951-5.062-14.913-2.75-8.209-5.467-16.431-8.213-24.642a4498.887 4498.887 0 00-6.7-19.867c-.105-.31-.407-.552-.617-.826l4.896-9.002c.168.292.39.565.496.879a6167.476 6167.476 0 016.768 20.118c2.916 8.73 5.814 17.467 8.728 26.198.116.349.308.671.491 1.062l.67-.78-.167 10.052z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#4AA73C" d="M43.155 32.227c.21.274.511.516.617.826a4498.887 4498.887 0 016.7 19.867c2.746 8.211 5.463 16.433 8.213 24.642 1.662 4.961 3.362 9.911 5.062 14.913l.765-.289-.171 2.426-.155.559c-.266 2.656-.49 5.318-.814 7.968-.163 1.328-.509 2.632-.772 3.947-.198-.287-.476-.548-.583-.866-5.467-16.297-10.918-32.6-16.376-48.9a3888.972 3888.972 0 00-5.242-15.551c-.089-.263-.34-.469-.516-.702l3.272-8.84z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#57AE47" d="M65.202 70.702l-.67.78c-.183-.391-.375-.714-.491-1.062-2.913-8.731-5.812-17.468-8.728-26.198a6167.476 6167.476 0 00-6.768-20.118c-.105-.314-.327-.588-.496-.879l6.055-7.965c.191.255.463.482.562.769 1.681 4.921 3.347 9.848 5.003 14.778 1.547 4.604 3.071 9.215 4.636 13.813.105.308.47.526.714.786l.012 1.045c.058 8.082.115 16.167.171 24.251z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#60B24F" d="M65.021 45.404c-.244-.26-.609-.478-.714-.786-1.565-4.598-3.089-9.209-4.636-13.813-1.656-4.93-3.322-9.856-5.003-14.778-.099-.287-.371-.514-.562-.769 1.969-1.928 3.877-3.925 5.925-5.764 1.821-1.634 3.285-3.386 3.352-5.968.003-.107.059-.214.145-.514l.519 1.306c-.013.661-.072 1.322-.029 1.979.075 1.143.259 2.28.311 3.423.096 2.127.142 4.258.185 6.388.069 3.428.132 6.856.175 10.285.067 5.478.111 10.956.18 16.434.008.861.098 1.718.152 2.577z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#A9AA88" d="M62.598 107.085c.263-1.315.609-2.62.772-3.947.325-2.649.548-5.312.814-7.968l.066-.01.066.011a41.402 41.402 0 001.394 9.838c-.176.232-.425.439-.518.701-.727 2.05-1.412 4.116-2.143 6.166-.1.28-.378.498-.574.744l-.747-2.566.87-2.969z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#B6B598" d="M62.476 112.621c.196-.246.475-.464.574-.744.731-2.05 1.417-4.115 2.143-6.166.093-.262.341-.469.518-.701l1.255 2.754c-.248.352-.59.669-.728 1.061l-2.404 7.059c-.099.283-.437.483-.663.722l-.695-3.985z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#C2C1A7" d="M63.171 116.605c.227-.238.564-.439.663-.722l2.404-7.059c.137-.391.48-.709.728-1.061l1.215 1.037c-.587.58-.913 1.25-.717 2.097l-.369 1.208c-.168.207-.411.387-.494.624-.839 2.403-1.64 4.819-2.485 7.222-.107.305-.404.544-.614.812-.109-1.387-.22-2.771-.331-4.158z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#CECDB7" d="M63.503 120.763c.209-.269.506-.508.614-.812.845-2.402 1.646-4.818 2.485-7.222.083-.236.325-.417.494-.624l-.509 5.545c-.136.157-.333.294-.398.477-.575 1.614-1.117 3.24-1.694 4.854-.119.333-.347.627-.525.938-.158-.207-.441-.407-.454-.623-.051-.841-.016-1.688-.013-2.533z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#DBDAC7" d="M63.969 123.919c.178-.312.406-.606.525-.938.578-1.613 1.119-3.239 1.694-4.854.065-.183.263-.319.398-.477l.012 3.64-1.218 3.124-1.411-.495z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#EBE9DC" d="M65.38 124.415l1.218-3.124.251 3.696-1.469-.572z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#CECDB7" d="M67.464 110.898c-.196-.847.129-1.518.717-2.097l.337.23-1.054 1.867z" /><path fill-rule="evenodd" clip-rule="evenodd" fill="#4FAA41" d="M64.316 95.172l-.066-.011-.066.01.155-.559-.023.56z" /></svg>
                                      </div>
                                      <span className="text-sm font-medium text-secondary-900 dark:text-white">MongoDB</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {mongodbConnection?.hasConnection ? (
                                        <>
                                          <button
                                            onClick={async () => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setShowMongoDBPanel(true);
                                              setTimeout(() => loadMongoDBConnection(), 500);
                                            }}
                                            className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                            title="Connected - Click to view"
                                          >
                                            <EyeIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowAttachmentsPopover(false);
                                              setShowAppsSubmenu(false);
                                              setAppDisconnectDialog({
                                                isOpen: true,
                                                title: 'Disconnect MongoDB',
                                                message: 'Are you sure you want to disconnect MongoDB? This will remove your MongoDB connection and database access. This action cannot be undone.',
                                                onConfirm: async () => {
                                                  try {
                                                    if (mongodbConnection.connection) {
                                                      await mongodbService.deleteConnection(mongodbConnection.connection._id);
                                                    }
                                                    await loadMongoDBConnection();
                                                    setMessages(prev => [...prev, {
                                                      id: Date.now().toString(),
                                                      role: 'assistant',
                                                      content: '✅ MongoDB has been disconnected successfully.',
                                                      timestamp: new Date()
                                                    }]);
                                                  } catch (error) {
                                                    console.error('Failed to disconnect MongoDB:', error);
                                                    setError('Failed to disconnect MongoDB. Please try again.');
                                                  }
                                                }
                                              });
                                            }}
                                            className="p-1 hover:bg-danger-500/10 dark:hover:bg-danger-500/20 rounded transition-colors"
                                            title="Disconnect MongoDB"
                                          >
                                            <XMarkIcon className="w-3.5 h-3.5 text-danger-600 dark:text-danger-400" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setShowAttachmentsPopover(false);
                                            setShowAppsSubmenu(false);
                                            setShowMongoDBPanel(true);
                                          }}
                                          className="p-1 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded transition-colors"
                                          title="Connect MongoDB"
                                        >
                                          <PlusIcon className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
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
                    className="w-full px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 md:pt-5 lg:pt-6 pb-1.5 sm:pb-2 pr-8 sm:pr-10 md:pr-12 lg:pr-14 resize-none min-h-[88px] sm:min-h-[96px] md:min-h-[104px] lg:min-h-[112px] max-h-56 sm:max-h-64 md:max-h-72 lg:max-h-80 overflow-y-auto bg-transparent border-none outline-none text-secondary-900 dark:text-white placeholder:text-secondary-400 dark:placeholder:text-secondary-500 font-body text-sm leading-relaxed focus:ring-0 focus:outline-none relative z-10"
                    rows={2}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
                      height: '112px'
                    }}
                  />

                  {/* Mention Autocomplete */}
                  <MentionAutocomplete
                    value={currentMessage}
                    onChange={(newValue) => {
                      setCurrentMessage(newValue);
                    }}
                    onSelect={() => {
                      // Mention is already inserted in the textarea
                      // The onChange handler will check for picker commands
                    }}
                    textareaRef={textareaRef}
                  />
                </div>

                {/* Web Search Enabled Indicator - Left of Model Selector */}
                {webSearchEnabled && (
                  <button
                    onClick={() => setWebSearchEnabled(false)}
                    className="h-8 sm:h-9 md:h-9 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 md:px-4 rounded-full glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/80 to-primary-100/60 dark:from-primary-900/30 dark:to-primary-800/20 hover:from-primary-100/90 hover:to-primary-200/70 dark:hover:from-primary-800/40 dark:hover:to-primary-700/30 transition-all duration-200 shrink-0 animate-fade-in group relative shadow-sm hover:shadow-md"
                    title="Web Search Enabled - Click to disable"
                  >
                    {/* Icon container - maintains position */}
                    <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                      {/* Default: Globe */}
                      <GlobeAltIcon className="absolute inset-0 w-full h-full text-primary-600 dark:text-primary-400 group-hover:opacity-0 transition-opacity duration-200" />

                      {/* Hover: X icon in same position */}
                      <XMarkIcon className="absolute inset-0 w-full h-full text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>

                    <span className="text-xs sm:text-sm font-display font-semibold text-primary-700 dark:text-primary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">
                      Search
                    </span>
                  </button>
                )}

                {/* Plan Mode Enabled Indicator */}
                {planModeEnabled && (
                  <button
                    onClick={() => setPlanModeEnabled(false)}
                    className="h-8 sm:h-9 md:h-9 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 md:px-4 rounded-full glass backdrop-blur-xl border border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-primary-50/80 to-primary-100/60 dark:from-primary-900/30 dark:to-primary-800/20 hover:from-primary-100/90 hover:to-primary-200/70 dark:hover:from-primary-800/40 dark:hover:to-primary-700/30 transition-all duration-200 shrink-0 animate-fade-in group relative shadow-sm hover:shadow-md"
                    title="Plan Mode Enabled - Structured planning and verification - Click to disable"
                  >
                    {/* Icon container - maintains position */}
                    <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
                      {/* Default: Plan icon */}
                      <svg
                        className="absolute inset-0 w-full h-full text-primary-600 dark:text-primary-400 group-hover:opacity-0 transition-opacity duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {/* Hover: X */}
                      <XMarkIcon className="absolute inset-0 w-full h-full text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>

                    <span className="text-xs sm:text-sm font-display font-semibold text-primary-700 dark:text-primary-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-nowrap">
                      Plan
                    </span>
                  </button>
                )}

                {/* Model Selector */}
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
                  disabled={(!currentMessage.trim() && attachments.length === 0) || isLoading}
                  className={`relative flex items-center justify-center transition-all duration-300 shrink-0 ${(!currentMessage.trim() && attachments.length === 0) || isLoading
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

              {/* File Ingestion Loaders */}
              {ingestingFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {ingestingFiles.map((file) => (
                    <FileIngestionLoader
                      key={file.uploadId}
                      uploadId={file.uploadId}
                      fileName={file.fileName}
                      onComplete={() => {
                        // Get document info from pending documents
                        const docInfo = pendingDocumentsRef.current[file.uploadId];

                        if (docInfo) {
                          // Add to selected documents
                          const docMetadata: DocumentMetadata = {
                            documentId: docInfo.documentId,
                            fileName: docInfo.fileName,
                            fileType: docInfo.fileType,
                            uploadDate: new Date().toISOString(),
                            chunksCount: 0, // Will be updated when we get the actual count
                            s3Key: docInfo.s3Key
                          };

                          setSelectedDocuments(prev => [...prev, docMetadata]);

                          // Clean up
                          delete pendingDocumentsRef.current[file.uploadId];
                        }

                        // Remove from ingesting files when complete
                        setIngestingFiles(prev => prev.filter(f => f.uploadId !== file.uploadId));
                      }}
                      onError={(error) => {
                        setError(`Failed to ingest ${file.fileName}: ${error}`);
                        setIngestingFiles(prev => prev.filter(f => f.uploadId !== file.uploadId));
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Secondary Actions Row - Only show if there are attachments or conversation files */}
              {(attachments.length > 0 || getAllConversationAttachments().length > 0) && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  {/* View Conversation Files Button */}
                  {getAllConversationAttachments().length > 0 && (
                    <button
                      onClick={() => setShowConversationFilesModal(true)}
                      className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors shrink-0 relative flex items-center gap-1.5"
                      title={`View all files (${getAllConversationAttachments().length})`}
                    >
                      <FolderOpenIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span className="text-xs font-display font-medium text-primary-600 dark:text-primary-400">
                        View Files ({getAllConversationAttachments().length})
                      </span>
                    </button>
                  )}

                  {/* Attachment Chips - Inline in secondary row */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-auto">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-200/30 dark:border-primary-500/20 rounded-lg"
                        >
                          <DocumentIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-xs font-display text-secondary-900 dark:text-white truncate max-w-[120px]">
                            {att.fileName}
                          </span>
                          <button
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full p-0.5"
                          >
                            <XMarkIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Helper text */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-2 px-1">
                <div className="text-xs text-secondary-400 dark:text-secondary-500 font-medium">
                  {currentMessage.length > 0 && (
                    <span className="text-primary-500 dark:text-primary-400">
                      {currentMessage.length} character{currentMessage.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Modal */}
      <SourcesModal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
        sources={currentSources || []}
      />

      {/* Plan Modification Dialog */}
      <PlanModificationDialog
        isOpen={showPlanModifyDialog}
        onClose={() => {
          setShowPlanModifyDialog(false);
          setPlanModificationText("");
          setCurrentPlanTaskId(null);
        }}
        onSubmit={handleModifyPlan}
        value={planModificationText}
        onChange={setPlanModificationText}
        isLoading={isPlanModifying}
      />

      {/* Code Change Request Dialog */}
      <ChangeRequestDialog
        isOpen={showChangeRequestDialog}
        onClose={() => {
          setShowChangeRequestDialog(false);
          setChangeRequestText("");
          setCurrentPlanTaskId(null);
        }}
        onSubmit={handleRequestCodeChanges}
        value={changeRequestText}
        onChange={setChangeRequestText}
        isLoading={isRequestingChanges}
      />

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

      {/* Vercel Connector Modal */}
      {showVercelConnector && (
        <VercelConnector
          onConnect={async (_connectionId) => {
            setShowVercelConnector(false);
            await loadVercelConnection();
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: '✅ Vercel has been connected successfully! You can now deploy and manage your projects.',
              timestamp: new Date()
            }]);
          }}
          onClose={async () => {
            setShowVercelConnector(false);
            await loadVercelConnection();
          }}
        />
      )}

      {/* AWS Connector Modal */}
      {showAWSConnector && (
        <AWSConnector
          onConnect={async () => {
            setShowAWSConnector(false);
            await loadAWSConnection();
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: '✅ AWS has been connected successfully! You can now use @aws to interact with your AWS resources and get cost optimization insights.',
              timestamp: new Date()
            }]);
          }}
          onClose={async () => {
            setShowAWSConnector(false);
            await loadAWSConnection();
          }}
        />
      )}

      {/* AWS Service Panel */}
      <AWSServicePanel
        isOpen={showAWSPanel}
        onClose={() => setShowAWSPanel(false)}
        connection={awsConnection?.connection || null}
        onRefresh={loadAWSConnection}
      />

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

      {/* Vercel Service Panel */}
      <VercelServicePanel
        isOpen={showVercelPanel}
        onClose={() => setShowVercelPanel(false)}
      />

      {/* MongoDB Integration Panel */}
      <MongoDBIntegrationPanel
        isOpen={showMongoDBPanel}
        onClose={() => setShowMongoDBPanel(false)}
        onSelectCommand={(command) => {
          setCurrentMessage(command);
          setShowMongoDBPanel(false);
        }}
      />

      {/* Delete Conversation Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmConversationId}
        title="Delete Conversation"
        message={
          deleteConfirmConversationId ? (
            <>
              Are you sure you want to delete{' '}
              <span className="font-bold text-danger-600 dark:text-danger-400">
                {conversations.find(c => c.id === deleteConfirmConversationId)?.title || 'this conversation'}
              </span>
              ? This action cannot be undone.
            </>
          ) : (
            'Are you sure you want to delete this conversation? This action cannot be undone.'
          )
        }
        confirmLabel="Delete Conversation"
        cancelLabel="Cancel"
        danger={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmConversationId(null)}
      />

      {/* Attach Files Modal */}
      <AttachFilesModal
        isOpen={showAttachModal}
        onClose={() => setShowAttachModal(false)}
        onAttachmentsSelected={(selected) => {
          setAttachments(prev => [...prev, ...selected]);
          setShowAttachModal(false);
        }}
      />

      {/* Conversation Files Modal */}
      {showConversationFilesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass max-w-3xl w-full max-h-[80vh] rounded-2xl shadow-2xl animate-scale-in border border-primary-200/30 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-200/30">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <FolderOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                    Conversation Files
                  </h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    All files attached in this conversation ({getAllConversationAttachments().length})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConversationFilesModal(false)}
                className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {getAllConversationAttachments().length === 0 ? (
                <div className="text-center py-12">
                  <DocumentIcon className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
                  <p className="text-secondary-600 dark:text-secondary-400 font-display">
                    No files attached in this conversation yet
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {getAllConversationAttachments().map((attachment, index) => (
                    <a
                      key={`${attachment.fileId}-${index}`}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl glass backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30 dark:border-primary-500/20 hover:border-primary-400/50 dark:hover:border-primary-400/50 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                        {attachment.type === 'google' ? (
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                        ) : (
                          <DocumentIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-secondary-900 dark:text-white truncate mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {attachment.fileName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-secondary-500 dark:text-secondary-400">
                          <span className="px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium">
                            {attachment.type === 'google' ? 'Google' : 'Uploaded'} {attachment.fileType}
                          </span>
                          {attachment.fileSize > 0 && (
                            <>
                              <span>•</span>
                              <span>{(attachment.fileSize / 1024).toFixed(2)} KB</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-200/30">
              <button
                onClick={() => setShowConversationFilesModal(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white hover:opacity-90 transition-all duration-300 font-display font-semibold text-sm hover:scale-105 hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Disconnect Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={appDisconnectDialog.isOpen}
        title={appDisconnectDialog.title}
        message={appDisconnectDialog.message}
        confirmLabel="Disconnect"
        cancelLabel="Cancel"
        danger={true}
        onConfirm={appDisconnectDialog.onConfirm}
        onCancel={() => setAppDisconnectDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Governed Agent Prompt Modal */}
      {showGovernedPrompt && governedClassification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass max-w-2xl w-full rounded-2xl shadow-2xl animate-scale-in border border-primary-500/30 bg-black/90 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-primary-500/30">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/50">
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-primary-500">
                  Use Autonomous Agent Mode?
                </h3>
                <p className="text-sm text-primary-300/80">
                  This task may benefit from structured planning
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-primary-900/30 to-black/50 border border-primary-500/20 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-display font-semibold text-primary-400 mb-1">
                      Task Classification
                    </p>
                    <p className="text-sm text-primary-300/90">
                      {governedClassification.classification.reasoning}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/60 border border-primary-600/20 rounded-lg p-3 hover:border-primary-500/40 transition-all">
                  <p className="text-xs text-primary-400/70 mb-1 font-display font-medium">Type</p>
                  <p className="text-sm font-display font-semibold text-primary-300 capitalize">
                    {governedClassification.classification.type.replace('_', ' ')}
                  </p>
                </div>
                <div className="bg-black/60 border border-primary-600/20 rounded-lg p-3 hover:border-primary-500/40 transition-all">
                  <p className="text-xs text-primary-400/70 mb-1 font-display font-medium">Complexity</p>
                  <p className="text-sm font-display font-semibold text-primary-300 capitalize">
                    {governedClassification.classification.complexity}
                  </p>
                </div>
                <div className="bg-black/60 border border-primary-600/20 rounded-lg p-3 hover:border-primary-500/40 transition-all">
                  <p className="text-xs text-primary-400/70 mb-1 font-display font-medium">Risk Level</p>
                  <p className="text-sm font-display font-semibold text-primary-300 capitalize">
                    {governedClassification.classification.riskLevel}
                  </p>
                </div>
                <div className="bg-black/60 border border-primary-600/20 rounded-lg p-3 hover:border-primary-500/40 transition-all">
                  <p className="text-xs text-primary-400/70 mb-1 font-display font-medium">Integrations</p>
                  <p className="text-sm font-display font-semibold text-primary-300">
                    {governedClassification.classification.integrations.length || 'None'}
                  </p>
                </div>
              </div>

              <div className="glass bg-gradient-to-br from-primary-900/40 to-black/60 border border-primary-500/30 rounded-xl p-4 shadow-sm shadow-primary-500/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2c2.31 0 4.438.793 6.118 2.016m0 0L12 9m5.618-4.016L14 9" />
                  </svg>
                  <p className="text-sm text-primary-300 font-medium">
                    <strong className="font-display font-bold text-primary-400">Autonomous Agent</strong> will plan, verify, and execute this task with approval gates for risky actions.
                    You'll see the plan before anything is executed.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-500/30 bg-black/70">
              <button
                onClick={handleUseNormalChat}
                className="px-5 py-2.5 rounded-xl border border-primary-500/30 bg-black/50 text-primary-300 hover:bg-primary-900/30 hover:text-primary-200 hover:border-primary-500/50 transition-all duration-300 font-display font-semibold text-sm hover:scale-105 hover:shadow-md"
              >
                Use Normal Chat
              </button>
              <button
                onClick={handleUseGovernedAgent}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-black hover:from-primary-400 hover:to-primary-500 transition-all duration-300 font-display font-semibold text-sm hover:scale-105 hover:shadow-xl shadow-lg shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Starting...' : 'Use Autonomous Agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Governed Agent Modal */}
      {showGovernedAgent && governedTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass max-w-7xl w-full h-[90vh] rounded-2xl shadow-2xl animate-scale-in border border-primary-200/30 dark:border-primary-500/20 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-r from-secondary-50/50 to-transparent dark:from-secondary-900/30 dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg glow-primary">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold gradient-text-primary">
                    Autonomous Agent
                  </h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-mono">
                    Task ID: {governedTaskId.substring(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={closeGovernedAgent}
                className="p-2 hover:bg-primary-500/10 dark:hover:bg-primary-500/20 rounded-lg transition-all duration-200 hover:scale-110 group"
                title="Close Autonomous Agent"
              >
                <XMarkIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <UniversalGovernedAgent taskId={governedTaskId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
