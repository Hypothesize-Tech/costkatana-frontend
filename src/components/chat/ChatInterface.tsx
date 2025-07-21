import React, { useState, useEffect, useRef } from 'react';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    ClockIcon,
    CurrencyDollarIcon,
    TrashIcon,
    PlusIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ChatService } from '@/services/chat.service';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
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
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<AvailableModel | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadAvailableModels = async () => {
        try {
            const models = await ChatService.getAvailableModels();
            setAvailableModels(models);
            if (models.length > 0 && !selectedModel) {
                setSelectedModel(models[0]);
            }
        } catch (error) {
            console.error('Error loading models:', error);
            setError('Failed to load available models');
        }
    };

    const loadConversations = async () => {
        try {
            const result = await ChatService.getUserConversations();
            setConversations(result.conversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadConversationHistory = async (conversationId: string) => {
        try {
            const result = await ChatService.getConversationHistory(conversationId);
            setMessages(result.messages);
            setCurrentConversationId(conversationId);
            
            // Update selected model based on conversation
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
                const model = availableModels.find(m => m.id === conversation.modelId);
                if (model) {
                    setSelectedModel(model);
                }
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            setError('Failed to load conversation');
        }
    };

    const startNewConversation = async () => {
        if (!selectedModel) return;

        try {
            setMessages([]);
            setCurrentConversationId(null);
            setError(null);
        } catch (error) {
            console.error('Error starting new conversation:', error);
            setError('Failed to start new conversation');
        }
    };

    const sendMessage = async () => {
        if (!currentMessage.trim() || !selectedModel || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: currentMessage.trim(),
            timestamp: new Date()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setCurrentMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await ChatService.sendMessage({
                message: userMessage.content,
                modelId: selectedModel.id,
                conversationId: currentConversationId || undefined
            });

            const assistantMessage: ChatMessage = {
                id: response.messageId,
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
                metadata: {
                    cost: response.cost,
                    latency: response.latency,
                    tokenCount: response.tokenCount
                }
            };

            setMessages([...newMessages, assistantMessage]);
            setCurrentConversationId(response.conversationId);
            
            // Refresh conversations list
            loadConversations();

        } catch (error: any) {
            console.error('Error sending message:', error);
            setError(error.message || 'Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteConversation = async (conversationId: string) => {
        try {
            await ChatService.deleteConversation(conversationId);
            setConversations(conversations.filter(c => c.id !== conversationId));
            
            if (currentConversationId === conversationId) {
                setMessages([]);
                setCurrentConversationId(null);
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            setError('Failed to delete conversation');
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Sidebar */}
            <div className={`${showConversations ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={() => setShowConversations(!showConversations)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${showConversations ? 'rotate-180' : ''}`} />
                        {showConversations && <span className="ml-2 font-medium">Conversations</span>}
                    </button>
                </div>

                {/* New Chat Button */}
                {showConversations && (
                    <div className="p-4">
                        <button
                            onClick={startNewConversation}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            New Chat
                        </button>
                    </div>
                )}

                {/* Conversations List */}
                {showConversations && (
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                    currentConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                onClick={() => loadConversationHistory(conversation.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {conversation.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {conversation.messageCount} messages • {formatTimestamp(conversation.updatedAt)}
                                        </p>
                                        {conversation.totalCost && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ${conversation.totalCost.toFixed(4)} total cost
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conversation.id);
                                        }}
                                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-gray-900">
                                            {selectedModel?.name || 'Select Model'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {selectedModel?.provider}
                                        </div>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 ml-2 text-gray-500" />
                                </button>

                                {/* Model Dropdown */}
                                {showModelDropdown && (
                                    <div
                                        className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                                        style={{ maxHeight: '400px', overflowY: 'auto' }}
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
                                                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                                                        selectedModel?.id === model.id ? 'bg-blue-50 border border-blue-200' : ''
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{model.name}</div>
                                                            <div className="text-sm text-gray-500">{model.provider}</div>
                                                            <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                                                        </div>
                                                        {model.pricing && (
                                                            <div className="text-xs text-green-600 text-right">
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

                        <div className="text-sm text-gray-500">
                            Chat with AWS Bedrock Models
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <SparklesIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Start a conversation
                            </h3>
                            <p className="text-gray-500">
                                Choose a model and start chatting with AWS Bedrock AI models
                            </p>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-3xl px-4 py-3 rounded-lg ${
                                    message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-200'
                                }`}
                            >
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                </div>
                                
                                {message.role === 'assistant' && message.metadata && (
                                    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                        {message.metadata.cost && (
                                            <div className="flex items-center">
                                                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                                ${message.metadata.cost.toFixed(6)}
                                            </div>
                                        )}
                                        {message.metadata.latency && (
                                            <div className="flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                {message.metadata.latency}ms
                                            </div>
                                        )}
                                        {message.metadata.tokenCount && (
                                            <div>{message.metadata.tokenCount} tokens</div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="text-xs opacity-70 mt-2">
                                    {formatTimestamp(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 text-gray-500">
                                    <LoadingSpinner size="small" />
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-4">
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={selectedModel ? `Message ${selectedModel.name}...` : "Select a model to start chatting"}
                                disabled={!selectedModel || isLoading}
                                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                rows={1}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={!currentMessage.trim() || !selectedModel || isLoading}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 