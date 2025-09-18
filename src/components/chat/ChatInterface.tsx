import React, { useState, useEffect, useRef } from "react";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ChatService } from "@/services/chat.service";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    cost?: number;
    latency?: number;
    tokenCount?: number;
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

export const ChatInterface: React.FC = () => {
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
  const [showConversations, setShowConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadAvailableModels();
    loadConversations();
  }, []);

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

      // Update selected model based on conversation
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        const model = availableModels.find(
          (m) => m.id === conversation.modelId,
        );
        if (model) {
          setSelectedModel(model);
        }
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation");
    }
  };

  const startNewConversation = async () => {
    if (!selectedModel) return;

    try {
      setMessages([]);
      setCurrentConversationId(null);
      setError(null);
    } catch (error) {
      console.error("Error starting new conversation:", error);
      setError("Failed to start new conversation");
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedModel || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCurrentMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await ChatService.sendMessage({
        message: userMessage.content,
        modelId: selectedModel.id,
        conversationId: currentConversationId || undefined,
      });

      const assistantMessage: ChatMessage = {
        id: response.messageId,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        metadata: {
          cost: response.cost,
          latency: response.latency,
          tokenCount: response.tokenCount,
        },
      };

      setMessages([...newMessages, assistantMessage]);
      setCurrentConversationId(response.conversationId);

      // Refresh conversations list
      loadConversations();
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await ChatService.deleteConversation(conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));

      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      setError("Failed to delete conversation");
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

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
              className="btn-primary w-full flex items-center justify-center text-sm py-2"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
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
        <div className="glass backdrop-blur-xl border-b border-primary-200/30 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center px-4 py-2 glass hover:bg-primary-500/10 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <SparklesIcon className="h-5 w-5 mr-2 text-primary-500" />
                  <div className="text-left">
                    <div className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {selectedModel?.name || "Select Model"}
                    </div>
                    <div className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted">
                      {selectedModel?.provider}
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 ml-2 text-light-text-muted dark:text-dark-text-muted" />
                </button>

                {/* Model Dropdown */}
                {showModelDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-80 glass shadow-2xl backdrop-blur-xl border border-primary-200/30 z-10 scrollbar-hide animate-scale-in"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <div className="p-2">
                      {availableModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelDropdown(false);
                            startNewConversation();
                          }}
                          className={`w-full text-left p-3 rounded-xl hover:bg-primary-500/5 transition-all duration-300 hover:scale-[1.02] ${selectedModel?.id === model.id
                            ? "bg-gradient-to-r from-primary-50/50 to-secondary-50/50 border border-primary-200/50 glow-primary"
                            : ""
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                {model.name}
                              </div>
                              <div className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
                                {model.provider}
                              </div>
                              <div className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                                {model.description}
                              </div>
                            </div>
                            {model.pricing && (
                              <div className="text-xs gradient-text-success text-right font-bold">
                                <div>${model.pricing.input}/1M in</div>
                                <div>${model.pricing.output}/1M out</div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm font-display font-medium gradient-text">
              Chat with AWS Bedrock Models
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full mx-auto scrollbar-hide">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-16 animate-fade-in">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-2xl glow-primary animate-pulse">
                  <SparklesIcon className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-display font-bold gradient-text mb-4">
                  Welcome to Cost Katana
                </h1>
                <p className="text-xl font-body text-light-text-secondary dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
                  Chat with 23+ AWS Bedrock AI models while tracking costs,
                  optimizing performance, and managing your AI infrastructure
                  all in one place.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <div className="glass p-6 bg-gradient-to-br from-success-50/50 to-success-100/50 border border-success-200/30 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Cost Tracking
                  </h3>
                  <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Monitor real-time costs across all AI models and providers
                  </p>
                </div>

                <div className="glass p-6 bg-gradient-to-br from-primary-50/50 to-primary-100/50 border border-primary-200/30 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Smart Optimization
                  </h3>
                  <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Get AI-powered suggestions to reduce costs and improve
                    performance
                  </p>
                </div>

                <div className="glass p-6 bg-gradient-to-br from-accent-50/50 to-accent-100/50 border border-accent-200/30 shadow-lg backdrop-blur-xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Real-time Analytics
                  </h3>
                  <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                    Track usage patterns, performance metrics, and cost trends
                  </p>
                </div>
              </div>

              {selectedModel ? (
                <p className="text-lg font-body text-light-text-primary dark:text-dark-text-primary font-medium">
                  Ready to chat with{" "}
                  <span className="gradient-text font-display font-bold">{selectedModel.name}</span> •
                  <span className="gradient-text-success ml-1 font-bold">
                    ${selectedModel.pricing?.input}/$
                    {selectedModel.pricing?.output} per 1M tokens
                  </span>
                </p>
              ) : (
                <p className="text-light-text-muted dark:text-dark-text-muted text-lg font-body">
                  👆 Select a model above to start chatting
                </p>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-4xl px-6 py-4 rounded-2xl text-base leading-relaxed shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${message.role === "user"
                  ? "bg-gradient-primary text-white glow-primary"
                  : "glass border border-primary-200/30"
                  }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>

                {message.role === "assistant" && message.metadata && (
                  <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-primary-200/20 text-xs">
                    {message.metadata.cost && (
                      <div className="flex items-center gradient-text-success font-bold">
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />$
                        {message.metadata.cost.toFixed(6)}
                      </div>
                    )}
                    {message.metadata.latency && (
                      <div className="flex items-center text-light-text-muted dark:text-dark-text-muted font-medium">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {message.metadata.latency}ms
                      </div>
                    )}
                    {message.metadata.tokenCount && (
                      <div className="text-light-text-muted dark:text-dark-text-muted font-medium">{message.metadata.tokenCount} tokens</div>
                    )}
                  </div>
                )}

                <div className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted mt-2">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass p-4 shadow-lg backdrop-blur-xl border border-primary-200/30">
                <div className="flex items-center space-x-2 text-light-text-secondary dark:text-dark-text-secondary">
                  <LoadingSpinner size="small" />
                  <span className="text-sm font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-gradient-to-br from-danger-50 to-danger-100/50 border-t border-danger-200/50 animate-scale-in">
            <p className="text-sm font-medium text-danger-700">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="glass backdrop-blur-xl border-t border-primary-200/30 p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    selectedModel
                      ? `Message ${selectedModel.name}...`
                      : "Select a model to start chatting"
                  }
                  disabled={!selectedModel || isLoading}
                  className="input w-full resize-none rounded-2xl px-6 py-4 text-base scrollbar-hide"
                  rows={1}
                  style={{ minHeight: "56px", maxHeight: "160px" }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || !selectedModel || isLoading}
                className="btn-primary px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
