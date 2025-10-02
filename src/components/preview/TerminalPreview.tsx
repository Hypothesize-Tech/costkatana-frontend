/**
 * TerminalPreview Component
 * 
 * Terminal-style preview for command-line code execution.
 * Simulates a real terminal environment with command history and output.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    Terminal,
    Copy,
    Download,
    Maximize2,
    Minimize2,
    Settings,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Folder
} from 'lucide-react';

interface TerminalPreviewProps {
    commands: string[];
    workingDirectory?: string;
    environment?: Record<string, string>;
    className?: string;
    showHistory?: boolean;
    showFileSystem?: boolean;
    autoExecute?: boolean;
    onCommandExecute?: (command: string, output: string) => void;
    onError?: (error: string) => void;
}

interface TerminalCommand {
    id: string;
    command: string;
    output: string;
    timestamp: Date;
    success: boolean;
    executionTime: number;
}

interface FileSystemNode {
    name: string;
    type: 'file' | 'directory';
    content?: string;
    children?: FileSystemNode[];
}

const DEFAULT_FILE_SYSTEM: FileSystemNode = {
    name: '/',
    type: 'directory',
    children: [
        {
            name: 'home',
            type: 'directory',
            children: [
                {
                    name: 'user',
                    type: 'directory',
                    children: [
                        {
                            name: 'projects',
                            type: 'directory',
                            children: [
                                { name: 'app.js', type: 'file', content: 'console.log("Hello World!");' },
                                { name: 'package.json', type: 'file', content: '{"name": "my-app", "version": "1.0.0"}' }
                            ]
                        },
                        { name: 'Documents', type: 'directory', children: [] },
                        { name: 'Downloads', type: 'directory', children: [] }
                    ]
                }
            ]
        },
        {
            name: 'usr',
            type: 'directory',
            children: [
                { name: 'bin', type: 'directory', children: [] },
                { name: 'lib', type: 'directory', children: [] }
            ]
        }
    ]
};

const COMMAND_HANDLERS: Record<string, (args: string[], fs: FileSystemNode, cwd: string) => { output: string; success: boolean }> = {
    ls: (args, fs, cwd) => {
        const path = args[0] || cwd;
        const node = findNodeByPath(fs, path);

        if (!node || node.type !== 'directory') {
            return { output: `ls: cannot access '${path}': No such file or directory`, success: false };
        }

        const items = node.children?.map(child =>
            `${child.type === 'directory' ? '📁' : '📄'} ${child.name}`
        ).join('\n') || '';

        return { output: items || 'Empty directory', success: true };
    },

    cd: (args, fs, cwd) => {
        const targetPath = args[0] || '/';
        const newPath = resolvePath(cwd, targetPath);
        const node = findNodeByPath(fs, newPath);

        if (!node || node.type !== 'directory') {
            return { output: `cd: ${targetPath}: No such file or directory`, success: false };
        }

        return { output: `Changed directory to ${newPath}`, success: true };
    },

    pwd: (args, fs, cwd) => {
        return { output: cwd, success: true };
    },

    cat: (args, fs, cwd) => {
        const filePath = args[0];
        if (!filePath) {
            return { output: 'cat: missing file operand', success: false };
        }

        const fullPath = resolvePath(cwd, filePath);
        const node = findNodeByPath(fs, fullPath);

        if (!node || node.type !== 'file') {
            return { output: `cat: ${filePath}: No such file or directory`, success: false };
        }

        return { output: node.content || '', success: true };
    },

    echo: (args, fs, cwd) => {
        return { output: args.join(' '), success: true };
    },

    whoami: (args, fs, cwd) => {
        return { output: 'user', success: true };
    },

    date: (args, fs, cwd) => {
        return { output: new Date().toString(), success: true };
    },

    help: (args, fs, cwd) => {
        const availableCommands = Object.keys(COMMAND_HANDLERS).join(', ');
        return { output: `Available commands: ${availableCommands}`, success: true };
    }
};

function findNodeByPath(fs: FileSystemNode, path: string): FileSystemNode | null {
    if (path === '/') return fs;

    const parts = path.split('/').filter(part => part.length > 0);
    let current = fs;

    for (const part of parts) {
        if (part === '..') {
            // Handle parent directory (simplified)
            continue;
        }

        const child = current.children?.find(c => c.name === part);
        if (!child) return null;
        current = child;
    }

    return current;
}

function resolvePath(cwd: string, path: string): string {
    if (path.startsWith('/')) return path;
    if (path === '..') return cwd.split('/').slice(0, -1).join('/') || '/';
    if (path === '.') return cwd;
    return cwd === '/' ? `/${path}` : `${cwd}/${path}`;
}

export const TerminalPreview: React.FC<TerminalPreviewProps> = React.memo(({
    commands = [],
    workingDirectory = '/home/user',
    environment = {},
    className = '',
    showHistory = true,
    showFileSystem = true,
    autoExecute = false,
    onCommandExecute,
    onError
}) => {
    const [currentDirectory, setCurrentDirectory] = useState(workingDirectory);
    const [commandHistory, setCommandHistory] = useState<TerminalCommand[]>([]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fileSystem] = useState<FileSystemNode>(DEFAULT_FILE_SYSTEM);
    const [copied, setCopied] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Execute command
    const executeCommand = useCallback(async (command: string) => {
        if (!command.trim()) return;

        const startTime = performance.now();
        setIsExecuting(true);

        try {
            const [cmd, ...args] = command.trim().split(' ');
            const handler = COMMAND_HANDLERS[cmd];

            let result: { output: string; success: boolean };

            if (handler) {
                result = handler(args, fileSystem, currentDirectory);

                // Handle directory changes
                if (cmd === 'cd' && result.success) {
                    const newPath = resolvePath(currentDirectory, args[0] || '/');
                    setCurrentDirectory(newPath);
                }
            } else {
                result = {
                    output: `Command not found: ${cmd}. Type 'help' for available commands.`,
                    success: false
                };
            }

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            const terminalCommand: TerminalCommand = {
                id: Date.now().toString(),
                command,
                output: result.output,
                timestamp: new Date(),
                success: result.success,
                executionTime
            };

            setCommandHistory(prev => [...prev, terminalCommand]);
            onCommandExecute?.(command, result.output);

            if (!result.success) {
                onError?.(result.output);
            }

        } catch (error) {
            const terminalCommand: TerminalCommand = {
                id: Date.now().toString(),
                command,
                output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date(),
                success: false,
                executionTime: 0
            };

            setCommandHistory(prev => [...prev, terminalCommand]);
            onError?.(terminalCommand.output);
        } finally {
            setIsExecuting(false);
        }
    }, [currentDirectory, fileSystem, onCommandExecute, onError]);

    // Handle command input
    const handleCommandSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCommand.trim() || isExecuting) return;

        executeCommand(currentCommand);
        setCurrentCommand('');
        setHistoryIndex(-1);
    }, [currentCommand, isExecuting, executeCommand]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[newIndex].command);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = historyIndex + 1;
                if (newIndex >= commandHistory.length) {
                    setHistoryIndex(-1);
                    setCurrentCommand('');
                } else {
                    setHistoryIndex(newIndex);
                    setCurrentCommand(commandHistory[newIndex].command);
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Simple tab completion (could be enhanced)
            const cmd = currentCommand.trim();
            const availableCommands = Object.keys(COMMAND_HANDLERS);
            const matches = availableCommands.filter(c => c.startsWith(cmd));
            if (matches.length === 1) {
                setCurrentCommand(matches[0] + ' ');
            }
        }
    }, [currentCommand, commandHistory, historyIndex]);

    // Copy command history
    const copyHistory = useCallback(async () => {
        const historyText = commandHistory.map(cmd =>
            `$ ${cmd.command}\n${cmd.output}\n`
        ).join('\n');

        try {
            await navigator.clipboard.writeText(historyText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy history:', error);
        }
    }, [commandHistory]);

    // Download command history
    const downloadHistory = useCallback(() => {
        const historyText = commandHistory.map(cmd =>
            `$ ${cmd.command}\n${cmd.output}\n`
        ).join('\n');

        const blob = new Blob([historyText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `terminal-history-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [commandHistory]);

    // Clear history
    const clearHistory = useCallback(() => {
        setCommandHistory([]);
    }, []);

    // Auto-execute commands on mount
    useEffect(() => {
        if (autoExecute && commands.length > 0) {
            const executeCommands = async () => {
                for (const command of commands) {
                    await executeCommand(command);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                }
            };
            executeCommands();
        }
    }, [autoExecute, commands, executeCommand]);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Scroll to bottom when new commands are added
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [commandHistory]);

    return (
        <div className={`terminal-preview-container ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-5 h-5 text-green-400" />
                        <h3 className="font-semibold">Terminal Preview</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-green-900 text-green-200 rounded-full">
                            {currentDirectory}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={copyHistory}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Copy History"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={downloadHistory}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Download History"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button
                            onClick={clearHistory}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Clear History"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 bg-gray-800 border-b border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Working Directory</label>
                            <input
                                type="text"
                                value={currentDirectory}
                                onChange={(e) => setCurrentDirectory(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Environment Variables</label>
                            <div className="space-y-2">
                                {Object.entries(environment).map(([key, value]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">{key}=</span>
                                        <span className="text-sm text-green-400">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Statistics</label>
                            <div className="space-y-1 text-sm text-gray-400">
                                <div>Commands executed: {commandHistory.length}</div>
                                <div>Success rate: {commandHistory.length > 0 ?
                                    `${Math.round((commandHistory.filter(c => c.success).length / commandHistory.length) * 100)}%` :
                                    '0%'
                                }</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '500px' }}>
                {/* Terminal Section */}
                <div className={`${showFileSystem ? 'w-2/3' : 'w-full'} flex flex-col`}>
                    {/* Terminal Output */}
                    <div
                        ref={terminalRef}
                        className="flex-1 bg-black text-green-400 p-4 overflow-y-auto font-mono text-sm"
                        style={{ height: 'calc(100% - 60px)' }}
                    >
                        {commandHistory.length === 0 ? (
                            <div className="text-gray-500">
                                <div>Welcome to Terminal Preview</div>
                                <div>Type 'help' for available commands</div>
                                <div className="mt-4">
                                    <div className="text-green-400">Available commands:</div>
                                    <div className="ml-4 mt-2">
                                        {Object.keys(COMMAND_HANDLERS).map(cmd => (
                                            <div key={cmd} className="text-gray-400">• {cmd}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            commandHistory.map((cmd) => (
                                <div key={cmd.id} className="mb-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-green-400">$</span>
                                        <span className="text-white">{cmd.command}</span>
                                        <span className="text-gray-500 text-xs">
                                            {cmd.executionTime.toFixed(2)}ms
                                        </span>
                                        {cmd.success ? (
                                            <CheckCircle className="w-3 h-3 text-green-400" />
                                        ) : (
                                            <AlertTriangle className="w-3 h-3 text-red-400" />
                                        )}
                                    </div>
                                    <div className={`ml-4 whitespace-pre-wrap ${cmd.success ? 'text-gray-300' : 'text-red-400'
                                        }`}>
                                        {cmd.output}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Command Input */}
                    <div className="bg-gray-900 border-t border-gray-700 p-4">
                        <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2">
                            <span className="text-green-400 font-mono">$</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={currentCommand}
                                onChange={(e) => setCurrentCommand(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent text-white font-mono focus:outline-none"
                                placeholder="Enter command..."
                                disabled={isExecuting}
                            />
                            {isExecuting && (
                                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                            )}
                        </form>
                    </div>
                </div>

                {/* File System Panel */}
                {showFileSystem && (
                    <div className="w-1/3 border-l border-gray-700 bg-gray-900">
                        <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center space-x-2">
                                <Folder className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-gray-300">File System</span>
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
                            <div className="space-y-1 text-sm">
                                {renderFileSystem(fileSystem, 0)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

TerminalPreview.displayName = 'TerminalPreview';

// Helper function to render file system tree
function renderFileSystem(node: FileSystemNode, depth: number): React.ReactNode {
    const indent = '  '.repeat(depth);
    const icon = node.type === 'directory' ? '📁' : '📄';

    return (
        <div key={node.name}>
            <div className="text-gray-300 hover:text-white cursor-pointer">
                {indent}{icon} {node.name}
            </div>
            {node.children && node.children.map(child =>
                renderFileSystem(child, depth + 1)
            )}
        </div>
    );
}

export default TerminalPreview;
