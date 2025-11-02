import React, { useEffect, useState, useRef } from 'react';
import {
    ClockIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    FireIcon,
    BoltIcon,
    UserIcon,
    FolderIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { AdminDashboardService, ActivityEvent } from '../../services/adminDashboard.service';
import { API_BASE_URL } from '../../config/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface RealTimeActivityFeedProps {
    limit?: number;
}

export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({ limit = 50 }) => {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const isConnectingRef = useRef<boolean>(false);
    const isUnmountingRef = useRef<boolean>(false);

    useEffect(() => {
        isUnmountingRef.current = false;

        // Fetch initial events
        const fetchInitialEvents = async () => {
            try {
                const initialEvents = await AdminDashboardService.getRecentActivity({ limit });
                if (!isUnmountingRef.current) {
                    setEvents(initialEvents);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching initial activity events:', error);
                if (!isUnmountingRef.current) {
                    setLoading(false);
                }
            }
        };

        fetchInitialEvents();

        // Set up SSE connection with authentication
        const setupSSEConnection = async () => {
            if (isConnectingRef.current || isUnmountingRef.current) {
                return;
            }

            isConnectingRef.current = true;

            try {
                const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
                if (!token) {
                    console.error('No authentication token found');
                    if (!isUnmountingRef.current) {
                        setLoading(false);
                    }
                    isConnectingRef.current = false;
                    return;
                }

                const API_URL = API_BASE_URL || 'http://localhost:8000';
                const response = await fetch(`${API_URL}/api/admin/analytics/activity/feed`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                });

                if (!response.ok) {
                    throw new Error(`SSE connection failed: ${response.status}`);
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    throw new Error('No response body reader available');
                }

                readerRef.current = reader;

                const readStream = async () => {
                    try {
                        let buffer = '';
                        while (!isUnmountingRef.current) {
                            const { done, value } = await reader.read();
                            if (done) {
                                console.log('SSE stream ended normally');
                                isConnectingRef.current = false;
                                break;
                            }

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';

                            for (const line of lines) {
                                if (line.trim()) {
                                    if (line.startsWith(':')) {
                                        continue;
                                    }

                                    if (line.startsWith('data: ')) {
                                        try {
                                            const data = JSON.parse(line.slice(6));

                                            if (data.type === 'connected') {
                                                console.log('SSE connected:', data.message);
                                                continue;
                                            }

                                            if (data.type === 'heartbeat') {
                                                continue;
                                            }

                                            if (data.type === 'recent_events' && Array.isArray(data.events)) {
                                                if (!isUnmountingRef.current) {
                                                    setEvents(prev => {
                                                        const combined = [...data.events, ...prev];
                                                        const unique = Array.from(
                                                            new Map(combined.map(e => [e.id, e])).values()
                                                        );
                                                        return unique.slice(0, limit);
                                                    });
                                                    console.log(`Received ${data.events.length} recent events`);
                                                }
                                            } else if (data.type === 'activity_event') {
                                                const event = data.data || data;
                                                if (!isUnmountingRef.current && event && event.id) {
                                                    setEvents(prev => {
                                                        const exists = prev.find(e => e.id === event.id);
                                                        if (!exists) {
                                                            return [event, ...prev].slice(0, limit);
                                                        }
                                                        return prev;
                                                    });
                                                }
                                            }
                                        } catch (parseError) {
                                            console.error('Error parsing SSE event:', parseError, line);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (streamError) {
                        console.error('Error reading SSE stream:', streamError);
                        isConnectingRef.current = false;
                        if (!isUnmountingRef.current && streamError instanceof Error) {
                            if (reconnectTimeoutRef.current) {
                                clearTimeout(reconnectTimeoutRef.current);
                            }
                            reconnectTimeoutRef.current = setTimeout(() => {
                                if (!isUnmountingRef.current) {
                                    setupSSEConnection();
                                }
                            }, 10000);
                        }
                    }
                };

                readStream();
            } catch (error) {
                console.error('Error setting up SSE connection:', error);
                isConnectingRef.current = false;

                if (!isUnmountingRef.current && error instanceof Error) {
                    const isRetryable = !error.message.includes('401') && !error.message.includes('404');

                    if (isRetryable) {
                        if (reconnectTimeoutRef.current) {
                            clearTimeout(reconnectTimeoutRef.current);
                        }
                        reconnectTimeoutRef.current = setTimeout(() => {
                            if (!isUnmountingRef.current) {
                                setupSSEConnection();
                            }
                        }, 10000);
                    } else {
                        setLoading(false);
                    }
                }
            }
        };

        const connectionTimeout = setTimeout(() => {
            if (!isUnmountingRef.current) {
                setupSSEConnection();
            }
        }, 500);

        return () => {
            isUnmountingRef.current = true;
            clearTimeout(connectionTimeout);

            if (readerRef.current) {
                try {
                    readerRef.current.cancel();
                } catch (e) {
                    // Ignore cancellation errors
                }
                readerRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            isConnectingRef.current = false;
        };
    }, [limit]);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'high_cost':
            case 'cost_spike':
                return CurrencyDollarIcon;
            case 'error':
            case 'error_rate_spike':
                return ExclamationTriangleIcon;
            case 'anomaly':
                return FireIcon;
            case 'budget_warning':
                return ExclamationTriangleIcon;
            default:
                return ClockIcon;
        }
    };

    const getEventIconBg = (severity?: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-gradient-to-br from-red-500 to-red-600';
            case 'high':
                return 'bg-gradient-to-br from-orange-500 to-orange-600';
            case 'medium':
                return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
            case 'low':
                return 'bg-gradient-to-br from-blue-500 to-blue-600';
            default:
                return 'bg-gradient-to-br from-gray-500 to-gray-600';
        }
    };

    const getSeverityBadge = (severity?: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/50';
            case 'high':
                return 'bg-orange-100/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-800/50';
            case 'medium':
                return 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-800/50';
            case 'low':
                return 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50';
            default:
                return 'bg-gray-100/50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-800/50';
        }
    };

    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="glass p-12 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-3xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="glass p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-dark-card/90 dark:to-dark-card/70">
            {/* Premium Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-50"></div>
                        <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg glow-primary">
                            <BoltIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold gradient-text">
                            Real-Time Activity Feed
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Live platform activity and events
                        </p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-display font-semibold text-sm shadow-lg ${events.length > 0
                    ? 'bg-gradient-primary text-white glow-primary'
                    : 'bg-gray-100/50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                    }`}>
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100/50 dark:bg-primary-900/30 mb-4">
                            <ClockIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-lg font-display font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                            No Activity Yet
                        </p>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-body">
                            Activity events will appear here in real-time
                        </p>
                    </div>
                ) : (
                    events.map((event) => {
                        const Icon = getEventIcon(event.type || 'request');
                        const iconBg = getEventIconBg(event.severity);
                        const severityBadge = getSeverityBadge(event.severity);

                        return (
                            <div
                                key={event.id}
                                className="p-5 glass rounded-xl border border-primary-200/30 dark:border-primary-700/30 hover:scale-[1.01] transition-all duration-300 bg-gradient-to-br from-white/80 to-white/60 dark:from-dark-card/80 dark:to-dark-card/60 hover:shadow-xl"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${iconBg} shadow-lg flex-shrink-0`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            <h4 className="font-display font-bold text-lg text-light-text-primary dark:text-dark-text-primary">
                                                {event.title || event.type || 'Activity Event'}
                                            </h4>
                                            {event.severity && (
                                                <span className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase tracking-wide border ${severityBadge}`}>
                                                    {event.severity}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 font-body leading-relaxed">
                                            {event.message}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{formatTimestamp(event.timestamp)}</span>
                                            </div>
                                            {event.userEmail && (
                                                <div className="flex items-center gap-1.5">
                                                    <UserIcon className="w-4 h-4" />
                                                    <span className="truncate max-w-[150px]">{event.userEmail}</span>
                                                </div>
                                            )}
                                            {event.projectName && (
                                                <div className="flex items-center gap-1.5">
                                                    <FolderIcon className="w-4 h-4" />
                                                    <span className="truncate max-w-[150px]">{event.projectName}</span>
                                                </div>
                                            )}
                                            {(event as any).cost && (
                                                <div className="flex items-center gap-1.5">
                                                    <CurrencyDollarIcon className="w-4 h-4" />
                                                    <span className="font-display font-semibold">${((event as any).cost as number).toFixed(4)}</span>
                                                </div>
                                            )}
                                            {(event as any).tokens && (
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowTrendingUpIcon className="w-4 h-4" />
                                                    <span>{((event as any).tokens as number).toLocaleString()} tokens</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
