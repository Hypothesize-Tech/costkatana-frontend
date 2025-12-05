import React from 'react';
import {
    Info,
    AlertTriangle,
    AlertOctagon,
    Zap,
    TrendingUp,
    Search,
    Target,
    RotateCw,
    Brain,
    Wrench,
    CheckCircle,
    DollarSign,
    FileText,
    Bell
} from 'lucide-react';
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
        const icons: Record<string, JSX.Element> = {
            low: <Info className="w-5 h-5" />,
            medium: <AlertTriangle className="w-5 h-5" />,
            high: <AlertOctagon className="w-5 h-5" />,
            critical: <Zap className="w-5 h-5" />
        };
        return icons[severity] || <Info className="w-5 h-5" />;
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
        const icons: Record<string, JSX.Element> = {
            cost_spike: <TrendingUp className="w-5 h-5" />,
            anomaly_detected: <Search className="w-5 h-5" />,
            dominant_cost_driver: <Target className="w-5 h-5" />,
            unusual_pattern: <RotateCw className="w-5 h-5" />,
            retry_storm: <Zap className="w-5 h-5" />,
            context_bloat: <Brain className="w-5 h-5" />,
            tool_loop: <Wrench className="w-5 h-5" />
        };
        return icons[type] || <Info className="w-5 h-5" />;
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
            <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-success glow-success mb-3 sm:mb-4">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-display font-bold gradient-text-success mb-2">No Anomalies Detected</h3>
                    <p className="text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300">Your cost patterns are within normal ranges. Great job!</p>
                </div>
            </div>
        );
    }

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    const highAnomalies = anomalies.filter(a => a.severity === 'high');
    const mediumAnomalies = anomalies.filter(a => a.severity === 'medium');
    const lowAnomalies = anomalies.filter(a => a.severity === 'low');

    return (
        <div className="glass rounded-xl border border-primary-200/30 shadow-xl backdrop-blur-xl p-4 sm:p-5 md:p-6 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-0">
                <div>
                    <h2 className="text-lg sm:text-xl font-display font-bold gradient-text-primary">Cost Anomaly Alerts</h2>
                    <p className="text-xs sm:text-sm md:text-base text-secondary-600 dark:text-secondary-300 mt-1">Unusual patterns that need attention</p>
                </div>

                <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-display font-bold gradient-text-danger">
                        {anomalies.length}
                    </div>
                    <div className="text-xs sm:text-sm text-light-text-tertiary dark:text-dark-text-tertiary">Active Alerts</div>
                </div>
            </div>

            {/* Severity Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <div className="text-center p-2 sm:p-3 glass rounded-xl border border-danger-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-danger-50/50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20">
                    <div className="text-base sm:text-lg font-display font-bold text-danger-700 dark:text-danger-300">
                        {criticalAnomalies.length}
                    </div>
                    <div className="text-xs text-danger-600 dark:text-danger-400">Critical</div>
                </div>

                <div className="text-center p-2 sm:p-3 glass rounded-xl border border-secondary-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20">
                    <div className="text-base sm:text-lg font-display font-bold text-secondary-700 dark:text-secondary-300">
                        {highAnomalies.length}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">High</div>
                </div>

                <div className="text-center p-2 sm:p-3 glass rounded-xl border border-warning-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20">
                    <div className="text-base sm:text-lg font-display font-bold text-warning-700 dark:text-warning-300">
                        {mediumAnomalies.length}
                    </div>
                    <div className="text-xs text-warning-600 dark:text-warning-400">Medium</div>
                </div>

                <div className="text-center p-2 sm:p-3 glass rounded-xl border border-highlight-200/30 shadow-lg backdrop-blur-xl bg-gradient-to-br from-highlight-50/50 to-highlight-100/50 dark:from-highlight-900/20 dark:to-highlight-800/20">
                    <div className="text-base sm:text-lg font-display font-bold text-highlight-700 dark:text-highlight-300">
                        {lowAnomalies.length}
                    </div>
                    <div className="text-xs text-highlight-600 dark:text-highlight-400">Low</div>
                </div>
            </div>

            {/* Anomalies List */}
            <div className="space-y-3 sm:space-y-4">
                {anomalies.map((anomaly, index) => (
                    <div
                        key={index}
                        className={`p-3 sm:p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1 text-current">
                                {getSeverityIcon(anomaly.severity)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-current flex-shrink-0">{getAnomalyTypeIcon(anomaly.type)}</span>
                                        <h3 className="text-xs sm:text-sm font-display font-medium capitalize gradient-text-primary break-words">
                                            {getAnomalyTypeDescription(anomaly.type)}
                                        </h3>
                                    </div>

                                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-display font-medium self-start sm:self-auto ${getSeverityBadgeColor(anomaly.severity)}`}>
                                        {anomaly.severity}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm mb-3 text-light-text-secondary dark:text-dark-text-secondary break-words">
                                    {anomaly.description}
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs">
                                        <span className="flex items-center">
                                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-danger-600 dark:text-danger-400 flex-shrink-0" />
                                            <span className="font-medium text-light-text-primary dark:text-dark-text-primary break-words">
                                                Cost Impact: {formatCurrency(anomaly.cost_impact)}
                                            </span>
                                        </span>

                                        <span className="flex items-center">
                                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-success-600 dark:text-success-400 flex-shrink-0" />
                                            <span className="font-medium text-light-text-primary dark:text-dark-text-primary break-words">
                                                Save: {formatCurrency(anomaly.optimization_potential)}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex space-x-2 self-start sm:self-auto">
                                        <button className="btn btn-icon-secondary">
                                            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>

                                        <button className="btn btn-icon-secondary">
                                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>

                                        <button className="btn btn-icon-secondary">
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-primary-200/30">
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={() => {
                            alert(`Acknowledging ${anomalies.length} anomalies.\n\nThis will mark all current anomalies as reviewed and will stop showing them in the alerts.`);
                        }}
                        className="btn btn-danger inline-flex items-center"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Acknowledge All
                    </button>

                    <button
                        onClick={() => {
                            const details = anomalies.map(a =>
                                `${a.type.toUpperCase()} (${a.severity}): ${a.description}\nCost Impact: ${formatCurrency(a.cost_impact)}\nPotential Savings: ${formatCurrency(a.optimization_potential)}`
                            ).join('\n\n');
                            alert(`Anomaly Details:\n\n${details}`);
                        }}
                        className="btn btn-secondary inline-flex items-center"
                    >
                        <FileText className="h-4 w-4 mr-2" />
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
                        className="btn btn-secondary inline-flex items-center"
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Set Alerts
                    </button>
                </div>
            </div>
        </div>
    );
};



