import { useState, useEffect, useCallback, useRef } from 'react';
import { logsService } from '../services/logs.service';

interface UseLogStreamOptions {
    filters?: any;
    maxLogs?: number;
}

export const useLogStream = (options: UseLogStreamOptions = {}) => {
    const { filters = {}, maxLogs = 500 } = options;
    const [logs, setLogs] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const pausedLogsRef = useRef<any[]>([]);

    const startStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setIsLoading(true);
        setError(null);

        try {
            const es = logsService.createLogStream(
                filters,
                (log) => {
                    if (!isPaused) {
                        setLogs((prev) => {
                            const newLogs = [log, ...prev];
                            return newLogs.slice(0, maxLogs);
                        });
                    } else {
                        pausedLogsRef.current.push(log);
                    }
                },
                (err) => {
                    setError(err.message || 'Stream error');
                    setIsConnected(false);
                }
            );

            eventSourceRef.current = es;

            // Set connected after a short delay to ensure connection is established
            setTimeout(() => {
                if (es.readyState === EventSource.OPEN) {
                    setIsConnected(true);
                    setIsLoading(false);
                }
            }, 1000);

            es.addEventListener('open', () => {
                setIsConnected(true);
                setIsLoading(false);
                setError(null);
            });

            es.addEventListener('error', () => {
                setIsConnected(false);
                setIsLoading(false);
                if (es.readyState === EventSource.CLOSED) {
                    setError('Connection closed');
                }
            });
        } catch (err: any) {
            setError(err.message || 'Failed to start stream');
            setIsConnected(false);
            setIsLoading(false);
        }
    }, [filters, isPaused, maxLogs]);

    const stopStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsConnected(false);
        setIsPaused(false);
        pausedLogsRef.current = [];
    }, []);

    const pauseStream = useCallback(() => {
        setIsPaused(true);
    }, []);

    const resumeStream = useCallback(() => {
        setIsPaused(false);
        if (pausedLogsRef.current.length > 0) {
            setLogs((prev) => {
                const newLogs = [...pausedLogsRef.current.reverse(), ...prev];
                pausedLogsRef.current = [];
                return newLogs.slice(0, maxLogs);
            });
        }
    }, [maxLogs]);

    const clearLogs = useCallback(() => {
        setLogs([]);
        pausedLogsRef.current = [];
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    return {
        logs,
        isConnected,
        isPaused,
        isLoading,
        error,
        startStream,
        stopStream,
        pauseStream,
        resumeStream,
        clearLogs
    };
};

