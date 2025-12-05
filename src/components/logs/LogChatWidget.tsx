import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiLoader, FiZap, FiDollarSign, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';
import { ChatMessage } from './ChatMessage';
import { logQueryChatService, ChatMessage as ChatMessageType } from '../../services/logQueryChat.service';

interface LogChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyToDashboard: (visualization: any, data: any[]) => void;
    currentFilters?: any;
}

export const LogChatWidget: React.FC<LogChatWidgetProps> = ({ isOpen, onClose, onApplyToDashboard, currentFilters }) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendQuery = async () => {
        if (!inputText.trim() || isLoading) return;

        const userQuery = inputText.trim();
        setInputText('');
        setError(null);

        // Add user message immediately
        const userMessage: ChatMessageType = {
            role: 'user',
            content: userQuery,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await logQueryChatService.sendQuery(
                userQuery,
                conversationId,
                currentFilters
            );

            // Set conversation ID for follow-up queries
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }

            // Add AI response
            const aiMessage: ChatMessageType = {
                role: 'assistant',
                content: response.summary,
                query: userQuery,
                resultsCount: response.data?.length || 0,
                visualization: response.visualization,
                suggestedQueries: response.suggestedQueries || [],
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);

            // If blocked, show warning
            if (response.blocked) {
                setError('Query blocked for security reasons');
            }

        } catch (err: any) {
            console.error('Failed to send query:', err);
            setError(err.message || 'Failed to process query');

            // Add error message
            const errorMessage: ChatMessageType = {
                role: 'assistant',
                content: `Error: ${err.message || 'Failed to process your query. Please try again.'}`,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = (visualization: any, data: any[]) => {
        onApplyToDashboard(visualization, data);

        // Auto-close chat after applying
        setTimeout(() => {
            onClose();
        }, 500);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendQuery();
        }
    };

    const clearConversation = () => {
        setMessages([]);
        setConversationId(undefined);
        setError(null);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="card shadow-2xl overflow-hidden mb-4 md:mb-6 animate-fade-in border-2 border-primary-500/20">
            {/* Header */}
            <div className="relative px-4 py-4 md:px-6 md:py-5 bg-gradient-to-r from-primary-500/10 via-primary-400/5 to-transparent border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-50"></div>
                <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
                                <FiZap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-light-surface dark:border-dark-surface animate-pulse"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base md:text-xl font-bold gradient-text-primary flex items-center gap-2 truncate">
                                AI Log Assistant
                            </h3>
                            <p className="text-xs md:text-sm text-light-text-secondary dark:text-dark-text-secondary hidden sm:block">
                                Query and analyze your logs with natural language
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 md:p-2.5 rounded-xl hover:bg-red-500/10 transition-all duration-300 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 hover:scale-110 flex-shrink-0"
                        title="Close AI Assistant"
                    >
                        <FiX className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Messages Section */}
                <div className="flex-1 flex flex-col">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 max-h-96 min-h-[20rem] md:min-h-[28rem] bg-gradient-to-b from-light-surface/50 to-transparent dark:from-dark-surface/50">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-2 md:px-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl glow-primary mb-4 md:mb-6">
                                    <FiZap className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <h4 className="text-lg md:text-2xl font-bold gradient-text-primary mb-2 md:mb-3 px-2">
                                    Ask me anything about your logs
                                </h4>
                                <p className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary mb-6 md:mb-8 max-w-md px-2">
                                    I can help you query, analyze, and visualize your AI operation logs using natural language
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl px-2">
                                    <button
                                        onClick={() => setInputText("What's my total cost today?")}
                                        className="group relative px-3 py-3 md:px-5 md:py-4 bg-light-panel dark:bg-dark-panel hover:bg-primary-500/5 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-300 text-left border-2 border-primary-200/30 dark:border-primary-500/20 hover:border-primary-500/50 hover:shadow-lg hover:scale-105"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                                <FiDollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Cost Analysis</span>
                                        </div>
                                        <div className="text-xs md:text-sm font-medium text-light-text-primary dark:text-dark-text-primary">"What's my total cost today?"</div>
                                    </button>
                                    <button
                                        onClick={() => setInputText("Show errors in the last hour")}
                                        className="group relative px-3 py-3 md:px-5 md:py-4 bg-light-panel dark:bg-dark-panel hover:bg-primary-500/5 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-300 text-left border-2 border-primary-200/30 dark:border-primary-500/20 hover:border-primary-500/50 hover:shadow-lg hover:scale-105"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                                <FiAlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                                            </div>
                                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Error Tracking</span>
                                        </div>
                                        <div className="text-xs md:text-sm font-medium text-light-text-primary dark:text-dark-text-primary">"Show errors in the last hour"</div>
                                    </button>
                                    <button
                                        onClick={() => setInputText("Which service costs the most?")}
                                        className="group relative px-3 py-3 md:px-5 md:py-4 bg-light-panel dark:bg-dark-panel hover:bg-primary-500/5 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-300 text-left border-2 border-primary-200/30 dark:border-primary-500/20 hover:border-primary-500/50 hover:shadow-lg hover:scale-105"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                                <FiBarChart2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Service Analysis</span>
                                        </div>
                                        <div className="text-xs md:text-sm font-medium text-light-text-primary dark:text-dark-text-primary">"Which service costs the most?"</div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <ChatMessage
                                        key={idx}
                                        message={msg}
                                        type={msg.role as 'user' | 'ai'}
                                        onApply={msg.role === 'assistant' ? handleApply : undefined}
                                        onSuggestedQueryClick={msg.role === 'assistant' ? (query: string) => {
                                            setInputText(query);
                                            inputRef.current?.focus();
                                        } : undefined}
                                    />
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-4 md:mb-6 animate-fade-in">
                                        <div className="bg-light-panel dark:bg-dark-panel border-2 border-primary-200/30 dark:border-primary-500/20 rounded-xl px-3 py-3 md:px-5 md:py-4 shadow-lg">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <FiLoader className="w-4 h-4 md:w-5 md:h-5 animate-spin text-primary-500" />
                                                    <div className="absolute inset-0 blur-md bg-primary-500/30"></div>
                                                </div>
                                                <div>
                                                    <span className="text-xs md:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">Analyzing your query...</span>
                                                    <div className="flex gap-1 mt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-4 md:px-6 py-2.5 md:py-3 bg-red-50 dark:bg-red-900/20 border-t-2 border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2">
                                <FiAlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                <p className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="relative px-3 md:px-6 py-4 md:py-6 border-t-2 border-primary-200/30 dark:border-primary-500/20 bg-gradient-to-br from-light-surface via-light-panel/30 to-light-surface dark:from-dark-surface dark:via-dark-panel/30 dark:to-dark-surface">
                        {/* Background decorations */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-transparent to-primary-400/5 pointer-events-none"></div>

                        <div className="relative">
                            {/* Main Input Container */}
                            <div className="relative bg-light-panel dark:bg-dark-panel rounded-xl md:rounded-2xl shadow-xl border-2 border-primary-200/30 dark:border-primary-500/20 hover:border-primary-500/40 focus-within:border-primary-500 focus-within:shadow-2xl transition-all duration-300">
                                <div className="flex items-end">
                                    {/* Textarea Container */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask me anything about your logs..."
                                            className="w-full px-3 py-3 md:px-6 md:py-4 pr-24 md:pr-32 bg-transparent text-sm md:text-base text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none resize-none"
                                            rows={2}
                                            disabled={isLoading}
                                            style={{ minHeight: '60px', maxHeight: '150px' }}
                                        />

                                        {/* Hint Text */}
                                        {!inputText && (
                                            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-6 pointer-events-none">
                                                <div className="flex items-center gap-2 text-xs text-light-text-muted dark:text-dark-text-muted">
                                                    <span className="opacity-60 hidden sm:inline">Try: "What's my cost today?" or "Show recent errors"</span>
                                                    <span className="opacity-60 sm:hidden">Ask about your logs...</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Character count & keyboard hint */}
                                        <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 flex items-center gap-2 md:gap-3">
                                            {inputText && (
                                                <span className="text-xs text-light-text-muted dark:text-dark-text-muted font-medium hidden sm:inline">
                                                    {inputText.length} chars
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1 text-xs text-light-text-muted dark:text-dark-text-muted">
                                                <kbd className="px-1.5 py-0.5 md:px-2 md:py-1 bg-light-surface dark:bg-dark-surface rounded-md border border-primary-200/30 dark:border-primary-500/20 font-mono text-xs shadow-sm">
                                                    ↵
                                                </kbd>
                                                <span className="hidden sm:inline">to send</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Send Button */}
                                    <div className="flex items-end p-1.5 md:p-2">
                                        <button
                                            onClick={handleSendQuery}
                                            disabled={!inputText.trim() || isLoading}
                                            className="relative group px-4 py-2.5 md:px-6 md:py-3.5 bg-gradient-primary text-white rounded-lg md:rounded-xl hover:shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 font-bold overflow-hidden"
                                        >
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>

                                            {/* Button content */}
                                            <div className="relative flex items-center gap-1.5 md:gap-2.5">
                                                {isLoading ? (
                                                    <>
                                                        <div className="relative">
                                                            <FiLoader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                                            <div className="absolute inset-0 blur-sm bg-white/30 animate-pulse"></div>
                                                        </div>
                                                        <span className="hidden sm:inline">Analyzing</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSend className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                        <span className="hidden sm:inline">Send</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between mt-3 md:mt-4 px-1 md:px-2">
                                {/* Left: Clear button */}
                                {messages.length > 0 ? (
                                    <button
                                        onClick={clearConversation}
                                        className="group flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-light-text-muted dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 font-semibold rounded-lg md:rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                                    >
                                        <FiX className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-90 transition-transform" />
                                        <span>Clear Chat</span>
                                    </button>
                                ) : (
                                    <div></div>
                                )}

                                {/* Right: Status indicator */}
                                <div className="flex items-center gap-2 md:gap-2.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                                    <div className="relative w-1.5 h-1.5 md:w-2 md:h-2">
                                        <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse"></div>
                                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping"></div>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                        AI Online
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
