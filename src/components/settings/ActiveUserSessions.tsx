import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Globe, X, AlertCircle } from 'lucide-react';
import { userSessionService } from '../../services/userSession.service';
import { UserSession } from '../../types/userSession.types';
import { useNotifications } from '../../contexts/NotificationContext';
import { UserSessionShimmer } from '../shimmer/UserSessionShimmer';

interface ActiveUserSessionsProps {
    onSessionRevoked?: () => void;
}

export const ActiveUserSessions: React.FC<ActiveUserSessionsProps> = ({ onSessionRevoked }) => {
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
    const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
    const { showNotification } = useNotifications();

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const response = await userSessionService.getActiveUserSessions();
            if (response.success) {
                setSessions(response.data);
            }
        } catch (error: any) {
            console.error('Error loading sessions:', error);
            showNotification('Failed to load active sessions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSession = async (userSessionId: string) => {
        if (revokingSessionId) return;

        try {
            setRevokingSessionId(userSessionId);
            const response = await userSessionService.revokeUserSession(userSessionId);
            if (response.success) {
                showNotification('Session revoked successfully', 'success');
                await loadSessions();
                onSessionRevoked?.();
            }
        } catch (error: any) {
            console.error('Error revoking session:', error);
            showNotification(error.message || 'Failed to revoke session', 'error');
        } finally {
            setRevokingSessionId(null);
        }
    };

    const handleRevokeAllOther = async () => {
        if (revokingSessionId) return;

        try {
            setRevokingSessionId('all');
            const response = await userSessionService.revokeAllOtherUserSessions();
            if (response.success) {
                showNotification(response.message || 'All other sessions revoked successfully', 'success');
                await loadSessions();
                onSessionRevoked?.();
            }
            setShowRevokeAllConfirm(false);
        } catch (error: any) {
            console.error('Error revoking all other sessions:', error);
            showNotification(error.message || 'Failed to revoke sessions', 'error');
        } finally {
            setRevokingSessionId(null);
        }
    };

    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const getDeviceIcon = (deviceName: string, os?: string) => {
        const lowerDevice = deviceName.toLowerCase();
        const lowerOs = os?.toLowerCase() || '';

        if (lowerDevice.includes('mobile') || lowerOs.includes('android') || lowerOs.includes('ios')) {
            return <Smartphone className="w-5 h-5" />;
        } else if (lowerDevice.includes('tablet') || lowerOs.includes('ipad')) {
            return <Tablet className="w-5 h-5" />;
        } else {
            return <Monitor className="w-5 h-5" />;
        }
    };

    const getBrowserIcon = (browser?: string) => {
        // Browser icons - using Globe as fallback since lucide-react doesn't have browser-specific icons
        return <Globe className="w-4 h-4" />;
    };

    const getLocationText = (session: UserSession): string => {
        if (session.location.city && session.location.country) {
            return `${session.location.city}, ${session.location.country}`;
        } else if (session.location.country) {
            return session.location.country;
        } else if (session.location.city) {
            return session.location.city;
        }
        return 'Unknown Location';
    };

    if (loading) {
        return <UserSessionShimmer />;
    }

    if (sessions.length === 0) {
        return (
            <div className="p-4 rounded-lg border glass border-info-200/30 sm:p-5 md:p-6">
                <div className="flex flex-col gap-3 items-center text-center sm:flex-row sm:text-left sm:gap-4">
                    <div className="flex justify-center items-center w-10 h-10 rounded-lg bg-gradient-info/20 sm:w-12 sm:h-12">
                        <Smartphone className="w-5 h-5 text-info-500 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-base">
                        No active sessions found. Sessions will appear here when you log in from different devices.
                    </p>
                </div>
            </div>
        );
    }

    const otherSessions = sessions.filter(s => !s.isCurrentSession);
    const currentSession = sessions.find(s => s.isCurrentSession);

    return (
        <div className="space-y-3 sm:space-y-4">
            {currentSession && (
                <div className="p-3 rounded-lg border glass border-success-200/30 bg-gradient-success/5 sm:p-4">
                    <div className="flex flex-col gap-3 items-start sm:flex-row sm:justify-between">
                        <div className="flex gap-2 items-start flex-1 w-full sm:gap-3">
                            <div className="flex justify-center items-center w-9 h-9 rounded-lg bg-gradient-success/20 mt-0.5 sm:w-10 sm:h-10 sm:mt-1">
                                {getDeviceIcon(currentSession.deviceName, currentSession.os)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-1.5 items-center mb-1 sm:gap-2">
                                    <span className="text-sm font-semibold font-display gradient-text-success sm:text-base">
                                        {currentSession.deviceName}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-success text-white whitespace-nowrap">
                                        Current Session
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:gap-3 sm:text-sm">
                                    <span className="flex gap-1 items-center">
                                        {getBrowserIcon(currentSession.browser)}
                                        <span className="truncate">{currentSession.browser || 'Unknown Browser'}</span>
                                    </span>
                                    <span className="truncate">{getLocationText(currentSession)}</span>
                                    <span className="whitespace-nowrap">{formatRelativeTime(currentSession.lastActiveAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {otherSessions.length > 0 && (
                <>
                    <div className="flex flex-col gap-2 justify-between items-start sm:flex-row sm:items-center">
                        <h3 className="text-sm font-semibold font-display gradient-text sm:text-base">
                            Other Active Sessions ({otherSessions.length})
                        </h3>
                        <button
                            onClick={() => setShowRevokeAllConfirm(true)}
                            disabled={revokingSessionId === 'all'}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-gradient-danger text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
                        >
                            {revokingSessionId === 'all' ? 'Revoking...' : 'Revoke All Others'}
                        </button>
                    </div>

                    {showRevokeAllConfirm && (
                        <div className="p-3 rounded-lg border glass border-danger-200/30 bg-gradient-danger/5 sm:p-4">
                            <div className="flex flex-col gap-2 items-start mb-3 sm:flex-row sm:gap-3 sm:mb-4">
                                <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold font-display gradient-text-danger mb-1 sm:text-base">
                                        Revoke All Other Sessions?
                                    </h4>
                                    <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                                        This will log you out from all other devices. You will remain logged in on this device.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 justify-end sm:flex-row">
                                <button
                                    onClick={() => setShowRevokeAllConfirm(false)}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border border-primary-200/30 text-light-text-primary dark:text-dark-text-primary hover:bg-primary-100/10 dark:hover:bg-primary-900/10 w-full sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRevokeAllOther}
                                    disabled={revokingSessionId === 'all'}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-gradient-danger text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    {revokingSessionId === 'all' ? 'Revoking...' : 'Revoke All'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5 sm:space-y-3">
                        {otherSessions.map((session) => (
                            <div
                                key={session.userSessionId}
                                className="p-3 rounded-lg border glass border-primary-200/30 hover:border-primary-300/50 transition-colors sm:p-4"
                            >
                                <div className="flex flex-col gap-3 items-start sm:flex-row sm:justify-between">
                                    <div className="flex gap-2 items-start flex-1 w-full sm:gap-3">
                                        <div className="flex justify-center items-center w-9 h-9 rounded-lg bg-gradient-primary/20 mt-0.5 sm:w-10 sm:h-10 sm:mt-1">
                                            {getDeviceIcon(session.deviceName, session.os)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold font-display gradient-text mb-1 sm:text-base">
                                                {session.deviceName}
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:gap-3 sm:text-sm">
                                                <span className="flex gap-1 items-center">
                                                    {getBrowserIcon(session.browser)}
                                                    <span className="truncate">{session.browser || 'Unknown Browser'}</span>
                                                </span>
                                                <span className="truncate">{getLocationText(session)}</span>
                                                <span className="whitespace-nowrap">{formatRelativeTime(session.lastActiveAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeSession(session.userSessionId)}
                                        disabled={revokingSessionId === session.userSessionId}
                                        className="flex justify-center items-center w-7 h-7 rounded-lg transition-colors text-danger-500 hover:bg-danger-100/10 dark:hover:bg-danger-900/10 disabled:opacity-50 disabled:cursor-not-allowed self-end sm:self-center sm:w-8 sm:h-8"
                                        title="Revoke this session"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

