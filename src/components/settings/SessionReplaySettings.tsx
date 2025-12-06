import React, { useState, useEffect, useCallback } from 'react';
import { Video, Clock, Info, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { SessionReplaySettingsShimmer } from '../shimmer/SettingsShimmer';

interface SessionReplayPreferences {
    enableSessionReplay: boolean;
    sessionReplayTimeout: number;
}

export const SessionReplaySettings: React.FC = () => {
    const [preferences, setPreferences] = useState<SessionReplayPreferences>({
        enableSessionReplay: false,
        sessionReplayTimeout: 30
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { showNotification } = useNotifications();

    const fetchPreferences = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch preferences');
            }

            const data = await response.json();
            if (data.success && data.data.preferences) {
                setPreferences({
                    enableSessionReplay: data.data.preferences.enableSessionReplay || false,
                    sessionReplayTimeout: data.data.preferences.sessionReplayTimeout || 30
                });
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            showNotification('Failed to load preferences', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enableSessionReplay: preferences.enableSessionReplay,
                    sessionReplayTimeout: preferences.sessionReplayTimeout
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update preferences');
            }

            const data = await response.json();
            if (data.success) {
                showNotification('Preferences saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            showNotification('Failed to save preferences', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <SessionReplaySettingsShimmer />;
    }

    return (
        <div className="p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 sm:p-5 md:p-6">
            {/* Header - Responsive */}
            <div className="flex flex-col gap-2 items-start mb-4 sm:flex-row sm:gap-3 sm:items-center sm:mb-5 md:mb-6">
                <div className="flex justify-center items-center w-8 h-8 rounded-xl bg-gradient-primary glow-primary sm:w-9 sm:h-9 md:w-10 md:h-10">
                    <Video className="w-5 h-5 text-white sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                </div>
                <h2 className="text-lg font-bold font-display gradient-text sm:text-xl md:text-xl">
                    Session Replay Settings
                </h2>
            </div>

            {/* Description - Responsive */}
            <div className="p-3 mb-4 rounded-lg border glass border-info-200/30 bg-info-50/50 dark:bg-info-900/20 sm:p-4 sm:mb-5 md:mb-6">
                <p className="text-xs text-secondary-700 dark:text-secondary-300 sm:text-sm">
                    Configure how your AI usage sessions are recorded for replay and analysis. Track requests, responses, and performance metrics.
                </p>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Enable Session Replay Toggle - Responsive */}
                <div className="p-4 rounded-lg border glass border-secondary-200/30 sm:p-5 md:p-6">
                    <label className="flex gap-3 items-start cursor-pointer sm:gap-4">
                        <input
                            type="checkbox"
                            checked={preferences.enableSessionReplay}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                enableSessionReplay: e.target.checked
                            })}
                            className="w-4 h-4 mt-0.5 rounded border-2 border-primary-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all cursor-pointer sm:w-5 sm:h-5"
                        />
                        <div className="flex-1">
                            <span className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">
                                Enable Session Replay
                            </span>
                            <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                                Automatically record your AI interactions, code context, and system metrics for later playback and analysis
                            </p>
                        </div>
                    </label>
                </div>

                {/* Session Timeout Setting - Responsive */}
                {preferences.enableSessionReplay && (
                    <div className="p-4 space-y-3 rounded-lg border glass border-primary-200/30 sm:p-5 sm:space-y-4 md:p-6">
                        <div className="flex flex-col gap-2 items-start sm:flex-row sm:gap-3 sm:items-center">
                            <div className="flex justify-center items-center w-7 h-7 rounded-lg bg-gradient-secondary sm:w-8 sm:h-8">
                                <Clock className="w-4 h-4 text-white sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-base">
                                    Session Timeout
                                </label>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                                    Automatic session end after inactivity
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:gap-4 sm:items-center">
                            <input
                                type="range"
                                min="5"
                                max="120"
                                step="5"
                                value={preferences.sessionReplayTimeout}
                                onChange={(e) => setPreferences({
                                    ...preferences,
                                    sessionReplayTimeout: parseInt(e.target.value)
                                })}
                                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-secondary/20 accent-primary-500"
                                style={{
                                    background: `linear-gradient(to right, 
                                        rgb(59, 130, 246) 0%, 
                                        rgb(59, 130, 246) ${((preferences.sessionReplayTimeout - 5) / 115) * 100}%, 
                                        rgba(59, 130, 246, 0.2) ${((preferences.sessionReplayTimeout - 5) / 115) * 100}%, 
                                        rgba(59, 130, 246, 0.2) 100%)`
                                }}
                            />
                            <div className="flex gap-2 items-center justify-center sm:justify-start">
                                <input
                                    type="number"
                                    min="5"
                                    max="120"
                                    value={preferences.sessionReplayTimeout}
                                    onChange={(e) => {
                                        const value = Math.max(5, Math.min(120, parseInt(e.target.value) || 5));
                                        setPreferences({
                                            ...preferences,
                                            sessionReplayTimeout: value
                                        });
                                    }}
                                    className="px-3 py-2 w-20 text-sm rounded-lg border glass border-primary-200/30 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">min</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Information Panel */}
                <div className="p-6 rounded-lg border glass border-info-200/30 bg-info-50/50 dark:bg-info-900/20">
                    <div className="flex gap-4 items-start">
                        <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-gradient-info glow-info">
                            <Info className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="mb-3 font-semibold font-display text-info-700 dark:text-info-300">
                                What gets recorded?
                            </h4>
                            <ul className="space-y-2">
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        AI model requests and responses
                                    </span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        Token usage and cost for each interaction
                                    </span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        Code context and file snapshots
                                    </span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        System performance metrics (CPU, memory)
                                    </span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        State changes tracked over time
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Privacy Notice */}
                {preferences.enableSessionReplay && (
                    <div className="p-6 rounded-lg border glass border-warning-200/30 bg-warning-50/50 dark:bg-warning-900/20">
                        <div className="flex gap-4 items-start">
                            <div className="flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg bg-gradient-warning glow-warning">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="mb-2 font-semibold font-display text-warning-700 dark:text-warning-300">
                                    Privacy Notice
                                </h4>
                                <p className="text-sm text-warning-600 dark:text-warning-400">
                                    Session replay data is stored securely and can be viewed only by you.
                                    Sensitive information like API keys and passwords are automatically redacted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col gap-2 justify-end pt-4 mt-4 border-t border-primary-200/30 sm:flex-row sm:gap-3 sm:pt-5 sm:mt-5 md:pt-6 md:mt-6">
                <button
                    onClick={fetchPreferences}
                    disabled={saving}
                    className="btn btn-secondary px-4 py-2 glass rounded-lg border border-secondary-200/30 font-body text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-secondary-300/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:px-6 sm:py-2.5"
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary px-4 py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:px-6 sm:py-2.5"
                >
                    {saving ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </div>
    );
};

export default SessionReplaySettings;

