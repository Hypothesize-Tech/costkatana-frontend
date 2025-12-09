import React, { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    PlusIcon,
    ClockIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection } from '../../../services/google.service';
import { GoogleServiceShimmer } from '../../ui/GoogleServiceShimmer';
import { GoogleViewerStates } from '../GoogleViewerStates';
import { CreateCalendarEventModal } from '../modals/CreateCalendarEventModal';
import googleCalendarLogo from '../../../assets/google-calender-logo.webp';

interface CalendarViewerProps {
    connection: GoogleConnection;
}

interface CalendarEvent {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    description?: string;
    attendees?: Array<{ email: string }>;
    htmlLink?: string;
    location?: string;
}

export const CalendarViewer: React.FC<CalendarViewerProps> = ({ connection }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'upcoming' | 'today'>('upcoming');
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection._id]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await googleService.listCalendarEvents(connection._id, undefined, undefined, 20);
            setEvents(response || []);
        } catch (error) {
            console.error('Failed to load calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatEventTime = (event: CalendarEvent) => {
        const start = event.start.dateTime || event.start.date;
        if (!start) return 'No time';
        const date = new Date(start);

        // Check if it's an all-day event
        if (event.start.date && !event.start.dateTime) {
            return date.toLocaleDateString();
        }

        // Format with time
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatEventDuration = (event: CalendarEvent) => {
        const start = event.start.dateTime || event.start.date;
        const end = event.end.dateTime || event.end.date;

        if (!start || !end) return '';

        const startDate = new Date(start);
        const endDate = new Date(end);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours < 1) {
            const minutes = Math.round(durationMs / (1000 * 60));
            return `${minutes} min`;
        } else if (durationHours < 24) {
            return `${Math.round(durationHours * 10) / 10} hour${durationHours !== 1 ? 's' : ''}`;
        } else {
            const days = Math.round(durationHours / 24);
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    };

    const toggleEventExpanded = (eventId: string) => {
        setExpandedEvents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(eventId)) {
                newSet.delete(eventId);
            } else {
                newSet.add(eventId);
            }
            return newSet;
        });
    };

    // Parse HTML description safely
    const parseDescription = (description?: string) => {
        if (!description) return null;

        // Remove script tags and sanitize
        const sanitized = description
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '');

        return { __html: sanitized };
    };

    const todayEvents = events.filter(event => {
        const start = event.start.dateTime || event.start.date;
        if (!start) return false;
        const eventDate = new Date(start);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    });

    const displayEvents = viewMode === 'today' ? todayEvents : events;

    if (loading && events.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                            <img src={googleCalendarLogo} alt="Google Calendar" className="w-5 h-5 object-contain" />
                            Calendar
                        </h3>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <GoogleServiceShimmer count={5} type="list" />
                </div>
            </div>
        );
    }

    if (!loading && displayEvents.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                            <img src={googleCalendarLogo} alt="Google Calendar" className="w-5 h-5 object-contain" />
                            Calendar
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={loadEvents}
                                disabled={loading}
                                className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                                title="Create new event"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <GoogleViewerStates
                        state="empty"
                        serviceName="Calendar Events"
                        suggestedCommand="@calendar list my events for today"
                    />
                </div>
                {showCreateModal && (
                    <CreateCalendarEventModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        connectionId={connection._id}
                        onEventCreated={loadEvents}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <img src={googleCalendarLogo} alt="Google Calendar" className="w-5 h-5 object-contain" />
                        Calendar
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadEvents}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            title="Refresh events"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                            title="Create new event"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('today')}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${viewMode === 'today'
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/20 text-secondary-900 dark:text-white hover:bg-primary-200 dark:hover:bg-primary-900/30'
                            }`}
                    >
                        Today ({todayEvents.length})
                    </button>
                    <button
                        onClick={() => setViewMode('upcoming')}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${viewMode === 'upcoming'
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/20 text-secondary-900 dark:text-white hover:bg-primary-200 dark:hover:bg-primary-900/30'
                            }`}
                    >
                        Upcoming ({events.length})
                    </button>
                </div>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading && events.length > 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayEvents.map((event) => {
                            const isExpanded = expandedEvents.has(event.id);
                            const description = parseDescription(event.description);

                            return (
                                <div
                                    key={event.id}
                                    className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                                                {event.summary || 'Untitled Event'}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                                                <div className="flex items-center gap-1">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span>{formatEventTime(event)}</span>
                                                </div>
                                                {formatEventDuration(event) && (
                                                    <span className="text-xs">({formatEventDuration(event)})</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleEventExpanded(event.id)}
                                            className="p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors ml-2"
                                            title={isExpanded ? 'Collapse details' : 'View details'}
                                        >
                                            {isExpanded ? (
                                                <ChevronUpIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                            ) : (
                                                <ChevronDownIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="mt-3 pt-3 border-t border-primary-200/30 dark:border-primary-500/20 space-y-2">
                                            {description && (
                                                <div className="text-sm text-secondary-700 dark:text-secondary-300">
                                                    <div className="font-medium mb-1">Description:</div>
                                                    <div
                                                        className="prose prose-sm dark:prose-invert max-w-none"
                                                        dangerouslySetInnerHTML={description}
                                                    />
                                                </div>
                                            )}

                                            {event.location && (
                                                <div className="text-sm text-secondary-700 dark:text-secondary-300">
                                                    <div className="font-medium mb-1">Location:</div>
                                                    <div>{event.location}</div>
                                                </div>
                                            )}

                                            {event.attendees && event.attendees.length > 0 && (
                                                <div className="text-sm text-secondary-700 dark:text-secondary-300">
                                                    <div className="font-medium mb-1 flex items-center gap-1">
                                                        <UserGroupIcon className="w-4 h-4" />
                                                        Attendees ({event.attendees.length}):
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {event.attendees.map((attendee, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/20 text-xs"
                                                            >
                                                                {attendee.email}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {event.htmlLink && (
                                                <div className="pt-2">
                                                    <a
                                                        href={event.htmlLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                    >
                                                        Open in Google Calendar →
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateCalendarEventModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    connectionId={connection._id}
                    onEventCreated={loadEvents}
                />
            )}
        </div>
    );
};
