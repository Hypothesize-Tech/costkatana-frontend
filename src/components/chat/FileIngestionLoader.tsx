import React, { useEffect, useState } from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface FileIngestionProgress {
    uploadId: string;
    fileName: string;
    progress: number;
    stage: string;
    message: string;
    totalChunks?: number;
    processedChunks?: number;
}

interface FileIngestionLoaderProps {
    uploadId: string;
    fileName: string;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

export const FileIngestionLoader: React.FC<FileIngestionLoaderProps> = ({
    uploadId,
    fileName,
    onComplete,
    onError
}) => {
    const [progress, setProgress] = useState<FileIngestionProgress>({
        uploadId,
        fileName,
        progress: 0,
        stage: 'connecting',
        message: 'Connecting to server...'
    });

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const url = token
            ? `${apiUrl}/api/ingestion/upload-progress/${uploadId}?token=${token}`
            : `${apiUrl}/api/ingestion/upload-progress/${uploadId}`;

        let eventSource: EventSource | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;
        let reconnectTimeout: number | null = null;
        let lastProgressTime = Date.now();
        const progressTimeout = 300000; // 5 minutes timeout

        const connect = () => {
            if (eventSource) {
                eventSource.close();
            }

            eventSource = new EventSource(url, { withCredentials: true });

            eventSource.onopen = () => {
                reconnectAttempts = 0; // Reset on successful connection
                lastProgressTime = Date.now();
                setProgress(prev => ({
                    ...prev,
                    stage: 'connected',
                    progress: 5,
                    message: 'Connected. Waiting for ingestion to start...'
                }));
            };

            eventSource.onmessage = (event) => {
                try {
                    // Ignore heartbeat messages
                    if (event.data.startsWith(': heartbeat')) {
                        return;
                    }

                    lastProgressTime = Date.now();
                    const data = JSON.parse(event.data);

                    setProgress({
                        uploadId: data.uploadId || uploadId,
                        fileName,
                        progress: data.progress || 0,
                        stage: data.stage || 'processing',
                        message: data.message || 'Processing...',
                        totalChunks: data.totalChunks,
                        processedChunks: data.processedChunks
                    });

                    if (data.stage === 'complete') {
                        if (eventSource) {
                            eventSource.close();
                        }
                        setTimeout(() => {
                            onComplete?.();
                        }, 500);
                    } else if (data.stage === 'error') {
                        if (eventSource) {
                            eventSource.close();
                        }
                        onError?.(data.message || data.error || 'Ingestion failed');
                    }
                } catch (error) {
                    console.error('Failed to parse SSE message:', error);
                }
            };

            eventSource.onerror = () => {
                const now = Date.now();
                const timeSinceLastProgress = now - lastProgressTime;

                // If we haven't received progress in a while, it might be stuck
                if (timeSinceLastProgress > progressTimeout) {
                    if (eventSource) {
                        eventSource.close();
                    }
                    onError?.('Ingestion is taking longer than expected. Please check the file and try again.');
                    return;
                }

                // Only reconnect if connection was established and closed unexpectedly
                if (eventSource?.readyState === EventSource.CLOSED && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;

                    reconnectTimeout = window.setTimeout(() => {
                        connect();
                    }, 2000 * reconnectAttempts); // Exponential backoff
                } else if (eventSource?.readyState === EventSource.CLOSED) {
                    onError?.('Connection lost. Please try uploading again.');
                }
            };

            // Monitor for stuck connections
            const progressMonitor = window.setInterval(() => {
                const now = Date.now();
                const timeSinceLastProgress = now - lastProgressTime;

                // If no progress for 5 minutes, consider it stuck
                if (timeSinceLastProgress > progressTimeout && eventSource?.readyState === EventSource.OPEN) {
                    if (eventSource) {
                        eventSource.close();
                    }
                    window.clearInterval(progressMonitor);
                    onError?.('Ingestion appears to be stuck. Please try uploading again.');
                }
            }, 30000); // Check every 30 seconds

            // Cleanup progress monitor
            return () => {
                window.clearInterval(progressMonitor);
            };
        };

        // Initial connection
        connect();

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [uploadId, fileName, onComplete, onError]);

    const getStageIcon = () => {
        switch (progress.stage) {
            case 'connected':
            case 'uploading':
                return (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                );
            case 'extracting':
                return (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                );
            case 'chunking':
                return (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                );
            case 'embedding':
                return (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                );
            case 'complete':
                return (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                );
        }
    };

    const getStageLabel = () => {
        switch (progress.stage) {
            case 'connected':
            case 'uploading':
                return 'Uploading';
            case 'extracting':
                return 'Extracting text';
            case 'chunking':
                return 'Creating chunks';
            case 'embedding':
                return 'Generating embeddings';
            case 'complete':
                return 'Complete';
            default:
                return 'Processing';
        }
    };

    return (
        <div className="glass backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel border border-primary-200/30 dark:border-primary-500/20 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
                {/* File Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <DocumentIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-display font-semibold text-secondary-900 dark:text-white truncate">
                            {fileName}
                        </h4>
                        <span className="text-xs font-display font-medium text-primary-600 dark:text-primary-400 ml-2">
                            {progress.progress}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full overflow-hidden mb-2">
                        <div
                            className="h-full bg-gradient-primary transition-all duration-300 ease-out"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>

                    {/* Stage Info */}
                    <div className="flex items-center gap-2">
                        {getStageIcon()}
                        <span className="text-xs font-display text-secondary-600 dark:text-secondary-400">
                            {getStageLabel()}
                        </span>
                        {progress.processedChunks !== undefined && progress.totalChunks !== undefined && (
                            <span className="text-xs font-display text-secondary-500 dark:text-secondary-500">
                                • {progress.processedChunks}/{progress.totalChunks} chunks
                            </span>
                        )}
                    </div>

                    {/* Message */}
                    {progress.message && (
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-1">
                            {progress.message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

