/**
 * PreviewRenderer Component
 * 
 * Main component that intelligently detects and renders appropriate previews
 * for different types of code content, similar to Claude, ChatGPT, and Gemini.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    Code2,
    Eye,
    EyeOff,
    Maximize2,
    Minimize2,
    Copy,
    Download,
    Terminal,
    Layers,
    Zap,
    Shield,
    CheckCircle
} from 'lucide-react';

// Import preview components
import CodePreview from './CodePreview';
import LivePreview from './LivePreview';
import TerminalPreview from './TerminalPreview';

interface PreviewRendererProps {
    content: string;
    language?: string;
    className?: string;
    showPreview?: boolean;
    onPreviewToggle?: (show: boolean) => void;
    maxHeight?: string;
    allowFullscreen?: boolean;
    allowDownload?: boolean;
    sandboxMode?: 'strict' | 'moderate' | 'permissive';
    theme?: 'light' | 'dark' | 'auto';
}

interface CodeBlock {
    type: 'html' | 'javascript' | 'react' | 'vue' | 'angular' | 'svelte' | 'terminal' | 'bash' | 'shell' | 'css' | 'scss' | 'json' | 'yaml' | 'xml' | 'sql' | 'python' | 'java' | 'cpp' | 'csharp' | 'go' | 'rust' | 'php' | 'ruby' | 'swift' | 'kotlin' | 'typescript' | 'jsx' | 'tsx' | 'vue' | 'svelte' | 'other';
    content: string;
    language: string;
    startLine: number;
    endLine: number;
    hasPreview: boolean;
    framework?: string;
    dependencies?: Record<string, string>;
}

interface PreviewConfig {
    type: 'code' | 'live' | 'framework' | 'terminal';
    component: React.ComponentType<any>;
    props: any;
    icon: React.ReactNode;
    label: string;
    description: string;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = React.memo(({
    content,
    language = 'javascript',
    className = '',
    showPreview = true,
    onPreviewToggle,
    maxHeight = '500px',
    allowFullscreen = true,
    allowDownload = true,
    sandboxMode = 'strict',
    theme = 'auto'
}) => {
    const [selectedPreview, setSelectedPreview] = useState<string>('auto');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Parse content to detect code blocks
    const codeBlocks = useMemo(() => {
        const blocks: CodeBlock[] = [];
        const lines = content.split('\n');
        let currentBlock: Partial<CodeBlock> | null = null;
        let lineNumber = 0;

        for (const line of lines) {
            lineNumber++;

            // Detect code block start
            if (line.startsWith('```')) {
                const lang = line.slice(3).trim();
                if (currentBlock) {
                    // End current block
                    if (currentBlock.content) {
                        blocks.push({
                            type: detectCodeType(lang),
                            content: currentBlock.content,
                            language: lang,
                            startLine: currentBlock.startLine || 0,
                            endLine: lineNumber - 1,
                            hasPreview: hasPreviewCapability(lang),
                            framework: detectFramework(lang),
                            dependencies: getFrameworkDependencies(lang)
                        });
                    }
                    currentBlock = null;
                } else {
                    // Start new block
                    currentBlock = {
                        content: '',
                        startLine: lineNumber,
                        language: lang
                    };
                }
            } else if (currentBlock) {
                // Add line to current block
                currentBlock.content += (currentBlock.content ? '\n' : '') + line;
            }
        }

        // Handle unclosed block
        if (currentBlock && currentBlock.content) {
            blocks.push({
                type: detectCodeType(currentBlock.language || ''),
                content: currentBlock.content,
                language: currentBlock.language || '',
                startLine: currentBlock.startLine || 0,
                endLine: lineNumber,
                hasPreview: hasPreviewCapability(currentBlock.language || ''),
                framework: detectFramework(currentBlock.language || ''),
                dependencies: getFrameworkDependencies(currentBlock.language || '')
            });
        }

        return blocks;
    }, [content]);

    // Detect code type based on language
    const detectCodeType = (lang: string): CodeBlock['type'] => {
        const langMap: Record<string, CodeBlock['type']> = {
            'html': 'html',
            'javascript': 'javascript',
            'js': 'javascript',
            'typescript': 'typescript',
            'ts': 'typescript',
            'jsx': 'jsx',
            'tsx': 'tsx',
            'react': 'react',
            'vue': 'vue',
            'angular': 'angular',
            'svelte': 'svelte',
            'terminal': 'terminal',
            'bash': 'bash',
            'shell': 'shell',
            'sh': 'shell',
            'css': 'css',
            'scss': 'scss',
            'json': 'json',
            'yaml': 'yaml',
            'yml': 'yaml',
            'xml': 'xml',
            'sql': 'sql',
            'python': 'python',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c++': 'cpp',
            'csharp': 'csharp',
            'c#': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'php': 'php',
            'ruby': 'ruby',
            'swift': 'swift',
            'kotlin': 'kotlin'
        };

        return langMap[lang.toLowerCase()] || 'other';
    };

    // Check if language has preview capability
    const hasPreviewCapability = (lang: string): boolean => {
        const previewableTypes: CodeBlock['type'][] = [
            'html', 'javascript', 'react', 'vue', 'angular', 'svelte',
            'terminal', 'bash', 'shell', 'css', 'scss', 'jsx', 'tsx'
        ];

        const type = detectCodeType(lang);
        return previewableTypes.includes(type);
    };

    // Detect framework from language
    const detectFramework = (lang: string): string | undefined => {
        const frameworkMap: Record<string, string> = {
            'react': 'react',
            'jsx': 'react',
            'tsx': 'react',
            'vue': 'vue',
            'angular': 'angular',
            'svelte': 'svelte'
        };

        return frameworkMap[lang.toLowerCase()];
    };

    // Get framework dependencies
    const getFrameworkDependencies = (lang: string): Record<string, string> => {
        const framework = detectFramework(lang);
        const dependencyMap: Record<string, Record<string, string>> = {
            'react': {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
            },
            'vue': {
                'vue': '^3.3.0'
            },
            'angular': {
                '@angular/core': '^16.0.0',
                '@angular/platform-browser': '^16.0.0'
            },
            'svelte': {
                'svelte': '^3.59.0'
            }
        };

        return dependencyMap[framework || ''] || {};
    };

    // Get preview configuration for a code block
    const getPreviewConfig = (block: CodeBlock): PreviewConfig | null => {
        if (!block.hasPreview) return null;

        const configs: Record<string, PreviewConfig> = {
            // HTML/JavaScript previews
            html: {
                type: 'code',
                component: CodePreview,
                props: {
                    code: block.content,
                    language: block.language,
                    framework: 'html',
                    sandboxMode,
                    theme,
                    allowFullscreen,
                    allowDownload
                },
                icon: <Code2 className="w-4 h-4" />,
                label: 'HTML Preview',
                description: 'Static HTML preview with CSS and JavaScript'
            },

            javascript: {
                type: 'code',
                component: CodePreview,
                props: {
                    code: block.content,
                    language: block.language,
                    framework: 'html',
                    sandboxMode,
                    theme,
                    allowFullscreen,
                    allowDownload
                },
                icon: <Code2 className="w-4 h-4" />,
                label: 'JavaScript Preview',
                description: 'Interactive JavaScript preview'
            },

            // Live previews for frameworks
            react: {
                type: 'live',
                component: LivePreview,
                props: {
                    code: block.content,
                    language: block.language,
                    framework: 'react',
                    dependencies: block.dependencies,
                    autoRun: true,
                    showEditor: true,
                    showPreview: true
                },
                icon: <Zap className="w-4 h-4" />,
                label: 'React Live Preview',
                description: 'Live React component with hot reload'
            },

            vue: {
                type: 'live',
                component: LivePreview,
                props: {
                    code: block.content,
                    language: block.language,
                    framework: 'vue',
                    dependencies: block.dependencies,
                    autoRun: true,
                    showEditor: true,
                    showPreview: true
                },
                icon: <Zap className="w-4 h-4" />,
                label: 'Vue Live Preview',
                description: 'Live Vue component with reactivity'
            },

            // Framework-specific previews
            angular: {
                type: 'live',
                component: LivePreview,
                props: {
                    initialCode: block.content,
                    language: 'javascript',
                    framework: 'angular',
                    autoRun: true,
                    showEditor: true,
                    showPreview: true
                },
                icon: <Layers className="w-4 h-4" />,
                label: 'Angular Live Preview',
                description: 'Live Angular component preview'
            },

            svelte: {
                type: 'live',
                component: LivePreview,
                props: {
                    initialCode: block.content,
                    language: 'javascript',
                    framework: 'svelte',
                    autoRun: true,
                    showEditor: true,
                    showPreview: true
                },
                icon: <Layers className="w-4 h-4" />,
                label: 'Svelte Live Preview',
                description: 'Live Svelte component preview'
            },

            // Terminal previews
            terminal: {
                type: 'terminal',
                component: TerminalPreview,
                props: {
                    commands: block.content.split('\n').filter(line => line.trim()),
                    showHistory: true,
                    showFileSystem: true,
                    autoExecute: true
                },
                icon: <Terminal className="w-4 h-4" />,
                label: 'Terminal Preview',
                description: 'Interactive terminal with command execution'
            },

            bash: {
                type: 'terminal',
                component: TerminalPreview,
                props: {
                    commands: block.content.split('\n').filter(line => line.trim()),
                    showHistory: true,
                    showFileSystem: true,
                    autoExecute: true
                },
                icon: <Terminal className="w-4 h-4" />,
                label: 'Bash Terminal',
                description: 'Bash command execution environment'
            },

            shell: {
                type: 'terminal',
                component: TerminalPreview,
                props: {
                    commands: block.content.split('\n').filter(line => line.trim()),
                    showHistory: true,
                    showFileSystem: true,
                    autoExecute: true
                },
                icon: <Terminal className="w-4 h-4" />,
                label: 'Shell Terminal',
                description: 'Shell command execution environment'
            }
        };

        return configs[block.type] || configs.html;
    };

    // Copy content to clipboard
    const copyContent = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy content:', error);
        }
    }, [content]);

    // Download content
    const downloadContent = useCallback(() => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `preview-content-${Date.now()}.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [content, language]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    // Get the best preview for the content
    const bestPreview = useMemo(() => {
        if (codeBlocks.length === 0) return null;

        // Find the first block with preview capability
        const previewableBlock = codeBlocks.find(block => block.hasPreview);
        if (!previewableBlock) return null;

        return getPreviewConfig(previewableBlock);
    }, [codeBlocks]);

    if (!showPreview || !bestPreview) {
        return (
            <div className={`preview-renderer ${className}`}>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Code2 className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">No preview available</span>
                        </div>
                        <button
                            onClick={() => onPreviewToggle?.(!showPreview)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const PreviewComponent = bestPreview.component;

    return (
        <div className={`preview-renderer ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        {bestPreview.icon}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{bestPreview.label}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            {bestPreview.type.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {bestPreview.description}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Security indicator */}
                    {sandboxMode === 'strict' && (
                        <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                            <Shield className="w-3 h-3" />
                            <span>Sandboxed</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={copyContent}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy Content"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {allowDownload && (
                            <button
                                onClick={downloadContent}
                                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Download Content"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={() => onPreviewToggle?.(!showPreview)}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={showPreview ? 'Hide Preview' : 'Show Preview'}
                        >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            {/* Preview Content */}
            <div style={{ height: isFullscreen ? 'calc(100vh - 80px)' : maxHeight }}>
                <PreviewComponent {...bestPreview.props} />
            </div>
        </div>
    );
});

PreviewRenderer.displayName = 'PreviewRenderer';

export default PreviewRenderer;
