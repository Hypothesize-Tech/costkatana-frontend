import React, { useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { googleService } from '../../../services/google.service';
import { useToast } from '../../../hooks/useToast';
import googleCalendarLogo from '../../../assets/google-calender-logo.webp';

interface CreateCalendarEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    connectionId: string;
    onEventCreated?: () => void;
}

export const CreateCalendarEventModal: React.FC<CreateCalendarEventModalProps> = ({
    isOpen,
    onClose,
    connectionId,
    onEventCreated
}) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        summary: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        attendees: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.summary || !formData.startDate) {
            showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            setLoading(true);

            // Combine date and time
            const startDateTime = formData.startTime
                ? new Date(`${formData.startDate}T${formData.startTime}`)
                : new Date(`${formData.startDate}T09:00:00`);

            const endDateTime = formData.endTime
                ? new Date(`${formData.endDate || formData.startDate}T${formData.endTime}`)
                : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour

            // Parse attendees (comma-separated emails)
            const attendees = formData.attendees
                .split(',')
                .map(email => email.trim())
                .filter(email => email.length > 0);

            await googleService.createCalendarEvent(
                connectionId,
                formData.summary,
                startDateTime,
                endDateTime,
                formData.description || undefined,
                attendees.length > 0 ? attendees : undefined
            );

            showToast('Calendar event created successfully', 'success');
            onEventCreated?.();
            onClose();

            // Reset form
            setFormData({
                summary: '',
                description: '',
                startDate: '',
                startTime: '',
                endDate: '',
                endTime: '',
                attendees: ''
            });
        } catch (error: unknown) {
            console.error('Failed to create calendar event:', error);
            const errorMessage = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                : undefined;
            showToast(errorMessage || 'Failed to create calendar event', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-3 sm:px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="inline-block align-bottom glass rounded-xl sm:rounded-2xl border border-primary-200/30 dark:border-primary-500/20 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-6 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full w-full max-h-[90vh] overflow-y-auto">
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                        >
                            <XCircleIcon className="h-8 w-8 sm:h-9 sm:w-9 text-gray-400 dark:text-gray-500 hover:text-danger-500 dark:hover:text-danger-400" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="w-full">
                            <div className="text-center sm:text-left mb-4 sm:mb-6 pr-8 sm:pr-0">
                                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
                                        <img src={googleCalendarLogo} alt="Google Calendar" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-display font-bold gradient-text-primary">
                                            Create Calendar Event
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-sm sm:text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
                                    Schedule a new event in Google Calendar
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                                        Event Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        required
                                        className="input w-full"
                                        placeholder="Meeting with team"
                                    />
                                </div>

                                <div>
                                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="input w-full resize-none"
                                        placeholder="Event description..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-display font-semibold gradient-text-primary mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-display font-semibold gradient-text-primary mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-display font-semibold gradient-text-primary mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-display font-semibold gradient-text-primary mb-2">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-display font-semibold gradient-text-primary mb-2">
                                        Attendees (comma-separated emails)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.attendees}
                                        onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                                        className="input w-full"
                                        placeholder="user1@example.com, user2@example.com"
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-primary-200/30">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="btn btn-ghost text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Creating...
                                            </span>
                                        ) : (
                                            'Create Event'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

