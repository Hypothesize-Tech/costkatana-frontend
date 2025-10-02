/**
 * CodePreview Component
 * 
 * A comprehensive preview system similar to Claude, ChatGPT, and Gemini
 * that can render HTML, CSS, JavaScript, and various frameworks in real-time.
 * Includes security sandboxing and multiple preview modes.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Maximize2,
    Minimize2,
    RotateCcw,
    Shield,
    Code2,
    Monitor,
    Smartphone,
    Tablet,
    ExternalLink,
    Copy,
    Download,
    Eye,
    EyeOff,
    Check
} from 'lucide-react';

interface CodePreviewProps {
    code: string;
    language: string;
    title?: string;
    className?: string;
    showPreview?: boolean;
    onPreviewToggle?: (show: boolean) => void;
    maxHeight?: string;
    allowFullscreen?: boolean;
    allowDownload?: boolean;
    sandboxMode?: 'strict' | 'moderate' | 'permissive';
    framework?: 'html' | 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
    dependencies?: Record<string, string>;
    theme?: 'light' | 'dark' | 'auto';
}

interface PreviewDimensions {
    width: string;
    height: string;
    label: string;
    icon: React.ReactNode;
}

const PREVIEW_DIMENSIONS: PreviewDimensions[] = [
    { width: '100%', height: '400px', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { width: '768px', height: '1024px', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { width: '375px', height: '667px', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> }
];

export const CodePreview: React.FC<CodePreviewProps> = React.memo(({
    code,
    language,
    title = 'Code Preview',
    className = '',
    showPreview = true,
    onPreviewToggle,
    maxHeight = '500px',
    allowFullscreen = true,
    allowDownload = true,
    sandboxMode = 'strict',
    framework = 'html',
    dependencies = {},
    theme = 'auto'
}) => {
    const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentDimension, setCurrentDimension] = useState(0);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionError, setExecutionError] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Generate sandbox attributes based on mode
    const getSandboxAttributes = useCallback(() => {
        switch (sandboxMode) {
            case 'strict':
                return 'allow-scripts'; // Most restrictive - no same-origin
            case 'moderate':
                return 'allow-scripts allow-forms'; // Allow forms but no same-origin
            case 'permissive':
                return 'allow-scripts allow-same-origin allow-forms allow-popups'; // More permissive
            default:
                return 'allow-scripts'; // Default to strict
        }
    }, [sandboxMode]);

    // Generate preview content based on framework
    const generatePreviewContent = useCallback(() => {
        if (!code.trim()) return '';

        // If it's HTML and already has DOCTYPE, use it as-is
        if (language.toLowerCase() === 'html' && code.trim().startsWith('<!DOCTYPE')) {
            // Inject theme class into existing HTML
            return code.replace('<html', `<html class="${theme}"`);
        }

        // If it's HTML but doesn't have DOCTYPE, wrap it
        if (language.toLowerCase() === 'html') {
            return `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        /* Light theme */
        .light body {
            background: radial-gradient(circle at top right, #f8fafc, #ffffff 70%);
            color: #0f172a;
        }
        
        /* Dark theme */
        .dark body {
            background: linear-gradient(135deg, #000000 0%, #0C1012 25%, #001a0d 50%, #0C1012 75%, #000000 100%);
            color: #f8fafc;
        }
        
        /* Default to light theme if no class */
        body {
            background: radial-gradient(circle at top right, #f8fafc, #ffffff 70%);
            color: #0f172a;
        }
        
        /* Professional scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(6, 236, 158, 0.1);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #06ec9e, #009454);
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 0 8px rgba(6, 236, 158, 0.4);
        }
        
        /* Selection styles */
        ::selection {
            background: rgba(6, 236, 158, 0.3);
            color: #0f172a;
        }
        
        .dark ::selection {
            background: rgba(6, 236, 158, 0.25);
            color: #f8fafc;
        }
    </style>
</head>
<body>
    ${code}
</body>
</html>`;
        }

        // For other frameworks, use the original logic
        const baseHTML = `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        /* Light theme */
        .light body {
            background: radial-gradient(circle at top right, #f8fafc, #ffffff 70%);
            color: #0f172a;
        }
        
        /* Dark theme */
        .dark body {
            background: linear-gradient(135deg, #000000 0%, #0C1012 25%, #001a0d 50%, #0C1012 75%, #000000 100%);
            color: #f8fafc;
        }
        
        /* Default to light theme if no class */
        body {
            background: radial-gradient(circle at top right, #f8fafc, #ffffff 70%);
            color: #0f172a;
        }
        
        /* Professional scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(6, 236, 158, 0.1);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #06ec9e, #009454);
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            box-shadow: 0 0 8px rgba(6, 236, 158, 0.4);
        }
        
        /* Selection styles */
        ::selection {
            background: rgba(6, 236, 158, 0.3);
            color: #0f172a;
        }
        
        .dark ::selection {
            background: rgba(6, 236, 158, 0.25);
            color: #f8fafc;
        }
    </style>
    ${framework === 'react' ? `
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    ` : ''}
    ${framework === 'vue' ? `
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    ` : ''}
    ${Object.entries(dependencies).map(([name, version]) =>
            `<script src="https://unpkg.com/${name}@${version}"></script>`
        ).join('\n')}
</head>
<body>
    <div id="app"></div>
    <script type="${framework === 'react' ? 'text/babel' : 'text/javascript'}">
        try {
            ${framework === 'react' ? `
            const { useState, useEffect, useRef } = React;
            const { createElement: h, Fragment } = React;
            ${code}
            ` : framework === 'vue' ? `
            const { createApp, ref, reactive, computed, onMounted } = Vue;
            ${code}
            ` : code}
        } catch (error) {
            document.body.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace;">Error: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;

        return baseHTML;
    }, [code, framework, dependencies, title, theme, language]);

    // Execute code and update preview
    const executeCode = useCallback(async () => {
        if (!code.trim()) return;

        setIsExecuting(true);
        setExecutionError(null);

        try {
            const content = generatePreviewContent();
            setPreviewContent(content);

            // Update iframe content
            if (iframeRef.current) {
                const iframe = iframeRef.current;
                iframe.srcdoc = content;
            }
        } catch (error) {
            setExecutionError(error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
            setIsExecuting(false);
        }
    }, [code]);

    // Copy code to clipboard
    const copyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }, [code]);

    // Download code as file
    const downloadCode = useCallback(() => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [code, title, language]);

    // Toggle preview visibility
    const togglePreview = useCallback(() => {
        const newVisibility = !isPreviewVisible;
        setIsPreviewVisible(newVisibility);
        onPreviewToggle?.(newVisibility);
    }, [isPreviewVisible, onPreviewToggle]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!allowFullscreen) return;
        setIsFullscreen(!isFullscreen);
    }, [allowFullscreen, isFullscreen]);

    // Reset preview
    const resetPreview = useCallback(() => {
        setExecutionError(null);
        executeCode();
    }, [executeCode]);

    // Execute code on mount and when code changes with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            executeCode();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [executeCode]);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const currentDim = PREVIEW_DIMENSIONS[currentDimension];

    return (
        <div className={`code-preview-container ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <Code2 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            {language.toUpperCase()}
                        </span>
                    </div>

                    {sandboxMode === 'strict' && (
                        <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                            <Shield className="w-3 h-3" />
                            <span>Sandboxed</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Framework indicator */}
                    {framework !== 'html' && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            {framework.toUpperCase()}
                        </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={togglePreview}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                        >
                            {isPreviewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={copyCode}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy Code"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {allowDownload && (
                            <button
                                onClick={downloadCode}
                                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Download Code"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={resetPreview}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Reset Preview"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

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
            </div>

            {/* Content */}
            <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : maxHeight }}>
                {/* Code Section */}
                <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700`}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source Code</span>
                            {isExecuting && (
                                <div className="flex items-center space-x-2 text-sm text-blue-600">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Executing...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
                        <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                            <code>{code}</code>
                        </pre>
                    </div>
                </div>

                {/* Preview Section */}
                {isPreviewVisible && (
                    <div className="w-1/2 flex flex-col">
                        {/* Preview Controls */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>

                                    {/* Device size selector */}
                                    <div className="flex items-center space-x-1 ml-4">
                                        {PREVIEW_DIMENSIONS.map((dim, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentDimension(index)}
                                                className={`p-1 rounded ${currentDimension === index
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                                    }`}
                                                title={dim.label}
                                            >
                                                {dim.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {currentDim.label} ({currentDim.width} × {currentDim.height})
                                    </span>

                                    <button
                                        onClick={() => window.open('data:text/html;charset=utf-8,' + encodeURIComponent(previewContent), '_blank')}
                                        className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                        title="Open in New Tab"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 relative bg-white dark:bg-gray-900">
                            {executionError ? (
                                <div className="p-4 text-red-600 dark:text-red-400">
                                    <div className="font-semibold mb-2">Execution Error:</div>
                                    <pre className="text-sm font-mono whitespace-pre-wrap">{executionError}</pre>
                                </div>
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                                    style={{
                                        maxWidth: currentDim.width,
                                        maxHeight: currentDim.height,
                                        margin: '0 auto'
                                    }}
                                >
                                    <iframe
                                        key={`${language}-${theme}-${sandboxMode}`}
                                        ref={iframeRef}
                                        className="w-full h-full border-0"
                                        sandbox={getSandboxAttributes()}
                                        title={`${title} Preview`}
                                        style={{
                                            width: currentDim.width,
                                            height: currentDim.height,
                                            maxWidth: '100%',
                                            maxHeight: '100%'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

CodePreview.displayName = 'CodePreview';

export default CodePreview;
