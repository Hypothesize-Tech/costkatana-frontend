import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface TerminalOutputProps {
    command?: string;
    output?: string;
    className?: string;
    showPrompt?: boolean;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({
    command = '',
    output = '',
    className = '',
    showPrompt = true
}) => {
    const [copied, setCopied] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);

    // Blinking cursor animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(prev => !prev);
        }, 530);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = async () => {
        try {
            const textToCopy = command + (output ? '\n' + output : '');
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            console.error('Failed to copy');
        }
    };

    const renderTerminalContent = () => {
        const prompt = 'user@cost-katana:~/project$ ';
        const lines = command.split('\n');
        const outputLines = output ? output.split('\n') : [];

        return (
            <div className="font-mono text-sm leading-relaxed">
                {/* Command lines with prompt */}
                {lines.map((line, index) => {
                    const isLastCommandLine = index === lines.length - 1 && !output;
                    return (
                        <div key={`cmd-${index}`} className="flex items-start">
                            {showPrompt && index === 0 && (
                                <span className="text-primary-500 select-none">{prompt}</span>
                            )}
                            {showPrompt && index > 0 && (
                                <span className="select-none" style={{ width: `${prompt.length}ch` }}></span>
                            )}
                            <span className="text-white flex-1">
                                {line}
                                {isLastCommandLine && (
                                    <span
                                        className="inline-block w-2 h-4 bg-primary-500 ml-0.5"
                                        style={{
                                            opacity: cursorVisible ? 1 : 0,
                                            transition: 'opacity 0.1s',
                                            verticalAlign: 'middle'
                                        }}
                                    />
                                )}
                            </span>
                        </div>
                    );
                })}

                {/* Output lines without prompt */}
                {outputLines.length > 0 && (
                    <div className="mt-1 text-gray-300">
                        {outputLines.map((line, index) => (
                            <div key={`out-${index}`} className="leading-relaxed">
                                {line || '\u00A0'}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Terminal Window */}
            <div className="overflow-hidden rounded-lg border border-gray-800 shadow-2xl bg-black">
                {/* Terminal Header - macOS style */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></div>
                    </div>
                    <div className="flex-1 text-center">
                        <span className="text-xs text-gray-400 font-medium">Terminal</span>
                    </div>
                    <div className="w-12"></div>
                </div>

                {/* Terminal Content */}
                <div className="relative bg-black p-4">
                    {renderTerminalContent()}

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg 
                                 opacity-0 group-hover:opacity-100 transition-all duration-200 
                                 backdrop-blur-sm border border-gray-700"
                        title="Copy command"
                    >
                        {copied ? (
                            <Check size={16} className="text-primary-500" />
                        ) : (
                            <Copy size={16} className="text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TerminalOutput;