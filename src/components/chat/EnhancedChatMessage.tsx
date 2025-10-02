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
    Play,
    Square,
    Settings,
    Shield,
    AlertTriangle,
    CheckCircle,
    Zap,
    Terminal,
    Layers,
    Monitor,
    Smartphone,
    Tablet
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
    maxHeight = '500px',
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
        let index = 0;

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

    // Get preview component for a code block
    const getPreviewComponent = (block: typeof codeBlocks[0]) => {
        if (!block.hasPreview) return null;

        return (
            <div key={`preview-${block.startIndex}`} className="mt-4">
                <PreviewRenderer
                    content={block.code}
                    language={block.language}
                    showPreview={showPreviewForMessage}
                    onPreviewToggle={(show) => onPreviewToggle?.(message.id, show)}
                    maxHeight={maxHeight}
                    allowFullscreen={allowFullscreen}
                    sandboxMode={sandboxMode}
                    theme={theme}
                />
            </div>
        );
    };

    // Custom markdown components
    const markdownComponents = {
        code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const code = String(children).replace(/\n$/, '');
            const hasPreview = hasPreviewCapability(language);
            const blockIndex = codeBlocks.findIndex(block => block.code === code);

            return (
                <div className="relative">
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
                            <div className="flex items-center space-x-1">
                                {hasPreview && (
                                    <button
                                        onClick={() => setSelectedCodeBlock(blockIndex === -1 ? null : blockIndex)}
                                        className="p-1 text-xs font-display font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        title="Toggle Preview"
                                    >
                                        <Eye className="w-3 h-3" />
                                    </button>
                                )}
                                <button
                                    onClick={() => copyCode(code)}
                                    className="p-1 text-xs font-display font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Copy Code"
                                >
                                    {copiedCode === code ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                                <button
                                    onClick={() => downloadCode(code, language)}
                                    className="p-1 text-xs font-display font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    title="Download Code"
                                >
                                    <Download className="w-3 h-3" />
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
        <div className={`enhanced-chat-message ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
            {/* Message Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : message.role === 'assistant'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-white'
                        }`}>
                        {message.role === 'user' ? 'U' : message.role === 'assistant' ? 'A' : 'S'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Assistant' : 'System'}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Code blocks indicator */}
                    {codeBlocks.length > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Code2 className="w-4 h-4" />
                            <span>{codeBlocks.length} code block{codeBlocks.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {/* Preview toggle */}
                    {codeBlocks.some(block => block.hasPreview) && (
                        <button
                            onClick={togglePreview}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={showPreviewForMessage ? 'Hide Previews' : 'Show Previews'}
                        >
                            {showPreviewForMessage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Fullscreen toggle */}
                    {allowFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Message Content */}
            <div className="p-4" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : 'auto' }}>
                {/* Thinking section */}
                {message.thinking && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-blue-900 dark:text-blue-100">Thinking Process</span>
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
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
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                            <Layers className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900 dark:text-white">Sources</span>
                        </div>
                        <div className="space-y-2">
                            {message.sources.map((source, index) => (
                                <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        {source.title}
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {source.snippet}
                                    </p>
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
