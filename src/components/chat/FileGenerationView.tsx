import React from 'react';
import {
    DocumentIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    FolderOpenIcon,
    CodeBracketIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface FileGenerationProgress {
    phase: 'planning' | 'structure_complete' | 'generating_file' | 'file_committed' | 'file_complete' | 'file_error' | 'complete' | 'error';
    message: string;
    totalFiles?: number;
    completedFiles?: number;
    currentFile?: string;
    progress?: number;
    repositories?: string[];
    githubUrl?: string;
    error?: string;
}

interface FileGenerationViewProps {
    progress: FileGenerationProgress;
    files?: Array<{
        path: string;
        status: 'pending' | 'generating' | 'complete' | 'error';
        githubUrl?: string;
        error?: string;
    }>;
}

export const FileGenerationView: React.FC<FileGenerationViewProps> = ({ progress, files = [] }) => {
    const getPhaseIcon = () => {
        switch (progress.phase) {
            case 'planning':
                return <ArrowPathIcon className="w-5 h-5 animate-spin text-green-500" />;
            case 'structure_complete':
                return <FolderOpenIcon className="w-5 h-5 text-green-500" />;
            case 'generating_file':
                return <CodeBracketIcon className="w-5 h-5 animate-pulse text-green-400" />;
            case 'file_committed':
            case 'file_complete':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'file_error':
            case 'error':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'complete':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            default:
                return <DocumentIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPhaseLabel = () => {
        switch (progress.phase) {
            case 'planning':
                return 'Planning File Structure';
            case 'structure_complete':
                return 'Structure Ready';
            case 'generating_file':
                return 'Generating Files';
            case 'file_committed':
                return 'Committing to GitHub';
            case 'file_complete':
                return 'Files Generated';
            case 'complete':
                return 'Generation Complete';
            case 'error':
            case 'file_error':
                return 'Generation Error';
            default:
                return 'Processing';
        }
    };

    const getProgressBarColor = () => {
        if (progress.phase === 'error' || progress.phase === 'file_error') return 'bg-red-500';
        if (progress.phase === 'complete') return 'bg-green-500';
        if (progress.phase === 'generating_file') return 'bg-green-500';
        return 'bg-green-600';
    };

    return (
        <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 shadow-sm backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        {getPhaseIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-bold text-gray-900 dark:text-green-100">
                            Code Generation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-green-300">
                            {getPhaseLabel()}
                        </p>
                    </div>
                </div>
                {progress.progress !== undefined && (
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-green-500">
                            {progress.progress}%
                        </span>
                    </div>
                )}
            </div>

            {/* Status Message */}
            <div className="rounded-lg bg-gray-50 dark:bg-black/60 border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-green-300">
                    {progress.message}
                </p>
            </div>

            {/* Progress Bar */}
            {progress.totalFiles && progress.totalFiles > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-600 dark:text-green-300">
                            Generation Progress
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-green-100">
                            {progress.completedFiles || 0} / {progress.totalFiles} files
                        </span>
                    </div>
                    <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${getProgressBarColor()} relative overflow-hidden`}
                            style={{
                                width: `${progress.totalFiles > 0
                                    ? ((progress.completedFiles || 0) / progress.totalFiles) * 100
                                    : 0
                                    }%`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Current File */}
            {progress.currentFile && (
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-800/10 border border-green-200 dark:border-green-800 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <CodeBracketIcon className="w-5 h-5 text-green-500 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                Currently Generating
                            </p>
                            <p className="text-sm font-mono font-semibold text-green-900 dark:text-green-100 truncate">
                                {progress.currentFile}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Repositories */}
            {progress.repositories && progress.repositories.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-display font-semibold text-gray-900 dark:text-green-100 flex items-center gap-2">
                        <FolderOpenIcon className="w-4 h-4 text-green-500" />
                        Target Repositories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {progress.repositories.map((repo, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                            >
                                {repo}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-display font-semibold text-gray-900 dark:text-green-100 flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4 text-gray-500" />
                        Generated Files
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-black/80 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        {file.status === 'complete' ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                        ) : file.status === 'error' ? (
                                            <XCircleIcon className="w-5 h-5 text-red-500" />
                                        ) : file.status === 'generating' ? (
                                            <ArrowPathIcon className="w-5 h-5 text-green-500 animate-spin" />
                                        ) : (
                                            <DocumentIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-mono truncate ${file.status === 'complete' ? 'text-gray-900 dark:text-green-100 font-medium' :
                                            file.status === 'error' ? 'text-red-700 dark:text-red-400' :
                                                file.status === 'generating' ? 'text-green-700 dark:text-green-400 font-medium' :
                                                    'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {file.path}
                                        </p>
                                        {file.error && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{file.error}</p>
                                        )}
                                    </div>
                                </div>
                                {file.githubUrl && (
                                    <a
                                        href={file.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-3 flex-shrink-0 text-xs font-medium text-green-500 hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100 underline"
                                    >
                                        View
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {progress.error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4">
                    <div className="flex items-start space-x-3">
                        <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                                Generation Error
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-400">
                                {progress.error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {progress.phase === 'complete' && (
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-800/10 border border-green-200 dark:border-green-800 p-4">
                    <div className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                                Generation Complete
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Successfully generated {progress.completedFiles} file{(progress.completedFiles || 0) !== 1 ? 's' : ''} and committed to GitHub
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};