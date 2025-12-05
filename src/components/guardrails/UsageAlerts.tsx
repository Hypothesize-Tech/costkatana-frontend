import React, { useEffect, useState } from 'react';
import {
    Bell,
    AlertTriangle,
    Info,
    XCircle,
    CheckCircle,
    X,
    Clock,
    Lightbulb,
    AlertCircle,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { guardrailsService, UsageAlert } from '../../services/guardrails.service';
import { formatDistanceToNow } from 'date-fns';

export const UsageAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<UsageAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAlerts();
        // Refresh alerts every 2 minutes
        const interval = setInterval(fetchAlerts, 120000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await guardrailsService.getUsageAlerts();
            // Filter out dismissed alerts
            const filteredAlerts = data.filter(alert => !dismissedAlerts.has(alert._id));
            setAlerts(filteredAlerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissAlert = async (alertId: string) => {
        try {
            await guardrailsService.markAlertAsRead(alertId);
            setDismissedAlerts(prev => new Set([...prev, alertId]));
            setAlerts(prev => prev.filter(alert => alert._id !== alertId));
        } catch (error) {
            console.error('Error dismissing alert:', error);
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return (
                    <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-danger">
                        <XCircle className="w-4 h-4 text-white" />
                    </div>
                );
            case 'medium':
                return (
                    <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-warning">
                        <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                );
            case 'low':
                return (
                    <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-primary">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                );
            default:
                return (
                    <div className="flex justify-center items-center w-8 h-8 rounded-lg shadow-lg bg-gradient-secondary">
                        <Bell className="w-4 h-4 text-white" />
                    </div>
                );
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-gradient-to-br from-danger-50/50 to-danger-100/50 dark:from-danger-900/20 dark:to-danger-800/20 border-danger-200/30 dark:border-danger-700/30';
            case 'medium':
                return 'bg-gradient-to-br from-warning-50/50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200/30 dark:border-warning-700/30';
            case 'low':
                return 'bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200/30 dark:border-primary-700/30';
            default:
                return 'bg-gradient-to-br from-secondary-50/50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/20 border-secondary-200/30 dark:border-secondary-700/30';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'gradient-text-danger';
            case 'medium':
                return 'gradient-text-warning';
            case 'low':
                return 'gradient-text';
            default:
                return 'text-light-text-primary dark:text-dark-text-primary';
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">Usage Alerts</h3>
                </div>
                <div className="flex justify-center items-center h-24 sm:h-28 md:h-32">
                    <div className="spinner-lg text-primary-500"></div>
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
                <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">Usage Alerts</h3>
                </div>
                <div className="flex flex-col justify-center items-center h-24 sm:h-28 md:h-32 text-center">
                    <div className="flex justify-center items-center mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl shadow-2xl animate-pulse bg-gradient-success">
                        <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="mb-2 text-base sm:text-lg font-bold font-display gradient-text-success">No Active Alerts</p>
                    <p className="text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Your usage is within normal limits</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center">
                    <div className="flex justify-center items-center mr-3 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg bg-gradient-primary flex-shrink-0">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-display gradient-text-primary">Usage Alerts</h3>
                </div>
                {alerts.length > 0 && (
                    <span className="px-2.5 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold text-white rounded-full shadow-lg font-display bg-gradient-danger self-start sm:self-auto">
                        {alerts.length} active
                    </span>
                )}
            </div>
            <div className="space-y-3 sm:space-y-4">
                {alerts.map(alert => (
                    <div
                        key={alert._id}
                        className={`glass rounded-xl p-4 sm:p-5 md:p-6 border ${getSeverityColor(alert.severity)} shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105`}
                    >
                        <div className="flex justify-between items-start gap-3 sm:gap-4">
                            <div className="flex flex-1 gap-3 sm:gap-4 items-start min-w-0">
                                <div className="flex-shrink-0">
                                {getSeverityIcon(alert.severity)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-display font-bold text-base sm:text-lg ${getSeverityTextColor(alert.severity)}`}>
                                        {alert.title}
                                    </h4>
                                    <p className="mt-2 text-xs sm:text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                                        {alert.message}
                                    </p>

                                    {alert.metadata?.suggestions && alert.metadata.suggestions.length > 0 && (
                                        <div className="p-3 sm:p-4 mt-3 sm:mt-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30">
                                            <p className="flex gap-1.5 sm:gap-2 items-center mb-2 sm:mb-3 text-xs sm:text-sm font-bold font-display gradient-text-primary">
                                                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                Recommendations:
                                            </p>
                                            <ul className="space-y-2">
                                                {alert.metadata.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                                                    <li key={index} className="flex items-start text-sm font-body text-light-text-primary dark:text-dark-text-primary">
                                                        <div className="flex-shrink-0 mt-2 mr-3 w-2 h-2 rounded-full shadow-lg bg-gradient-primary"></div>
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {alert.metadata?.percentage && (
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-semibold font-display text-light-text-primary dark:text-dark-text-primary">Usage Progress</span>
                                                <span className={`text-sm font-display font-bold ${alert.metadata.percentage >= 90
                                                    ? 'gradient-text-danger'
                                                    : alert.metadata.percentage >= 75
                                                        ? 'gradient-text-warning'
                                                        : 'gradient-text-success'
                                                    }`}>
                                                    {alert.metadata.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="overflow-hidden w-full h-3 rounded-full bg-primary-200/30 dark:bg-primary-800/30">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${alert.metadata.percentage >= 90
                                                        ? 'bg-gradient-danger'
                                                        : alert.metadata.percentage >= 75
                                                            ? 'bg-gradient-warning'
                                                            : 'bg-gradient-success'
                                                        }`}
                                                    style={{ width: `${Math.min(alert.metadata.percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <p className="flex gap-1 items-center mt-4 text-xs font-body text-light-text-muted dark:text-dark-text-muted">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => dismissAlert(alert._id)}
                                className="p-1.5 sm:p-2 rounded-xl transition-all duration-300 btn hover:bg-primary-500/10 hover:scale-110 flex-shrink-0"
                                aria-label="Dismiss alert"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 text-light-text-muted dark:text-dark-text-muted hover:text-danger-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {alerts.some(alert => alert.severity === 'high') && (
                <div className="p-4 sm:p-5 md:p-6 mt-4 sm:mt-6 rounded-xl border shadow-2xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-700/30 bg-gradient-primary">
                    <div className="flex items-center mb-3 sm:mb-4">
                        <div className="flex justify-center items-center mr-2 sm:mr-3 w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-lg bg-white/20 flex-shrink-0">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <p className="text-base sm:text-lg font-bold text-white font-display">
                            Approaching Usage Limits
                        </p>
                    </div>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm font-body text-white/90">
                        Upgrade your plan for increased limits and access to all features.
                    </p>
                    <a
                        href="https://www.costkatana.com/#pricing"
                        className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold bg-white rounded-xl shadow-lg transition-all duration-300 btn btn-primary font-display text-primary-600 hover:bg-primary-50 hover:scale-105"
                    >
                        <Sparkles className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                        View Plans
                        <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                </div>
            )}
        </div>
    );
};
