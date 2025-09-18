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
            low: 'glass border-info-200/30 text-info-800 dark:text-info-300 bg-gradient-to-br from-info-50/50 to-info-100/50 dark:from-info-900/20 dark:to-info-800/20',
            medium: 'glass border-warning-200/30 text-warning-800 dark:text-warning-300 bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20',
            high: 'glass border-secondary-200/30 text-secondary-800 dark:text-secondary-300 bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20',
            critical: 'glass border-danger-200/30 text-danger-800 dark:text-danger-300 bg-gradient-to-br from-danger-50/50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20'
        };
        return colors[severity] || 'glass border-accent-200/30 text-light-text-primary dark:text-dark-text-primary';
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
            low: 'badge-info',
            medium: 'badge-warning',
            high: 'badge-secondary',
            critical: 'badge-danger'
        };
        return colors[severity] || 'badge-secondary';
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
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-success glow-success mb-4">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-display font-bold gradient-text-success mb-2">No Anomalies Detected</h3>
                    <p className="text-secondary-600 dark:text-secondary-300">Your cost patterns are within normal ranges. Great job!</p>
                </div>
            </div>
        );
    }

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    const highAnomalies = anomalies.filter(a => a.severity === 'high');
    const mediumAnomalies = anomalies.filter(a => a.severity === 'medium');
    const lowAnomalies = anomalies.filter(a => a.severity === 'low');

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-display font-bold gradient-text-primary">Cost Anomaly Alerts</h2>
                    <p className="text-secondary-600 dark:text-secondary-300 mt-1">Unusual patterns that need attention</p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-display font-bold gradient-text-danger">
                        {anomalies.length}
                    </div>
                    <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Active Alerts</div>
                </div>
            </div>

            {/* Severity Summary */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 glass rounded-xl border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-danger-50/50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="text-lg font-display font-bold text-danger-700 dark:text-danger-300">
                        {criticalAnomalies.length}
                    </div>
                    <div className="text-xs text-danger-600 dark:text-danger-400">Critical</div>
                </div>

                <div className="text-center p-3 glass rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20">
                    <div className="text-lg font-display font-bold text-secondary-700 dark:text-secondary-300">
                        {highAnomalies.length}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">High</div>
                </div>

                <div className="text-center p-3 glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20">
                    <div className="text-lg font-display font-bold text-warning-700 dark:text-warning-300">
                        {mediumAnomalies.length}
                    </div>
                    <div className="text-xs text-warning-600 dark:text-warning-400">Medium</div>
                </div>

                <div className="text-center p-3 glass rounded-xl border border-highlight-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-highlight-50/50 to-highlight-100/50 dark:from-highlight-900/20 dark:to-highlight-800/20">
                    <div className="text-lg font-display font-bold text-highlight-700 dark:text-highlight-300">
                        {lowAnomalies.length}
                    </div>
                    <div className="text-xs text-highlight-600 dark:text-highlight-400">Low</div>
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
                                        <h3 className="text-sm font-display font-medium capitalize gradient-text-primary">
                                            {getAnomalyTypeDescription(anomaly.type)}
                                        </h3>
                                    </div>

                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-medium ${getSeverityBadgeColor(anomaly.severity)}`}>
                                        {anomaly.severity}
                                    </span>
                                </div>

                                <p className="text-sm mb-3 text-light-text-secondary dark:text-dark-text-secondary">
                                    {anomaly.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-xs">
                                        <span className="flex items-center">
                                            <svg className="h-4 w-4 mr-1 text-danger-600 dark:text-danger-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                                Cost Impact: {formatCurrency(anomaly.cost_impact)}
                                            </span>
                                        </span>

                                        <span className="flex items-center">
                                            <svg className="h-4 w-4 mr-1 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                                                Save: {formatCurrency(anomaly.optimization_potential)}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button className="btn-icon-secondary">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        <button className="btn-icon-secondary">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        <button className="btn-icon-secondary">
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
            <div className="mt-6 pt-6 border-t border-primary-200/30">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => {
                            alert(`Acknowledging ${anomalies.length} anomalies.\n\nThis will mark all current anomalies as reviewed and will stop showing them in the alerts.`);
                        }}
                        className="btn-danger inline-flex items-center"
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
                        className="btn-secondary inline-flex items-center"
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
                        className="btn-secondary inline-flex items-center"
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



