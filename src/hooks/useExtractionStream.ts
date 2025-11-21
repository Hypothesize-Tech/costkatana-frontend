import { useState, useEffect, useCallback, useRef } from 'react';

export interface ExtractionStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    templateId?: string;
    extractedAt?: Date;
    extractedBy?: string;
    errorMessage?: string;
    usage?: {
        checksPerformed: number;
        tokensSaved: number;
        costSaved: number;
    };
    extractionCost?: number;
}

interface ExtractionStreamMessage {
    type: 'connected' | 'status_update' | 'close' | 'timeout' | 'heartbeat';
    message?: string;
    templateId?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    extractedAt?: string;
    extractedBy?: string;
    errorMessage?: string;
    usage?: {
        checksPerformed: number;
        costSaved: number;
    };
    extractionCost?: number;
}

interface UseExtractionStreamOptions {
    templateId: string;
    onStatusUpdate?: (status: ExtractionStatus) => void;
    autoConnect?: boolean;
}

export const useExtractionStream = (options: UseExtractionStreamOptions) => {
    const { templateId, onStatusUpdate, autoConnect = true } = options;
    const [status, setStatus] = useState<ExtractionStatus | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);
    const maxRetries = 3;

    const connect = useCallback(() => {
        if (!templateId) {
            setError('Template ID is required');
            return;
        }

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const url = `${API_BASE_URL}/api/templates/${templateId}/reference-image/stream?token=${token}`;

            const eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                try {
                    const data: ExtractionStreamMessage = JSON.parse(event.data);

                    // Handle different message types
                    switch (data.type) {
                        case 'connected':
                            setIsConnected(true);
                            setRetryCount(0);
                            // Set initial status from connection message
                            if (data.status) {
                                const initialStatus: ExtractionStatus = {
                                    status: data.status,
                                    templateId: data.templateId,
                                    extractedAt: data.extractedAt ? new Date(data.extractedAt) : undefined,
                                    extractedBy: data.extractedBy,
                                    errorMessage: data.errorMessage,
                                    usage: data.usage ? {
                                        checksPerformed: data.usage.checksPerformed,
                                        tokensSaved: data.usage.costSaved || 0,
                                        costSaved: data.usage.costSaved || 0
                                    } : undefined,
                                    extractionCost: data.extractionCost
                                };
                                setStatus(initialStatus);
                                onStatusUpdate?.(initialStatus);
                            }
                            break;

                        case 'status_update':
                            if (data.status) {
                                const updatedStatus: ExtractionStatus = {
                                    status: data.status,
                                    templateId: data.templateId,
                                    extractedAt: data.extractedAt ? new Date(data.extractedAt) : undefined,
                                    extractedBy: data.extractedBy,
                                    errorMessage: data.errorMessage,
                                    usage: data.usage ? {
                                        checksPerformed: data.usage.checksPerformed,
                                        tokensSaved: data.usage.costSaved || 0,
                                        costSaved: data.usage.costSaved || 0
                                    } : undefined,
                                    extractionCost: data.extractionCost
                                };
                                setStatus(updatedStatus);
                                onStatusUpdate?.(updatedStatus);
                            }
                            break;

                        case 'close':
                            // Stream closed naturally (extraction complete)
                            setIsConnected(false);
                            eventSource.close();
                            break;

                        case 'timeout':
                            setError(data.message || 'Stream timeout');
                            setIsConnected(false);
                            eventSource.close();
                            break;

                        case 'heartbeat':
                            // Just keep-alive, no action needed
                            break;

                        default:
                            // Unknown message type, ignore
                            break;
                    }
                } catch {
                    // Failed to parse message, ignore
                }
            };

            eventSource.onerror = () => {
                setIsConnected(false);

                if (eventSource.readyState === EventSource.CLOSED) {
                    setError('Connection closed');

                    // Attempt to reconnect with exponential backoff
                    if (retryCount < maxRetries) {
                        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                        setTimeout(() => {
                            // Silent reconnect attempt
                            setRetryCount(prev => prev + 1);
                            connect();
                        }, delay);
                    } else {
                        setError('Maximum reconnection attempts reached. Please refresh manually.');
                    }
                } else {
                    setError('Connection error occurred');
                }
            };

            eventSource.addEventListener('open', () => {
                setIsConnected(true);
                setError(null);
            });

            eventSourceRef.current = eventSource;
        } catch (err) {
            setError((err as Error).message || 'Failed to establish SSE connection');
            setIsConnected(false);
        }
    }, [templateId, onStatusUpdate, retryCount]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsConnected(false);
        setRetryCount(0);
    }, []);

    const reconnect = useCallback(() => {
        disconnect();
        setRetryCount(0);
        setTimeout(() => connect(), 100);
    }, [connect, disconnect]);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect && templateId) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoConnect, templateId]);

    return {
        status,
        isConnected,
        error,
        retryCount,
        connect,
        disconnect,
        reconnect
    };
};

