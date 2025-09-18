import React, { useState, useEffect } from 'react';
import { useMixpanel } from '../../hooks/useMixpanel';

interface TrackingStats {
    totalClicks: number;
    buttonClicks: number;
    linkClicks: number;
    formSubmissions: number;
    pageViews: number;
    scrollEvents: number;
    navigationEvents: number;
}

export const TrackingConfiguration: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [trackingStats, setTrackingStats] = useState<TrackingStats>({
        totalClicks: 0,
        buttonClicks: 0,
        linkClicks: 0,
        formSubmissions: 0,
        pageViews: 0,
        scrollEvents: 0,
        navigationEvents: 0
    });
    const [sessionStartTime] = useState(Date.now());

    const { isTrackingEnabled, trackUserAction } = useMixpanel();
    // Get sessionId from a static source instead of calling useGlobalTracking again
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate tracking stats (in real implementation, this would come from analytics)
    useEffect(() => {
        const interval = setInterval(() => {
            setTrackingStats(prev => ({
                totalClicks: prev.totalClicks + Math.floor(Math.random() * 3),
                buttonClicks: prev.buttonClicks + Math.floor(Math.random() * 2),
                linkClicks: prev.linkClicks + Math.floor(Math.random() * 1),
                formSubmissions: prev.formSubmissions + Math.floor(Math.random() * 1),
                pageViews: prev.pageViews + Math.floor(Math.random() * 1),
                scrollEvents: prev.scrollEvents + Math.floor(Math.random() * 5),
                navigationEvents: prev.navigationEvents + Math.floor(Math.random() * 1)
            }));
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleToggleTracking = () => {
        trackUserAction(
            'toggle_tracking',
            window.location.pathname,
            'tracking_config',
            'tracking_toggle',
            {
                enabled: !isTrackingEnabled,
                sessionId
            }
        );

        // In a real implementation, this would update user preferences
        console.log('Tracking toggled:', !isTrackingEnabled);
    };

    const handleExportTrackingData = () => {
        trackUserAction(
            'export_tracking_data',
            window.location.pathname,
            'tracking_config',
            'export_button',
            {
                sessionId,
                sessionDuration: Date.now() - sessionStartTime
            }
        );

        // Export tracking data
        const trackingData = {
            sessionId,
            sessionStartTime: new Date(sessionStartTime).toISOString(),
            sessionDuration: Date.now() - sessionStartTime,
            stats: trackingStats,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(trackingData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tracking-data-${sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="glass shadow-2xl backdrop-blur-xl border border-primary-200/30 max-w-sm animate-slide-up bg-gradient-light-panel dark:bg-gradient-dark-panel">
                {/* Header */}
                <div className="p-4 border-b border-primary-200/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full shadow-lg ${isTrackingEnabled ? 'bg-gradient-success animate-pulse' : 'bg-gradient-danger'}`}></div>
                            <h3 className="text-sm font-display font-bold text-light-text-primary dark:text-dark-text-primary">
                                📊 Analytics Tracking
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-8 h-8 rounded-lg glass hover:bg-primary-500/20 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-all duration-300 hover:scale-110 flex items-center justify-center"
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="p-4 space-y-4 animate-fade-in">
                        {/* Status */}
                        <div className="p-3 rounded-xl glass border border-primary-200/20">
                            <div className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary space-y-1">
                                <p>Status: <span className={`font-bold ${isTrackingEnabled ? 'gradient-text-success' : 'text-danger-500'}`}>{isTrackingEnabled ? 'Active' : 'Disabled'}</span></p>
                                <p>Session: <span className="font-mono text-primary-600 dark:text-primary-400">{sessionId}</span></p>
                                <p>Duration: <span className="gradient-text">{sessionDuration}s</span></p>
                            </div>
                        </div>

                        {/* Tracking Stats */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-display font-bold text-light-text-primary dark:text-dark-text-primary">Session Stats</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="glass p-3 rounded-xl border border-primary-200/20 hover:bg-primary-500/5 transition-colors duration-200">
                                    <div className="font-display font-bold gradient-text">{trackingStats.totalClicks}</div>
                                    <div className="text-light-text-muted dark:text-dark-text-muted">Total Clicks</div>
                                </div>
                                <div className="glass p-3 rounded-xl border border-primary-200/20 hover:bg-primary-500/5 transition-colors duration-200">
                                    <div className="font-display font-bold gradient-text">{trackingStats.buttonClicks}</div>
                                    <div className="text-light-text-muted dark:text-dark-text-muted">Button Clicks</div>
                                </div>
                                <div className="glass p-3 rounded-xl border border-primary-200/20 hover:bg-primary-500/5 transition-colors duration-200">
                                    <div className="font-display font-bold gradient-text">{trackingStats.linkClicks}</div>
                                    <div className="text-light-text-muted dark:text-dark-text-muted">Link Clicks</div>
                                </div>
                                <div className="glass p-3 rounded-xl border border-primary-200/20 hover:bg-primary-500/5 transition-colors duration-200">
                                    <div className="font-display font-bold gradient-text">{trackingStats.formSubmissions}</div>
                                    <div className="text-light-text-muted dark:text-dark-text-muted">Form Submissions</div>
                                </div>
                                <div className="glass p-3 rounded-xl border border-primary-200/20 hover:bg-primary-500/5 transition-colors duration-200">
                                    <div className="font-display font-bold gradient-text">{trackingStats.pageViews}</div>
                                    <div className="text-light-text-muted dark:text-dark-text-muted">Page Views</div>
                                </div>
                                <div className="glass p-3 rounded-xl border border-primary-200/20 hover:bg-primary-500/5 transition-colors duration-200">
                                    <div className="font-display font-bold gradient-text">{trackingStats.scrollEvents}</div>
                                    <div className="text-light-text-muted dark:text-dark-text-muted">Scroll Events</div>
                                </div>
                            </div>
                        </div>

                        {/* What's Being Tracked */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-display font-bold text-light-text-primary dark:text-dark-text-primary">What's Tracked</h4>
                            <div className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary space-y-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-primary rounded-full shadow-lg"></div>
                                    <span>Button clicks and interactions</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-success rounded-full shadow-lg"></div>
                                    <span>Link clicks and navigation</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full shadow-lg"></div>
                                    <span>Form submissions</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-accent rounded-full shadow-lg"></div>
                                    <span>Page views and scroll depth</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-danger rounded-full shadow-lg"></div>
                                    <span>Element positions and viewport</span>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="text-xs glass p-3 rounded-xl border border-primary-200/20">
                            <p className="font-display font-bold text-light-text-primary dark:text-dark-text-primary mb-2">🔒 Privacy Notice</p>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">We track interactions to improve user experience. No personal data is collected. You can disable tracking at any time.</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleToggleTracking}
                                className={`w-full px-4 py-2 text-xs font-display font-semibold rounded-xl transition-all duration-300 hover:scale-105 ${isTrackingEnabled
                                    ? 'bg-gradient-danger text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gradient-success text-white shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isTrackingEnabled ? 'Disable Tracking' : 'Enable Tracking'}
                            </button>

                            <button
                                onClick={handleExportTrackingData}
                                className="w-full px-4 py-2 text-xs font-display font-semibold bg-gradient-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Export Session Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 