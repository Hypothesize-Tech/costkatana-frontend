/**
 * EnhancedChatMessage Component
 * 
 * Enhanced chat message component that integrates preview capabilities
 * similar to Claude, ChatGPT, and Gemini with intelligent code detection.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    Copy,
    Download,
    Eye,
    EyeOff,
    Maximize2,
    Minimize2,
    Code2,
    CheckCircle,
    Zap,
    Layers,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Import preview components
import PreviewRenderer from '../preview/PreviewRenderer';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    sources?: Array<{
        title: string;
        url: string;
        snippet: string;
    }>;
    thinking?: string;
    codeBlocks?: Array<{
        language: string;
        code: string;
        hasPreview: boolean;
    }>;
}

interface EnhancedChatMessageProps {
    message: ChatMessage;
    className?: string;
    showPreview?: boolean;
    onPreviewToggle?: (messageId: string, show: boolean) => void;
    onCodeCopy?: (code: string) => void;
    onCodeDownload?: (code: string, language: string) => void;
    maxHeight?: string;
    allowFullscreen?: boolean;
    sandboxMode?: 'strict' | 'moderate' | 'permissive';
    theme?: 'light' | 'dark' | 'auto';
}

export const EnhancedChatMessage: React.FC<EnhancedChatMessageProps> = ({
    message,
    className = '',
    showPreview = true,
    onPreviewToggle,
    onCodeCopy,
    onCodeDownload,
    maxHeight: _maxHeight = '500px',
    allowFullscreen = true,
    sandboxMode = 'strict',
    theme = 'auto'
}) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [showPreviewForMessage, setShowPreviewForMessage] = useState(showPreview);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedCodeBlock, setSelectedCodeBlock] = useState<number | null>(null);

    // Parse content to extract code blocks
    const codeBlocks = useMemo(() => {
        const blocks: Array<{
            language: string;
            code: string;
            hasPreview: boolean;
            startIndex: number;
            endIndex: number;
        }> = [];

        const content = message.content;
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1] || 'text';
            const code = match[2].trim();
            const hasPreview = hasPreviewCapability(language);

            blocks.push({
                language,
                code,
                hasPreview,
                startIndex: match.index,
                endIndex: match.index + match[0].length
            });
        }

        return blocks;
    }, [message.content]);

    // Check if language has preview capability
    const hasPreviewCapability = (language: string): boolean => {
        const previewableLanguages = [
            'html', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx',
            'react', 'vue', 'angular', 'svelte', 'css', 'scss',
            'terminal', 'bash', 'shell', 'sh', 'python', 'py',
            'json', 'yaml', 'xml', 'sql'
        ];

        return previewableLanguages.includes(language.toLowerCase());
    };

    // Copy code to clipboard
    const copyCode = useCallback(async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
            onCodeCopy?.(code);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }, [onCodeCopy]);

    // Download code
    const downloadCode = useCallback((code: string, language: string) => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-${Date.now()}.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onCodeDownload?.(code, language);
    }, [onCodeDownload]);

    // Toggle preview for message
    const togglePreview = useCallback(() => {
        const newShowPreview = !showPreviewForMessage;
        setShowPreviewForMessage(newShowPreview);
        onPreviewToggle?.(message.id, newShowPreview);
    }, [showPreviewForMessage, message.id, onPreviewToggle]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    // Custom markdown components
    const markdownComponents = {
        code({ className, children }: { className?: string; children?: React.ReactNode }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const code = String(children).replace(/\n$/, '');
            const hasPreview = hasPreviewCapability(language);
            const blockIndex = codeBlocks.findIndex(block => block.code === code);

            return (
                <div className="relative">
                    <div className="my-4 rounded-xl overflow-hidden border border-primary-200/30">
                        <div className="flex items-center justify-between px-4 py-2.5 glass border-b border-primary-200/30 bg-gradient-to-r from-primary-50/30 to-transparent dark:from-primary-900/10">
                            <div className="flex items-center space-x-2">
                                <span className="font-display font-bold text-sm text-light-text-primary dark:text-dark-text-primary capitalize px-2 py-0.5 bg-primary-500/10 rounded-lg">
                                    {language}
                                </span>
                                {hasPreview && (
                                    <span className="px-2 py-0.5 text-xs font-display font-bold bg-gradient-to-r from-success-500/20 to-success-600/20 text-success-600 dark:text-success-400 border border-success-500/30 rounded-lg">
                                        PREVIEW
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-1">
                                {hasPreview && (
                                    <button
                                        onClick={() => setSelectedCodeBlock(blockIndex === -1 ? null : blockIndex)}
                                        className="btn btn-ghost p-1.5 rounded-lg hover:bg-primary-500/10 transition-all"
                                        title="Toggle Preview"
                                    >
                                        <Eye className="w-3.5 h-3.5 text-primary-500" />
                                    </button>
                                )}
                                <button
                                    onClick={() => copyCode(code)}
                                    className="btn btn-ghost p-1.5 rounded-lg hover:bg-primary-500/10 transition-all"
                                    title="Copy Code"
                                >
                                    {copiedCode === code ? <CheckCircle className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5 text-primary-500" />}
                                </button>
                                <button
                                    onClick={() => downloadCode(code, language)}
                                    className="btn btn-ghost p-1.5 rounded-lg hover:bg-primary-500/10 transition-all"
                                    title="Download Code"
                                >
                                    <Download className="w-3.5 h-3.5 text-primary-500" />
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
                            {code}
                        </SyntaxHighlighter>
                    </div>

                    {/* Preview for this code block */}
                    {hasPreview && selectedCodeBlock === blockIndex && (
                        <div className="mt-4">
                            <PreviewRenderer
                                content={code}
                                language={language}
                                showPreview={true}
                                maxHeight="400px"
                                allowFullscreen={allowFullscreen}
                                sandboxMode={sandboxMode}
                                theme={theme}
                            />
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className={`enhanced-chat-message ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-light-ambient dark:bg-gradient-dark-ambient' : ''}`}>
            {/* Message Header */}
            <div className="flex items-center justify-between p-4 glass backdrop-blur-xl border-b border-primary-200/30 shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : message.role === 'assistant'
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                            : 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white'
                        }`}>
                        <span className="font-display font-bold text-sm">
                            {message.role === 'user' ? 'U' : message.role === 'assistant' ? 'A' : 'S'}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                            {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI Assistant' : 'System'}
                        </h4>
                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                            {message.timestamp.toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Code blocks indicator */}
                    {codeBlocks.length > 0 && (
                        <div className="glass px-3 py-1.5 rounded-lg border border-primary-200/30 flex items-center space-x-1.5 text-xs font-display font-medium text-light-text-primary dark:text-dark-text-primary">
                            <Code2 className="w-3.5 h-3.5 text-primary-500" />
                            <span>{codeBlocks.length} block{codeBlocks.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {/* Preview toggle */}
                    {codeBlocks.some(block => block.hasPreview) && (
                        <button
                            onClick={togglePreview}
                            className="btn btn-ghost p-2 rounded-lg hover:bg-primary-500/10 transition-all"
                            title={showPreviewForMessage ? 'Hide Previews' : 'Show Previews'}
                        >
                            {showPreviewForMessage ? <EyeOff className="w-4 h-4 text-primary-500" /> : <Eye className="w-4 h-4 text-primary-500" />}
                        </button>
                    )}

                    {/* Fullscreen toggle */}
                    {allowFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="btn btn-ghost p-2 rounded-lg hover:bg-primary-500/10 transition-all"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4 text-primary-500" /> : <Maximize2 className="w-4 h-4 text-primary-500" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Message Content */}
            <div className="p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : 'auto' }}>
                {/* Thinking section */}
                {message.thinking && (
                    <div className="mb-4 glass rounded-xl border border-primary-200/30 backdrop-blur-xl p-4 shadow-lg">
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="p-1.5 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-lg">
                                <Zap className="w-4 h-4 text-primary-500" />
                            </div>
                            <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">Thinking Process</span>
                        </div>
                        <div className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap leading-relaxed">
                            {message.thinking}
                        </div>
                    </div>
                )}

                {/* Main content with markdown */}
                <div className="prose prose-sm max-w-none font-body text-light-text-primary dark:text-dark-text-primary">
                    <ReactMarkdown components={markdownComponents}>
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-6 glass rounded-xl border border-primary-200/30 backdrop-blur-xl p-4 shadow-lg">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="p-1.5 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-lg">
                                <Layers className="w-4 h-4 text-accent-500" />
                            </div>
                            <span className="font-display font-bold text-light-text-primary dark:text-dark-text-primary">Sources & References</span>
                        </div>
                        <div className="space-y-3">
                            {message.sources.map((source, index) => (
                                <div key={index} className="glass rounded-lg border border-primary-200/20 p-3 hover:border-primary-300/40 transition-all cursor-pointer group">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="font-display font-semibold text-sm text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                                            {source.title}
                                        </div>
                                        <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                                            {source.snippet}
                                        </p>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedChatMessage;
