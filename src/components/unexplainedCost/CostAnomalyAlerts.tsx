import React from 'react';
import { CostAnomaly } from '../../services/unexplainedCost.service';

interface CostAnomalyAlertsProps {
    anomalies: CostAnomaly[];
}

export const CostAnomalyAlerts: React.FC<CostAnomalyAlertsProps> = ({ anomalies }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4
        }).format(amount);
    };

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            low: 'bg-blue-50 border-blue-200 text-blue-800',
            medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            high: 'bg-orange-50 border-orange-200 text-orange-800',
            critical: 'bg-red-50 border-red-200 text-red-800'
        };
        return colors[severity] || 'bg-gray-50 border-gray-200 text-gray-800';
    };

    const getSeverityIcon = (severity: string) => {
        const icons: Record<string, string> = {
            low: 'ℹ️',
            medium: '⚠️',
            high: '🚨',
            critical: '💥'
        };
        return icons[severity] || '❓';
    };

    const getSeverityBadgeColor = (severity: string) => {
        const colors: Record<string, string> = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };

    const getAnomalyTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            cost_spike: '📈',
            anomaly_detected: '🔍',
            dominant_cost_driver: '🎯',
            unusual_pattern: '🔄',
            retry_storm: '⚡',
            context_bloat: '🧠',
            tool_loop: '🔧'
        };
        return icons[type] || '❓';
    };

    const getAnomalyTypeDescription = (type: string) => {
        const descriptions: Record<string, string> = {
            cost_spike: 'Cost Spike',
            anomaly_detected: 'Anomaly Detected',
            dominant_cost_driver: 'Dominant Cost Driver',
            unusual_pattern: 'Unusual Pattern',
            retry_storm: 'Retry Storm',
            context_bloat: 'Context Bloat',
            tool_loop: 'Tool Loop'
        };
        return descriptions[type] || 'Unknown Anomaly';
    };

    if (anomalies.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Anomalies Detected</h3>
                    <p className="text-gray-600">Your cost patterns are within normal ranges. Great job!</p>
                </div>
            </div>
        );
    }

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    const highAnomalies = anomalies.filter(a => a.severity === 'high');
    const mediumAnomalies = anomalies.filter(a => a.severity === 'medium');
    const lowAnomalies = anomalies.filter(a => a.severity === 'low');

    return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Cost Anomaly Alerts</h2>
                    <p className="text-gray-600 mt-1">Unusual patterns that need attention</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                        {anomalies.length}
                    </div>
                    <div className="text-sm text-gray-500">Active Alerts</div>
                </div>
            </div>

            {/* Severity Summary */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-lg font-bold text-red-700">
                        {criticalAnomalies.length}
                    </div>
                    <div className="text-xs text-red-600">Critical</div>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-lg font-bold text-orange-700">
                        {highAnomalies.length}
                    </div>
                    <div className="text-xs text-orange-600">High</div>
                </div>

                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">
                        {mediumAnomalies.length}
                    </div>
                    <div className="text-xs text-yellow-600">Medium</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-700">
                        {lowAnomalies.length}
                    </div>
                    <div className="text-xs text-blue-600">Low</div>
                </div>
            </div>

            {/* Anomalies List */}
            <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3 mt-1">
                                <span className="text-2xl">{getSeverityIcon(anomaly.severity)}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl">{getAnomalyTypeIcon(anomaly.type)}</span>
                                        <h3 className="text-sm font-medium capitalize">
                                            {getAnomalyTypeDescription(anomaly.type)}
                                        </h3>
                                    </div>

                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeColor(anomaly.severity)}`}>
                                        {anomaly.severity}
                                    </span>
                                </div>

                                <p className="text-sm mb-3">
                                    {anomaly.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-xs">
                                        <span className="flex items-center">
                                            <svg className="h-4 w-4 mr-1 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">
                                                Cost Impact: {formatCurrency(anomaly.cost_impact)}
                                            </span>
                                        </span>

                                        <span className="flex items-center">
                                            <svg className="h-4 w-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">
                                                Save: {formatCurrency(anomaly.optimization_potential)}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => {
                            alert(`Acknowledging ${anomalies.length} anomalies.\n\nThis will mark all current anomalies as reviewed and will stop showing them in the alerts.`);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Acknowledge All
                    </button>

                    <button
                        onClick={() => {
                            const details = anomalies.map(a =>
                                `${a.type.toUpperCase()} (${a.severity}): ${a.description}\nCost Impact: ${formatCurrency(a.cost_impact)}\nPotential Savings: ${formatCurrency(a.optimization_potential)}`
                            ).join('\n\n');
                            alert(`Anomaly Details:\n\n${details}`);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        View Details
                    </button>

                    <button
                        onClick={() => {
                            const severityCounts = {
                                critical: anomalies.filter(a => a.severity === 'critical').length,
                                high: anomalies.filter(a => a.severity === 'high').length,
                                medium: anomalies.filter(a => a.severity === 'medium').length,
                                low: anomalies.filter(a => a.severity === 'low').length
                            };
                            alert(`Setting up anomaly alerts:\n\nAlert Thresholds:\n• Critical: ${severityCounts.critical} anomalies\n• High: ${severityCounts.high} anomalies\n• Medium: ${severityCounts.medium} anomalies\n• Low: ${severityCounts.low} anomalies\n\nYou will be notified when new anomalies are detected.`);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Set Alerts
                    </button>
                </div>
            </div>
        </div>
    );
};



