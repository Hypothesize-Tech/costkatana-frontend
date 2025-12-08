import React, { useState, useEffect } from 'react';
import {
    CalendarIcon,
    ArrowPathIcon,
    PlusIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { googleService, GoogleConnection } from '../../../services/google.service';

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
}

export const CalendarViewer: React.FC<CalendarViewerProps> = ({ connection }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'upcoming' | 'today'>('upcoming');

    useEffect(() => {
        loadEvents();
    }, [connection]);

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
        return date.toLocaleString();
    };

    const todayEvents = events.filter(event => {
        const start = event.start.dateTime || event.start.date;
        if (!start) return false;
        const eventDate = new Date(start);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    });

    const displayEvents = viewMode === 'today' ? todayEvents : events;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary-200/30 dark:border-primary-500/20">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        Calendar
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={loadEvents}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('today')}
                        className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'today'
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/20 text-secondary-900 dark:text-white'
                            }`}
                    >
                        Today ({todayEvents.length})
                    </button>
                    <button
                        onClick={() => setViewMode('upcoming')}
                        className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'upcoming'
                            ? 'bg-primary-600 text-white'
                            : 'bg-primary-100 dark:bg-primary-900/20 text-secondary-900 dark:text-white'
                            }`}
                    >
                        Upcoming ({events.length})
                    </button>
                </div>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : displayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-secondary-500">
                        <CalendarIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No events found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayEvents.map((event) => (
                            <div
                                key={event.id}
                                className="p-4 rounded-lg border border-primary-200/30 dark:border-primary-500/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-secondary-900 dark:text-white">
                                        {event.summary || 'Untitled Event'}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                                    <ClockIcon className="w-4 h-4" />
                                    {formatEventTime(event)}
                                </div>
                                {event.description && (
                                    <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-2">
                                        {event.description}
                                    </p>
                                )}
                                {event.attendees && event.attendees.length > 0 && (
                                    <div className="text-xs text-secondary-500">
                                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

