import React, { useState, useEffect, useCallback } from 'react';
import { VideoCameraIcon, ClockIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config/api';
import { useNotifications } from '../../contexts/NotificationContext';

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
        return (
            <div className="glass rounded-xl p-6 border border-secondary-200/30 shadow-lg backdrop-blur-xl">
                <div className="animate-pulse">
                    <div className="h-6 bg-gradient-primary/20 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gradient-primary/20 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-6 border border-primary-200/30 shadow-lg backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                    <VideoCameraIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-display font-bold gradient-text">
                    Session Replay Settings
                </h2>
            </div>

            {/* Description */}
            <div className="glass rounded-lg p-4 border border-info-200/30 bg-info-50/50 dark:bg-info-900/20 mb-6">
                <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    Configure how your AI usage sessions are recorded for replay and analysis. Track requests, responses, and performance metrics.
                </p>
            </div>

            <div className="space-y-6">
                {/* Enable Session Replay Toggle */}
                <div className="glass rounded-lg p-6 border border-secondary-200/30">
                    <label className="flex items-start gap-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.enableSessionReplay}
                            onChange={(e) => setPreferences({
                                ...preferences,
                                enableSessionReplay: e.target.checked
                            })}
                            className="w-5 h-5 mt-0.5 rounded border-2 border-primary-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all cursor-pointer"
                        />
                        <div className="flex-1">
                            <span className="font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                Enable Session Replay
                            </span>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                                Automatically record your AI interactions, code context, and system metrics for later playback and analysis
                            </p>
                        </div>
                    </label>
                </div>

                {/* Session Timeout Setting */}
                {preferences.enableSessionReplay && (
                    <div className="glass rounded-lg p-6 border border-primary-200/30 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center">
                                <ClockIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <label className="block font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                                    Session Timeout
                                </label>
                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    Automatic session end after inactivity
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
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
                                className="flex-1 h-2 bg-gradient-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                style={{
                                    background: `linear-gradient(to right, 
                                        rgb(59, 130, 246) 0%, 
                                        rgb(59, 130, 246) ${((preferences.sessionReplayTimeout - 5) / 115) * 100}%, 
                                        rgba(59, 130, 246, 0.2) ${((preferences.sessionReplayTimeout - 5) / 115) * 100}%, 
                                        rgba(59, 130, 246, 0.2) 100%)`
                                }}
                            />
                            <div className="flex items-center gap-2">
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
                                    className="w-20 px-3 py-2 glass rounded-lg border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">min</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Information Panel */}
                <div className="glass rounded-lg p-6 border border-info-200/30 bg-info-50/50 dark:bg-info-900/20">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-info flex items-center justify-center glow-info flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-display font-semibold text-info-700 dark:text-info-300 mb-3">
                                What gets recorded?
                            </h4>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        AI model requests and responses
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        Token usage and cost for each interaction
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        Code context and file snapshots
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-info mt-2 glow-info"></div>
                                    <span className="text-sm text-info-600 dark:text-info-400">
                                        System performance metrics (CPU, memory)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
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
                    <div className="glass rounded-lg p-6 border border-warning-200/30 bg-warning-50/50 dark:bg-warning-900/20">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-warning flex items-center justify-center glow-warning flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-display font-semibold text-warning-700 dark:text-warning-300 mb-2">
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-primary-200/30">
                <button
                    onClick={fetchPreferences}
                    disabled={saving}
                    className="px-6 py-2.5 glass rounded-lg border border-secondary-200/30 font-body text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-secondary-300/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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

