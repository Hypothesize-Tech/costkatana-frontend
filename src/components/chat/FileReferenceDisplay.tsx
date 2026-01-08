/**
 * File Reference Component
 * Displays file reference information for large responses
 * Matches Cost Katana theme with glass morphism and primary colors
 */

import React, { useState } from 'react';
import {
    FolderIcon,
    DocumentTextIcon,
    FolderOpenIcon,
    ClipboardDocumentIcon,
    LightBulbIcon,
    WrenchScrewdriverIcon,
    ClockIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface FileReferenceProps {
    fileReference: {
        type: 'file_reference';
        path: string;
        relativePath: string;
        size: number;
        summary?: string;
        instructions?: string;
        metadata?: {
            toolName?: string;
            userId?: string;
            requestId?: string;
            createdAt: Date;
        };
    };
}

export const FileReferenceDisplay: React.FC<FileReferenceProps> = ({ fileReference }) => {
    const [expanded, setExpanded] = useState(false);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const copyPathToClipboard = () => {
        navigator.clipboard.writeText(fileReference.path);
    };

    return (
        <div className="glass backdrop-blur-xl border border-primary-200/30 rounded-2xl p-4 mt-3 shadow-xl bg-gradient-to-br from-white/80 to-white/50 dark:from-dark-card/80 dark:to-dark-card/50 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg glow-primary">
                        <FolderIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="font-display font-bold text-sm text-light-text-primary dark:text-dark-text-primary">
                            Large Response Stored in File
                        </div>
                        <div className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                            {formatFileSize(fileReference.size)} • {fileReference.relativePath}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="px-3 py-1.5 glass backdrop-blur-xl border border-primary-200/30 rounded-lg text-xs font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 hover:border-primary-400/50 transition-all duration-300 shadow-md"
                >
                    {expanded ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {/* Summary */}
            {fileReference.summary && (
                <div className="glass backdrop-blur-xl border border-primary-200/20 rounded-xl p-3 mb-3 bg-gradient-to-br from-primary-50/30 to-primary-100/20 dark:from-primary-900/10 dark:to-primary-800/5 shadow-sm">
                    <div className="font-display font-semibold text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1.5 flex items-center gap-1.5">
                        <DocumentTextIcon className="w-4 h-4 text-primary-500" />
                        <span>Summary:</span>
                    </div>
                    <div className="text-sm font-body text-light-text-primary dark:text-dark-text-primary leading-relaxed">
                        {fileReference.summary}
                    </div>
                </div>
            )}

            {/* Expanded Details */}
            {expanded && (
                <div className="mt-3 space-y-3 animate-fade-in">
                    {/* File Path */}
                    <div className="glass backdrop-blur-xl border border-primary-200/20 rounded-xl p-3 bg-white/50 dark:bg-dark-card/50 shadow-sm">
                        <div className="font-display font-semibold text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 flex items-center gap-1.5">
                            <FolderOpenIcon className="w-4 h-4 text-primary-500" />
                            <span>File Path:</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-primary-200/20">
                            <code className="flex-1 font-mono text-xs text-primary-600 dark:text-primary-400 break-all">
                                {fileReference.path}
                            </code>
                            <button
                                onClick={copyPathToClipboard}
                                className="px-2 py-1 glass backdrop-blur-xl border border-primary-200/30 rounded-md text-[10px] font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 hover:border-primary-400/50 transition-all duration-300 flex-shrink-0 flex items-center gap-1"
                                title="Copy path"
                            >
                                <ClipboardDocumentIcon className="w-3 h-3" />
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>

                    {/* Instructions */}
                    {fileReference.instructions && (
                        <div className="glass backdrop-blur-xl border border-primary-300/30 rounded-xl p-3 bg-gradient-to-br from-primary-50/40 to-primary-100/20 dark:from-primary-900/20 dark:to-primary-800/10 shadow-sm">
                            <div className="font-display font-semibold text-xs text-primary-700 dark:text-primary-300 mb-2 flex items-center gap-1.5">
                                <LightBulbIcon className="w-4 h-4" />
                                <span>How to access:</span>
                            </div>
                            <pre className="font-mono text-[11px] text-primary-800 dark:text-primary-200 whitespace-pre-wrap break-words leading-relaxed">
                                {fileReference.instructions}
                            </pre>
                        </div>
                    )}

                    {/* Metadata */}
                    {fileReference.metadata && (
                        <div className="pt-2 border-t border-primary-200/30">
                            <div className="flex items-center gap-4 text-[11px] font-body text-light-text-secondary dark:text-dark-text-secondary">
                                {fileReference.metadata.toolName && (
                                    <div className="flex items-center gap-1.5">
                                        <WrenchScrewdriverIcon className="w-3.5 h-3.5 text-primary-500" />
                                        <span>Tool: <span className="font-mono text-primary-600 dark:text-primary-400">{fileReference.metadata.toolName}</span></span>
                                    </div>
                                )}
                                {fileReference.metadata.createdAt && (
                                    <div className="flex items-center gap-1.5">
                                        <ClockIcon className="w-3.5 h-3.5 text-primary-500" />
                                        <span>Created: {new Date(fileReference.metadata.createdAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Warning Notice */}
            <div className="mt-3 p-2.5 glass backdrop-blur-xl border border-yellow-300/30 rounded-lg bg-gradient-to-r from-yellow-50/40 to-amber-50/40 dark:from-yellow-900/10 dark:to-amber-900/10 shadow-sm">
                <div className="text-[11px] font-body text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                    <span>This file is stored in container ephemeral storage and will be automatically cleaned up after 24 hours</span>
                </div>
            </div>
        </div>
    );
};
