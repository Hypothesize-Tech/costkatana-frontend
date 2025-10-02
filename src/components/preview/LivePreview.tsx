/**
 * LivePreview Component
 * 
 * Real-time code execution with live editing capabilities.
 * Supports multiple frameworks and provides instant feedback.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    Play,
    Monitor,
    Smartphone,
    Tablet,
    Zap,
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Copy,
    ExternalLink,
    Maximize2,
    Minimize2
} from 'lucide-react';

interface LivePreviewProps {
    initialCode?: string;
    language?: string;
    framework?: 'html' | 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
    dependencies?: Record<string, string>;
    autoRun?: boolean;
    showEditor?: boolean;
    showPreview?: boolean;
    className?: string;
    onCodeChange?: (code: string) => void;
    onExecutionComplete?: (result: any) => void;
    onError?: (error: Error) => void;
}

interface ExecutionResult {
    success: boolean;
    output?: string;
    error?: string;
    executionTime: number;
    timestamp: Date;
}

const FRAMEWORK_TEMPLATES: Record<string, string> = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
        }
    </style>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Start editing to see live changes.</p>
</body>
</html>`,

    react: `import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Live Preview</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`,

    vue: `const { createApp, ref } = Vue;

const App = {
  setup() {
    const count = ref(0);
    
    return {
      count,
      increment: () => count.value++
    };
  },
  template: \`
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Vue Live Preview</h1>
      <p>Count: {{ count }}</p>
      <button 
        @click="increment"
        style="padding: 10px 20px; background-color: #42b883; color: white; border: none; border-radius: 5px; cursor: pointer;"
      >
        Increment
      </button>
    </div>
  \`
};

createApp(App).mount('#app');`,

    vanilla: `// Vanilla JavaScript Live Preview
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('app');
  
  container.innerHTML = \`
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Vanilla JS Live Preview</h1>
      <p id="counter">Count: 0</p>
      <button id="btn" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Increment
      </button>
    </div>
  \`;
  
  let count = 0;
  const counter = document.getElementById('counter');
  const btn = document.getElementById('btn');
  
  btn.addEventListener('click', () => {
    count++;
    counter.textContent = \`Count: \${count}\`;
  });
});`
};

export const LivePreview: React.FC<LivePreviewProps> = React.memo(({
    initialCode,
    language = 'javascript',
    framework = 'html',
    dependencies = {},
    autoRun = true,
    showEditor = true,
    showPreview = true,
    className = '',
    onCodeChange,
    onExecutionComplete,
    onError
}) => {
    const [code, setCode] = useState(initialCode || FRAMEWORK_TEMPLATES[framework]);
    const [isRunning, setIsRunning] = useState(false);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
    const [autoSave, setAutoSave] = useState(true);
    const [copied, setCopied] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const executionTimeoutRef = useRef<number>();

    // Device configurations
    const deviceConfigs = {
        desktop: { width: '100%', height: '600px', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
        tablet: { width: '768px', height: '1024px', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
        mobile: { width: '375px', height: '667px', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> }
    };

    // Generate HTML content for iframe
    const generateHTMLContent = useCallback(() => {
        const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #000000;
            line-height: 1.6;
        }
        * {
            box-sizing: border-box;
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
    <div id="root"></div>
    <script type="${framework === 'react' ? 'text/babel' : 'text/javascript'}">
        try {
            ${code}
        } catch (error) {
            document.body.innerHTML = '<div style="color: #ef4444; padding: 20px; font-family: monospace; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px;">Error: ' + error.message + '</div>';
            console.error('Execution error:', error);
        }
    </script>
</body>
</html>`;

        return baseHTML;
    }, [code, framework, dependencies]);

    // Execute code with performance monitoring
    const executeCode = useCallback(async () => {
        if (!code.trim()) return;

        const startTime = performance.now();
        setIsRunning(true);
        setExecutionResult(null);

        try {
            const htmlContent = generateHTMLContent();

            if (iframeRef.current) {
                iframeRef.current.srcdoc = htmlContent;
            }

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            const result: ExecutionResult = {
                success: true,
                output: 'Code executed successfully',
                executionTime,
                timestamp: new Date()
            };

            setExecutionResult(result);
            setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 executions
            onExecutionComplete?.(result);

        } catch (error) {
            const endTime = performance.now();
            const executionTime = endTime - startTime;

            const result: ExecutionResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                executionTime,
                timestamp: new Date()
            };

            setExecutionResult(result);
            setExecutionHistory(prev => [result, ...prev.slice(0, 9)]);
            onError?.(error instanceof Error ? error : new Error('Unknown error'));

        } finally {
            setIsRunning(false);
        }
    }, [code, generateHTMLContent, onExecutionComplete, onError]);

    // Handle code changes with debouncing
    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode);
        onCodeChange?.(newCode);

        if (autoRun) {
            // Clear existing timeout
            if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
            }

            // Set new timeout for auto-execution
            executionTimeoutRef.current = setTimeout(() => {
                executeCode();
            }, 1000); // 1 second debounce
        }
    }, [autoRun, executeCode, onCodeChange]);

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

    // Download code
    const downloadCode = useCallback(() => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `live-preview-${Date.now()}.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [code, language]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    // Auto-execute on mount if enabled
    useEffect(() => {
        if (autoRun && code) {
            executeCode();
        }
    }, [autoRun, executeCode, code]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current);
            }
        };
    }, []);

    const currentDeviceConfig = deviceConfigs[currentDevice];

    return (
        <div className={`live-preview-container ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            {framework.toUpperCase()}
                        </span>
                        {autoRun && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                AUTO
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Device selector */}
                    <div className="flex items-center space-x-1">
                        {Object.entries(deviceConfigs).map(([device, config]) => (
                            <button
                                key={device}
                                onClick={() => setCurrentDevice(device as any)}
                                className={`p-2 rounded-lg ${currentDevice === device
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                                title={config.label}
                            >
                                {config.icon}
                            </button>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={executeCode}
                            disabled={isRunning}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Run Code"
                        >
                            {isRunning ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            onClick={copyCode}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy Code"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={downloadCode}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download Code"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '600px' }}>
                {/* Editor Section */}
                {showEditor && (
                    <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700`}>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Editor</span>
                                <div className="flex items-center space-x-2">
                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={autoRun}
                                            onChange={(e) => setAutoSave(e.target.checked)}
                                            className="rounded"
                                        />
                                        <span>Auto-run</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 h-full">
                            <textarea
                                ref={editorRef}
                                value={code}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                className="w-full h-full p-4 font-mono text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your code here..."
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}

                {/* Preview Section */}
                {showPreview && (
                    <div className="w-1/2 flex flex-col">
                        {/* Preview Header */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</span>
                                    {executionResult && (
                                        <div className="flex items-center space-x-2 text-xs">
                                            {executionResult.success ? (
                                                <div className="flex items-center space-x-1 text-green-600">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Success</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1 text-red-600">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>Error</span>
                                                </div>
                                            )}
                                            <span className="text-gray-500">
                                                {executionResult.executionTime.toFixed(2)}ms
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {currentDeviceConfig.label}
                                    </span>

                                    <button
                                        onClick={() => window.open('data:text/html;charset=utf-8,' + encodeURIComponent(generateHTMLContent()), '_blank')}
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
                            <div
                                className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                                style={{
                                    maxWidth: currentDeviceConfig.width,
                                    maxHeight: currentDeviceConfig.height,
                                    margin: '0 auto'
                                }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts allow-same-origin"
                                    title="Live Preview"
                                    style={{
                                        width: currentDeviceConfig.width,
                                        height: currentDeviceConfig.height,
                                        maxWidth: '100%',
                                        maxHeight: '100%'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Execution History */}
            {executionHistory.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Execution History</span>
                        <button
                            onClick={() => setExecutionHistory([])}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                        {executionHistory.map((result, index) => (
                            <div
                                key={index}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs ${result.success
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}
                            >
                                {result.success ? (
                                    <CheckCircle className="w-3 h-3" />
                                ) : (
                                    <AlertTriangle className="w-3 h-3" />
                                )}
                                <span>{result.executionTime.toFixed(0)}ms</span>
                                <Clock className="w-3 h-3" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

LivePreview.displayName = 'LivePreview';

export default LivePreview;
