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
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isTrackingEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                Analytics Tracking
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="p-4 space-y-4">
                        {/* Status */}
                        <div className="text-xs text-gray-600">
                            <p>Status: {isTrackingEnabled ? 'Active' : 'Disabled'}</p>
                            <p>Session: {sessionId}</p>
                            <p>Duration: {sessionDuration}s</p>
                        </div>

                        {/* Tracking Stats */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-700">Session Stats</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{trackingStats.totalClicks}</div>
                                    <div className="text-gray-500">Total Clicks</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{trackingStats.buttonClicks}</div>
                                    <div className="text-gray-500">Button Clicks</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{trackingStats.linkClicks}</div>
                                    <div className="text-gray-500">Link Clicks</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{trackingStats.formSubmissions}</div>
                                    <div className="text-gray-500">Form Submissions</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{trackingStats.pageViews}</div>
                                    <div className="text-gray-500">Page Views</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium">{trackingStats.scrollEvents}</div>
                                    <div className="text-gray-500">Scroll Events</div>
                                </div>
                            </div>
                        </div>

                        {/* What's Being Tracked */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-700">What's Tracked</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Button clicks and interactions</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Link clicks and navigation</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Form submissions</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>Page views and scroll depth</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>Element positions and viewport</span>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <p className="font-medium mb-1">Privacy Notice</p>
                            <p>We track interactions to improve user experience. No personal data is collected. You can disable tracking at any time.</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={handleToggleTracking}
                                className={`w-full px-3 py-2 text-xs rounded ${isTrackingEnabled
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                            >
                                {isTrackingEnabled ? 'Disable Tracking' : 'Enable Tracking'}
                            </button>

                            <button
                                onClick={handleExportTrackingData}
                                className="w-full px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
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