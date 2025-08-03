import React, { useState } from 'react';
import { useMixpanel } from '../../hooks/useMixpanel';

/**
 * Example component demonstrating Mixpanel tracking features
 * This component shows various ways to track user interactions
 */
export const MixpanelExample: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const {
        trackEvent,
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
        setUserProfile,
        incrementUserProperty,
        isTrackingEnabled
    } = useMixpanel();

    const handleButtonClick = () => {
        // Track a simple button click
        trackFeatureUsage('example_button', 'clicked', '/example', 'example_button', {
            buttonType: 'primary',
            page: 'example'
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        // Track search functionality
        trackSearch(query, 'example_search', '/example', 'search_input', Math.floor(Math.random() * 100), {
            searchType: 'general',
            resultsCount: Math.floor(Math.random() * 100) // Simulated results
        });
    };

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);

        // Track filter usage
        trackFilterUsage('example_filter', filter, '/example', 'filter_dropdown', {
            previousValue: selectedFilter
        });
    };

    const handleChartInteraction = () => {
        // Track chart interactions
        trackChartInteraction('line_chart', 'zoom', '/example', 'chart_component', {
            zoomLevel: 'monthly',
            dataPoints: 30
        });
    };

    const handleOptimization = () => {
        // Track optimization events
        trackOptimizationEvent('cost_reduction', '/example', 'optimization_button', 0.05, {
            originalCost: 0.10,
            optimizedCost: 0.05,
            savingsPercentage: 50
        });
    };

    const handleExport = () => {
        // Track export events
        trackExportEvent('csv', '/example', 'export_button', 'analytics_report', {
            dataPoints: 1000,
            dateRange: 'last_30_days'
        });
    };

    const handleModalOpen = () => {
        // Track modal interactions
        trackModalInteraction('opened', 'example_modal', '/example', 'modal_button', {
            trigger: 'button_click'
        });
    };

    const handleError = () => {
        // Track error events
        trackError('Example error occurred', 'EXAMPLE_ERROR', '/example', 'error_button', {
            component: 'MixpanelExample',
            action: 'error_test'
        });
    };

    const handlePerformanceTest = () => {
        // Track performance metrics
        trackPerformance('api_response_time', 1250, 'ms', '/example', 'performance_button', {
            endpoint: '/api/example',
            method: 'GET'
        });
    };

    const handleUserProfileUpdate = () => {
        // Update user profile properties
        setUserProfile({
            lastExampleUsage: new Date().toISOString(),
            exampleFeatureEnabled: true
        });
    };

    const handleIncrementProperty = () => {
        // Increment user properties
        incrementUserProperty('example_interactions', 1);
    };

    const handleDashboardInteraction = () => {
        // Track dashboard interactions
        trackDashboardInteraction('widget_clicked', 'example_dashboard', '/example', 'dashboard_widget', {
            widgetType: 'metric_card',
            metric: 'total_cost'
        });
    };

    const handleAnalyticsEvent = () => {
        // Track custom analytics events
        trackAnalyticsEvent('custom_analytics_event', '/example', 'analytics_button', {
            eventType: 'user_action',
            category: 'example'
        });
    };

    const handleCustomEvent = () => {
        // Track custom events
        trackEvent('Custom Event', {
            category: 'example',
            action: 'custom_action',
            label: 'example_label',
            value: 100
        });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Mixpanel Tracking Examples
                </h2>
                <p className="text-gray-600">
                    This component demonstrates various Mixpanel tracking features.
                    {isTrackingEnabled ? (
                        <span className="text-green-600 ml-2">✓ Tracking enabled</span>
                    ) : (
                        <span className="text-red-600 ml-2">✗ Tracking disabled</span>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Tracking */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Basic Tracking</h3>
                    <button
                        onClick={handleButtonClick}
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
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="all">All</option>
                        <option value="recent">Recent</option>
                        <option value="popular">Popular</option>
                    </select>
                </div>

                {/* Chart Interaction */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Chart Interaction</h3>
                    <button
                        onClick={handleChartInteraction}
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

                {/* User Profile */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">User Profile</h3>
                    <button
                        onClick={handleUserProfileUpdate}
                        className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                        Update Profile
                    </button>
                </div>

                {/* Property Increment */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Property Increment</h3>
                    <button
                        onClick={handleIncrementProperty}
                        className="w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                    >
                        Increment Property
                    </button>
                </div>

                {/* Dashboard Interaction */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Dashboard</h3>
                    <button
                        onClick={handleDashboardInteraction}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Track Dashboard
                    </button>
                </div>

                {/* Analytics Event */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Analytics</h3>
                    <button
                        onClick={handleAnalyticsEvent}
                        className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                        Track Analytics
                    </button>
                </div>

                {/* Custom Event */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Custom Event</h3>
                    <button
                        onClick={handleCustomEvent}
                        className="w-full px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
                    >
                        Track Custom Event
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Tracking Status</h3>
                <p className="text-sm text-gray-600">
                    Mixpanel tracking is currently{' '}
                    {isTrackingEnabled ? (
                        <span className="text-green-600 font-medium">enabled</span>
                    ) : (
                        <span className="text-red-600 font-medium">disabled</span>
                    )}
                    . Check the browser console for detailed event logs.
                </p>
            </div>
        </div>
    );
}; 