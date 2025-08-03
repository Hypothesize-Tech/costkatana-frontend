import React, { useState } from 'react';
import { useMixpanel } from '../../hooks/useMixpanel';

/**
 * Example component demonstrating specific tracking with detailed context
 * This shows how to track every interaction with comprehensive metadata
 */
export const SpecificTrackingExample: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedProject] = useState('project-1');

    const {
        trackUserAction,
        trackFeatureUsage,
        trackAnalyticsEvent,
        trackDashboardInteraction,
        trackChartInteraction,
        trackOptimizationEvent,
        trackExportEvent,
        trackError,
        trackSearch,
        trackFilterUsage,
        trackModalInteraction,
        trackPerformance,
        trackAuthEvent,
        setUserProfile,
        incrementUserProperty,
        isTrackingEnabled
    } = useMixpanel();

    // Specific button click tracking
    const handleOptimizeButtonClick = () => {
        trackUserAction(
            'click',
            '/optimization',
            'optimization_button',
            'optimize-cost-button',
            { buttonType: 'primary', action: 'optimize_costs' }
        );

        trackFeatureUsage(
            'optimization',
            'clicked',
            '/optimization',
            'optimization_button',
            { optimizationType: 'cost_reduction', projectId: selectedProject }
        );
    };

    // Specific search tracking
    const handleSearch = (query: string) => {
        setSearchQuery(query);

        trackSearch(
            query,
            'global_search',
            '/analytics',
            'search_input',
            Math.floor(Math.random() * 100),
            { searchType: 'analytics', projectId: selectedProject }
        );
    };

    // Specific filter tracking
    const handleFilterChange = (filterType: string, value: any) => {
        setSelectedFilter(value);

        trackFilterUsage(
            filterType,
            value,
            '/analytics',
            'filter_dropdown',
            { previousValue: selectedFilter, projectId: selectedProject }
        );
    };

    // Specific chart interaction tracking
    const handleChartZoom = () => {
        trackChartInteraction(
            'line_chart',
            'zoom',
            '/analytics',
            'cost_trend_chart',
            { dataPoints: 30, zoomLevel: 'monthly' },
            { chartId: 'cost-trend', projectId: selectedProject }
        );
    };

    // Specific optimization tracking
    const handleOptimization = () => {
        trackOptimizationEvent(
            'cost_reduction',
            '/optimization',
            'optimization_card',
            0.05,
            { originalCost: 0.10, optimizedCost: 0.05, projectId: selectedProject }
        );
    };

    // Specific export tracking
    const handleExport = () => {
        trackExportEvent(
            'csv',
            '/analytics',
            'export_button',
            'analytics_report',
            { dataPoints: 1000, dateRange: 'last_30_days', projectId: selectedProject }
        );
    };

    // Specific modal tracking
    const handleModalOpen = () => {
        trackModalInteraction(
            'opened',
            'create_project_modal',
            '/projects',
            'create_project_button',
            { trigger: 'button_click', projectId: selectedProject }
        );
    };

    // Specific error tracking
    const handleError = () => {
        trackError(
            'API request failed',
            'API_ERROR_500',
            '/analytics',
            'analytics_page',
            { endpoint: '/api/analytics', projectId: selectedProject }
        );
    };

    // Specific performance tracking
    const handlePerformanceTest = () => {
        trackPerformance(
            'api_response_time',
            1250,
            'ms',
            '/analytics',
            'analytics_page',
            { endpoint: '/api/analytics', method: 'GET' }
        );
    };

    // Specific dashboard interaction tracking
    const handleDashboardWidgetClick = () => {
        trackDashboardInteraction(
            'widget_clicked',
            'analytics_dashboard',
            '/analytics',
            'cost_widget',
            { widgetType: 'metric_card', metric: 'total_cost', projectId: selectedProject }
        );
    };

    // Specific analytics event tracking
    const handleAnalyticsEvent = () => {
        trackAnalyticsEvent(
            'chart_interacted',
            '/analytics',
            'cost_chart',
            { chartType: 'line_chart', interaction: 'zoom', projectId: selectedProject }
        );
    };

    // Specific authentication tracking
    const handleLogin = () => {
        trackAuthEvent('login', {
            method: 'email',
            source: 'login_form',
            success: true,
            metadata: { loginAttempt: 1 }
        });
    };

    // Specific user profile update
    const handleProfileUpdate = () => {
        setUserProfile({
            lastOptimizationUsage: new Date().toISOString(),
            optimizationFeatureEnabled: true,
            preferredOptimizationType: 'cost_reduction'
        });
    };

    // Specific property increment
    const handleIncrementProperty = () => {
        incrementUserProperty('optimization_interactions', 1);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Specific Tracking Examples
                </h2>
                <p className="text-gray-600">
                    This component demonstrates specific tracking with detailed context for better UX analysis.
                    {isTrackingEnabled ? (
                        <span className="text-green-600 ml-2">✓ Tracking enabled</span>
                    ) : (
                        <span className="text-red-600 ml-2">✗ Tracking disabled</span>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* User Action Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">User Action Tracking</h3>
                    <button
                        onClick={handleOptimizeButtonClick}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Track Button Click
                    </button>
                </div>

                {/* Search Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Search Tracking</h3>
                    <input
                        type="text"
                        placeholder="Enter search query..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                {/* Filter Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Filter Tracking</h3>
                    <select
                        value={selectedFilter}
                        onChange={(e) => handleFilterChange('time_range', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>

                {/* Chart Interaction */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Chart Interaction</h3>
                    <button
                        onClick={handleChartZoom}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Track Chart Zoom
                    </button>
                </div>

                {/* Optimization Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Optimization</h3>
                    <button
                        onClick={handleOptimization}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        Track Optimization
                    </button>
                </div>

                {/* Export Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Export</h3>
                    <button
                        onClick={handleExport}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                        Track Export
                    </button>
                </div>

                {/* Modal Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Modal</h3>
                    <button
                        onClick={handleModalOpen}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Track Modal Open
                    </button>
                </div>

                {/* Error Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Error Tracking</h3>
                    <button
                        onClick={handleError}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Track Error
                    </button>
                </div>

                {/* Performance Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Performance</h3>
                    <button
                        onClick={handlePerformanceTest}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                        Track Performance
                    </button>
                </div>

                {/* Dashboard Interaction */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Dashboard</h3>
                    <button
                        onClick={handleDashboardWidgetClick}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Track Dashboard Widget
                    </button>
                </div>

                {/* Analytics Event */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Analytics</h3>
                    <button
                        onClick={handleAnalyticsEvent}
                        className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                        Track Analytics Event
                    </button>
                </div>

                {/* Authentication */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Authentication</h3>
                    <button
                        onClick={handleLogin}
                        className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                        Track Login
                    </button>
                </div>

                {/* User Profile */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">User Profile</h3>
                    <button
                        onClick={handleProfileUpdate}
                        className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                        Update Profile
                    </button>
                </div>

                {/* Property Increment */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Property Increment</h3>
                    <button
                        onClick={handleIncrementProperty}
                        className="w-full px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
                    >
                        Increment Property
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Tracking Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• <strong>User Actions:</strong> Tracks specific button clicks with page, component, and element context</p>
                    <p>• <strong>Search:</strong> Tracks search queries with type, page, component, and results count</p>
                    <p>• <strong>Filters:</strong> Tracks filter changes with type, value, page, and component context</p>
                    <p>• <strong>Charts:</strong> Tracks chart interactions with type, action, page, and component</p>
                    <p>• <strong>Optimization:</strong> Tracks optimization events with type, savings, page, and component</p>
                    <p>• <strong>Exports:</strong> Tracks export requests with format, page, component, and metadata</p>
                    <p>• <strong>Modals:</strong> Tracks modal interactions with action, name, page, and component</p>
                    <p>• <strong>Errors:</strong> Tracks errors with code, page, component, and context</p>
                    <p>• <strong>Performance:</strong> Tracks performance metrics with value, unit, page, and component</p>
                    <p>• <strong>Dashboard:</strong> Tracks dashboard interactions with type, page, and component</p>
                    <p>• <strong>Analytics:</strong> Tracks analytics events with type, page, component, and metadata</p>
                    <p>• <strong>Authentication:</strong> Tracks auth events with method, source, and success status</p>
                </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Event Data Structure</h3>
                <div className="text-sm text-gray-600">
                    <p>Each event includes:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Page Context:</strong> Current page path and category</li>
                        <li><strong>Component Context:</strong> Component name and category</li>
                        <li><strong>Action Context:</strong> Specific action and category</li>
                        <li><strong>User Context:</strong> User ID and session information</li>
                        <li><strong>Technical Context:</strong> Browser, screen size, timezone</li>
                        <li><strong>Business Context:</strong> Project ID, filters, metadata</li>
                        <li><strong>Performance Context:</strong> Response times, error codes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}; 